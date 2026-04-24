import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getServerSession(req, res, authOptions);
    if (!session || session.user.role !== "UNIVERSIDAD") {
        return res.status(403).json({ message: "Sin permisos" });
    }

    const { id } = req.query as { id: string };

    if (req.method === "PATCH") {
        const { activa, quedoContratado, fechaFin } = req.body;

        const practica = await prisma.practica.update({
            where: { id },
            data: {
                ...(activa !== undefined && { activa }),
                ...(quedoContratado !== undefined && { quedoContratado }),
                ...(fechaFin && { fechaFin: new Date(fechaFin) }),
            },
            include: {
                estudiante: { include: { user: true } },
                empresa: { include: { user: true } },
            },
        });

        return res.status(200).json({ data: practica });
    }

    return res.status(405).json({ message: "Método no permitido" });
}