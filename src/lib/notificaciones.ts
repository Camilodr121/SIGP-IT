import { prisma } from "@/lib/prisma";

type TipoNotificacion =
    | "REPORTE_SUBIDO"
    | "DOCUMENTO_APROBADO"
    | "DOCUMENTO_RECHAZADO"
    | "PRACTICA_ASIGNADA";

interface CrearNotificacionParams {
    userId: string;
    titulo: string;
    mensaje: string;
    tipo: TipoNotificacion;
    enlace?: string;
}

export async function crearNotificacion(params: CrearNotificacionParams) {
    return prisma.notificacion.create({
        data: {
            userId: params.userId,
            titulo: params.titulo,
            mensaje: params.mensaje,
            tipo: params.tipo,
            enlace: params.enlace ?? null,
        },
    });
}