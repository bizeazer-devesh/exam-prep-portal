import type { ExamTrackConfig } from '../types';

export const SSC_EXAM_TRACKS: ExamTrackConfig[] = [
  {
    id: 'all',
    name: 'All SSC Exams',
    shortName: 'All SSC',
    fullName: 'Unified SSC Master Question Bank',
    tierLabel: 'CGL • CPO • CHSL',
    description: 'Complete cross-exam archive across all 4 core SSC subjects with official verified keys.',
    positiveMarks: 2.0,
    negativeMarks: 0.5,
    mockQuestionsCount: 50,
    mockDurationMins: 45,
    accentClass: 'bg-brand-600 text-white',
  },
  {
    id: 'SSC CGL',
    name: 'SSC CGL',
    shortName: 'CGL',
    fullName: 'Combined Graduate Level Examination',
    tierLabel: 'Tier I & Tier II',
    description: 'Officer-grade quantitative, reasoning, English comprehension & GS practice aligned to CGL.',
    positiveMarks: 2.0,
    negativeMarks: 0.5,
    mockQuestionsCount: 100,
    mockDurationMins: 60,
    accentClass: 'bg-indigo-600 text-white',
  },
  {
    id: 'SSC CPO',
    name: 'SSC CPO',
    shortName: 'CPO',
    fullName: 'SI in Delhi Police & CAPFs Examination',
    tierLabel: 'Paper I & Paper II',
    description: 'Official SSC CPO Tier-1 shift questions across English, Quant, Reasoning & General Awareness.',
    positiveMarks: 1.0,
    negativeMarks: 0.25,
    mockQuestionsCount: 50,
    mockDurationMins: 40,
    accentClass: 'bg-emerald-600 text-white',
  },
  {
    id: 'SSC CHSL',
    name: 'SSC CHSL',
    shortName: 'CHSL',
    fullName: 'Combined Higher Secondary (10+2) Level',
    tierLabel: 'Tier I & Tier II',
    description: 'High-speed accuracy drills for LDC, JSA, and DEO aspirants covering all 4 Tier-1 sections.',
    positiveMarks: 2.0,
    negativeMarks: 0.5,
    mockQuestionsCount: 100,
    mockDurationMins: 60,
    accentClass: 'bg-sky-600 text-white',
  },
  {
    id: 'SSC CPO 2024',
    name: 'SSC CPO 2024',
    shortName: 'CPO 24',
    fullName: 'SSC CPO 2024 Latest Shift Archive',
    tierLabel: 'June 2024 Shifts',
    description: 'Recent 2024 Tier-1 English & cross-section shift sets reflecting the latest TCS question pattern.',
    positiveMarks: 1.0,
    negativeMarks: 0.25,
    mockQuestionsCount: 50,
    mockDurationMins: 40,
    accentClass: 'bg-amber-600 text-white',
  },
  {
    id: 'SSC CPO 2023',
    name: 'SSC CPO 2023',
    shortName: 'CPO 23',
    fullName: 'SSC CPO 2023 Official Shift Archive',
    tierLabel: 'Oct 2023 Shifts',
    description: 'Official 2023 Tier-1 shift questions for benchmarking accuracy and recurring vocabulary.',
    positiveMarks: 1.0,
    negativeMarks: 0.25,
    mockQuestionsCount: 50,
    mockDurationMins: 40,
    accentClass: 'bg-violet-600 text-white',
  },
];

export interface SubjectMeta {
  id: string;
  shortLabel: string;
  description: string;
  colorClass: string;
  badgeBgClass: string;
}

export const SUBJECT_METADATA: Record<string, SubjectMeta> = {
  'English Language & Comprehension': {
    id: 'English Language & Comprehension',
    shortLabel: 'English & Comprehension',
    description: 'Idioms, Grammar, Cloze Tests, Vocabulary & Reading Passages',
    colorClass: 'text-blue-600 dark:text-blue-400',
    badgeBgClass: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800/60',
  },
  'Quantitative Aptitude': {
    id: 'Quantitative Aptitude',
    shortLabel: 'Quantitative Aptitude',
    description: 'Algebra, Geometry, Trigonometry, Mensuration & Arithmetic',
    colorClass: 'text-emerald-600 dark:text-emerald-400',
    badgeBgClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/60',
  },
  'General Intelligence & Reasoning': {
    id: 'General Intelligence & Reasoning',
    shortLabel: 'Reasoning & Intelligence',
    description: 'Analogy, Series, Coding-Decoding, Syllogism & Non-Verbal',
    colorClass: 'text-violet-600 dark:text-violet-400',
    badgeBgClass: 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/50 dark:text-violet-300 dark:border-violet-800/60',
  },
  'General Knowledge & General Awareness': {
    id: 'General Knowledge & General Awareness',
    shortLabel: 'General Awareness (GS)',
    description: 'Polity, History, Geography, Science, Economy & Static GK',
    colorClass: 'text-amber-600 dark:text-amber-400',
    badgeBgClass: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800/60',
  },
};

export function getExamTrackMeta(examId: string): ExamTrackConfig {
  return (
    SSC_EXAM_TRACKS.find((t) => t.id === examId) || {
      id: examId,
      name: examId,
      shortName: examId,
      fullName: examId,
      tierLabel: 'SSC Examination',
      description: 'Official previous year questions and mock test preparation.',
      positiveMarks: 1.0,
      negativeMarks: 0.25,
      mockQuestionsCount: 50,
      mockDurationMins: 40,
      accentClass: 'bg-brand-600 text-white',
    }
  );
}
