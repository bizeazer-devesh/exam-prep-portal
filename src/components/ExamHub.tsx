import React from 'react';
import type { Question, QuestionAttempt, ExamStats, PortalSection } from '../types';
import { SSC_EXAM_TRACKS, SUBJECT_METADATA, getExamTrackMeta } from '../data/examCatalog';
import {
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  Flame,
  Play,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
} from 'lucide-react';

interface ExamHubProps {
  questions: Question[];
  attempts: Record<string, QuestionAttempt>;
  bookmarks: Set<string>;
  stats: ExamStats;
  activeExam: string;
  examCounts: Record<string, number>;
  onSelectExam: (examId: string) => void;
  onPracticeSubject: (subject: string) => void;
  onPracticeCategory: (category: string) => void;
  onNavigateSection: (section: PortalSection) => void;
  onLaunchPresetMock: (examId: string, subject: string, count: number, mins: number) => void;
}

export const ExamHub: React.FC<ExamHubProps> = ({
  questions,
  attempts,
  bookmarks,
  stats,
  activeExam,
  examCounts,
  onSelectExam,
  onPracticeSubject,
  onPracticeCategory,
  onNavigateSection,
  onLaunchPresetMock,
}) => {
  const activeTrack = getExamTrackMeta(activeExam);

  // Compute subject-wise stats
  const subjectStats = Object.keys(SUBJECT_METADATA).map((subjectName) => {
    const subQs = questions.filter((q) => q.subject === subjectName);
    let attempted = 0;
    let correct = 0;
    subQs.forEach((q) => {
      const att = attempts[q.id];
      if (att) {
        attempted++;
        if (att.isCorrect) correct++;
      }
    });
    const accuracy = attempted > 0 ? (correct / attempted) * 100 : 0;
    const progress = subQs.length > 0 ? (attempted / subQs.length) * 100 : 0;
    return {
      subjectName,
      meta: SUBJECT_METADATA[subjectName],
      total: subQs.length,
      attempted,
      correct,
      accuracy,
      progress,
    };
  });

  // Compute top high-yield categories (largest question banks)
  const categoryCounts: Record<string, { total: number; attempted: number; correct: number }> = {};
  questions.forEach((q) => {
    if (!categoryCounts[q.category]) {
      categoryCounts[q.category] = { total: 0, attempted: 0, correct: 0 };
    }
    categoryCounts[q.category].total++;
    const att = attempts[q.id];
    if (att) {
      categoryCounts[q.category].attempted++;
      if (att.isCorrect) categoryCounts[q.category].correct++;
    }
  });

  const topCategories = Object.entries(categoryCounts)
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 8);

  const featuredExams = SSC_EXAM_TRACKS.filter((t) =>
    ['SSC CGL', 'SSC CPO', 'SSC CHSL', 'SSC CPO 2024'].includes(t.id)
  );

  return (
    <div className="space-y-8">
      {/* Hero Portal Banner */}
      <section className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Official SSC Answer Keys Verified • 2022–2024 Shifts</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              {activeTrack.fullName}
            </h1>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              {activeTrack.description} Practice topic-wise previous year questions across English,
              Quantitative Aptitude, Reasoning, and General Awareness, or simulate timed CBT mocks.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                onClick={() => onNavigateSection('practice')}
                className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-brand-700 transition-colors"
              >
                <BookOpen className="h-4 w-4" />
                <span>Open Question Bank</span>
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={() =>
                  onLaunchPresetMock(
                    activeTrack.id,
                    'all',
                    Math.min(50, questions.length),
                    activeTrack.mockDurationMins
                  )
                }
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-semibold text-slate-800 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <Play className="h-4 w-4 text-brand-600 dark:text-brand-400" />
                <span>Launch {activeTrack.shortName} 50Q Mock</span>
              </button>
            </div>
          </div>

          {/* Right KPI Grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2 lg:w-80 shrink-0">
            <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/50">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>PYQ Bank</span>
                <Sparkles className="h-3.5 w-3.5 text-brand-500" />
              </div>
              <div className="mt-1.5 text-2xl font-bold tabular-nums text-slate-900 dark:text-white">
                {stats.total.toLocaleString()}
              </div>
              <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">4 Core Subjects</div>
            </div>

            <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/50">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Attempted</span>
                <Target className="h-3.5 w-3.5 text-indigo-500" />
              </div>
              <div className="mt-1.5 text-2xl font-bold tabular-nums text-slate-900 dark:text-white">
                {stats.attempted}
              </div>
              <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                {stats.correct} correct
              </div>
            </div>

            <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/50">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Accuracy</span>
                <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
              </div>
              <div className="mt-1.5 text-2xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                {stats.accuracy.toFixed(0)}%
              </div>
              <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                Net: {stats.score.toFixed(1)}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/50">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Saved</span>
                <Flame className="h-3.5 w-3.5 text-amber-500" />
              </div>
              <div className="mt-1.5 text-2xl font-bold tabular-nums text-slate-900 dark:text-white">
                {bookmarks.size}
              </div>
              <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                {stats.incorrect} to review
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Multi-SSC Exam Tracks Section */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              SSC Examination Tracks
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Switch between official SSC recruitment tracks with tailored marking schemes and mock configurations.
            </p>
          </div>
          <button
            onClick={() => onNavigateSection('mock_center')}
            className="text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 flex items-center gap-1"
          >
            <span>Open Full Mock Center</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {featuredExams.map((track) => {
            const count = examCounts[track.id] || 0;
            const isSelected = activeExam === track.id;
            return (
              <div
                key={track.id}
                className={`flex flex-col justify-between rounded-2xl border p-5 transition-all ${
                  isSelected
                    ? 'border-brand-500 bg-brand-50/40 dark:border-brand-500/70 dark:bg-brand-950/20 shadow-sm'
                    : 'border-slate-200/90 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700 shadow-xs'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold ${track.accentClass}`}>
                      <Award className="h-3.5 w-3.5" />
                      <span>{track.name}</span>
                    </span>
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      {track.tierLabel}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                      {track.fullName}
                    </h3>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {track.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 pt-1 text-xs text-slate-600 dark:text-slate-300">
                    <span className="font-semibold tabular-nums">{count.toLocaleString()} Qs</span>
                    <span className="text-slate-300 dark:text-slate-700">•</span>
                    <span className="tabular-nums">
                      +{track.positiveMarks} / -{track.negativeMarks}
                    </span>
                  </div>
                </div>

                <div className="mt-5 flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => {
                      onSelectExam(track.id);
                      onNavigateSection('practice');
                    }}
                    className="flex-1 rounded-xl border border-slate-200 bg-white py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    Practice PYQs
                  </button>
                  <button
                    onClick={() =>
                      onLaunchPresetMock(
                        track.id,
                        'all',
                        Math.min(50, count),
                        track.mockDurationMins
                      )
                    }
                    className="rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white transition-colors"
                  >
                    Mock Test
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4-Subject Syllabus Mastery Grid */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Core Syllabus Subjects
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Track subject-wise completion across all 4 Tier-1 & Tier-2 SSC sections.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {subjectStats.map((sub) => (
            <div
              key={sub.subjectName}
              className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between gap-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <span
                    className={`inline-block rounded-md border px-2.5 py-0.5 text-xs font-semibold ${sub.meta.badgeBgClass}`}
                  >
                    {sub.meta.shortLabel}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white pt-1">
                    {sub.subjectName}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {sub.meta.description}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-lg font-bold tabular-nums text-slate-900 dark:text-white">
                    {sub.total}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Questions</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 dark:text-slate-400">
                    Solved: <strong className="text-slate-900 dark:text-white tabular-nums">{sub.attempted}/{sub.total}</strong>
                  </span>
                  <span className="font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                    {sub.attempted > 0 ? `${sub.accuracy.toFixed(0)}% accuracy` : 'Not started'}
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-brand-600 dark:bg-brand-500 transition-all duration-300"
                    style={{ width: `${sub.progress}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => onPracticeSubject(sub.subjectName)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400"
                >
                  <span>Practice Topic-Wise</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => onLaunchPresetMock(activeExam, sub.subjectName, 25, 20)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  <Clock className="h-3.5 w-3.5" />
                  <span>25Q Sectional Quiz</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* High-Yield Topics Quick Jump */}
      <section className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              High-Yield SSC Topics
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Jump directly into the most frequently tested topics across SSC CGL, CPO & CHSL shifts.
            </p>
          </div>
          <button
            onClick={() => onNavigateSection('analytics')}
            className="text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400"
          >
            View All 41 Topics
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {topCategories.map(([cat, data]) => {
            const acc = data.attempted > 0 ? Math.round((data.correct / data.attempted) * 100) : null;
            return (
              <button
                key={cat}
                onClick={() => onPracticeCategory(cat)}
                className="group flex items-center justify-between gap-3 rounded-xl border border-slate-200/80 bg-slate-50/50 p-3.5 text-left hover:border-brand-300 hover:bg-brand-50/40 dark:border-slate-800 dark:bg-slate-800/40 dark:hover:border-brand-700 dark:hover:bg-brand-950/30 transition-all"
              >
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-slate-800 group-hover:text-brand-700 dark:text-slate-200 dark:group-hover:text-brand-300 truncate">
                    {cat}
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                    <span>{data.total} Qs</span>
                    {acc !== null && (
                      <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                        <CheckCircle2 className="h-3 w-3" />
                        {acc}%
                      </span>
                    )}
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-slate-400 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors" />
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
};
