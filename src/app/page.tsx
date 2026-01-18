import Link from "next/link";
import { Book, Plus, ArrowRight, Clock } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

async function createBank(formData: FormData) {
  "use server";
  const title = formData.get("title") as string;
  if (!title) return;
  await prisma.bank.create({ data: { title } });
  revalidatePath("/");
}

export default async function Home() {
  const banks = await prisma.bank.findMany({
    include: { _count: { select: { questions: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Professional Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 bg-slate-900 rounded-sm" />
            <span className="font-semibold text-slate-900 tracking-tight">
              EXAM<span className="font-light text-slate-500">SYSTEM</span>
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <Clock size={16} />
            <span>
              {new Date().toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-8 py-12">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Question Banks
            </h1>
            <p className="text-slate-500 mt-1">
              Manage examination content and subjects.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Create New Card - Dashed and understated */}
          <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-lg p-6 flex flex-col justify-center items-center hover:border-slate-400 hover:bg-slate-100 transition-all group">
            <form action={createBank} className="w-full">
              <div className="mb-4 text-center">
                <div className="mx-auto w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 group-hover:text-slate-600 mb-2">
                  <Plus size={20} />
                </div>
                <h3 className="font-medium text-slate-900">Create New Bank</h3>
              </div>
              <div className="flex gap-2">
                <input
                  name="title"
                  placeholder="Subject Name..."
                  className="flex-1 bg-white border border-slate-300 text-sm px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                  required
                />
                <button
                  type="submit"
                  className="bg-slate-900 text-white px-4 py-2 text-sm font-medium rounded-md hover:bg-slate-800 transition-colors"
                >
                  Add
                </button>
              </div>
            </form>
          </div>

          {/* Bank Cards - Strict, White, Shadow-sm */}
          {banks.map((bank) => (
            <Link
              href={`/bank/${bank.id}`}
              key={bank.id}
              className="block group"
            >
              <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm hover:shadow-md hover:border-blue-900 transition-all duration-200 h-full flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-slate-100 rounded-md text-slate-700 group-hover:bg-blue-50 group-hover:text-blue-900 transition-colors">
                    <Book size={20} />
                  </div>
                  <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                    ID: {bank.id.slice(-4)}
                  </span>
                </div>

                <h2 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-blue-900 transition-colors">
                  {bank.title}
                </h2>

                <div className="mt-auto pt-6 flex items-center justify-between text-sm text-slate-500 border-t border-slate-100">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    {bank._count.questions} Items
                  </span>
                  <span className="flex items-center gap-1.5 group-hover:translate-x-1 transition-transform">
                    Manage <ArrowRight size={14} />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
