import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getServerSession(req, res, authOptions);
    if (!session || session.user.role !== "UNIVERSIDAD") {
        return res.status(403).json({ message: "Sin permisos" });
    }

    if (req.method !== "GET") {
        return res.status(405).json({ message: "Método no permitido" });
    }

    // Datos base
    const [practicas, documentos] = await Promise.all([
        prisma.practica.findMany({
            include: {
                empresa: true,
                documentos: true,
            },
        }),
        prisma.documento.findMany({
            orderBy: { createdAt: "asc" },
        }),
    ]);

    // --- KPIs ---
    const totalPracticas = practicas.length;
    const practicasActivas = practicas.filter((p) => p.activa).length;
    const totalDocumentos = documentos.length;
    const aprobados = documentos.filter((d) => d.estado === "APROBADO").length;
    const contratados = practicas.filter((p) => p.quedoContratado).length;

    const tasaAprobacion =
        totalDocumentos > 0 ? Math.round((aprobados / totalDocumentos) * 100) : 0;
    const tasaContratacion =
        totalPracticas > 0 ? Math.round((contratados / totalPracticas) * 100) : 0;

    // Reportes este mes
    const ahora = new Date();
    const reportesMes = documentos.filter((d) => {
        const fecha = new Date(d.createdAt);
        return (
            fecha.getMonth() === ahora.getMonth() &&
            fecha.getFullYear() === ahora.getFullYear()
        );
    }).length;

    // --- Gráfica 1: Reportes por mes (últimos 6 meses) ---
    const reportesPorMes: Record<string, number> = {};
    for (let i = 5; i >= 0; i--) {
        const fecha = new Date();
        fecha.setMonth(fecha.getMonth() - i);
        const clave = fecha.toLocaleDateString("es-CO", { month: "short", year: "2-digit" });
        reportesPorMes[clave] = 0;
    }
    documentos.forEach((d) => {
        const fecha = new Date(d.createdAt);
        const diffMeses =
            (ahora.getFullYear() - fecha.getFullYear()) * 12 +
            (ahora.getMonth() - fecha.getMonth());
        if (diffMeses >= 0 && diffMeses <= 5) {
            const clave = fecha.toLocaleDateString("es-CO", { month: "short", year: "2-digit" });
            if (reportesPorMes[clave] !== undefined) reportesPorMes[clave]++;
        }
    });
    const grafica_reportesMes = Object.entries(reportesPorMes).map(([mes, total]) => ({
        mes,
        total,
    }));

    // --- Gráfica 2: Estado de documentos (dona) ---
    const estadoCount = { PENDIENTE: 0, EN_REVISION: 0, APROBADO: 0, RECHAZADO: 0 };
    documentos.forEach((d) => { estadoCount[d.estado]++; });
    const grafica_estadoDocs = [
        { name: "Pendiente", value: estadoCount.PENDIENTE, color: "#eab308" },
        { name: "En revisión", value: estadoCount.EN_REVISION, color: "#3b82f6" },
        { name: "Aprobado", value: estadoCount.APROBADO, color: "#0d9488" },
        { name: "Rechazado", value: estadoCount.RECHAZADO, color: "#ef4444" },
    ];

    // --- Gráfica 3: Índice de permanencia por empresa ---
    const empresaMap: Record<string, { nombre: string; total: number; contratados: number }> = {};
    practicas.forEach((p) => {
        const nombre = p.empresa?.nombreEmpresa ?? "Sin nombre";
        if (!empresaMap[nombre]) empresaMap[nombre] = { nombre, total: 0, contratados: 0 };
        empresaMap[nombre].total++;
        if (p.quedoContratado) empresaMap[nombre].contratados++;
    });
    const grafica_permanencia = Object.values(empresaMap).map((e) => ({
        empresa: e.nombre.length > 14 ? e.nombre.slice(0, 14) + "…" : e.nombre,
        indice: e.total > 0 ? Math.round((e.contratados / e.total) * 100) : 0,
        total: e.total,
    }));

    // --- Gráfica 4: Prácticas activas vs finalizadas ---
    const grafica_practicas = [
        { estado: "Activas", cantidad: practicasActivas },
        { estado: "Finalizadas", cantidad: totalPracticas - practicasActivas },
    ];

    return res.status(200).json({
        kpis: {
            practicasActivas,
            reportesMes,
            tasaAprobacion,
            tasaContratacion,
        },
        graficas: {
            reportesMes: grafica_reportesMes,
            estadoDocs: grafica_estadoDocs,
            permanencia: grafica_permanencia,
            practicas: grafica_practicas,
        },
    });
}