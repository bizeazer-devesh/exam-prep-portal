import React, { useState, useMemo } from 'react';
import type { Question, QuestionAttempt, ExamStats } from '../types';
import { SUBJECT_METADATA } from '../data/examCatalog';
import {
  Award,
  CheckCircle2,
  XCircle,
  Bookmark,
  Download,
  RotateCcw,
  ArrowRight,
  BarChart3,
} from 'lucide-react';

interface AnalyticsViewProps {
  questions: Question[];
  attempts: Record<string, QuestionAttempt>;
  bookmarks: Set<string>;
  stats: ExamStats;
  onSelectCategory: (cat: string) => void;
  onResetProgress: () => void;
  onExportBookmarks: () => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  questions,
  attempts,
  bookmarks,
  stats,
  onSelectCategory,
  onResetProgress,
  onExportBookmarks,
}) => {
  const [sortBy, setSortBy] = useState<'total' | 'attempted' | 'weakest'>('total');

  const subjectStats = useMemo(() => {
    return Object.keys(SUBJECT_METADATA).map((subj) => {
      const subQs = questions.filter((q) => q.subject === subj);
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
      return {
        name: subj,
        meta: SUBJECT_METADATA[subj],
        total: subQs.length,
        attempted,
        correct,
        incorrect: attempted - correct,
        accuracy,
      };
    });
  }, [questions, attempts]);

  const categoryStats = useMemo(() => {
    const map: Record<string, { total: number; attempted: number; correct: number; subject: string }> = {};
    questions.forEach((q) => {
      if (!map[q.category]) {
        map[q.category] = { total: 0, attempted: 0, correct: 0, subject: q.subject };
      }
      map[q.category].total += 1;
      const att = attempts[q.id];
      if (att) {
        map[q.category].attempted += 1;
        if (att.isCorrect) map[q.category].correct += 1;
      }
    });

    return Object.entries(map)
      .map(([name, data]) => ({
        name,
        ...data,
        accuracy: data.attempted > 0 ? (data.correct / data.attempted) * 100 : 0,
      }))
      .sort((a, b) => {
        if (sortBy === 'attempted') return b.attempted - a.attempted || b.total - a.total;
        if (sortBy === 'weakest') {
          if (a.attempted === 0 && b.attempted === 0) return b.total - a.total;
          if (a.attempted === 0) return 1;
          if (b.attempted === 0) return -1;
          return a.accuracy - b.accuracy;
        }
        return b.total - a.total;
      });
  }, [questions, attempts, sortBy]);

  return (
    <div className="space-y-8">
      {/* Top Overview KPI Strip */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span>Net Score (+1 / -0.25)</span>
            <Award className="h-4 w-4 text-brand-500" />
          </div>
          <div className="mt-2 text-3xl font-bold tabular-nums text-slate-900 dark:text-white">
            {stats.score.toFixed(2)}
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Across {stats.attempted.toLocaleString()} attempted questions
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span>Overall Accuracy</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-3xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
            {stats.accuracy.toFixed(1)}%
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
            {stats.correct} correct answers
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span>Mistakes to Revise</span>
            <XCircle className="h-4 w-4 text-rose-500" />
          </div>
          <div className="mt-2 text-3xl font-bold tabular-nums text-rose-600 dark:text-rose-400">
            {stats.incorrect}
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Review in Revision Queue
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span>Bookmarked PYQs</span>
            <Bookmark className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-2 text-3xl font-bold tabular-nums text-slate-900 dark:text-white">
            {bookmarks.size}
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Saved for high-yield revision
          </p>
        </div>
      </section>

      {/* Subject-wise Performance Breakdown */}
      <section className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-brand-600 dark:text-brand-400" />
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Subject-Wise Performance
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {subjectStats.map((sub) => (
            <div
              key={sub.name}
              className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/40 space-y-3"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {sub.meta.shortLabel}
                </span>
                <span className="text-xs font-semibold tabular-nums text-slate-600 dark:text-slate-300">
                  {sub.correct}/{sub.attempted} ({sub.accuracy.toFixed(0)}%)
                </span>
              </div>

              <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                  style={{ width: `${sub.accuracy}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                <span>Completion: {sub.attempted} / {sub.total}</span>
                <span>Incorrect: {sub.incorrect}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 41-Topic Mastery Breakdown */}
      <section className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Topic-Wise Mastery ({categoryStats.length} Topics)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Click any topic to launch focused PYQ practice for that concept.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'total' | 'attempted' | 'weakest')}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="total">Question Count</option>
              <option value="attempted">Most Practiced</option>
              <option value="weakest">Lowest Accuracy First</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {categoryStats.map((cat) => (
            <button
              key={cat.name}
              onClick={() => onSelectCategory(cat.name)}
              className="group rounded-xl border border-slate-200/80 bg-slate-50/40 p-3.5 text-left hover:border-brand-300 hover:bg-brand-50/30 dark:border-slate-800 dark:bg-slate-800/30 dark:hover:border-brand-700 transition-all space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-semibold text-slate-800 group-hover:text-brand-700 dark:text-slate-200 dark:group-hover:text-brand-300 line-clamp-1">
                  {cat.name}
                </span>
                <ArrowRight className="h-3.5 w-3.5 shrink-0 text-slate-400 group-hover:text-brand-600" />
              </div>

              <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                <div
                  className="h-full rounded-full bg-brand-600 dark:bg-brand-400 transition-all"
                  style={{ width: `${cat.accuracy}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                <span>
                  {cat.correct}/{cat.attempted} solved ({cat.total} total)
                </span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {cat.attempted > 0 ? `${cat.accuracy.toFixed(0)}%` : '—'}
                </span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Data Management Footer */}
      <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Study Data & Progress Controls
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            All attempts and bookmarks are persisted locally in your browser.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {bookmarks.size > 0 && (
            <button
              onClick={onExportBookmarks}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Export Bookmarks JSON</span>
            </button>
          )}
          <button
            onClick={() => {
              if (window.confirm('Reset all your answer attempts, scores, and bookmarks?')) {
                onResetProgress();
              }
            }}
            className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-950/70 transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Reset All Progress</span>
          </button>
        </div>
      </section>
    </div>
  );
};
