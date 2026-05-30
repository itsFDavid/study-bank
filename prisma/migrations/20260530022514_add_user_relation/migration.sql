-- Step 1: Crear la tabla de Usuarios primero (Requerido para la Llave Foránea)
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- Step 2: Crear el índice único para el Email
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- Step 3: Insertar el usuario administrador semilla para heredar los registros huérfanos
INSERT INTO "User" ("id", "name", "email", "image")
VALUES ('system-admin', 'System Admin', 'admin@studybank.local', '/icons/icon-192x192.png')
ON CONFLICT ("id") DO NOTHING;

-- Step 4: Alterar la tabla Bank agregando los nuevos controles e inyectando "userId" como OPCIONAL primero
ALTER TABLE "Bank" 
ADD COLUMN "allowReviews" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "isPublic" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "maxAttempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "userId" TEXT; -- Se agrega sin NOT NULL temporalmente para no tronar

-- Step 5: Sincronizar y normalizar tus datos existentes (GCP ACE, AWS, etc.) asignándolos al administrador
UPDATE "Bank" SET "userId" = 'system-admin' WHERE "userId" IS NULL;

-- Step 6: Ahora que la columna tiene datos en cada fila, asegurar el candado estricto NOT NULL
ALTER TABLE "Bank" ALTER COLUMN "userId" SET NOT NULL;

-- Step 7: Crear la tabla de Reseñas (Reviews)
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL,
    "comment" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bankId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- Step 8: Agregar los Constraints de Llaves Foráneas (Foreign Keys) en Cascada
ALTER TABLE "Bank" ADD CONSTRAINT "Bank_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Review" ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Review" ADD CONSTRAINT "Review_bankId_fkey" FOREIGN KEY ("bankId") REFERENCES "Bank"("id") ON DELETE CASCADE ON UPDATE CASCADE;