import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getServerSession(req, res, authOptions);
    if (!session || session.user.role !== "UNIVERSIDAD") {
        return res.status(403).json({ message: "Sin permisos" });
    }

    // GET — listar usuarios estudiante con y sin perfil
    if (req.method === "GET") {
        const usuarios = await prisma.user.findMany({
            where: { role: "ESTUDIANTE" },
            include: { perfilEstudiante: true },
            orderBy: { createdAt: "desc" },
        });
        return res.status(200).json({ data: usuarios });
    }

    // POST — crear perfil de estudiante
    if (req.method === "POST") {
        const { userId, codigoUsta, programa, semestre, telefono } = req.body;

        if (!userId) {
            return res.status(400).json({ message: "userId es requerido" });
        }

        const existente = await prisma.perfilEstudiante.findUnique({ where: { userId } });
        if (existente) {
            return res.status(409).json({ message: "Este estudiante ya tiene perfil" });
        }

        const perfil = await prisma.perfilEstudiante.create({
            data: {
                userId,
                codigoUsta: codigoUsta || null,
                programa: programa || null,
                semestre: semestre ? parseInt(semestre) : null,
                telefono: telefono || null,
            },
        });

        return res.status(201).json({ data: perfil });
    }

    return res.status(405).json({ message: "Método no permitido" });
}