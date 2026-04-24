import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getServerSession(req, res, authOptions);
    if (!session || session.user.role !== "ESTUDIANTE") {
        return res.status(403).json({ message: "Sin permisos" });
    }

    const userId = session.user.id;

    if (req.method === "PATCH") {
        const { codigoUsta, programa, semestre, telefono } = req.body;

        const perfil = await prisma.perfilEstudiante.upsert({
            where: { userId },
            update: {
                codigoUsta: codigoUsta ?? undefined,
                programa: programa ?? undefined,
                semestre: semestre ? parseInt(semestre) : undefined,
                telefono: telefono ?? undefined,
            },
            create: {
                userId,
                codigoUsta: codigoUsta || null,
                programa: programa || null,
                semestre: semestre ? parseInt(semestre) : null,
                telefono: telefono || null,
            },
        });

        return res.status(200).json({ data: perfil });
    }

    return res.status(405).json({ message: "Método no permitido" });
}