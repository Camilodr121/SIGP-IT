import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getSession({ req });
    if (!session || session.user.role !== "UNIVERSIDAD")
        return res.status(401).json({ message: "No autorizado" });

    if (req.method === "GET") {
        const empresas = await prisma.perfilEmpresa.findMany({
            include: { user: { select: { id: true, name: true, email: true } } },
            orderBy: { createdAt: "desc" },
        });
        return res.status(200).json({ data: empresas });
    }

    if (req.method === "POST") {
        const { nombreEmpresa, nit, sector, ciudad, telefono } = req.body;
        if (!nombreEmpresa?.trim())
            return res.status(400).json({ message: "El nombre de la empresa es requerido" });

        // Crea un usuario EMPRESA placeholder + su perfil empresa
        const email = `empresa-${Date.now()}@sigp.internal`;
        const nuevo = await prisma.user.create({
            data: {
                email,
                name: nombreEmpresa.trim(),
                role: "EMPRESA",
                password: "", // sin acceso directo — gestionada por universidad
                perfilEmpresa: {
                    create: {
                        nombreEmpresa: nombreEmpresa.trim(),
                        nit: nit || null,
                        sector: sector || null,
                        ciudad: ciudad || null,
                        telefono: telefono || null,
                    },
                },
            },
            include: { perfilEmpresa: true },
        });
        return res.status(201).json({ data: nuevo.perfilEmpresa });
    }

    return res.status(405).json({ message: "Método no permitido" });
}