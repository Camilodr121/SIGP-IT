import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { crearNotificacion } from "@/lib/notificaciones";
import { emitirNotificacion } from "@/pages/api/notificaciones/stream";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getServerSession(req, res, authOptions);
    if (!session) return res.status(401).json({ message: "No autorizado" });

    // POST — solo universidad puede crear prácticas
    if (req.method === "POST") {
        if (session.user.role !== "UNIVERSIDAD") {
            return res.status(403).json({ message: "Sin permisos" });
        }

        const { estudianteId, empresaId, fechaInicio, fechaFin, descripcionCargo } = req.body;

        if (!estudianteId || !empresaId || !fechaInicio) {
            return res.status(400).json({ message: "Faltan campos requeridos" });
        }

        const practica = await prisma.practica.create({
            data: {
                estudianteId,
                empresaId,
                fechaInicio: new Date(fechaInicio),
                fechaFin: fechaFin ? new Date(fechaFin) : null,
                descripcionCargo: descripcionCargo ?? null,
            },
            include: {
                estudiante: { include: { user: true } },
                empresa: { include: { user: true } },
            },
        });

        // Notificar al estudiante
        if (practica.estudiante?.userId) {
            const msg = `Fuiste asignado a ${practica.empresa.nombreEmpresa}`;
            await crearNotificacion({
                userId: practica.estudiante.userId,
                titulo: "Práctica asignada",
                mensaje: msg,
                tipo: "PRACTICA_ASIGNADA",
                enlace: "/dashboard/estudiante/practica",
            });
            emitirNotificacion(practica.estudiante.userId, {
                titulo: "Práctica asignada",
                mensaje: msg,
                tipo: "PRACTICA_ASIGNADA",
            });
        }

        // Notificar a la empresa
        if (practica.empresa?.userId) {
            const msg = `${practica.estudiante.user.name} fue asignado a tu empresa`;
            await crearNotificacion({
                userId: practica.empresa.userId,
                titulo: "Nuevo practicante asignado",
                mensaje: msg,
                tipo: "PRACTICA_ASIGNADA",
                enlace: "/dashboard/empresa/practicantes",
            });
            emitirNotificacion(practica.empresa.userId, {
                titulo: "Nuevo practicante asignado",
                mensaje: msg,
                tipo: "PRACTICA_ASIGNADA",
            });
        }

        return res.status(201).json({ data: practica });
    }

    // GET — listar prácticas según rol
    if (req.method === "GET") {
        const practicas = await prisma.practica.findMany({
            include: {
                estudiante: { include: { user: true } },
                empresa: { include: { user: true } },
                documentos: true,
            },
            orderBy: { createdAt: "desc" },
        });
        return res.status(200).json({ data: practicas });
    }

    return res.status(405).json({ message: "Método no permitido" });
}