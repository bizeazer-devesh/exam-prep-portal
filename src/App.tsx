import React, { useState, useEffect, useMemo } from 'react';
import questionsRaw from './data/questions.json';
import type {
  Question,
  QuestionAttempt,
  PortalSection,
  ListMode,
  FilterState,
  ExamStats,
  CBTConfig,
} from './types';
import { getExamTrackMeta, SSC_EXAM_TRACKS, SUBJECT_METADATA } from './data/examCatalog';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { ExamHub } from './components/ExamHub';
import { PracticeToolbar } from './components/PracticeToolbar';
import { PaginatedList } from './components/PaginatedList';
import { VirtualizedList } from './components/VirtualizedList';
import { MockTestCenter } from './components/MockTestCenter';
import { AnalyticsView } from './components/AnalyticsView';
import { CBTExamModal } from './components/CBTExamModal';
import { BookmarkCheck, ShieldCheck } from 'lucide-react';

const questionsData: Question[] = questionsRaw as unknown as Question[];

export const App: React.FC = () => {
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return (
      localStorage.getItem('exampyq_theme') === 'dark' ||
      window.matchMedia('(prefers-color-scheme: dark)').matches
    );
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('exampyq_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('exampyq_theme', 'light');
    }
  }, [isDarkMode]);

  // Sidebar & Navigation state
  const [activeSection, setActiveSection] = useState<PortalSection>('hub');
  const [listMode, setListMode] = useState<ListMode>('paginated');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Active CBT Mock Simulator config (null when closed)
  const [activeCBT, setActiveCBT] = useState<CBTConfig | null>(null);

  // User attempts state (persisted)
  const [attempts, setAttempts] = useState<Record<string, QuestionAttempt>>(() => {
    const saved = localStorage.getItem('exampyq_attempts');
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem('exampyq_attempts', JSON.stringify(attempts));
  }, [attempts]);

  // User bookmarks state (persisted)
  const [bookmarks, setBookmarks] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('exampyq_bookmarks');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  useEffect(() => {
    localStorage.setItem('exampyq_bookmarks', JSON.stringify(Array.from(bookmarks)));
  }, [bookmarks]);

  // Auto show solution toggle
  const [autoShowSolution, setAutoShowSolution] = useState(false);

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    subject: 'all',
    selectedExam: 'all',
    selectedCategory: 'all',
    selectedYear: 'all',
    searchQuery: '',
    attemptStatus: 'all',
  });

  // Precomputed counts for sidebar badges
  const examCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    SSC_EXAM_TRACKS.forEach((track) => {
      if (track.id === 'all') {
        counts[track.id] = questionsData.length;
      } else {
        counts[track.id] = questionsData.filter((q) => q.exams.includes(track.id)).length;
      }
    });
    return counts;
  }, []);

  const subjectCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    const scoped =
      filters.selectedExam === 'all'
        ? questionsData
        : questionsData.filter((q) => q.exams.includes(filters.selectedExam));
    scoped.forEach((q) => {
      counts[q.subject] = (counts[q.subject] || 0) + 1;
    });
    return counts;
  }, [filters.selectedExam]);

  // Dynamic categories & years scoped to current exam + subject
  const categories = useMemo(() => {
    const scoped = questionsData.filter((q) => {
      if (filters.selectedExam !== 'all' && !q.exams.includes(filters.selectedExam)) return false;
      if (filters.subject !== 'all' && q.subject !== filters.subject) return false;
      return true;
    });
    return Array.from(new Set(scoped.map((q) => q.category))).sort();
  }, [filters.selectedExam, filters.subject]);

  const years = useMemo(() => {
    return Array.from(new Set(questionsData.map((q) => q.year))).sort((a, b) => b - a);
  }, []);

  // Filtered questions computation
  const filteredQuestions = useMemo(() => {
    const effectiveStatus =
      activeSection === 'revision' &&
      filters.attemptStatus !== 'bookmarked' &&
      filters.attemptStatus !== 'incorrect'
        ? 'bookmarked'
        : filters.attemptStatus;

    return questionsData.filter((q) => {
      if (filters.subject !== 'all' && q.subject !== filters.subject) return false;
      if (filters.selectedExam !== 'all' && !q.exams.includes(filters.selectedExam)) return false;
      if (filters.selectedCategory !== 'all' && q.category !== filters.selectedCategory) return false;
      if (filters.selectedYear !== 'all' && String(q.year) !== filters.selectedYear) return false;

      if (effectiveStatus === 'bookmarked' && !bookmarks.has(q.id)) return false;
      if (effectiveStatus === 'unattempted' && !!attempts[q.id]) return false;
      if (effectiveStatus === 'correct' && (!attempts[q.id] || !attempts[q.id].isCorrect)) return false;
      if (effectiveStatus === 'incorrect' && (!attempts[q.id] || attempts[q.id].isCorrect)) return false;

      if (filters.searchQuery.trim()) {
        const query = filters.searchQuery.toLowerCase();
        const inPrompt = q.question.toLowerCase().includes(query);
        const inId = q.question_id?.toLowerCase().includes(query);
        const inCategory = q.category.toLowerCase().includes(query);
        const inOptions = Object.values(q.options).some((opt) =>
          opt.toLowerCase().includes(query)
        );
        const inConcept = q.solution.key_concept.toLowerCase().includes(query);
        const inExplanation = q.solution.detailed_explanation.toLowerCase().includes(query);
        return inPrompt || inId || inCategory || inOptions || inConcept || inExplanation;
      }

      return true;
    });
  }, [filters, attempts, bookmarks, activeSection]);

  // Overall Statistics computation
  const stats: ExamStats = useMemo(() => {
    let correct = 0;
    let incorrect = 0;
    Object.values(attempts).forEach((att) => {
      if (att.isCorrect) correct++;
      else incorrect++;
    });
    const attempted = correct + incorrect;
    const accuracy = attempted > 0 ? (correct / attempted) * 100 : 0;
    const score = correct * 1.0 - incorrect * 0.25;

    return {
      total: questionsData.length,
      attempted,
      correct,
      incorrect,
      bookmarked: bookmarks.size,
      accuracy,
      score,
    };
  }, [attempts, bookmarks]);

  // Event handlers
  const handleSelectOption = (qId: string, optionKey: string) => {
    const targetQ = questionsData.find((q) => q.id === qId);
    if (!targetQ) return;
    const isCorrect = optionKey === targetQ.correct_answer;
    setAttempts((prev) => ({
      ...prev,
      [qId]: {
        selectedOption: optionKey,
        isCorrect,
        timestamp: Date.now(),
      },
    }));
  };

  const handleClearOption = (qId: string) => {
    setAttempts((prev) => {
      const copy = { ...prev };
      delete copy[qId];
      return copy;
    });
  };

  const handleToggleBookmark = (qId: string) => {
    setBookmarks((prev) => {
      const next = new Set(prev);
      if (next.has(qId)) next.delete(qId);
      else next.add(qId);
      return next;
    });
  };

  const handleResetProgress = () => {
    setAttempts({});
    setBookmarks(new Set());
    localStorage.removeItem('exampyq_attempts');
    localStorage.removeItem('exampyq_bookmarks');
  };

  const handleUpdateFilters = (newFilters: Partial<FilterState>) => {
    setFilters((prev) => {
      const updated = { ...prev, ...newFilters };
      // Reset category if subject changed and category might not belong to new subject
      if (newFilters.subject !== undefined && newFilters.subject !== prev.subject) {
        updated.selectedCategory = 'all';
      }
      return updated;
    });
  };

  const handleResetFilters = () => {
    setFilters({
      subject: 'all',
      selectedExam: 'all',
      selectedCategory: 'all',
      selectedYear: 'all',
      searchQuery: '',
      attemptStatus: activeSection === 'revision' ? 'bookmarked' : 'all',
    });
  };

  const handleSectionChange = (section: PortalSection) => {
    setActiveSection(section);
    if (section === 'revision') {
      setFilters((prev) => ({
        ...prev,
        attemptStatus: bookmarks.size > 0 ? 'bookmarked' : 'incorrect',
      }));
    } else if (section === 'practice' && (filters.attemptStatus === 'bookmarked' || filters.attemptStatus === 'incorrect')) {
      setFilters((prev) => ({ ...prev, attemptStatus: 'all' }));
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExportBookmarks = () => {
    const bookmarkedQs = questionsData.filter((q) => bookmarks.has(q.id));
    const dataStr =
      'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(bookmarkedQs, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', dataStr);
    dlAnchor.setAttribute('download', 'exampyq_ssc_bookmarks.json');
    dlAnchor.click();
  };

  const handleLaunchPresetMock = (examId: string, subject: string, count: number, mins: number) => {
    const meta = getExamTrackMeta(examId);
    const pool = questionsData.filter((q) => {
      if (examId !== 'all' && !q.exams.includes(examId)) return false;
      if (subject !== 'all' && q.subject !== subject) return false;
      return true;
    });
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(count, shuffled.length));
    const subjectLabel =
      subject === 'all' ? 'Full Mixed Syllabus' : SUBJECT_METADATA[subject]?.shortLabel || subject;

    setActiveCBT({
      title: meta.fullName,
      subtitle: `${subjectLabel} • ${selected.length} Questions`,
      examCode: meta.shortName,
      questions: selected,
      durationMinutes: mins,
      positiveMarks: meta.positiveMarks,
      negativeMarks: meta.negativeMarks,
    });
  };

  const handleLaunchFilteredMock = () => {
    const meta = getExamTrackMeta(filters.selectedExam);
    const selected = filteredQuestions.slice(0, Math.min(50, filteredQuestions.length));
    if (selected.length === 0) return;
    setActiveCBT({
      title: `${meta.name} Custom Practice Mock`,
      subtitle: `${selected.length} Filtered PYQs`,
      examCode: meta.shortName,
      questions: selected,
      durationMinutes: Math.max(10, Math.round(selected.length * 0.8)),
      positiveMarks: meta.positiveMarks,
      negativeMarks: meta.negativeMarks,
    });
  };

  const handleSearchFromTopBar = (q: string) => {
    handleUpdateFilters({ searchQuery: q });
    if (q.trim() && activeSection !== 'practice' && activeSection !== 'revision') {
      setActiveSection('practice');
    }
  };

  const activeExamMeta = getExamTrackMeta(filters.selectedExam);

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900 dark:bg-[#090d16] dark:text-slate-100 font-sans transition-colors duration-200">
      {/* Persistent Professional Left Sidebar */}
      <Sidebar
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
        activeExam={filters.selectedExam}
        onExamChange={(exam) => handleUpdateFilters({ selectedExam: exam })}
        activeSubject={filters.subject}
        onSubjectChange={(subj) => handleUpdateFilters({ subject: subj })}
        examCounts={examCounts}
        subjectCounts={subjectCounts}
        totalQuestions={questionsData.length}
        bookmarkedCount={bookmarks.size}
        incorrectCount={stats.incorrect}
        stats={stats}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Right Workspace Column */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar
          activeSection={activeSection}
          activeExam={filters.selectedExam}
          activeSubject={filters.subject}
          searchQuery={filters.searchQuery}
          onSearchChange={handleSearchFromTopBar}
          onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
          onQuickLaunchMock={() =>
            handleLaunchPresetMock(
              filters.selectedExam,
              filters.subject,
              50,
              activeExamMeta.mockDurationMins
            )
          }
          onNavigateAnalytics={() => handleSectionChange('analytics')}
          stats={stats}
        />

        <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
          {activeSection === 'hub' && (
            <ExamHub
              questions={questionsData}
              attempts={attempts}
              bookmarks={bookmarks}
              stats={stats}
              activeExam={filters.selectedExam}
              examCounts={examCounts}
              onSelectExam={(examId) => handleUpdateFilters({ selectedExam: examId })}
              onPracticeSubject={(subj) => {
                handleUpdateFilters({ subject: subj });
                handleSectionChange('practice');
              }}
              onPracticeCategory={(cat) => {
                handleUpdateFilters({ subject: 'all', selectedCategory: cat });
                handleSectionChange('practice');
              }}
              onNavigateSection={handleSectionChange}
              onLaunchPresetMock={handleLaunchPresetMock}
            />
          )}

          {(activeSection === 'practice' || activeSection === 'revision') && (
            <div className="space-y-5">
              {/* Context Banner */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    {activeSection === 'revision' ? (
                      <>
                        <BookmarkCheck className="h-5 w-5 text-amber-500" />
                        <span>Revision & Mistakes Queue</span>
                      </>
                    ) : (
                      <span>{activeExamMeta.fullName}</span>
                    )}
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    {activeSection === 'revision'
                      ? 'Revisit bookmarked PYQs and incorrect attempts to lock in high-yield rules.'
                      : `${activeExamMeta.tierLabel} • Marking: +${activeExamMeta.positiveMarks} / -${activeExamMeta.negativeMarks}`}
                  </p>
                </div>

                <div className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Official Answer Keys Verified</span>
                </div>
              </div>

              <PracticeToolbar
                filters={filters}
                onFilterChange={handleUpdateFilters}
                onResetFilters={handleResetFilters}
                categories={categories}
                years={years}
                totalQuestions={questionsData.length}
                filteredCount={filteredQuestions.length}
                listMode={listMode}
                onListModeChange={setListMode}
                autoShowSolution={autoShowSolution}
                onAutoShowSolutionChange={setAutoShowSolution}
                onLaunchFilteredMock={handleLaunchFilteredMock}
                bookmarkedCount={bookmarks.size}
                onExportBookmarks={handleExportBookmarks}
                isRevisionView={activeSection === 'revision'}
              />

              {listMode === 'paginated' ? (
                <PaginatedList
                  questions={filteredQuestions}
                  attempts={attempts}
                  bookmarks={bookmarks}
                  onSelectOption={handleSelectOption}
                  onClearOption={handleClearOption}
                  onToggleBookmark={handleToggleBookmark}
                  autoShowSolutionOnAnswer={autoShowSolution}
                />
              ) : (
                <VirtualizedList
                  questions={filteredQuestions}
                  attempts={attempts}
                  bookmarks={bookmarks}
                  onSelectOption={handleSelectOption}
                  onClearOption={handleClearOption}
                  onToggleBookmark={handleToggleBookmark}
                  autoShowSolutionOnAnswer={autoShowSolution}
                />
              )}
            </div>
          )}

          {activeSection === 'mock_center' && (
            <MockTestCenter
              questions={questionsData}
              activeExam={filters.selectedExam}
              onStartCBT={(config) => setActiveCBT(config)}
            />
          )}

          {activeSection === 'analytics' && (
            <AnalyticsView
              questions={questionsData}
              attempts={attempts}
              bookmarks={bookmarks}
              stats={stats}
              onSelectCategory={(cat) => {
                handleUpdateFilters({ subject: 'all', selectedCategory: cat });
                handleSectionChange('practice');
              }}
              onResetProgress={handleResetProgress}
              onExportBookmarks={handleExportBookmarks}
            />
          )}
        </main>

        {/* Footer */}
        <footer className="mt-12 border-t border-slate-200/80 bg-white/80 py-6 px-4 sm:px-6 text-center text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400">
          <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              ExamPYQ Pro — SSC CGL, CPO & CHSL Preparation Portal
            </span>
            <span>
              2,000+ Official Shift PYQs • English, Quant, Reasoning & General Awareness
            </span>
          </div>
        </footer>
      </div>

      {/* CBT Exam Simulator Overlay */}
      {activeCBT && (
        <CBTExamModal
          config={activeCBT}
          onExit={() => setActiveCBT(null)}
          onSaveProgress={(examAttempts) => {
            setAttempts((prev) => ({ ...prev, ...examAttempts }));
          }}
        />
      )}
    </div>
  );
};

export default App;
