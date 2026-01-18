"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  Check,
  X,
  ArrowRight,
  RotateCcw,
  AlertTriangle,
  Clock,
  LogOut, // Importamos icono para salir
  ChevronLeft,
} from "lucide-react";
import Link from "next/link";

export default function QuizRunner({
  questions,
  bankId,
}: {
  questions: Array<{
    id: string;
    questionText: string;
    options: string[];
    answers: string[];
  }>;
  bankId: string;
}) {
  // --- STATE ---
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [userAnswers, setUserAnswers] = useState<Record<string, string[]>>({});
  const [isFinished, setIsFinished] = useState(false);

  // Timer State (60 minutes = 3600 seconds)
  const [timeRemaining, setTimeRemaining] = useState(60 * 60);

  const currentQuestion = questions[currentIndex];
  const progressPercentage = ((currentIndex + 1) / questions.length) * 100;
  const isMultiSelect = currentQuestion.answers.length > 1;

  // --- TIMER LOGIC ---
  useEffect(() => {
    if (isFinished) return;

    const timerInterval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerInterval);
          setIsFinished(true); // Auto-submit when time runs out
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [isFinished]);

  // Format seconds to MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // --- HANDLERS ---
  const toggleOption = (option: string) => {
    if (selectedOptions.includes(option)) {
      setSelectedOptions((prev) => prev.filter((o) => o !== option));
    } else {
      if (!isMultiSelect && selectedOptions.length > 0) {
        setSelectedOptions([option]);
      } else {
        setSelectedOptions((prev) => [...prev, option]);
      }
    }
  };

  const handleNext = () => {
    const newAnswers = {
      ...userAnswers,
      [currentQuestion.id]: selectedOptions,
    };
    setUserAnswers(newAnswers);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOptions([]);
    } else {
      setIsFinished(true);
    }
  };

  // --- RESULTS SCREEN ---
  if (isFinished) {
    let correctCount = 0;
    questions.forEach((q) => {
      const u = userAnswers[q.id] || [];
      const c = q.answers;
      if (u.length === c.length && u.every((ans) => c.includes(ans)))
        correctCount++;
    });

    const score = Math.round((correctCount / questions.length) * 100);
    const passed = score >= 70;

    return (
      <div className="max-w-5xl mx-auto py-12 px-6 font-sans">
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
          {/* HEADER: Formal Report Style */}
          <div className="bg-slate-900 border-b border-slate-200 px-8 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-200 uppercase tracking-wide">
                Examination Report
              </h2>
              <p className="text-sm text-slate-400 font-mono mt-1">
                ID: {bankId.slice(-8).toUpperCase()} •{" "}
                {new Date().toLocaleDateString()}
              </p>
            </div>

            {/* PASS/FAIL BADGE (Top Right Corner) */}
            <div
              className={cn(
                "px-6 py-2 rounded border text-sm font-bold uppercase tracking-widest shadow-sm",
                passed
                  ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                  : "bg-rose-100 text-rose-800 border-rose-200",
              )}
            >
              {passed ? "Pass" : "Fail"}
            </div>
          </div>

          {/* SCORE SECTION */}
          <div className="bg-slate-900 p-8 border-b border-slate-100 text-center">
            <div className="inline-flex flex-col items-center">
              <span className="text-6xl font-bold text-slate-200 tracking-tighter">
                {score}%
              </span>
              <span className="text-xs font-bold text-slate-300 uppercase mt-2 tracking-widest">
                Final Score
              </span>
            </div>
          </div>

          {/* QUESTION REVIEW */}
          <div className="divide-y divide-slate-100">
            {questions.map((q, i) => {
              const uAnswers = userAnswers[q.id] || [];
              const isCorrect =
                uAnswers.length === q.answers.length &&
                uAnswers.every((a) => q.answers.includes(a));

              return (
                <div
                  key={q.id}
                  className="p-6 hover:bg-slate-50 transition-colors group"
                >
                  <div className="flex gap-5">
                    {/* Status Icon */}
                    <div className="mt-1 flex-shrink-0">
                      {isCorrect ? (
                        <div className="w-6 h-6 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center">
                          <Check size={14} strokeWidth={3} />
                        </div>
                      ) : (
                        <div className="w-6 h-6 bg-rose-100 text-rose-700 rounded-full flex items-center justify-center">
                          <X size={14} strokeWidth={3} />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex justify-between items-baseline mb-2">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                          Item {i + 1}
                        </span>
                        {!isCorrect && (
                          <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-100 uppercase">
                            Incorrect
                          </span>
                        )}
                      </div>

                      <p className="text-slate-900 font-medium text-base mb-4 whitespace-break-spaces leading-relaxed">
                        {q.questionText}
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                        {/* User Response */}
                        <div className="bg-slate-50 p-4 rounded border border-slate-200">
                          <span className="text-[10px] font-bold text-slate-400 uppercase block mb-2 tracking-wider">
                            Selected Response
                          </span>
                          {uAnswers.length > 0 ? (
                            uAnswers.map((a) => (
                              <div
                                key={a}
                                className="text-slate-700 font-medium mb-1 last:mb-0 flex items-start gap-2"
                              >
                                <span className="text-slate-400">•</span> {a}
                              </div>
                            ))
                          ) : (
                            <span className="text-slate-400 italic">
                              No response provided
                            </span>
                          )}
                        </div>

                        {/* Correct Answer (Only show if wrong) */}
                        {!isCorrect && (
                          <div className="bg-white p-4 rounded border border-emerald-100 shadow-[0_0_0_1px_rgba(16,185,129,0.1)]">
                            <span className="text-[10px] font-bold text-emerald-600 uppercase block mb-2 tracking-wider">
                              Correct Key
                            </span>
                            {q.answers.map((a: string) => (
                              <div
                                key={a}
                                className="text-emerald-900 font-medium mb-1 last:mb-0 flex items-start gap-2"
                              >
                                <Check
                                  size={14}
                                  className="mt-0.5 text-emerald-600"
                                />{" "}
                                {a}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* FOOTER ACTIONS */}
          <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-center gap-4">
            <Link
              href={`/bank/${bankId}`}
              className="px-6 py-2.5 border border-slate-300 bg-white text-slate-700 font-semibold rounded hover:bg-slate-50 transition-colors text-sm shadow-sm"
            >
              Return to Bank
            </Link>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 bg-slate-900 text-white font-semibold rounded hover:bg-slate-800 transition-colors text-sm flex items-center gap-2 shadow-sm"
            >
              <RotateCcw size={16} /> Retake Examination
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- QUIZ INTERFACE ---
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* HEADER CORREGIDO: Usamos GRID para alinear perfectamente los 3 elementos */}
      <div className="bg-white border-b border-slate-200 h-16 grid grid-cols-3 items-center px-6 fixed top-0 left-0 w-full z-30 shadow-sm">
        {/* COLUMNA IZQUIERDA: Botón Salir + Contador */}
        <div className="flex items-center gap-4">
          <Link
            href={`/bank/${bankId}`}
            className="text-slate-400 hover:text-rose-600 transition-colors flex items-center gap-1 group"
            title="Quit Exam"
          >
            <div className="p-1.5 rounded-md group-hover:bg-rose-50">
              <LogOut size={18} />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider hidden md:inline">
              Quit
            </span>
          </Link>

          <div className="h-4 w-px bg-slate-200 mx-2 hidden md:block" />

          <span className="font-mono text-slate-500 text-xs md:text-sm font-medium uppercase tracking-wider">
            Item {currentIndex + 1} / {questions.length}
          </span>
        </div>

        {/* COLUMNA CENTRAL: Barra de Progreso (Centrada perfectamente) */}
        <div className="flex justify-center px-4">
          <div className="w-full max-w-[200px] h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-slate-900 transition-all duration-500 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* COLUMNA DERECHA: Timer (Alineado al final) */}
        <div className="flex justify-end">
          <div
            className={cn(
              "flex items-center gap-2 font-mono text-sm md:text-base font-medium px-3 py-1 rounded-md bg-slate-50 border border-slate-100",
              timeRemaining < 300
                ? "text-rose-600 bg-rose-50 border-rose-100"
                : "text-slate-900",
            )}
          >
            <Clock
              size={16}
              className={
                timeRemaining < 300 ? "text-rose-500" : "text-slate-400"
              }
            />
            {formatTime(timeRemaining)}
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center pt-24 pb-12 px-4">
        <div className="w-full max-w-4xl bg-white border border-slate-200 rounded-lg shadow-sm p-8 md:p-12 min-h-[50vh] flex flex-col">
          {/* Question Stem */}
          <div className="mb-8">
            <h2 className="text-xl md:text-2xl font-semibold text-slate-900 leading-relaxed whitespace-pre-wrap">
              {currentQuestion.questionText}
            </h2>
            {isMultiSelect && (
              <div className="mt-4 flex items-center gap-2 text-blue-900 bg-blue-50 px-3 py-2 rounded border border-blue-100 text-xs font-bold uppercase tracking-wide inline-block">
                <AlertTriangle size={14} />
                Select all that apply ({currentQuestion.answers.length}{" "}
                required)
              </div>
            )}
          </div>

          {/* Options */}
          <div className="space-y-3 flex-grow">
            {currentQuestion.options.map((option: string, idx: number) => {
              const isSelected = selectedOptions.includes(option);
              return (
                <div
                  key={idx}
                  onClick={() => toggleOption(option)}
                  className={cn(
                    "group flex items-start p-4 border rounded cursor-pointer transition-all duration-150 select-none",
                    isSelected
                      ? "bg-blue-50/50 border-blue-900 shadow-[0_0_0_1px_rgba(30,58,138,1)]"
                      : "bg-white border-slate-200 hover:border-slate-400 hover:bg-slate-50",
                  )}
                >
                  <div
                    className={cn(
                      "mt-0.5 w-5 h-5 border rounded-sm flex items-center justify-center mr-4 transition-colors flex-shrink-0",
                      isSelected
                        ? "bg-blue-900 border-blue-900"
                        : "bg-white border-slate-300 group-hover:border-slate-400",
                    )}
                  >
                    {isSelected && <Check size={14} className="text-white" />}
                  </div>
                  <div
                    className={cn(
                      "text-sm md:text-base leading-relaxed",
                      isSelected
                        ? "text-slate-900 font-medium"
                        : "text-slate-600",
                    )}
                  >
                    {option}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer Action */}
          <div className="mt-10 flex justify-end pt-6 border-t border-slate-100">
            <button
              onClick={handleNext}
              disabled={selectedOptions.length === 0}
              className="bg-slate-900 text-white px-8 py-3 rounded font-semibold text-sm hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 shadow-sm"
            >
              {currentIndex === questions.length - 1
                ? "Submit Examination"
                : "Next Question"}
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
