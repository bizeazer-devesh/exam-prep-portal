export interface QuestionSolution {
  summary: string;
  key_concept: string;
  detailed_explanation: string;
  option_breakdown: Record<string, string>;
}

export interface Question {
  id: string;
  question_number: number;
  subject: string;
  exams: string[];
  primary_exam: string;
  year: number;
  shift: string;
  shift_question_number?: number;
  category: string;
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correct_answer: string;
  correct_answer_text: string;
  question_id: string;
  solution: QuestionSolution;
}

export interface QuestionAttempt {
  selectedOption: string;
  isCorrect: boolean;
  timestamp: number;
  markedForReview?: boolean;
}

export type PortalSection = 'hub' | 'practice' | 'mock_center' | 'revision' | 'analytics';

export type ListMode = 'paginated' | 'virtualized';

export interface FilterState {
  subject: string;
  selectedExam: string;
  selectedCategory: string;
  selectedYear: string;
  searchQuery: string;
  attemptStatus: 'all' | 'unattempted' | 'correct' | 'incorrect' | 'bookmarked';
}

export interface ExamStats {
  total: number;
  attempted: number;
  correct: number;
  incorrect: number;
  bookmarked: number;
  accuracy: number;
  score: number;
}

export interface ExamTrackConfig {
  id: string;
  name: string;
  shortName: string;
  fullName: string;
  tierLabel: string;
  description: string;
  positiveMarks: number;
  negativeMarks: number;
  mockQuestionsCount: number;
  mockDurationMins: number;
  accentClass: string;
}

export interface CBTConfig {
  title: string;
  subtitle: string;
  examCode: string;
  questions: Question[];
  durationMinutes: number;
  positiveMarks: number;
  negativeMarks: number;
}
