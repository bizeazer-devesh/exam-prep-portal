import React, { useState } from 'react';
import type { Question, QuestionAttempt } from '../types';
import { QuestionCard } from './QuestionCard';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PaginatedListProps {
  questions: Question[];
  attempts: Record<string, QuestionAttempt>;
  bookmarks: Set<string>;
  onSelectOption: (qId: string, optionKey: string) => void;
  onClearOption: (qId: string) => void;
  onToggleBookmark: (qId: string) => void;
  autoShowSolutionOnAnswer?: boolean;
}

export const PaginatedList: React.FC<PaginatedListProps> = ({
  questions,
  attempts,
  bookmarks,
  onSelectOption,
  onClearOption,
  onToggleBookmark,
  autoShowSolutionOnAnswer,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [jumpInput, setJumpInput] = useState('');

  const totalPages = Math.max(1, Math.ceil(questions.length / pageSize));
  const effectivePage = currentPage > totalPages ? 1 : currentPage;

  const startIndex = (effectivePage - 1) * pageSize;
  const currentQuestions = questions.slice(startIndex, startIndex + pageSize);

  const handlePageChange = (page: number) => {
    const validPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(validPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleJumpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseInt(jumpInput, 10);
    if (!isNaN(target) && target >= 1 && target <= totalPages) {
      handlePageChange(target);
      setJumpInput('');
    }
  };

  if (questions.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center dark:border-slate-800">
        <p className="text-base font-medium text-slate-500 dark:text-slate-400">
          No questions match the current filter criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {currentQuestions.map((question, idx) => (
          <QuestionCard
            key={question.id}
            question={question}
            index={startIndex + idx + 1}
            attempt={attempts[question.id]}
            isBookmarked={bookmarks.has(question.id)}
            onSelectOption={onSelectOption}
            onClearOption={onClearOption}
            onToggleBookmark={onToggleBookmark}
            autoShowSolutionOnAnswer={autoShowSolutionOnAnswer}
          />
        ))}
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/90">
        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
          <span>Per page:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 font-semibold text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 focus:outline-none"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
          <span className="text-slate-400">
            Showing {startIndex + 1} - {Math.min(startIndex + pageSize, questions.length)} of {questions.length}
          </span>
        </div>

        <div className="flex items-center gap-1 text-xs">
          <button
            onClick={() => handlePageChange(1)}
            disabled={effectivePage === 1}
            className="rounded-lg p-1.5 border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            title="First Page"
          >
            <ChevronsLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => handlePageChange(effectivePage - 1)}
            disabled={effectivePage === 1}
            className="rounded-lg p-1.5 border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            title="Previous Page"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <span className="px-3 font-semibold text-slate-800 dark:text-slate-200">
            Page {effectivePage} of {totalPages}
          </span>

          <button
            onClick={() => handlePageChange(effectivePage + 1)}
            disabled={effectivePage === totalPages}
            className="rounded-lg p-1.5 border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            title="Next Page"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <button
            onClick={() => handlePageChange(totalPages)}
            disabled={effectivePage === totalPages}
            className="rounded-lg p-1.5 border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            title="Last Page"
          >
            <ChevronsRight className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleJumpSubmit} className="flex items-center gap-1.5 text-xs">
          <span className="text-slate-500 dark:text-slate-400">Go to:</span>
          <input
            type="number"
            min={1}
            max={totalPages}
            placeholder={String(effectivePage)}
            value={jumpInput}
            onChange={(e) => setJumpInput(e.target.value)}
            className="w-14 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-center font-medium text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-lg bg-slate-800 px-2.5 py-1 font-semibold text-white hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600"
          >
            Go
          </button>
        </form>
      </div>
    </div>
  );
};
