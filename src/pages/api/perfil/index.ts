import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getServerSession(req, res, authOptions);
    if (!session) return res.status(401).json({ message: "No autorizado" });

    const { id: userId, role } = session.user;

    // GET — obtener perfil propio
    if (req.method === "GET") {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                perfilEstudiante: true,
                perfilEmpresa: true,
                perfilUniversidad: true,
            },
        });
        return res.status(200).json({ data: user });
    }

    // PATCH — actualizar nombre del usuario
    if (req.method === "PATCH") {
        const { name } = req.body;

        const user = await prisma.user.update({
            where: { id: userId },
            data: { ...(name && { name }) },
        });

        return res.status(200).json({ data: user });
    }

    return res.status(405).json({ message: "Método no permitido" });
}