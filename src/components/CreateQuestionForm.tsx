"use client";

import { useState, useRef } from "react"; // 1. Importamos useRef
import { Plus, Trash2, CheckSquare, Square, Save } from "lucide-react";
import { addQuestion } from "@/app/actions";
import { cn } from "@/lib/utils";

export default function CreateQuestionForm({ bankId }: { bankId: string }) {
  // 2. Creamos una referencia al formulario HTML para poder resetear inputs no controlados (como el textarea)
  const formRef = useRef<HTMLFormElement>(null);

  const [options, setOptions] = useState(["", ""]);
  const [correctIndices, setCorrectIndices] = useState<number[]>([]);
  // Estado de carga opcional para mejor UX
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addOption = () => setOptions([...options, ""]);

  const removeOption = (index: number) => {
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
    setCorrectIndices((prev) => {
      if (prev.includes(index)) {
        return prev.filter((i) => i !== index);
      } else {
        return [...prev, index];
      }
    });
  };

  // 3. ESTA ES LA CLAVE: Una función intermedia
  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);

    try {
      // a) Llamamos a tu Server Action real
      await addQuestion(formData);

      // b) Si todo salió bien, reseteamos el estado visual de React
      setOptions(["", ""]);
      setCorrectIndices([]);

      // c) Reseteamos el formulario HTML (esto limpia el textarea del enunciado)
      formRef.current?.reset();
    } catch (error) {
      console.error("Error al guardar:", error);
      // Aquí podrías poner un toast de error si quisieras
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
      <div className="flex items-center gap-2 mb-6 border-b pb-4">
        <h3 className="text-xl font-bold text-gray-800">Nueva Pregunta</h3>
        <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full font-medium">
          Multi-Opción
        </span>
      </div>

      {/* 4. Conectamos la ref y cambiamos la action por nuestro handleSubmit */}
      <form ref={formRef} action={handleSubmit} className="flex flex-col gap-6">
        <input type="hidden" name="bankId" value={bankId} />

        {correctIndices.map((idx) => (
          <input key={idx} type="hidden" name="correctIndices" value={idx} />
        ))}

        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-gray-700 uppercase">
            Enunciado
          </label>
          <textarea
            name="question"
            required
            rows={8}
            className="w-full bg-gray-50 border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 outline-none resize-y whitespace-pre-wrap font-medium"
            placeholder={
              "Escribe aquí tu pregunta...\nPuedes dar Enter para separar párrafos.\n\nEjemplo:\nContexto...\n\n¿Pregunta?"
            }
          />
        </div>

        <div className="flex flex-col gap-3">
          <label className="text-sm font-bold text-gray-700 uppercase flex justify-between items-center">
            Respuestas
            <span className="text-xs font-normal text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
              Marca todas las correctas
            </span>
          </label>

          {options.map((opt, index) => {
            const isSelected = correctIndices.includes(index);
            return (
              <div key={index} className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => toggleCorrect(index)}
                  className={cn(
                    "flex-shrink-0 w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-all",
                    isSelected
                      ? "border-green-500 bg-green-500 text-white"
                      : "border-gray-300 text-gray-300 hover:border-gray-400",
                  )}
                >
                  {isSelected ? (
                    <CheckSquare size={18} />
                  ) : (
                    <Square size={18} />
                  )}
                </button>

                <input
                  name="options"
                  value={opt}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  required
                  placeholder={`Opción ${index + 1}`}
                  className={cn(
                    "flex-grow border rounded-lg p-3 outline-none transition-all",
                    isSelected
                      ? "border-green-500 ring-1 ring-green-500 bg-green-50/20"
                      : "border-gray-300 focus:border-indigo-500 bg-white",
                  )}
                />

                {options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOption(index)}
                    className="text-gray-400 hover:text-red-500 p-2"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            );
          })}

          <button
            type="button"
            onClick={addOption}
            className="self-start text-sm text-indigo-600 font-medium flex items-center gap-1 mt-2 px-2 py-1 hover:bg-indigo-50 rounded"
          >
            <Plus size={16} /> Más opciones
          </button>
        </div>

        <button
          type="submit"
          disabled={correctIndices.length === 0 || isSubmitting}
          className="mt-4 w-full bg-black hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all"
        >
          {isSubmitting ? (
            "Guardando..."
          ) : (
            <>
              <Save size={20} /> Guardar
            </>
          )}
        </button>
      </form>
    </div>
  );
}
