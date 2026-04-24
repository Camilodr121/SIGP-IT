-- CreateEnum
CREATE TYPE "TipoDocumento" AS ENUM ('INICIACION', 'INFORME_1', 'INFORME_2', 'INFORME_3', 'INFORME_FINAL');

-- AlterTable
ALTER TABLE "Documento" ADD COLUMN     "tipoDocumento" "TipoDocumento";

-- AlterTable
ALTER TABLE "PerfilEmpresa" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
