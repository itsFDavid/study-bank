import Link from "next/link";
import { Book, ArrowRight, EyeOff, UserCheck } from "lucide-react";

interface BankCardProps {
  bank: {
    id: string;
    title: string;
    isPublic: boolean;
    userId: string;
    _count: { questions: number };
  };
  currentUserId?: string;
}

export default function BankCard({ bank, currentUserId }: BankCardProps) {
  const isOwner = currentUserId === bank.userId;

  return (
    <Link href={`/bank/${bank.id}`} className="block group h-full">
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm hover:shadow-md hover:border-blue-900/60 transition-all duration-200 h-full flex flex-col">
        <div className="flex justify-between items-start mb-4">
          <div className="p-2 bg-slate-100 rounded-md text-slate-700 group-hover:bg-blue-50 group-hover:text-blue-900 transition-colors">
            <Book size={18} />
          </div>
          <div className="flex items-center gap-1.5">
            {isOwner && (
              <span className="flex items-center gap-1 text-[10px] font-bold bg-blue-50 text-blue-950 px-2 py-0.5 rounded border border-blue-200 uppercase tracking-wide">
                <UserCheck size={10} /> Dueño
              </span>
            )}
            {!bank.isPublic && (
              <span className="flex items-center gap-1 text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200 uppercase tracking-wide">
                <EyeOff size={10} /> Private
              </span>
            )}
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
              ID: {bank.id.slice(-4).toUpperCase()}
            </span>
          </div>
        </div>

        <h2 className="text-base font-bold text-slate-900 mb-1 group-hover:text-blue-900 transition-colors leading-tight">
          {bank.title}
        </h2>

        <div className="mt-auto pt-6 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100">
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            {bank._count.questions} Reactivos
          </span>
          <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider group-hover:translate-x-1 transition-transform text-[10px] text-slate-600 group-hover:text-blue-900">
            Manage <ArrowRight size={12} />
          </span>
        </div>
      </div>
    </Link>
  );
}
