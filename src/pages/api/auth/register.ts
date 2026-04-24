import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Método no permitido" });
    }

    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
        return res.status(400).json({ message: "Todos los campos son requeridos" });
    }

    const rolesValidos: Role[] = ["ESTUDIANTE", "UNIVERSIDAD", "EMPRESA"];
    if (!rolesValidos.includes(role)) {
        return res.status(400).json({ message: "Rol inválido" });
    }

    const usuarioExistente = await prisma.user.findUnique({
        where: { email },
    });

    if (usuarioExistente) {
        return res.status(409).json({ message: "El email ya está registrado" });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const nuevoUsuario = await prisma.user.create({
        data: {
            name,
            email,
            password: passwordHash,
            role,
        },
    });

    return res.status(201).json({
        message: "Usuario creado exitosamente",
        userId: nuevoUsuario.id,
    });
}