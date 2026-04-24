import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { EstadoDocumento } from "@prisma/client";
import { crearNotificacion } from "@/lib/notificaciones";
import { emitirNotificacion } from "@/pages/api/notificaciones/stream";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getServerSession(req, res, authOptions);
    if (!session) return res.status(401).json({ message: "No autorizado" });

    const { id } = req.query as { id: string };

    // PATCH — actualizar estado o comentarios
    if (req.method === "PATCH") {
        const { estado, comentarios } = req.body;

        // Solo universidad y empresa pueden cambiar estado
        if (!["UNIVERSIDAD", "EMPRESA"].includes(session.user.role)) {
            return res.status(403).json({ message: "Sin permisos" });
        }

        const estadosValidos: EstadoDocumento[] = [
            "PENDIENTE", "EN_REVISION", "APROBADO", "RECHAZADO",
        ];

        if (estado && !estadosValidos.includes(estado)) {
            return res.status(400).json({ message: "Estado inválido" });
        }

        const documento = await prisma.documento.update({
            where: { id },
            data: {
                ...(estado && { estado }),
                ...(comentarios !== undefined && { comentarios }),
            },
        });

        // Notificar al estudiante solo cuando el estado es APROBADO o RECHAZADO
        if (estado === "APROBADO" || estado === "RECHAZADO") {
            const docConEstudiante = await prisma.documento.findUnique({
                where: { id },
                include: {
                    practica: {
                        include: {
                            estudiante: { include: { user: true } },
                        },
                    },
                },
            });

            const estudianteUserId = docConEstudiante?.practica?.estudiante?.userId;

            if (estudianteUserId) {
                const esAprobado = estado === "APROBADO";
                const notif = {
                    userId: estudianteUserId,
                    titulo: esAprobado ? "Reporte aprobado ✓" : "Reporte rechazado",
                    mensaje: esAprobado
                        ? `Tu reporte "${docConEstudiante!.titulo}" fue aprobado`
                        : `Tu reporte "${docConEstudiante!.titulo}" fue rechazado. Revisa los comentarios`,
                    tipo: (esAprobado ? "DOCUMENTO_APROBADO" : "DOCUMENTO_RECHAZADO") as "DOCUMENTO_APROBADO" | "DOCUMENTO_RECHAZADO",
                    enlace: "/dashboard/estudiante/reportes",
                };

                await crearNotificacion(notif);
                emitirNotificacion(estudianteUserId, {
                    titulo: notif.titulo,
                    mensaje: notif.mensaje,
                    tipo: notif.tipo,
                });
            }
        }

        return res.status(200).json({ data: documento });
    }

    return res.status(405).json({ message: "Método no permitido" });
}