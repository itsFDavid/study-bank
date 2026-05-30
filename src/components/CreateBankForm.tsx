"use client";

import { Plus, Loader2 } from "lucide-react";
import { useState, useRef } from "react";
import { toast } from "sonner";

interface CreateBankFormProps {
  onCreate: (title: string) => Promise<void>;
}

export default function CreateBankForm({ onCreate }: CreateBankFormProps) {
  const [isPending, setIsPending] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get("title")?.toString().trim();
    if (!title || title.length < 3) return;

    setIsPending(true);
    try {
      await onCreate(title);
      formRef.current?.reset();
      toast.success(`Banco "${title}" creado`);
    } catch {
      toast.error("No se pudo crear el banco");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-lg p-6 flex flex-col justify-center items-center hover:border-slate-400 hover:bg-slate-100/50 transition-all group h-full min-h-[190px]">
      <form ref={formRef} onSubmit={handleSubmit} className="w-full">
        <div className="mb-4 text-center">
          <div className="mx-auto w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 group-hover:text-slate-600 mb-2 shadow-sm">
            {isPending ? (
              <Loader2 size={18} className="animate-spin text-slate-600" />
            ) : (
              <Plus size={20} />
            )}
          </div>
          <h3 className="font-semibold text-sm text-slate-800 uppercase tracking-wider">
            Create New Bank
          </h3>
        </div>
        <div className="flex gap-2">
          <input
            name="title"
            type="text"
            placeholder="Subject Name (e.g. AWS)..."
            className="flex-1 bg-white border border-slate-300 text-sm px-3 py-2 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 placeholder:text-slate-400 text-slate-800"
            required
            disabled={isPending}
            minLength={3}
          />
          <button
            type="submit"
            disabled={isPending}
            className="bg-slate-950 text-white px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-md hover:bg-slate-800 transition-colors disabled:bg-slate-200 disabled:text-slate-400 shadow-sm"
          >
            Add
          </button>
        </div>
      </form>
    </div>
  );
}
