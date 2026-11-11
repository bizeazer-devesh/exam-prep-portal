import React, { useMemo } from 'react';
import { List, useDynamicRowHeight } from 'react-window';
import type { Question, QuestionAttempt } from '../types';
import { QuestionCard } from './QuestionCard';

interface VirtualizedListProps {
  questions: Question[];
  attempts: Record<string, QuestionAttempt>;
  bookmarks: Set<string>;
  onSelectOption: (qId: string, optionKey: string) => void;
  onClearOption: (qId: string) => void;
  onToggleBookmark: (qId: string) => void;
  autoShowSolutionOnAnswer?: boolean;
}

interface CustomRowProps {
  questions: Question[];
  attempts: Record<string, QuestionAttempt>;
  bookmarks: Set<string>;
  onSelectOption: (qId: string, optionKey: string) => void;
  onClearOption: (qId: string) => void;
  onToggleBookmark: (qId: string) => void;
  autoShowSolutionOnAnswer?: boolean;
}

function RowComponent(props: {
  index: number;
  style: React.CSSProperties;
  ariaAttributes: { "aria-posinset": number; "aria-setsize": number; role: "listitem" };
} & CustomRowProps): React.ReactElement | null {
  const {
    index,
    style,
    ariaAttributes,
    questions,
    attempts,
    bookmarks,
    onSelectOption,
    onClearOption,
    onToggleBookmark,
    autoShowSolutionOnAnswer,
  } = props;

  const question = questions[index];
  if (!question) return null;

  return (
    <div style={style} {...ariaAttributes} className="px-1 py-2">
      <QuestionCard
        question={question}
        index={index + 1}
        attempt={attempts[question.id]}
        isBookmarked={bookmarks.has(question.id)}
        onSelectOption={onSelectOption}
        onClearOption={onClearOption}
        onToggleBookmark={onToggleBookmark}
        autoShowSolutionOnAnswer={autoShowSolutionOnAnswer}
      />
    </div>
  );
}

export const VirtualizedList: React.FC<VirtualizedListProps> = ({
  questions,
  attempts,
  bookmarks,
  onSelectOption,
  onClearOption,
  onToggleBookmark,
  autoShowSolutionOnAnswer,
}) => {
  const dynamicRowHeight = useDynamicRowHeight({
    defaultRowHeight: 400,
  });

  const rowProps = useMemo<CustomRowProps>(
    () => ({
      questions,
      attempts,
      bookmarks,
      onSelectOption,
      onClearOption,
      onToggleBookmark,
      autoShowSolutionOnAnswer,
    }),
    [questions, attempts, bookmarks, onSelectOption, onClearOption, onToggleBookmark, autoShowSolutionOnAnswer]
  );

  if (questions.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center dark:border-slate-800">
        <p className="text-base font-medium text-slate-500 dark:text-slate-400">
          No questions match the current filter criteria.
        </p>
      </div>
    );
  }

  // Cast List to any if react-window 2.5 generic types clash with react 19 JSX element
  const VirtualList = List as any;

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white/50 p-2 shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
      <div className="mb-2 px-3 py-1.5 flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200/60 dark:border-slate-800/60">
        <span>React Window Virtualization Enabled (Dynamic Measurement)</span>
        <span>{questions.length} Questions</span>
      </div>
      <div className="h-[750px] w-full">
        <VirtualList
          rowCount={questions.length}
          rowHeight={dynamicRowHeight}
          rowComponent={RowComponent}
          rowProps={rowProps}
          style={{ height: '750px', width: '100%' }}
        />
      </div>
    </div>
  );
};
