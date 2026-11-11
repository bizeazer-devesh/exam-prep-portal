import React, { useState, useEffect, useCallback } from 'react';
import type { CBTConfig, QuestionAttempt } from '../types';
import { SolutionCard } from './SolutionCard';
import {
  Timer,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Trophy,
  AlertTriangle,
  X,
  Grid3X3,
  FileText,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface CBTExamModalProps {
  config: CBTConfig;
  onExit: () => void;
  onSaveProgress: (attempts: Record<string, QuestionAttempt>) => void;
}

export const CBTExamModal: React.FC<CBTExamModalProps> = ({
  config,
  onExit,
  onSaveProgress,
}) => {
  const examQuestions = config.questions;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [examAttempts, setExamAttempts] = useState<Record<string, QuestionAttempt>>({});
  const [visited, setVisited] = useState<Set<number>>(new Set([0]));
  const [markedForReview, setMarkedForReview] = useState<Set<number>>(new Set());
  const [timeLeft, setTimeLeft] = useState(config.durationMinutes * 60);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [reviewMode, setReviewMode] = useState(false);
  const [showMobilePalette, setShowMobilePalette] = useState(false);

  const handleSubmitExam = useCallback(() => {
    setIsSubmitted(true);
    onSaveProgress(examAttempts);
    confetti({
      particleCount: 90,
      spread: 70,
      origin: { y: 0.6 },
    });
  }, [examAttempts, onSaveProgress]);

  useEffect(() => {
    if (isSubmitted) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isSubmitted, handleSubmitExam]);

  const currentQ = examQuestions[currentIndex];
  const currentAttempt = currentQ ? examAttempts[currentQ.id] : undefined;

  const handleSelectOption = (optKey: string) => {
    if (isSubmitted && !reviewMode) return;
    const isCorrect = optKey === currentQ.correct_answer;
    setExamAttempts((prev) => ({
      ...prev,
      [currentQ.id]: {
        selectedOption: optKey,
        isCorrect,
        timestamp: Date.now(),
        markedForReview: markedForReview.has(currentIndex),
      },
    }));
  };

  const handleClearResponse = () => {
    setExamAttempts((prev) => {
      const copy = { ...prev };
      delete copy[currentQ.id];
      return copy;
    });
  };

  const handleNext = () => {
    if (currentIndex < examQuestions.length - 1) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      setVisited((prev) => new Set(prev).add(nextIdx));
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      const prevIdx = currentIndex - 1;
      setCurrentIndex(prevIdx);
      setVisited((prev) => new Set(prev).add(prevIdx));
    }
  };

  const handleMarkReviewAndNext = () => {
    setMarkedForReview((prev) => new Set(prev).add(currentIndex));
    handleNext();
  };

  const handleSaveAndNext = () => {
    if (markedForReview.has(currentIndex)) {
      setMarkedForReview((prev) => {
        const next = new Set(prev);
        next.delete(currentIndex);
        return next;
      });
    }
    handleNext();
  };

  const jumpToQuestion = (index: number) => {
    setCurrentIndex(index);
    setVisited((prev) => new Set(prev).add(index));
    setShowMobilePalette(false);
  };

  let correctCount = 0;
  let incorrectCount = 0;
  Object.values(examAttempts).forEach((att) => {
    if (att.isCorrect) correctCount++;
    else incorrectCount++;
  });
  const unattemptedCount = examQuestions.length - (correctCount + incorrectCount);
  const maxMarks = examQuestions.length * config.positiveMarks;
  const totalScore = correctCount * config.positiveMarks - incorrectCount * config.negativeMarks;
  const accuracy =
    correctCount + incorrectCount > 0
      ? (correctCount / (correctCount + incorrectCount)) * 100
      : 0;

  const formatTimer = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!currentQ) return null;

  let passageContent = '';
  let mainQuestion = currentQ.question;
  if (currentQ.question.startsWith('Comprehension:')) {
    const parts = currentQ.question.split(/SubQuestion No\s*:\s*\d+|Q\.\d+/i);
    if (parts.length > 1) {
      passageContent = parts[0].replace('Comprehension:', '').trim();
      mainQuestion = parts.slice(1).join(' ').trim();
    }
  }

  const paletteContent = (
    <div className="space-y-5">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
          Question Palette (1–{examQuestions.length})
        </h3>
        <button
          onClick={() => setShowMobilePalette(false)}
          className="md:hidden rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2.5 text-xs text-slate-600 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center rounded bg-emerald-600 text-white font-bold text-xs">
            ✓
          </span>
          <span>Answered ({correctCount + incorrectCount})</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center rounded bg-rose-600 text-white font-bold text-xs">
            ✗
          </span>
          <span>Skipped</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center rounded bg-violet-600 text-white font-bold text-xs">
            ★
          </span>
          <span>Review ({markedForReview.size})</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center rounded bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-bold text-xs">
            -
          </span>
          <span>Unvisited</span>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-2 pt-1">
        {examQuestions.map((q, idx) => {
          const isCurrent = idx === currentIndex;
          const isAns = !!examAttempts[q.id];
          const isRev = markedForReview.has(idx);
          const isVis = visited.has(idx);

          let bgClass = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
          if (isAns && isRev) {
            bgClass = 'bg-violet-700 text-white ring-2 ring-emerald-400';
          } else if (isAns) {
            bgClass = 'bg-emerald-600 text-white';
          } else if (isRev) {
            bgClass = 'bg-violet-600 text-white';
          } else if (isVis) {
            bgClass = 'bg-rose-500 text-white';
          }

          if (isCurrent) {
            bgClass += ' ring-2 ring-brand-500 scale-105';
          }

          return (
            <button
              key={q.id}
              onClick={() => jumpToQuestion(idx)}
              className={`flex h-9 w-full items-center justify-center rounded-lg text-xs font-bold tabular-nums transition-all ${bgClass}`}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-50 text-slate-900 dark:bg-[#090d16] dark:text-slate-100 font-sans">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 sm:px-6 py-3 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-3 min-w-0">
          <div className="rounded-lg bg-brand-600 px-3 py-1.5 font-bold text-white text-xs shrink-0">
            {config.examCode} CBT
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white truncate">
              {config.title}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
              {config.subtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3">
          {!isSubmitted && (
            <div
              className={`flex items-center gap-2 rounded-xl px-3.5 py-1.5 font-mono text-xs sm:text-sm font-bold tabular-nums ${
                timeLeft < 300
                  ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 animate-pulse'
                  : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200'
              }`}
            >
              <Timer className="h-4 w-4" />
              <span>{formatTimer(timeLeft)}</span>
            </div>
          )}

          <button
            onClick={() => setShowMobilePalette(true)}
            className="md:hidden inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200"
          >
            <Grid3X3 className="h-4 w-4" />
            <span>Palette</span>
          </button>

          {!isSubmitted ? (
            <button
              onClick={() => setShowExitConfirm(true)}
              className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition-colors"
            >
              Submit Test
            </button>
          ) : (
            <button
              onClick={onExit}
              className="rounded-xl bg-brand-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-brand-700 transition-colors"
            >
              Exit Simulator
            </button>
          )}

          <button
            onClick={onExit}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            title="Exit Test"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        <main className="flex-1 overflow-y-auto p-5 sm:p-8">
          <div className="mx-auto max-w-4xl space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3 dark:border-slate-800">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="text-base sm:text-lg font-bold text-brand-700 dark:text-brand-400 tabular-nums">
                  Question {currentIndex + 1} of {examQuestions.length}
                </span>
                <span className="rounded-md bg-slate-200/80 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  {currentQ.subject}
                </span>
                <span className="rounded-md bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700 dark:bg-brand-950/60 dark:text-brand-300">
                  {currentQ.category}
                </span>
              </div>
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400 tabular-nums">
                Marking: <span className="text-emerald-600 font-bold">+{config.positiveMarks}</span> | Negative:{' '}
                <span className="text-rose-600 font-bold">-{config.negativeMarks}</span>
              </div>
            </div>

            {passageContent && (
              <div className="rounded-xl border border-sky-200/80 bg-sky-50/60 p-4 dark:border-sky-900/40 dark:bg-sky-950/20">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-sky-800 dark:text-sky-300 mb-2">
                  <FileText className="h-4 w-4 text-sky-600" />
                  <span>Reading Passage</span>
                </div>
                <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-line">
                  {passageContent}
                </p>
              </div>
            )}

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 text-base leading-relaxed text-slate-900 dark:text-slate-100 whitespace-pre-line">
              {mainQuestion}
            </div>

            <div className="space-y-3">
              {Object.entries(currentQ.options).map(([key, text]) => {
                const isSelected = currentAttempt?.selectedOption === key;
                const isCorrect = currentQ.correct_answer === key;

                let optStyle =
                  'border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800/80';

                if (isSubmitted || reviewMode) {
                  if (isCorrect) {
                    optStyle =
                      'border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-500/30';
                  } else if (isSelected && !isCorrect) {
                    optStyle =
                      'border-rose-500 bg-rose-50/80 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 line-through';
                  }
                } else if (isSelected) {
                  optStyle =
                    'border-brand-600 bg-brand-50 text-brand-900 dark:border-brand-500 dark:bg-brand-950/50 dark:text-brand-200 ring-2 ring-brand-500/30';
                }

                return (
                  <button
                    key={key}
                    onClick={() => handleSelectOption(key)}
                    className={`w-full flex items-start gap-4 rounded-xl border p-4 text-left transition-all ${optStyle}`}
                  >
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                        isSelected
                          ? 'bg-brand-600 text-white'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {key}
                    </span>
                    <span className="flex-1 text-sm leading-relaxed">{text}</span>
                    {isSubmitted && isCorrect && (
                      <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    )}
                    {isSubmitted && isSelected && !isCorrect && (
                      <XCircle className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {(isSubmitted || reviewMode) && (
              <SolutionCard
                solution={currentQ.solution}
                correctAnswer={currentQ.correct_answer}
                correctAnswerText={currentQ.correct_answer_text}
                options={currentQ.options}
              />
            )}
          </div>
        </main>

        {/* Desktop Question Palette */}
        <aside className="w-80 border-l border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 overflow-y-auto hidden md:block">
          {paletteContent}
        </aside>

        {/* Mobile Question Palette Drawer */}
        {showMobilePalette && (
          <div className="fixed inset-0 z-50 flex justify-end md:hidden">
            <div
              className="fixed inset-0 bg-black/60"
              onClick={() => setShowMobilePalette(false)}
            />
            <aside className="relative z-10 w-80 max-w-[85vw] bg-white dark:bg-slate-900 p-5 h-full overflow-y-auto shadow-2xl">
              {paletteContent}
            </aside>
          </div>
        )}
      </div>

      <footer className="border-t border-slate-200 bg-white px-4 sm:px-6 py-3 dark:border-slate-800 dark:bg-slate-900 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {!isSubmitted && (
            <>
              <button
                onClick={handleMarkReviewAndNext}
                className="rounded-xl border border-violet-300 bg-violet-50 px-3.5 py-2 text-xs font-semibold text-violet-700 hover:bg-violet-100 dark:border-violet-800 dark:bg-violet-950/60 dark:text-violet-300"
              >
                Mark for Review & Next
              </button>
              <button
                onClick={handleClearResponse}
                className="rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Clear
              </button>
            </>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="flex items-center gap-1 rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-40 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Previous</span>
          </button>

          {!isSubmitted ? (
            <button
              onClick={handleSaveAndNext}
              className="flex items-center gap-1 rounded-xl bg-brand-600 px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-brand-700 transition-colors"
            >
              <span>Save & Next</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={currentIndex === examQuestions.length - 1}
              className="flex items-center gap-1 rounded-xl bg-brand-600 px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-brand-700 disabled:opacity-40"
            >
              <span>Next</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </footer>

      {showExitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center gap-3 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="h-6 w-6" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Submit {config.examCode} Mock Test?
              </h3>
            </div>
            <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              You have answered{' '}
              <strong className="text-emerald-600">{Object.keys(examAttempts).length}</strong> out
              of {examQuestions.length} questions ({unattemptedCount} unattempted). Ready to submit?
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowExitConfirm(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Keep Testing
              </button>
              <button
                onClick={() => {
                  setShowExitConfirm(false);
                  handleSubmitExam();
                }}
                className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 shadow-xs"
              >
                Confirm & Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {isSubmitted && !reviewMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-3xl bg-white p-8 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-6">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-600 text-white shadow-lg shadow-amber-500/30">
              <Trophy className="h-8 w-8" />
            </div>

            <div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                Test Completed!
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {config.title} — {config.subtitle}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-xl bg-brand-50 p-3 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-900/60">
                <div className="text-xs text-brand-700 dark:text-brand-300 font-semibold">Score</div>
                <div className="text-xl font-bold tabular-nums text-brand-900 dark:text-brand-100">
                  {totalScore.toFixed(2)}
                </div>
                <div className="text-xs text-slate-500">/ {maxMarks.toFixed(0)}</div>
              </div>

              <div className="rounded-xl bg-emerald-50 p-3 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60">
                <div className="text-xs text-emerald-700 dark:text-emerald-300 font-semibold">Correct</div>
                <div className="text-xl font-bold tabular-nums text-emerald-800 dark:text-emerald-200">
                  {correctCount}
                </div>
                <div className="text-xs text-emerald-600">+{(correctCount * config.positiveMarks).toFixed(1)}</div>
              </div>

              <div className="rounded-xl bg-rose-50 p-3 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60">
                <div className="text-xs text-rose-700 dark:text-rose-300 font-semibold">Incorrect</div>
                <div className="text-xl font-bold tabular-nums text-rose-800 dark:text-rose-200">
                  {incorrectCount}
                </div>
                <div className="text-xs text-rose-600">-{(incorrectCount * config.negativeMarks).toFixed(2)}</div>
              </div>

              <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div className="text-xs text-slate-600 dark:text-slate-400 font-semibold">Accuracy</div>
                <div className="text-xl font-bold tabular-nums text-slate-800 dark:text-slate-100">
                  {accuracy.toFixed(0)}%
                </div>
                <div className="text-xs text-slate-500">{unattemptedCount} skipped</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={() => setReviewMode(true)}
                className="flex-1 rounded-xl bg-brand-600 py-3 text-xs font-bold text-white shadow-sm hover:bg-brand-700 transition-colors"
              >
                Review Answers & Solutions
              </button>
              <button
                onClick={onExit}
                className="rounded-xl border border-slate-200 py-3 px-5 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Back to Portal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
