import React from 'react';
import type { PortalSection, ExamStats } from '../types';
import { getExamTrackMeta, SUBJECT_METADATA } from '../data/examCatalog';
import {
  Menu,
  Search,
  X,
  Play,
  BarChart3,
  ChevronRight,
} from 'lucide-react';

interface TopBarProps {
  activeSection: PortalSection;
  activeExam: string;
  activeSubject: string;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenMobileMenu: () => void;
  onQuickLaunchMock: () => void;
  onNavigateAnalytics: () => void;
  stats: ExamStats;
}

const SECTION_TITLES: Record<PortalSection, string> = {
  hub: 'Exam Hub',
  practice: 'Question Bank',
  mock_center: 'Mock Test Center',
  revision: 'Revision Queue',
  analytics: 'Performance Analytics',
};

export const TopBar: React.FC<TopBarProps> = ({
  activeSection,
  activeExam,
  activeSubject,
  searchQuery,
  onSearchChange,
  onOpenMobileMenu,
  onQuickLaunchMock,
  onNavigateAnalytics,
  stats,
}) => {
  const examMeta = getExamTrackMeta(activeExam);
  const subjectLabel =
    activeSubject === 'all'
      ? null
      : SUBJECT_METADATA[activeSubject]?.shortLabel || activeSubject;

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-4 border-b border-slate-200/90 bg-white/90 px-4 sm:px-6 backdrop-blur-md dark:border-slate-800/90 dark:bg-slate-900/90">
      {/* Left: Mobile Drawer Trigger + Breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <nav className="flex items-center gap-1.5 text-xs sm:text-sm min-w-0">
          <span className="hidden sm:inline font-semibold text-slate-500 dark:text-slate-400">
            {examMeta.name}
          </span>
          <ChevronRight className="hidden sm:inline h-4 w-4 text-slate-400 shrink-0" />
          <span className="font-bold text-slate-900 dark:text-white truncate">
            {SECTION_TITLES[activeSection]}
          </span>
          {subjectLabel && activeSection === 'practice' && (
            <>
              <ChevronRight className="hidden md:inline h-4 w-4 text-slate-400 shrink-0" />
              <span className="hidden md:inline rounded-md bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700 dark:bg-brand-950/70 dark:text-brand-300 truncate">
                {subjectLabel}
              </span>
            </>
          )}
        </nav>
      </div>

      {/* Right: Search + Score Pill + Primary Mock CTA */}
      <div className="flex items-center gap-2.5 sm:gap-3 flex-1 justify-end max-w-2xl">
        {/* Global Search */}
        <div className="relative flex-1 max-w-xs hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search PYQs, idioms, topics, IDs..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50/80 py-2 pl-9 pr-8 text-xs text-slate-800 placeholder-slate-400 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:bg-slate-900 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Analytics Quick Pill */}
        <button
          onClick={onNavigateAnalytics}
          className="hidden sm:flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-1.5 text-xs hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800/60 dark:hover:border-slate-600 transition-colors"
          title="View Performance Analytics"
        >
          <BarChart3 className="h-4 w-4 text-brand-600 dark:text-brand-400" />
          <span className="text-slate-500 dark:text-slate-400">Accuracy</span>
          <span className="font-bold tabular-nums text-slate-900 dark:text-white">
            {stats.accuracy.toFixed(0)}%
          </span>
        </button>

        {/* Launch CBT Mock CTA */}
        <button
          onClick={onQuickLaunchMock}
          className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-brand-700 active:scale-[0.99] transition-all shrink-0"
        >
          <Play className="h-3.5 w-3.5 fill-current" />
          <span>Start CBT Mock</span>
        </button>
      </div>
    </header>
  );
};
