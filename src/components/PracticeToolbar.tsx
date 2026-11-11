import React from 'react';
import type { FilterState, ListMode } from '../types';
import {
  Search,
  X,
  ListOrdered,
  Layers,
  RotateCcw,
  Play,
  Download,
  SlidersHorizontal,
} from 'lucide-react';

interface PracticeToolbarProps {
  filters: FilterState;
  onFilterChange: (newFilters: Partial<FilterState>) => void;
  onResetFilters: () => void;
  categories: string[];
  years: number[];
  totalQuestions: number;
  filteredCount: number;
  listMode: ListMode;
  onListModeChange: (mode: ListMode) => void;
  autoShowSolution: boolean;
  onAutoShowSolutionChange: (val: boolean) => void;
  onLaunchFilteredMock: () => void;
  bookmarkedCount: number;
  onExportBookmarks: () => void;
  isRevisionView?: boolean;
}

export const PracticeToolbar: React.FC<PracticeToolbarProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  categories,
  years,
  totalQuestions,
  filteredCount,
  listMode,
  onListModeChange,
  autoShowSolution,
  onAutoShowSolutionChange,
  onLaunchFilteredMock,
  bookmarkedCount,
  onExportBookmarks,
  isRevisionView = false,
}) => {
  const hasActiveFilters =
    filters.searchQuery.trim() !== '' ||
    filters.selectedCategory !== 'all' ||
    filters.selectedYear !== 'all' ||
    (!isRevisionView && filters.attemptStatus !== 'all');

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
      {/* Top Controls Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Structured Select Facets (replaces multi-row tab clutter) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 flex-1">
          {/* Topic / Category Select */}
          <div className="relative">
            <label className="sr-only" htmlFor="filter-topic">
              Topic
            </label>
            <select
              id="filter-topic"
              value={filters.selectedCategory}
              onChange={(e) => onFilterChange({ selectedCategory: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-xs font-medium text-slate-800 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-100"
            >
              <option value="all">All Topics ({categories.length})</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Year Select */}
          <div>
            <label className="sr-only" htmlFor="filter-year">
              Exam Year
            </label>
            <select
              id="filter-year"
              value={filters.selectedYear}
              onChange={(e) => onFilterChange({ selectedYear: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-xs font-medium text-slate-800 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-100"
            >
              <option value="all">All Years (2022–2024)</option>
              {years.map((yr) => (
                <option key={yr} value={String(yr)}>
                  {yr} Shift Archive
                </option>
              ))}
            </select>
          </div>

          {/* Status Select */}
          {!isRevisionView ? (
            <div>
              <label className="sr-only" htmlFor="filter-status">
                Attempt Status
              </label>
              <select
                id="filter-status"
                value={filters.attemptStatus}
                onChange={(e) =>
                  onFilterChange({
                    attemptStatus: e.target.value as FilterState['attemptStatus'],
                  })
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-xs font-medium text-slate-800 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-100"
              >
                <option value="all">Status: All Questions</option>
                <option value="unattempted">Status: Unattempted Only</option>
                <option value="correct">Status: Answered Correctly</option>
                <option value="incorrect">Status: Incorrect / Mistakes</option>
                <option value="bookmarked">Status: Bookmarked</option>
              </select>
            </div>
          ) : (
            <div>
              <label className="sr-only" htmlFor="revision-status">
                Revision Focus
              </label>
              <select
                id="revision-status"
                value={filters.attemptStatus === 'incorrect' ? 'incorrect' : 'bookmarked'}
                onChange={(e) =>
                  onFilterChange({
                    attemptStatus: e.target.value as 'bookmarked' | 'incorrect',
                  })
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-xs font-medium text-slate-800 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-100"
              >
                <option value="bookmarked">Revision: Bookmarked Questions</option>
                <option value="incorrect">Revision: Incorrect Answers</option>
              </select>
            </div>
          )}
        </div>

        {/* Mobile / Compact Search Input */}
        <div className="relative md:hidden">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
            placeholder="Search questions, rules, IDs..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2 pl-9 pr-8 text-xs text-slate-800 placeholder-slate-400 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-100"
          />
          {filters.searchQuery && (
            <button
              onClick={() => onFilterChange({ searchQuery: '' })}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Right Controls: List Mode Switcher + Filtered Mock CTA */}
        <div className="flex flex-wrap items-center justify-between lg:justify-end gap-2.5">
          <div className="inline-flex items-center rounded-xl border border-slate-200 bg-slate-100/80 p-1 dark:border-slate-700 dark:bg-slate-800">
            <button
              onClick={() => onListModeChange('paginated')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all ${
                listMode === 'paginated'
                  ? 'bg-white text-brand-700 shadow-xs dark:bg-slate-700 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <ListOrdered className="h-3.5 w-3.5" />
              <span>Pages</span>
            </button>
            <button
              onClick={() => onListModeChange('virtualized')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all ${
                listMode === 'virtualized'
                  ? 'bg-white text-brand-700 shadow-xs dark:bg-slate-700 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
              title="High-speed virtualized scroll"
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Fast Scroll</span>
            </button>
          </div>

          {filteredCount > 0 && (
            <button
              onClick={onLaunchFilteredMock}
              className="inline-flex items-center gap-1.5 rounded-xl border border-brand-200 bg-brand-50 px-3 py-2 text-xs font-semibold text-brand-700 hover:bg-brand-100 dark:border-brand-800/70 dark:bg-brand-950/60 dark:text-brand-300 dark:hover:bg-brand-900/60 transition-colors"
            >
              <Play className="h-3.5 w-3.5" />
              <span>Mock This Set ({Math.min(50, filteredCount)}Q)</span>
            </button>
          )}
        </div>
      </div>

      {/* Bottom Meta Row: Count, Preferences & Active Filter Reset */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-medium">
            <SlidersHorizontal className="h-3.5 w-3.5 text-slate-400" />
            <span>
              Showing{' '}
              <strong className="tabular-nums text-slate-900 dark:text-white">
                {filteredCount.toLocaleString()}
              </strong>{' '}
              of {totalQuestions.toLocaleString()} questions
            </span>
          </div>

          {hasActiveFilters && (
            <button
              onClick={onResetFilters}
              className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Clear Filters</span>
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-600 dark:text-slate-400 select-none">
            <input
              type="checkbox"
              checked={autoShowSolution}
              onChange={(e) => onAutoShowSolutionChange(e.target.checked)}
              className="h-3.5 w-3.5 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            />
            <span>Auto-reveal solution on answer</span>
          </label>

          {bookmarkedCount > 0 && (
            <button
              onClick={onExportBookmarks}
              className="inline-flex items-center gap-1.5 font-semibold text-slate-600 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-300 transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export Bookmarks ({bookmarkedCount})</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
