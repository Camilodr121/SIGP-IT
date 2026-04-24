import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getServerSession(req, res, authOptions);
    if (!session) return res.status(401).json({ message: "No autorizado" });

    const { id } = req.query as { id: string };

    // PATCH — marcar una como leída
    if (req.method === "PATCH") {
        const notif = await prisma.notificacion.findFirst({
            where: { id, userId: session.user.id },
        });
        if (!notif) return res.status(404).json({ message: "No encontrada" });

        await prisma.notificacion.update({
            where: { id },
            data: { leida: true },
        });
        return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ message: "Método no permitido" });
}