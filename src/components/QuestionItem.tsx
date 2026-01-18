"use client";

import { useState } from "react";
import { Trash2, Edit2, X, AlertCircle } from "lucide-react";
import { deleteQuestion } from "@/app/actions";
import FlashCard from "./FlashCard";
import QuestionForm from "./QuestionForm";

// 1. TIPOS ESTRICTOS
interface QuestionData {
  id: string;
  questionText: string;
  answers: string[];
  options: string[];
  createdAt: Date;
}

interface QuestionItemProps {
  question: QuestionData;
  bankId: string;
  index: number;
  total: number;
}

export default function QuestionItem({
  question,
  bankId,
  index,
  total,
}: QuestionItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDelete = async () => {
    // Reset error anterior
    setDeleteError(null);

    // Confirmación profesional
    const confirmed = confirm(
      `Confirm deletion of item ${total - index}?\n\nThis action cannot be undone.`,
    );

    if (!confirmed) return;

    setIsDeleting(true);

    try {
      const result = await deleteQuestion(question.id, bankId);

      if (!result.success) {
        setDeleteError(result.error || "Failed to delete question");
      }
    } catch (error) {
      console.error("Delete error:", error);
      setDeleteError("System error: Unable to complete deletion");
    } finally {
      setIsDeleting(false);
    }
  };

  // MODO EDICIÓN
  if (isEditing) {
    return (
      <div className="relative mb-8 bg-slate-50 p-6 border-2 border-blue-900/20 rounded-lg">
        <div className="absolute right-4 top-4 z-10">
          <button
            onClick={() => setIsEditing(false)}
            className="bg-white border border-slate-300 p-1.5 rounded hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors shadow-sm"
            title="Cancel Editing"
            type="button"
          >
            <X size={16} />
          </button>
        </div>
        <QuestionForm
          bankId={bankId}
          initialData={question}
          onSuccess={() => setIsEditing(false)}
        />
      </div>
    );
  }

  // MODO VISUALIZACIÓN
  return (
    <div className="group relative pl-8 mb-6 transition-all">
      {/* Número de pregunta */}
      <span className="absolute left-0 top-6 text-xs font-bold text-slate-400 w-6 text-right font-mono">
        {total - index}.
      </span>

      {/* ERROR DE ELIMINACIÓN (si existe) */}
      {deleteError && (
        <div className="mb-3 bg-rose-50 border-l-4 border-rose-700 p-3 rounded">
          <div className="flex items-start gap-2">
            <AlertCircle
              className="text-rose-700 flex-shrink-0 mt-0.5"
              size={16}
            />
            <div className="flex-1">
              <p className="text-xs font-bold text-rose-900 mb-1">
                Deletion Failed
              </p>
              <p className="text-xs text-rose-800">{deleteError}</p>
            </div>
            <button
              onClick={() => setDeleteError(null)}
              className="text-rose-400 hover:text-rose-600"
              type="button"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* BOTONES DE ACCIÓN */}
      <div className="absolute right-0 top-0 z-10 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1.5 p-2 bg-white/90 backdrop-blur-sm rounded-bl-md border-l border-b border-slate-200 shadow-sm">
        <button
          onClick={() => setIsEditing(true)}
          className="p-1.5 bg-white border border-slate-300 text-slate-600 hover:text-blue-900 hover:border-blue-900 rounded transition-all"
          title="Edit Item"
          type="button"
        >
          <Edit2 size={14} />
        </button>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="p-1.5 bg-white border border-slate-300 text-slate-600 hover:text-rose-700 hover:border-rose-700 rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          title="Delete Item"
          type="button"
        >
          {isDeleting ? (
            <div className="w-3.5 h-3.5 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
          ) : (
            <Trash2 size={14} />
          )}
        </button>
      </div>

      <FlashCard
        question={question.questionText}
        answers={question.answers}
        options={question.options}
      />
    </div>
  );
}
