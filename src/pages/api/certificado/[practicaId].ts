import type { NextApiRequest, NextApiResponse } from "next";
import React, { createElement } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { renderToBuffer } from "@react-pdf/renderer";
import CertificadoPDF from "@/components/certificado/CertificadoPDF";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getServerSession(req, res, authOptions);
    if (!session || session.user.role !== "EMPRESA") {
        return res.status(403).json({ message: "Sin permisos" });
    }

    if (req.method !== "GET") {
        return res.status(405).json({ message: "Método no permitido" });
    }

    const { practicaId } = req.query as { practicaId: string };

    const practica = await prisma.practica.findFirst({
        where: {
            id: practicaId,
            empresa: { userId: session.user.id },
        },
        include: {
            estudiante: {
                include: { user: true },
            },
            empresa: {
                include: { user: true },
            },
            documentos: {
                where: { estado: "APROBADO" },
            },
        },
    });

    if (!practica) {
        return res.status(404).json({ message: "Práctica no encontrada" });
    }

    const formatFecha = (fecha: Date | null) => {
        if (!fecha) return "En curso";
        return new Date(fecha).toLocaleDateString("es-CO", {
            day: "numeric", month: "long", year: "numeric",
        });
    };

    // Folio único basado en id + timestamp
    const folio = `SIGP-${practicaId.slice(0, 8).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;

    const pdfElement = createElement(CertificadoPDF, {
        estudiante: practica.estudiante.user.name ?? "Estudiante",
        codigoUsta: practica.estudiante.codigoUsta ?? "",
        programa: practica.estudiante.programa ?? "Ingeniería de Telecomunicaciones",
        empresa: practica.empresa.nombreEmpresa,
        cargo: practica.descripcionCargo ?? "Practicante",
        fechaInicio: formatFecha(practica.fechaInicio),
        fechaFin: formatFecha(practica.fechaFin),
        totalReportes: practica.documentos.length,
        representante: practica.empresa.user.name ?? "Representante",
        generadoEn: formatFecha(new Date()),
        folio,
    }) as React.ReactElement;

    const buffer = await renderToBuffer(pdfElement);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
        "Content-Disposition",
        `attachment; filename="certificado-practica-${practica.estudiante.user.name?.replace(/\s+/g, "-")}.pdf"`
    );
    res.setHeader("Content-Length", buffer.length);

    return res.end(buffer);
}