import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getServerSession(req, res, authOptions);
    if (!session || session.user.role !== "UNIVERSIDAD") {
        return res.status(403).json({ message: "Sin permisos" });
    }

    // GET — listar usuarios empresa con y sin perfil
    if (req.method === "GET") {
        const usuarios = await prisma.user.findMany({
            where: { role: "EMPRESA" },
            include: { perfilEmpresa: true },
            orderBy: { createdAt: "desc" },
        });
        return res.status(200).json({ data: usuarios });
    }

    // POST — crear perfil de empresa
    if (req.method === "POST") {
        const { userId, nombreEmpresa, nit, sector, ciudad, telefono } = req.body;

        if (!userId || !nombreEmpresa) {
            return res.status(400).json({ message: "userId y nombreEmpresa son requeridos" });
        }

        const existente = await prisma.perfilEmpresa.findUnique({ where: { userId } });
        if (existente) {
            return res.status(409).json({ message: "Esta empresa ya tiene perfil" });
        }

        const perfil = await prisma.perfilEmpresa.create({
            data: { userId, nombreEmpresa, nit, sector, ciudad, telefono },
        });

        return res.status(201).json({ data: perfil });
    }

    return res.status(405).json({ message: "Método no permitido" });
}