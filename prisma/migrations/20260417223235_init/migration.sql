-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ESTUDIANTE', 'UNIVERSIDAD', 'EMPRESA');

-- CreateEnum
CREATE TYPE "EstadoDocumento" AS ENUM ('PENDIENTE', 'EN_REVISION', 'APROBADO', 'RECHAZADO');

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "password" TEXT,
    "role" "Role" NOT NULL DEFAULT 'ESTUDIANTE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PerfilEstudiante" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "codigoUsta" TEXT,
    "programa" TEXT,
    "semestre" INTEGER,
    "telefono" TEXT,

    CONSTRAINT "PerfilEstudiante_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PerfilUniversidad" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "departamento" TEXT,
    "cargo" TEXT,

    CONSTRAINT "PerfilUniversidad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PerfilEmpresa" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "nombreEmpresa" TEXT NOT NULL,
    "nit" TEXT,
    "sector" TEXT,
    "ciudad" TEXT,
    "telefono" TEXT,

    CONSTRAINT "PerfilEmpresa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Practica" (
    "id" TEXT NOT NULL,
    "estudianteId" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "fechaInicio" TIMESTAMP(3) NOT NULL,
    "fechaFin" TIMESTAMP(3),
    "descripcionCargo" TEXT,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "quedoContratado" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Practica_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Documento" (
    "id" TEXT NOT NULL,
    "practicaId" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT,
    "archivoUrl" TEXT NOT NULL,
    "estado" "EstadoDocumento" NOT NULL DEFAULT 'PENDIENTE',
    "comentarios" TEXT,
    "firmadoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Documento_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "PerfilEstudiante_userId_key" ON "PerfilEstudiante"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PerfilEstudiante_codigoUsta_key" ON "PerfilEstudiante"("codigoUsta");

-- CreateIndex
CREATE UNIQUE INDEX "PerfilUniversidad_userId_key" ON "PerfilUniversidad"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PerfilEmpresa_userId_key" ON "PerfilEmpresa"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PerfilEmpresa_nit_key" ON "PerfilEmpresa"("nit");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PerfilEstudiante" ADD CONSTRAINT "PerfilEstudiante_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PerfilUniversidad" ADD CONSTRAINT "PerfilUniversidad_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PerfilEmpresa" ADD CONSTRAINT "PerfilEmpresa_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Practica" ADD CONSTRAINT "Practica_estudianteId_fkey" FOREIGN KEY ("estudianteId") REFERENCES "PerfilEstudiante"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Practica" ADD CONSTRAINT "Practica_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "PerfilEmpresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Documento" ADD CONSTRAINT "Documento_practicaId_fkey" FOREIGN KEY ("practicaId") REFERENCES "Practica"("id") ON DELETE CASCADE ON UPDATE CASCADE;
