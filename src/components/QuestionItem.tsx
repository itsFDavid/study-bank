"use client";

import { useState } from "react";
import { Trash2, Edit2, X, AlertCircle } from "lucide-react";
import { deleteQuestion } from "@/app/actions";
import FlashCard from "./FlashCard";
import QuestionForm from "./QuestionForm";
import { toast } from "sonner";

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
  hasSession?: boolean;
  isOwner: boolean;
}

export default function QuestionItem({
  question,
  bankId,
  index,
  total,
  hasSession,
  isOwner,
}: QuestionItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    toast.warning(`¿Eliminar el reactivo ${total - index}?`, {
      description: "Esta acción no se puede deshacer.",
      action: {
        label: "Eliminar",
        onClick: async () => {
          setIsDeleting(true);
          try {
            const result = await deleteQuestion(question.id, bankId);
            if (!result.success) {
              toast.error(result.error || "No se pudo eliminar el reactivo");
            } else {
              toast.success("Reactivo eliminado");
            }
          } catch {
            toast.error("Error del sistema al eliminar");
          } finally {
            setIsDeleting(false);
          }
        },
      },
      cancel: { label: "Cancelar", onClick: () => {} },
    });
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

      {isOwner && (
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
      )}

      <FlashCard
        question={question.questionText}
        answers={question.answers}
        options={question.options}
        hasSession={hasSession}
        isOwner={isOwner}
      />
    </div>
  );
}
