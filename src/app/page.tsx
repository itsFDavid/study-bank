import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import ResponsiveHeader from "@/components/ResponsiveHeader";
import CreateBankForm from "@/components/CreateBankForm";
import BankCard from "@/components/BankCard";
import Pagination from "@/components/Pagination";

export const dynamic = "force-dynamic";

interface CustomSessionUser {
  id: string;
}

interface BankSummaryData {
  id: string;
  title: string;
  isPublic: boolean;
  userId: string;
  _count: { questions: number };
}

interface PageProps {
  searchParams: Promise<{ view?: string; page?: string }>;
}

export default async function Home({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const view = resolvedParams.view || "all";
  const currentPage = Number(resolvedParams.page || "1");
  const pageSize = 20;

  const session = await getServerSession(authOptions);
  const user = session?.user as CustomSessionUser | undefined;
  const userId: string | undefined = user?.id;

  // Server Action atómica para registrar bancos
  async function handleCreateBank(title: string): Promise<void> {
    "use server";
    const currentSession = await getServerSession(authOptions);
    const currentUserId = (
      currentSession?.user as CustomSessionUser | undefined
    )?.id;
    if (!currentUserId) return;

    await prisma.bank.create({
      data: { title, userId: currentUserId, isPublic: false },
    });
    revalidatePath("/");
  }

  // 1. Construcción del Filtro Condicional (Seguridad)
  let whereClause = {};
  if (view === "mine" && userId) {
    whereClause = { userId: userId }; // Mis Bancos (propios, tanto públicos como privados)
  } else {
    whereClause = { isPublic: true }; // Bancos Públicos (todos los usuarios)
  }

  // 2. Ejecutar conteo total para la Paginación Matemática
  const totalBanks = await prisma.bank.count({ where: whereClause });
  const totalPages = Math.ceil(totalBanks / pageSize);

  // 3. Consulta Paginada a PostgreSQL
  const banks: BankSummaryData[] = await prisma.bank.findMany({
    where: whereClause,
    select: {
      id: true,
      title: true,
      isPublic: true,
      userId: true,
      _count: { select: { questions: true } },
    },
    skip: (currentPage - 1) * pageSize,
    take: pageSize,
    orderBy: { createdAt: "desc" },
  });

  const formattedDate = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <main className="min-h-screen bg-slate-50 font-sans pb-12">
      {/* Componente del Header con Menú Hamburguesa */}
      <ResponsiveHeader formattedDate={formattedDate} hasSession={!!userId} />

      <div className="max-w-7xl mx-auto px-6 md:px-8 py-12">
        <div className="mb-10">
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight uppercase">
            {view === "mine"
              ? "Mis Bancos de Preguntas Propios"
              : "Bancos de Preguntas Públicos"}
          </h1>
          <p className="text-slate-500 text-sm mt-1 leading-relaxed">
            {view === "mine"
              ? "Repositorio privado de reactivos diseñados por tu cuenta de autor."
              : "Consulta y practica de manera libre con los simuladores de la comunidad."}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Solo mostrar el formulario de creación si está en "Mis Bancos" y logueado */}
          {userId && view === "mine" && (
            <div>
              <CreateBankForm onCreate={handleCreateBank} />
            </div>
          )}

          {/* Render de las Tarjetas Modificadas */}
          {banks.map((bank: BankSummaryData) => (
            <div key={bank.id}>
              <BankCard bank={bank} currentUserId={userId} />
            </div>
          ))}
        </div>

        {banks.length === 0 && (
          <div className="text-center py-12 border border-dashed border-slate-200 rounded-lg bg-white mt-4">
            <p className="text-sm text-slate-400 font-medium">
              No se localizaron bancos de preguntas en este segmento.
            </p>
          </div>
        )}

        {/* Componente de Paginación Atómica */}
        <div className="mt-10">
          <Pagination totalPages={totalPages} currentPage={currentPage} />
        </div>
      </div>
    </main>
  );
}
