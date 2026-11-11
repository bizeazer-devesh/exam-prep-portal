import React from 'react';
import type { QuestionSolution } from '../types';
import { Lightbulb, CheckCircle2, BookOpen, Layers } from 'lucide-react';

interface SolutionCardProps {
  solution: QuestionSolution;
  correctAnswer: string;
  correctAnswerText: string;
  options: Record<string, string>;
}

export const SolutionCard: React.FC<SolutionCardProps> = ({
  solution,
  correctAnswer,
  correctAnswerText,
  options,
}) => {
  return (
    <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50/50 p-5 dark:border-emerald-900/60 dark:bg-emerald-950/20 text-slate-800 dark:text-slate-200">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-200/80 pb-3 dark:border-emerald-800/40">
        <div className="flex items-center gap-2 text-sm font-semibold text-emerald-800 dark:text-emerald-400">
          <Lightbulb className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <span>Official Solution & Analysis</span>
        </div>
        <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-900/80 dark:text-emerald-200">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-300" />
          <span>
            Answer: ({correctAnswer}) {correctAnswerText}
          </span>
        </div>
      </div>

      {solution.key_concept && (
        <div className="mt-3 flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400">
          <Layers className="mt-0.5 h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <div>
            <span className="font-semibold text-slate-700 dark:text-slate-300">Tested Concept: </span>
            <span className="rounded bg-white/80 px-2 py-0.5 font-medium text-slate-800 dark:bg-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700">
              {solution.key_concept}
            </span>
          </div>
        </div>
      )}

      <div className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
        <p>{solution.detailed_explanation}</p>
      </div>

      {solution.option_breakdown && Object.keys(solution.option_breakdown).length > 0 && (
        <div className="mt-4 pt-3 border-t border-emerald-200/50 dark:border-emerald-900/40">
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5">
            <BookOpen className="h-3.5 w-3.5" />
            <span>Options Breakdown</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
            {Object.entries(options).map(([letter, text]) => {
              const isCorrect = letter === correctAnswer;
              const note = solution.option_breakdown[letter];
              return (
                <div
                  key={letter}
                  className={`rounded-lg p-3 border transition-colors ${
                    isCorrect
                      ? 'border-emerald-300 bg-white dark:border-emerald-800 dark:bg-slate-900/90'
                      : 'border-slate-200/80 bg-white/60 dark:border-slate-800 dark:bg-slate-900/40 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-bold text-slate-900 dark:text-slate-100">
                      ({letter}) {text}
                    </span>
                    {isCorrect && (
                      <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded">
                        Correct
                      </span>
                    )}
                  </div>
                  {note && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {note}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
