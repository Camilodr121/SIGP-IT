// src/pages/api/documentos/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { crearNotificacion } from "@/lib/notificaciones";
import { emitirNotificacion } from "@/pages/api/notificaciones/stream";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getServerSession(req, res, authOptions);
    if (!session) return res.status(401).json({ message: "No autorizado" });

    // ── GET — listar documentos según rol ────────────────────────────────
    if (req.method === "GET") {
        const { role, id: userId } = session.user;
        let practicas: any[] = [];

        if (role === "ESTUDIANTE") {
            practicas = await prisma.practica.findMany({
                where: { estudiante: { userId } },
                include: {
                    empresa: true,
                    documentos: { orderBy: { createdAt: "desc" } },
                },
                orderBy: { createdAt: "desc" },
            });
        }

        if (role === "UNIVERSIDAD") {
            practicas = await prisma.practica.findMany({
                include: {
                    estudiante: { include: { user: true } },
                    empresa: { include: { user: true } },
                    documentos: { orderBy: { createdAt: "desc" } },
                },
                orderBy: { createdAt: "desc" },
            });
        }

        if (role === "EMPRESA") {
            practicas = await prisma.practica.findMany({
                where: { empresa: { userId } },
                include: {
                    estudiante: { include: { user: true } },
                    documentos: { orderBy: { createdAt: "desc" } },
                },
                orderBy: { createdAt: "desc" },
            });
        }

        return res.status(200).json({ data: practicas });
    }

    // ── POST — estudiante sube un documento ──────────────────────────────
    if (req.method === "POST") {
        if (session.user.role !== "ESTUDIANTE") {
            return res.status(403).json({ message: "Sin permisos" });
        }

        const { practicaId, titulo, descripcion, archivoUrl, tipoDocumento } = req.body;

        if (!practicaId || !titulo || !archivoUrl) {
            return res.status(400).json({ message: "Faltan campos requeridos" });
        }

        // Verificar que la práctica pertenece al estudiante
        const practica = await prisma.practica.findFirst({
            where: { id: practicaId, estudiante: { userId: session.user.id } },
        });

        if (!practica) {
            return res.status(404).json({ message: "Práctica no encontrada" });
        }

        const documento = await prisma.documento.create({
            data: {
                practicaId,
                titulo,
                descripcion: descripcion ?? null,
                archivoUrl,
                tipoDocumento: tipoDocumento ?? null,   // ← NUEVO — opcional, retrocompatible
            },
        });

        // Obtener relaciones para notificar
        const practicaConRelaciones = await prisma.practica.findUnique({
            where: { id: practicaId },
            include: {
                empresa: { include: { user: true } },
                estudiante: { include: { user: true } },
            },
        });

        const mensajeReporte = `${session.user.name} subió un nuevo reporte: "${titulo}"`;

        // Notificar a la empresa
        if (practicaConRelaciones?.empresa?.userId) {
            const empresaUserId = practicaConRelaciones.empresa.userId;
            await crearNotificacion({
                userId: empresaUserId,
                titulo: "Nuevo reporte subido",
                mensaje: mensajeReporte,
                tipo: "REPORTE_SUBIDO",
                enlace: "/dashboard/empresa/documentos",
            });
            emitirNotificacion(empresaUserId, {
                titulo: "Nuevo reporte subido",
                mensaje: mensajeReporte,
                tipo: "REPORTE_SUBIDO",
            });
        }

        // Notificar a universidad
        const universidad = await prisma.perfilUniversidad.findFirst({ include: { user: true } });
        if (universidad?.userId) {
            await crearNotificacion({
                userId: universidad.userId,
                titulo: "Nuevo reporte subido",
                mensaje: mensajeReporte,
                tipo: "REPORTE_SUBIDO",
                enlace: "/dashboard/universidad/reportes",
            });
            emitirNotificacion(universidad.userId, {
                titulo: "Nuevo reporte subido",
                mensaje: mensajeReporte,
                tipo: "REPORTE_SUBIDO",
            });
        }

        return res.status(201).json({ data: documento });
    }

    return res.status(405).json({ message: "Método no permitido" });
}