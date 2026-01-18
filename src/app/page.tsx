import Link from "next/link";
import { Book, Plus } from "lucide-react";
import { prisma } from "@/lib/prisma"; // Importamos tu cliente
import { revalidatePath } from "next/cache";

// Action rápida para crear un banco nuevo desde aquí mismo
async function createBank(formData: FormData) {
  "use server";
  const title = formData.get("title") as string;
  if (!title) return;

  await prisma.bank.create({ data: { title } });
  revalidatePath("/");
}

export default async function Home() {
  // 1. Obtenemos los bancos reales y contamos sus preguntas
  const banks = await prisma.bank.findMany({
    include: {
      _count: {
        select: { questions: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <header className="mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mis Bancos</h1>
          <p className="text-gray-500">Listos para el repaso</p>
        </div>

        {/* Formulario simple para crear banco rápido */}
        <form action={createBank} className="flex gap-2">
          <input
            name="title"
            placeholder="Nuevo tema (ej. Docker)"
            className="border p-2 rounded-lg text-sm"
            required
          />
          <button
            type="submit"
            className="bg-black text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-800 transition text-sm"
          >
            <Plus size={16} /> Crear
          </button>
        </form>
      </header>

      {banks.length === 0 ? (
        <div className="text-center text-gray-400 mt-20">
          <p>No tienes bancos de preguntas aún. ¡Crea uno arriba!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {banks.map((bank) => (
            <Link
              href={`/bank/${bank.id}`}
              key={bank.id}
              className="block group"
            >
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-indigo-500 transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <Book size={24} />
                  </div>
                  <span className="text-xs font-medium bg-gray-100 px-2 py-1 rounded text-gray-600">
                    {bank._count.questions} preguntas
                  </span>
                </div>
                <h2 className="text-xl font-bold text-gray-800 group-hover:text-indigo-600 transition-colors">
                  {bank.title}
                </h2>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
