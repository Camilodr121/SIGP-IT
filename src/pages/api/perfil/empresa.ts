import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getServerSession(req, res, authOptions);
    if (!session || session.user.role !== "EMPRESA") {
        return res.status(403).json({ message: "Sin permisos" });
    }

    const userId = session.user.id;

    if (req.method === "PATCH") {
        const { nombreEmpresa, nit, sector, ciudad, telefono } = req.body;

        const perfil = await prisma.perfilEmpresa.upsert({
            where: { userId },
            update: {
                nombreEmpresa: nombreEmpresa ?? undefined,
                nit: nit ?? undefined,
                sector: sector ?? undefined,
                ciudad: ciudad ?? undefined,
                telefono: telefono ?? undefined,
            },
            create: {
                userId,
                nombreEmpresa: nombreEmpresa || "Sin nombre",
                nit: nit || null,
                sector: sector || null,
                ciudad: ciudad || null,
                telefono: telefono || null,
            },
        });

        return res.status(200).json({ data: perfil });
    }

    return res.status(405).json({ message: "Método no permitido" });
}