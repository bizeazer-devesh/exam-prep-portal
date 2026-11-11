import React from 'react';
import type { PortalSection, ExamStats } from '../types';
import { SSC_EXAM_TRACKS, SUBJECT_METADATA } from '../data/examCatalog';
import {
  GraduationCap,
  LayoutDashboard,
  BookOpen,
  MonitorPlay,
  BookmarkCheck,
  BarChart3,
  Award,
  BookText,
  Calculator,
  BrainCircuit,
  Globe2,
  Layers,
  PanelLeftClose,
  PanelLeftOpen,
  Sun,
  Moon,
  X,
} from 'lucide-react';

interface SidebarProps {
  activeSection: PortalSection;
  onSectionChange: (section: PortalSection) => void;
  activeExam: string;
  onExamChange: (exam: string) => void;
  activeSubject: string;
  onSubjectChange: (subject: string) => void;
  examCounts: Record<string, number>;
  subjectCounts: Record<string, number>;
  totalQuestions: number;
  bookmarkedCount: number;
  incorrectCount: number;
  stats: ExamStats;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

const SUBJECT_ICONS: Record<string, React.ReactNode> = {
  'English Language & Comprehension': <BookText className="h-4 w-4 shrink-0" />,
  'Quantitative Aptitude': <Calculator className="h-4 w-4 shrink-0" />,
  'General Intelligence & Reasoning': <BrainCircuit className="h-4 w-4 shrink-0" />,
  'General Knowledge & General Awareness': <Globe2 className="h-4 w-4 shrink-0" />,
};

export const Sidebar: React.FC<SidebarProps> = ({
  activeSection,
  onSectionChange,
  activeExam,
  onExamChange,
  activeSubject,
  onSubjectChange,
  examCounts,
  subjectCounts,
  totalQuestions,
  bookmarkedCount,
  incorrectCount,
  stats,
  isDarkMode,
  onToggleDarkMode,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
}) => {
  const navItems: {
    id: PortalSection;
    label: string;
    icon: React.ReactNode;
    badge?: number | string;
    badgeColor?: string;
  }[] = [
    {
      id: 'hub',
      label: 'Exam Hub',
      icon: <LayoutDashboard className="h-4 w-4 shrink-0" />,
    },
    {
      id: 'practice',
      label: 'Question Bank',
      icon: <BookOpen className="h-4 w-4 shrink-0" />,
      badge: totalQuestions.toLocaleString(),
    },
    {
      id: 'mock_center',
      label: 'Mock Test Center',
      icon: <MonitorPlay className="h-4 w-4 shrink-0" />,
      badge: 'CBT',
      badgeColor: 'bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300',
    },
    {
      id: 'revision',
      label: 'Revision Queue',
      icon: <BookmarkCheck className="h-4 w-4 shrink-0" />,
      badge: bookmarkedCount + incorrectCount > 0 ? bookmarkedCount + incorrectCount : undefined,
      badgeColor: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
    },
    {
      id: 'analytics',
      label: 'Analytics & Mastery',
      icon: <BarChart3 className="h-4 w-4 shrink-0" />,
    },
  ];

  const completionPct = totalQuestions > 0 ? Math.min(100, (stats.attempted / totalQuestions) * 100) : 0;

  const sidebarContent = (
    <div className="flex h-full flex-col bg-white dark:bg-slate-900 border-r border-slate-200/90 dark:border-slate-800/90 select-none">
      {/* Brand Header */}
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200/80 px-4 dark:border-slate-800">
        <button
          onClick={() => {
            onSectionChange('hub');
            onCloseMobile();
          }}
          className="flex items-center gap-3 text-left min-w-0"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm shadow-brand-600/20">
            <GraduationCap className="h-5 w-5" />
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold tracking-tight text-slate-900 dark:text-white truncate">
                  ExamPYQ
                </span>
                <span className="rounded bg-brand-50 px-1.5 py-0.5 text-xs font-bold text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                  PRO
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                SSC Preparation Portal
              </p>
            </div>
          )}
        </button>

        {/* Desktop collapse toggle */}
        <button
          onClick={onToggleCollapse}
          className="hidden lg:flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </button>

        {/* Mobile close button */}
        <button
          onClick={onCloseMobile}
          className="lg:hidden flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label="Close navigation"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Scrollable Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {/* Workspace Section */}
        <div className="space-y-1">
          {!isCollapsed && (
            <div className="px-3 pb-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Workspace
            </div>
          )}
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSectionChange(item.id);
                  onCloseMobile();
                }}
                title={isCollapsed ? item.label : undefined}
                className={`w-full flex items-center justify-between gap-2.5 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 shadow-xs ring-1 ring-brand-200/80 dark:ring-brand-800/60'
                    : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/70 dark:hover:text-slate-100'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className={isActive ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400 dark:text-slate-500'}>
                    {item.icon}
                  </span>
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </div>
                {!isCollapsed && item.badge !== undefined && (
                  <span
                    className={`rounded-md px-1.5 py-0.5 text-xs font-semibold tabular-nums ${
                      item.badgeColor ||
                      (isActive
                        ? 'bg-brand-100 text-brand-700 dark:bg-brand-900/70 dark:text-brand-200'
                        : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400')
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* SSC Exam Tracks Section */}
        <div className="space-y-1">
          {!isCollapsed && (
            <div className="px-3 pb-1.5 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              <span>SSC Exam Tracks</span>
              <span>{SSC_EXAM_TRACKS.length - 1}</span>
            </div>
          )}
          {SSC_EXAM_TRACKS.map((track) => {
            const isActive = activeExam === track.id;
            const count = track.id === 'all' ? totalQuestions : examCounts[track.id] || 0;
            return (
              <button
                key={track.id}
                onClick={() => {
                  onExamChange(track.id);
                  if (activeSection === 'analytics' || activeSection === 'revision') {
                    onSectionChange('practice');
                  }
                  onCloseMobile();
                }}
                title={isCollapsed ? `${track.name} (${count})` : track.fullName}
                className={`w-full flex items-center justify-between gap-2 rounded-xl px-3 py-2 text-xs transition-all ${
                  isActive
                    ? 'bg-slate-900 text-white font-semibold dark:bg-slate-100 dark:text-slate-900 shadow-sm'
                    : 'text-slate-600 font-medium hover:bg-slate-100/80 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/70 dark:hover:text-slate-100'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Award
                    className={`h-4 w-4 shrink-0 ${
                      isActive
                        ? 'text-brand-400 dark:text-brand-600'
                        : 'text-slate-400 dark:text-slate-500'
                    }`}
                  />
                  {!isCollapsed && <span className="truncate">{track.name}</span>}
                </div>
                {!isCollapsed && (
                  <span
                    className={`text-xs tabular-nums ${
                      isActive ? 'text-slate-300 dark:text-slate-600' : 'text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    {count.toLocaleString()}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Subjects Syllabus Section */}
        <div className="space-y-1">
          {!isCollapsed && (
            <div className="px-3 pb-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Subjects Syllabus
            </div>
          )}

          <button
            onClick={() => {
              onSubjectChange('all');
              if (activeSection === 'hub') onSectionChange('practice');
              onCloseMobile();
            }}
            title={isCollapsed ? 'All Subjects' : undefined}
            className={`w-full flex items-center justify-between gap-2 rounded-xl px-3 py-2 text-xs transition-all ${
              activeSubject === 'all'
                ? 'bg-slate-100 text-slate-900 font-semibold dark:bg-slate-800 dark:text-white'
                : 'text-slate-600 font-medium hover:bg-slate-100/80 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/70 dark:hover:text-slate-100'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Layers className="h-4 w-4 shrink-0 text-slate-400" />
              {!isCollapsed && <span className="truncate">All Subjects</span>}
            </div>
            {!isCollapsed && (
              <span className="text-xs tabular-nums text-slate-400">
                {totalQuestions.toLocaleString()}
              </span>
            )}
          </button>

          {Object.keys(SUBJECT_METADATA).map((subjectName) => {
            const meta = SUBJECT_METADATA[subjectName];
            const isActive = activeSubject === subjectName;
            const count = subjectCounts[subjectName] || 0;
            return (
              <button
                key={subjectName}
                onClick={() => {
                  onSubjectChange(subjectName);
                  if (activeSection === 'hub' || activeSection === 'analytics') {
                    onSectionChange('practice');
                  }
                  onCloseMobile();
                }}
                title={isCollapsed ? meta.shortLabel : subjectName}
                className={`w-full flex items-center justify-between gap-2 rounded-xl px-3 py-2 text-xs transition-all ${
                  isActive
                    ? 'bg-brand-50 text-brand-700 font-semibold dark:bg-brand-950/60 dark:text-brand-300'
                    : 'text-slate-600 font-medium hover:bg-slate-100/80 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/70 dark:hover:text-slate-100'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className={isActive ? meta.colorClass : 'text-slate-400 dark:text-slate-500'}>
                    {SUBJECT_ICONS[subjectName] || <BookOpen className="h-4 w-4 shrink-0" />}
                  </span>
                  {!isCollapsed && <span className="truncate">{meta.shortLabel}</span>}
                </div>
                {!isCollapsed && (
                  <span
                    className={`text-xs tabular-nums ${
                      isActive ? 'text-brand-600 dark:text-brand-300' : 'text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sidebar Footer: Progress Summary + Theme Toggle */}
      <div className="shrink-0 border-t border-slate-200/80 p-3 dark:border-slate-800 space-y-3">
        {!isCollapsed && (
          <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-slate-700 dark:text-slate-200">Overall Progress</span>
              <span className="font-bold tabular-nums text-brand-600 dark:text-brand-400">
                {stats.attempted}/{totalQuestions}
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
              <div
                className="h-full rounded-full bg-brand-600 dark:bg-brand-400 transition-all duration-300"
                style={{ width: `${completionPct}%` }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>Accuracy: <strong className="text-slate-700 dark:text-slate-200 tabular-nums">{stats.accuracy.toFixed(0)}%</strong></span>
              <span>Score: <strong className="text-emerald-600 dark:text-emerald-400 tabular-nums">{stats.score.toFixed(1)}</strong></span>
            </div>
          </div>
        )}

        <button
          onClick={onToggleDarkMode}
          className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700/80 transition-colors"
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDarkMode ? (
            <>
              <Sun className="h-4 w-4 text-amber-400 shrink-0" />
              {!isCollapsed && <span>Light Appearance</span>}
            </>
          ) : (
            <>
              <Moon className="h-4 w-4 text-slate-600 shrink-0" />
              {!isCollapsed && <span>Dark Appearance</span>}
            </>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed/Collapsible Sidebar */}
      <aside
        className={`hidden lg:block shrink-0 transition-all duration-200 ${
          isCollapsed ? 'w-[76px]' : 'w-72'
        }`}
      >
        <div className="sticky top-0 h-screen">{sidebarContent}</div>
      </aside>

      {/* Mobile Slide-Over Sidebar */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            onClick={onCloseMobile}
          />
          <aside className="relative z-10 w-72 max-w-[85vw] h-full shadow-2xl">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
};
