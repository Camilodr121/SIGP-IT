import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getServerSession(req, res, authOptions);
    if (!session) return res.status(401).json({ message: "No autorizado" });

    const userId = session.user.id;

    // GET — obtener notificaciones del usuario
    if (req.method === "GET") {
        const notificaciones = await prisma.notificacion.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            take: 30,
        });

        const noLeidas = notificaciones.filter((n) => !n.leida).length;
        return res.status(200).json({ data: notificaciones, noLeidas });
    }

    // PATCH — marcar todas como leídas
    if (req.method === "PATCH") {
        await prisma.notificacion.updateMany({
            where: { userId, leida: false },
            data: { leida: true },
        });
        return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ message: "Método no permitido" });
}