import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { crearNotificacion } from "@/lib/notificaciones";
import { emitirNotificacion } from "@/pages/api/notificaciones/stream";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getServerSession(req, res, authOptions);
    if (!session || session.user.role !== "UNIVERSIDAD") {
        return res.status(403).json({ message: "Sin permisos" });
    }

    const { id } = req.query as { id: string };

    if (req.method === "GET") {
        const practica = await prisma.practica.findUnique({
            where: { id },
            include: {
                estudiante: { include: { user: true } },
                empresa: true,
                documentos: { orderBy: { createdAt: "asc" } },
            },
        });

        if (!practica) return res.status(404).json({ message: "Práctica no encontrada" });
        return res.status(200).json({ practica });
    }

    if (req.method === "PATCH") {
        const { activa, quedoContratado, fechaFin } = req.body;

        const practica = await prisma.practica.update({
            where: { id },
            data: {
                ...(activa !== undefined && { activa }),
                ...(quedoContratado !== undefined && { quedoContratado }),
                ...(fechaFin && { fechaFin: new Date(fechaFin) }),
                // Si se finaliza, guardar fecha actual si no hay fechaFin
                ...(!fechaFin && activa === false && { fechaFin: new Date() }),
            },
            include: {
                estudiante: { include: { user: true } },
                empresa: { include: { user: true } },
            },
        });

        // Notificar al estudiante sobre finalización
        if (activa === false && practica.estudiante?.userId) {
            const msg = quedoContratado
                ? `Tu práctica en ${practica.empresa?.nombreEmpresa ?? "la empresa"} finalizó. ¡Quedaste contratado!`
                : `Tu práctica en ${practica.empresa?.nombreEmpresa ?? "la empresa"} ha sido finalizada.`;
            await crearNotificacion({
                userId: practica.estudiante.userId,
                titulo: quedoContratado ? "¡Práctica finalizada — Contratado!" : "Práctica finalizada",
                mensaje: msg,
                tipo: "PRACTICA_FINALIZADA",
                enlace: "/dashboard/estudiante/practica",
            });
            emitirNotificacion(practica.estudiante.userId, {
                titulo: quedoContratado ? "¡Práctica finalizada — Contratado!" : "Práctica finalizada",
                mensaje: msg,
                tipo: "PRACTICA_FINALIZADA",
            });
        }

        // Notificar a la empresa sobre finalización
        if (activa === false && practica.empresa?.userId) {
            const nombreEst = practica.estudiante?.user?.name ?? "El estudiante";
            const msg = quedoContratado
                ? `La práctica de ${nombreEst} finalizó y fue marcado como contratado.`
                : `La práctica de ${nombreEst} ha sido finalizada por la universidad.`;
            await crearNotificacion({
                userId: practica.empresa.userId,
                titulo: "Práctica finalizada",
                mensaje: msg,
                tipo: "PRACTICA_FINALIZADA",
                enlace: "/dashboard/empresa/estadisticas",
            });
            emitirNotificacion(practica.empresa.userId, {
                titulo: "Práctica finalizada",
                mensaje: msg,
                tipo: "PRACTICA_FINALIZADA",
            });
        }

        return res.status(200).json({ data: practica });
    }

    return res.status(405).json({ message: "Método no permitido" });
}