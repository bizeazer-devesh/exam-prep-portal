import React, { useState, useMemo } from 'react';
import type { Question, CBTConfig } from '../types';
import { SSC_EXAM_TRACKS, SUBJECT_METADATA, getExamTrackMeta } from '../data/examCatalog';
import {
  MonitorPlay,
  Timer,
  Award,
  CheckCircle2,
  Shuffle,
  Play,
  Layers,
  ShieldCheck,
} from 'lucide-react';

interface MockTestCenterProps {
  questions: Question[];
  activeExam: string;
  onStartCBT: (config: CBTConfig) => void;
}

export const MockTestCenter: React.FC<MockTestCenterProps> = ({
  questions,
  activeExam,
  onStartCBT,
}) => {
  const [selectedExam, setSelectedExam] = useState<string>(
    activeExam === 'all' ? 'SSC CGL' : activeExam
  );
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [questionCount, setQuestionCount] = useState<number>(50);
  const [durationMins, setDurationMins] = useState<number>(45);
  const [shuffleOrder, setShuffleOrder] = useState<boolean>(true);

  const examMeta = getExamTrackMeta(selectedExam);

  const eligibleQuestions = useMemo(() => {
    return questions.filter((q) => {
      if (selectedExam !== 'all' && !q.exams.includes(selectedExam)) return false;
      if (selectedSubject !== 'all' && q.subject !== selectedSubject) return false;
      return true;
    });
  }, [questions, selectedExam, selectedSubject]);

  const handleLaunchCustomMock = () => {
    if (eligibleQuestions.length === 0) return;
    let pool = [...eligibleQuestions];
    if (shuffleOrder) {
      for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
      }
    }
    const finalQuestions = pool.slice(0, Math.min(questionCount, pool.length));
    const subjectLabel =
      selectedSubject === 'all'
        ? 'Full Mixed Syllabus (4 Subjects)'
        : SUBJECT_METADATA[selectedSubject]?.shortLabel || selectedSubject;

    onStartCBT({
      title: examMeta.fullName,
      subtitle: `${subjectLabel} • ${finalQuestions.length} Questions`,
      examCode: examMeta.shortName,
      questions: finalQuestions,
      durationMinutes: durationMins,
      positiveMarks: examMeta.positiveMarks,
      negativeMarks: examMeta.negativeMarks,
    });
  };

  const presetTests = [
    {
      id: 'cgl-full',
      examId: 'SSC CGL',
      title: 'SSC CGL Tier-1 Full Simulation',
      subtitle: 'Mixed 100 Qs across English, Quant, Reasoning & GS',
      subject: 'all',
      count: 100,
      mins: 60,
      badge: 'Tier-1 Standard',
    },
    {
      id: 'cpo-english',
      examId: 'SSC CPO',
      title: 'SSC CPO English Marathon',
      subtitle: '50 Official CPO English Language & Comprehension PYQs',
      subject: 'English Language & Comprehension',
      count: 50,
      mins: 40,
      badge: 'CPO Paper Pattern',
    },
    {
      id: 'chsl-sprint',
      examId: 'SSC CHSL',
      title: 'SSC CHSL 50Q Combined Mock',
      subtitle: 'Balanced 50-question drill across all 4 CHSL sections',
      subject: 'all',
      count: 50,
      mins: 35,
      badge: 'Speed & Accuracy',
    },
    {
      id: 'quant-drill',
      examId: 'SSC CGL',
      title: 'Quantitative Aptitude 25Q Drill',
      subtitle: 'Algebra, Geometry, Trigonometry & Arithmetic speed test',
      subject: 'Quantitative Aptitude',
      count: 25,
      mins: 25,
      badge: 'Sectional Test',
    },
    {
      id: 'reasoning-drill',
      examId: 'SSC CGL',
      title: 'Reasoning & Intelligence 25Q Sprint',
      subtitle: 'Series, Coding, Analogy, Syllogism & Deduction',
      subject: 'General Intelligence & Reasoning',
      count: 25,
      mins: 18,
      badge: 'Sectional Test',
    },
    {
      id: 'gs-rapid',
      examId: 'SSC CPO',
      title: 'General Awareness 25Q Rapid Fire',
      subtitle: 'Polity, History, Science, Geography & Static GK',
      subject: 'General Knowledge & General Awareness',
      count: 25,
      mins: 12,
      badge: 'Sectional Test',
    },
  ];

  const handleLaunchPreset = (preset: (typeof presetTests)[number]) => {
    const meta = getExamTrackMeta(preset.examId);
    const pool = questions.filter((q) => {
      if (preset.examId !== 'all' && !q.exams.includes(preset.examId)) return false;
      if (preset.subject !== 'all' && q.subject !== preset.subject) return false;
      return true;
    });
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(preset.count, shuffled.length));

    onStartCBT({
      title: meta.fullName,
      subtitle: preset.title,
      examCode: meta.shortName,
      questions: selected,
      durationMinutes: preset.mins,
      positiveMarks: meta.positiveMarks,
      negativeMarks: meta.negativeMarks,
    });
  };

  return (
    <div className="space-y-8">
      {/* Custom CBT Builder Card */}
      <section className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-5 dark:border-slate-800">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 dark:text-brand-400">
              <MonitorPlay className="h-4 w-4" />
              <span>TCS-Style Computer Based Test (CBT) Simulator</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Configure Custom SSC Mock Test
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Customize exam marking scheme, subject scope, duration, and question count for realistic exam simulation.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs dark:border-slate-700 dark:bg-slate-800">
            <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-slate-600 dark:text-slate-300">
              Marking:{' '}
              <strong className="text-emerald-600 dark:text-emerald-400">
                +{examMeta.positiveMarks}
              </strong>{' '}
              /{' '}
              <strong className="text-rose-600 dark:text-rose-400">
                -{examMeta.negativeMarks}
              </strong>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Target SSC Exam Pattern
            </label>
            <select
              value={selectedExam}
              onChange={(e) => setSelectedExam(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2.5 text-xs font-medium text-slate-800 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            >
              {SSC_EXAM_TRACKS.map((track) => (
                <option key={track.id} value={track.id}>
                  {track.name} ({track.tierLabel})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Subject / Section Scope
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2.5 text-xs font-medium text-slate-800 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            >
              <option value="all">All 4 Subjects (Mixed Full Mock)</option>
              {Object.keys(SUBJECT_METADATA).map((sub) => (
                <option key={sub} value={sub}>
                  {SUBJECT_METADATA[sub].shortLabel}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Question Count
            </label>
            <select
              value={questionCount}
              onChange={(e) => {
                const cnt = Number(e.target.value);
                setQuestionCount(cnt);
                setDurationMins(cnt === 25 ? 20 : cnt === 50 ? 45 : 60);
              }}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2.5 text-xs font-medium text-slate-800 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            >
              <option value={25}>25 Questions (Sectional Drill)</option>
              <option value={50}>50 Questions (Standard Mock)</option>
              <option value={100}>100 Questions (Full Tier-1)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Timer Duration (Minutes)
            </label>
            <select
              value={durationMins}
              onChange={(e) => setDurationMins(Number(e.target.value))}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2.5 text-xs font-medium text-slate-800 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            >
              <option value={15}>15 Minutes (Speed Sprint)</option>
              <option value={20}>20 Minutes</option>
              <option value={35}>35 Minutes</option>
              <option value={45}>45 Minutes</option>
              <option value={60}>60 Minutes (Official Tier-1)</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-600 dark:text-slate-300 select-none">
              <input
                type="checkbox"
                checked={shuffleOrder}
                onChange={(e) => setShuffleOrder(e.target.checked)}
                className="h-3.5 w-3.5 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              />
              <Shuffle className="h-3.5 w-3.5 text-slate-400" />
              <span>Randomize question order</span>
            </label>

            <span className="text-slate-500 dark:text-slate-400 tabular-nums">
              Available pool: <strong className="text-slate-800 dark:text-white">{eligibleQuestions.length.toLocaleString()}</strong> PYQs
            </span>
          </div>

          <button
            onClick={handleLaunchCustomMock}
            disabled={eligibleQuestions.length === 0}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-brand-700 disabled:opacity-50 transition-colors"
          >
            <Play className="h-4 w-4 fill-current" />
            <span>Launch CBT Exam ({Math.min(questionCount, eligibleQuestions.length)} Qs)</span>
          </button>
        </div>
      </section>

      {/* Pre-Configured SSC Mock Series */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Curated SSC Mock Test Series
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            One-click full-length and sectional mock tests modeled on official SSC exam blueprints.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {presetTests.map((preset) => {
            const meta = getExamTrackMeta(preset.examId);
            return (
              <div
                key={preset.id}
                className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs hover:border-brand-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-brand-700 transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold ${meta.accentClass}`}>
                      <Award className="h-3.5 w-3.5" />
                      <span>{preset.examId}</span>
                    </span>
                    <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      {preset.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {preset.title}
                    </h3>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {preset.subtitle}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-400 pt-1">
                    <span className="inline-flex items-center gap-1 font-medium tabular-nums">
                      <Layers className="h-3.5 w-3.5 text-slate-400" />
                      {preset.count} Qs
                    </span>
                    <span className="inline-flex items-center gap-1 font-medium tabular-nums">
                      <Timer className="h-3.5 w-3.5 text-slate-400" />
                      {preset.mins} Mins
                    </span>
                    <span className="inline-flex items-center gap-1 font-medium tabular-nums">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                      +{meta.positiveMarks} / -{meta.negativeMarks}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleLaunchPreset(preset)}
                  className="mt-5 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 py-2.5 text-xs font-semibold text-white hover:bg-brand-600 dark:bg-slate-800 dark:hover:bg-brand-600 transition-colors"
                >
                  <Play className="h-3.5 w-3.5 fill-current" />
                  <span>Start Test Now</span>
                </button>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
