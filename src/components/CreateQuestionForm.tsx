"use client";

import { useState, useRef } from "react";
import { Plus, X, CheckSquare, Square, Save, AlertCircle } from "lucide-react";
import { addQuestion } from "@/app/actions";
import { cn } from "@/lib/utils";

export default function CreateQuestionForm({ bankId }: { bankId: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [options, setOptions] = useState(["", ""]);
  const [correctIndices, setCorrectIndices] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorMessages, setErrorMessages] = useState<string[] | null>(null);

  const addOption = () => {
    if (options.length >= 8) return;
    setOptions([...options, ""]);
  };

  const removeOption = (index: number) => {
    if (options.length <= 2) return;
    const newOptions = options.filter((_, i) => i !== index);
    setOptions(newOptions);
    setCorrectIndices((prev) =>
      prev.filter((i) => i !== index).map((i) => (i > index ? i - 1 : i)),
    );
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
    setErrorMessages(null);

    try {
      // 1. Llamamos a la acción y ESPERAMOS el resultado
      const result = await addQuestion(formData);

      // 2. Verificamos si la lógica de negocio falló (ej: validación Zod)
      if (!result.success) {
        // Si hay detalles de Zod (errores por campo), los extraemos
        if (result.details) {
          const messages: string[] = [];
          // result.details es un objeto { question: [...], options: [...] }
          Object.values(result.details).forEach((errArray: any) => {
            messages.push(...errArray);
          });
          setErrorMessages(messages);
        } else {
          // Si es un error genérico
          setErrorMessages([result.error as string]);
        }
        return; // Detenemos la ejecución aquí, no reseteamos el form
      }

      // 3. Éxito: Reseteamos el formulario
      setOptions(["", ""]);
      setCorrectIndices([]);
      formRef.current?.reset();
    } catch (err) {
      // 4. Error de red o crash del sistema
      setErrorMessages([
        "System failure: Unable to commit record to database.",
      ]);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
      <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
        <h3 className="font-semibold text-slate-800 text-sm uppercase tracking-wider">
          Define New Item
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

        {errorMessages && errorMessages.length > 0 && (
          <div className="bg-rose-50 border-l-4 border-rose-700 p-4 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex gap-3">
              <AlertCircle
                className="text-rose-700 flex-shrink-0 mt-0.5 justify-center items-center"
                size={18}
              />
              <div className="flex-1">
                <h4 className="text-sm font-bold text-rose-900 mb-1">
                  Submission Failed
                </h4>
                <ul className="list-disc list-inside text-xs text-rose-800 space-y-1">
                  {errorMessages.map((msg, i) => (
                    <li key={i}>{msg}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-500 uppercase">
            Question Stem
          </label>
          <textarea
            name="question"
            required
            rows={4}
            className="w-full text-sm p-3 border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-900 focus:border-blue-900 outline-none resize-y min-h-[100px]"
            placeholder="Enter the examination question text..."
          />
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-end">
            <label className="block text-xs font-bold text-slate-500 uppercase">
              Response Options
            </label>
            <span className="text-[10px] text-slate-400">
              Select checkboxes to mark correct answers
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
                    className={cn(
                      "w-full text-sm pl-8 pr-3 py-2 border rounded-md focus:outline-none transition-colors",
                      isSelected
                        ? "border-emerald-600 bg-emerald-50/10"
                        : "border-slate-300 focus:border-blue-900",
                    )}
                  />
                </div>

                {options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOption(index)}
                    className="text-slate-300 hover:text-rose-700 transition-colors"
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
            className="text-xs font-bold text-blue-900 hover:text-blue-700 flex items-center gap-1 mt-2 disabled:opacity-50"
          >
            <Plus size={12} /> ADD OPTION
          </button>
        </div>

        <div className="pt-4 border-t border-slate-100">
          <button
            type="submit"
            disabled={correctIndices.length === 0 || isSubmitting}
            className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold py-3 px-4 rounded-md shadow-sm transition-all text-sm flex justify-center items-center gap-2"
          >
            {isSubmitting ? (
              "Processing..."
            ) : (
              <>
                <Save size={16} /> ADD TO BANK
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
