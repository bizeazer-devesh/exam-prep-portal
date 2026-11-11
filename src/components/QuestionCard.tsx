import React, { useState } from 'react';
import type { Question, QuestionAttempt } from '../types';
import { SUBJECT_METADATA } from '../data/examCatalog';
import { SolutionCard } from './SolutionCard';
import {
  Bookmark,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  FileText,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

interface QuestionCardProps {
  question: Question;
  index: number;
  attempt?: QuestionAttempt;
  isBookmarked: boolean;
  onSelectOption: (qId: string, optionKey: string) => void;
  onClearOption: (qId: string) => void;
  onToggleBookmark: (qId: string) => void;
  autoShowSolutionOnAnswer?: boolean;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  attempt,
  isBookmarked,
  onSelectOption,
  onClearOption,
  onToggleBookmark,
  autoShowSolutionOnAnswer = false,
}) => {
  const [showSolution, setShowSolution] = useState(false);

  const isAnswered = !!attempt?.selectedOption;
  const isCorrect = attempt?.isCorrect;
  const subjectMeta = SUBJECT_METADATA[question.subject];

  let passageContent = '';
  let mainQuestion = question.question;

  if (question.question.startsWith('Comprehension:')) {
    const parts = question.question.split(/SubQuestion No\s*:\s*\d+|Q\.\d+/i);
    if (parts.length > 1) {
      passageContent = parts[0].replace('Comprehension:', '').trim();
      mainQuestion = parts.slice(1).join(' ').trim();
    }
  }

  const handleOptionClick = (key: string) => {
    onSelectOption(question.id, key);
    if (autoShowSolutionOnAnswer) {
      setShowSolution(true);
    }
  };

  return (
    <div
      id={`question-${question.question_number}`}
      className="group relative rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs transition-all duration-200 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
    >
      {/* Top Header Meta */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex h-7 items-center justify-center rounded-lg bg-brand-600 px-2.5 text-xs font-bold tabular-nums text-white">
            Q{question.question_number}
          </span>

          {subjectMeta && (
            <span
              className={`rounded-md border px-2.5 py-0.5 text-xs font-semibold ${subjectMeta.badgeBgClass}`}
            >
              {subjectMeta.shortLabel}
            </span>
          )}

          <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            {question.category}
          </span>

          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {question.primary_exam} • {question.shift.split('(')[0].trim()}
          </span>
        </div>

        {/* Top Right Actions */}
        <div className="flex items-center gap-2">
          {isAnswered && (
            <div
              className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg ${
                isCorrect
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300'
                  : 'bg-rose-100 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300'
              }`}
            >
              {isCorrect ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Correct</span>
                </>
              ) : (
                <>
                  <XCircle className="h-3.5 w-3.5" />
                  <span>Incorrect</span>
                </>
              )}
            </div>
          )}

          <button
            onClick={() => onToggleBookmark(question.id)}
            title={isBookmarked ? 'Remove Bookmark' : 'Bookmark Question'}
            className={`rounded-lg p-1.5 transition-colors ${
              isBookmarked
                ? 'bg-amber-100 text-amber-600 dark:bg-amber-950/80 dark:text-amber-400'
                : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-amber-500' : ''}`} />
          </button>
        </div>
      </div>

      {passageContent && (
        <div className="mt-4 rounded-xl border border-sky-200/80 bg-sky-50/50 p-4 dark:border-sky-900/40 dark:bg-sky-950/20">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-sky-800 dark:text-sky-300 mb-2">
            <FileText className="h-4 w-4 text-sky-600" />
            <span>Reading Passage / Comprehension Context</span>
          </div>
          <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-line">
            {passageContent}
          </p>
        </div>
      )}

      <div className="mt-4 text-base font-medium leading-relaxed text-slate-900 dark:text-slate-100 whitespace-pre-line">
        {mainQuestion}
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {Object.entries(question.options).map(([key, text]) => {
          const isSelected = attempt?.selectedOption === key;
          const isTargetCorrect = question.correct_answer === key;

          let optionStyle =
            'border-slate-200 bg-slate-50/60 hover:bg-slate-100 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-800/40 dark:hover:bg-slate-800 dark:hover:border-slate-700 text-slate-800 dark:text-slate-200';

          if (isAnswered) {
            if (isTargetCorrect) {
              optionStyle =
                'border-emerald-500 bg-emerald-50/80 text-emerald-900 font-semibold ring-2 ring-emerald-500/20 dark:border-emerald-500 dark:bg-emerald-950/40 dark:text-emerald-200';
            } else if (isSelected && !isTargetCorrect) {
              optionStyle =
                'border-rose-400 bg-rose-50/80 text-rose-900 font-medium line-through dark:border-rose-600 dark:bg-rose-950/40 dark:text-rose-200';
            } else {
              optionStyle =
                'opacity-65 border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/20';
            }
          }

          return (
            <button
              key={key}
              onClick={() => handleOptionClick(key)}
              className={`flex items-start gap-3 rounded-xl border p-3.5 text-left text-sm transition-all duration-150 ${optionStyle}`}
            >
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs font-bold transition-colors ${
                  isAnswered && isTargetCorrect
                    ? 'bg-emerald-600 text-white'
                    : isSelected && !isTargetCorrect
                    ? 'bg-rose-600 text-white'
                    : 'bg-slate-200/90 text-slate-700 dark:bg-slate-700 dark:text-slate-200'
                }`}
              >
                {key}
              </span>

              <span className="flex-1 leading-snug">{text}</span>

              {isAnswered && isTargetCorrect && (
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
              )}
              {isAnswered && isSelected && !isTargetCorrect && (
                <XCircle className="h-5 w-5 shrink-0 text-rose-500 dark:text-rose-400" />
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 pt-3.5 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowSolution(!showSolution)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-50 px-3.5 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-100 dark:bg-brand-950/60 dark:text-brand-300 dark:hover:bg-brand-900/60 transition-colors"
          >
            <Sparkles className="h-3.5 w-3.5 text-brand-600 dark:text-brand-400" />
            <span>{showSolution ? 'Hide Solution' : 'View Detailed Solution'}</span>
            {showSolution ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
          </button>

          {isAnswered && (
            <button
              onClick={() => onClearOption(question.id)}
              className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 py-1 px-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Clear your answer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Retry</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-400 dark:text-slate-500">
          <span className="hidden sm:inline">{question.exams.slice(0, 3).join(' • ')}</span>
          <span className="font-mono">ID: {question.question_id || 'N/A'}</span>
        </div>
      </div>

      {showSolution && (
        <SolutionCard
          solution={question.solution}
          correctAnswer={question.correct_answer}
          correctAnswerText={question.correct_answer_text}
          options={question.options}
        />
      )}
    </div>
  );
};
