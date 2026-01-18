import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// importar json ace
import questionsData from "../preguntas_ace.json";

async function main() {
  // Asegúrate de tener el ID de tu Banco de Preguntas creado previamente
  const bankId = "cmkj8fj5w000062qpzx68b6to"; 

  console.log(`Seeding questions for bank: ${bankId}...`);

  for (const q of questionsData) {
    await prisma.question.create({
      data: {
        questionText: q.questionText,
        options: q.options,
        answers: q.answers,
        bankId: bankId,
      },
    });
  }
  console.log("Seed completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });