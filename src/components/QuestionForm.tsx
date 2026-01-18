"use client";

import { useState, useRef } from "react";
import { Plus, X, CheckSquare, Save, AlertCircle, Loader2 } from "lucide-react";
import { addQuestion, updateQuestion } from "@/app/actions";
import { cn } from "@/lib/utils";

// =====================================================
// TIPOS
// =====================================================

type QuestionData = {
  id: string;
  questionText: string;
  options: string[];
  answers: string[];
};

interface QuestionFormProps {
  bankId: string;
  initialData?: QuestionData;
  onSuccess?: () => void;
}

// =====================================================
// COMPONENTE
// =====================================================

export default function QuestionForm({
  bankId,
  initialData,
  onSuccess,
}: QuestionFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados de error separados
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<
    string,
    string[]
  > | null>(null);

  // Estado de éxito (opcional, para feedback visual)
  const [showSuccess, setShowSuccess] = useState(false);

  // Estado inicial inteligente
  const [options, setOptions] = useState<string[]>(
    initialData ? initialData.options : ["", ""],
  );

  const [correctIndices, setCorrectIndices] = useState<number[]>(
    initialData
      ? initialData.options
          .map((opt, i) => (initialData.answers.includes(opt) ? i : -1))
          .filter((i) => i !== -1)
      : [],
  );

  // =====================================================
  // HANDLERS
  // =====================================================

  const addOption = () => {
    if (options.length >= 8) {
      setErrorMessage("Maximum 8 options allowed");
      return;
    }
    setOptions([...options, ""]);
  };

  const removeOption = (index: number) => {
    if (options.length <= 2) {
      setErrorMessage("Minimum 2 options required");
      return;
    }
    const newOptions = options.filter((_, i) => i !== index);
    setOptions(newOptions);
    setCorrectIndices((prev) =>
      prev.filter((i) => i !== index).map((i) => (i > index ? i - 1 : i)),
    );
    setErrorMessage(null);
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const toggleCorrect = (index: number) => {
    setCorrectIndices((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
    );
  };

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    setErrorMessage(null);
    setFieldErrors(null);
    setShowSuccess(false);

    try {
      let result;

      // Decidir si crear o actualizar
      if (initialData) {
        formData.append("questionId", initialData.id);
        result = await updateQuestion(formData);
      } else {
        result = await addQuestion(formData);
      }

      // Manejar respuesta
      if (!result.success) {
        setErrorMessage(result.error || "Operation failed");

        // Si hay detalles de errores de campo
        if (typeof result.details === "object" && result.details !== null) {
          setFieldErrors(result.details as Record<string, string[]>);
        }
        return;
      }

      // ÉXITO
      setShowSuccess(true);

      // Solo resetear si estamos creando (no editando)
      if (!initialData) {
        setOptions(["", ""]);
        setCorrectIndices([]);
        formRef.current?.reset();
      }

      // Callback de éxito (para cerrar modal si es edición)
      if (onSuccess) {
        setTimeout(() => onSuccess(), 300);
      } else {
        // Auto-hide success message después de 3s
        setTimeout(() => setShowSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Form submission error:", err);
      setErrorMessage("System error: Unable to complete operation");
    } finally {
      setIsSubmitting(false);
    }
  }

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
      {/* HEADER */}
      <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
        <h3 className="font-semibold text-slate-800 text-sm uppercase tracking-wider">
          {initialData ? "Edit Item Configuration" : "Define New Item"}
        </h3>
        <span className="text-[10px] font-bold bg-blue-100 text-blue-900 px-2 py-0.5 rounded border border-blue-200">
          MULTIPLE CHOICE
        </span>
      </div>

      <form ref={formRef} action={handleSubmit} className="p-6 space-y-6">
        <input type="hidden" name="bankId" value={bankId} />
        {correctIndices.map((idx) => (
          <input key={idx} type="hidden" name="correctIndices" value={idx} />
        ))}

        {/* MENSAJE DE ERROR */}
        {errorMessage && (
          <div className="bg-rose-50 border-l-4 border-rose-700 p-4 rounded">
            <div className="flex gap-3">
              <AlertCircle
                className="text-rose-700 flex-shrink-0 mt-0.5"
                size={18}
              />
              <div className="flex-1">
                <h4 className="text-sm font-bold text-rose-900 mb-1">
                  Validation Error
                </h4>
                <p className="text-xs text-rose-800">{errorMessage}</p>

                {/* Errores de campo específicos */}
                {fieldErrors && Object.keys(fieldErrors).length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {Object.entries(fieldErrors).map(([field, errors]) =>
                      errors?.map((err, idx) => (
                        <li
                          key={`${field}-${idx}`}
                          className="text-xs text-rose-700"
                        >
                          •{" "}
                          <span className="font-semibold capitalize">
                            {field}:
                          </span>{" "}
                          {err}
                        </li>
                      )),
                    )}
                  </ul>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  setErrorMessage(null);
                  setFieldErrors(null);
                }}
                className="text-rose-400 hover:text-rose-600 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}

        {/* MENSAJE DE ÉXITO */}
        {showSuccess && !initialData && (
          <div className="bg-emerald-50 border-l-4 border-emerald-700 p-4 rounded">
            <div className="flex gap-3">
              <CheckSquare
                className="text-emerald-700 flex-shrink-0"
                size={18}
              />
              <div className="flex-1">
                <h4 className="text-sm font-bold text-emerald-900">
                  Record Added Successfully
                </h4>
                <p className="text-xs text-emerald-800 mt-0.5">
                  Question has been added to the bank.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* CAMPO: PREGUNTA */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-500 uppercase">
            Question Stem
          </label>
          <textarea
            name="question"
            required
            defaultValue={initialData?.questionText}
            rows={4}
            maxLength={2000}
            className="w-full text-sm p-3 border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-900 focus:border-blue-900 outline-none resize-y min-h-[100px]"
            placeholder="Enter the examination question text..."
          />
          <p className="text-[10px] text-slate-400 text-right">
            Maximum 2000 characters
          </p>
        </div>

        {/* CAMPO: OPCIONES */}
        <div className="space-y-3">
          <div className="flex justify-between items-end">
            <label className="block text-xs font-bold text-slate-500 uppercase">
              Response Options
            </label>
            <span className="text-[10px] text-slate-400">
              Mark correct answer(s)
            </span>
          </div>

          {options.map((opt, index) => {
            const isSelected = correctIndices.includes(index);
            return (
              <div key={index} className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => toggleCorrect(index)}
                  className={cn(
                    "flex-shrink-0 w-5 h-5 rounded border transition-colors flex items-center justify-center",
                    isSelected
                      ? "bg-emerald-700 border-emerald-700 text-white"
                      : "bg-white border-slate-300 text-transparent hover:border-slate-400",
                  )}
                  aria-label={`Mark option ${String.fromCharCode(65 + index)} as correct`}
                >
                  <CheckSquare size={14} />
                </button>

                <div className="flex-grow relative">
                  <span className="absolute left-3 top-2.5 text-xs font-mono text-slate-400">
                    {String.fromCharCode(65 + index)}.
                  </span>
                  <input
                    name="options"
                    value={opt}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    required
                    maxLength={500}
                    className={cn(
                      "w-full text-sm pl-8 pr-3 py-2 border rounded-md focus:outline-none transition-colors",
                      isSelected
                        ? "border-emerald-600 bg-emerald-50/10 focus:border-emerald-700"
                        : "border-slate-300 focus:border-blue-900",
                    )}
                    placeholder={`Option ${String.fromCharCode(65 + index)}`}
                  />
                </div>

                {options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOption(index)}
                    className="text-slate-300 hover:text-rose-700 transition-colors p-1"
                    aria-label={`Remove option ${String.fromCharCode(65 + index)}`}
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            );
          })}

          <button
            type="button"
            onClick={addOption}
            disabled={options.length >= 8}
            className="text-xs font-bold text-blue-900 hover:text-blue-700 flex items-center gap-1 mt-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Plus size={12} /> ADD OPTION{" "}
            {options.length >= 8 && "(Maximum reached)"}
          </button>
        </div>

        {/* BOTÓN SUBMIT */}
        <div className="pt-4 border-t border-slate-100">
          <button
            type="submit"
            disabled={correctIndices.length === 0 || isSubmitting}
            className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-md shadow-sm transition-all text-sm flex justify-center items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin" size={16} />
                Processing...
              </>
            ) : (
              <>
                <Save size={16} />
                {initialData ? "UPDATE RECORD" : "ADD TO BANK"}
              </>
            )}
          </button>

          {correctIndices.length === 0 && (
            <p className="text-[10px] text-rose-600 text-center mt-2">
              At least one correct answer must be marked
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
