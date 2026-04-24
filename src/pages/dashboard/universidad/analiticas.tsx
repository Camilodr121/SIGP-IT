//src/pages/dashboard/universidad/analiticas.tsx
import { useState, useEffect } from "react";
import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    ResponsiveContainer,
} from "recharts";
import {
    TrendingUp, FileText, CheckCircle,
    Briefcase, Loader2,
} from "lucide-react";

interface Kpis {
    practicasActivas: number;
    reportesMes: number;
    tasaAprobacion: number;
    tasaContratacion: number;
}

interface Graficas {
    reportesMes: { mes: string; total: number }[];
    estadoDocs: { name: string; value: number; color: string }[];
    permanencia: { empresa: string; indice: number; total: number }[];
    practicas: { estado: string; cantidad: number }[];
}

// Tooltip personalizado oscuro
const TooltipOscuro = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 shadow-xl">
            {label && <p className="text-slate-400 text-xs mb-1">{label}</p>}
            {payload.map((p: any, i: number) => (
                <p key={i} className="text-sm font-medium" style={{ color: p.color ?? p.fill ?? "#0d9488" }}>
                    {p.name ? `${p.name}: ` : ""}{p.value}
                    {p.name?.toLowerCase().includes("índice") || p.name?.toLowerCase().includes("tasa") ? "%" : ""}
                </p>
            ))}
        </div>
    );
};

export default function AnaliticasUniversidad() {
    const [kpis, setKpis] = useState<Kpis | null>(null);
    const [graficas, setGraficas] = useState<Graficas | null>(null);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        fetch("/api/analiticas")
            .then((r) => r.json())
            .then((json) => {
                setKpis(json.kpis);
                setGraficas(json.graficas);
            })
            .finally(() => setCargando(false));
    }, []);

    const kpiItems = kpis
        ? [
            {
                label: "Prácticas activas",
                valor: kpis.practicasActivas,
                sufijo: "",
                icon: <Briefcase size={20} />,
                color: "text-teal-400",
                bg: "bg-teal-500/10",
            },
            {
                label: "Reportes este mes",
                valor: kpis.reportesMes,
                sufijo: "",
                icon: <FileText size={20} />,
                color: "text-blue-400",
                bg: "bg-blue-500/10",
            },
            {
                label: "Tasa de aprobación",
                valor: kpis.tasaAprobacion,
                sufijo: "%",
                icon: <CheckCircle size={20} />,
                color: "text-purple-400",
                bg: "bg-purple-500/10",
            },
            {
                label: "Tasa de contratación",
                valor: kpis.tasaContratacion,
                sufijo: "%",
                icon: <TrendingUp size={20} />,
                color: "text-orange-400",
                bg: "bg-orange-500/10",
            },
        ]
        : [];

    return (
        <DashboardLayout title="Analíticas">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-white">Analíticas del programa</h2>
                <p className="text-slate-400 text-sm mt-1">
                    Estadísticas generales del programa de prácticas
                </p>
            </div>

            {cargando ? (
                <div className="flex items-center justify-center py-32">
                    <Loader2 size={32} className="text-teal-500 animate-spin" />
                </div>
            ) : (
                <div className="space-y-6">
                    {/* KPIs */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {kpiItems.map((k) => (
                            <div
                                key={k.label}
                                className="bg-slate-900 border border-slate-800 rounded-xl p-5"
                            >
                                <div className={`inline-flex p-2 rounded-lg ${k.bg} ${k.color} mb-3`}>
                                    {k.icon}
                                </div>
                                <p className="text-3xl font-bold text-white">
                                    {k.valor}
                                    <span className="text-lg text-slate-400">{k.sufijo}</span>
                                </p>
                                <p className="text-slate-400 text-sm mt-1">{k.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* Fila 1: Línea + Dona */}
                    <div className="grid lg:grid-cols-5 gap-4">
                        {/* Reportes por mes — ocupa 3 columnas */}
                        <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-xl p-6">
                            <h3 className="text-white font-semibold text-sm mb-1">
                                Reportes entregados
                            </h3>
                            <p className="text-slate-500 text-xs mb-5">Últimos 6 meses</p>
                            <ResponsiveContainer width="100%" height={220}>
                                <LineChart data={graficas?.reportesMes ?? []}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                    <XAxis
                                        dataKey="mes"
                                        tick={{ fill: "#64748b", fontSize: 11 }}
                                        axisLine={{ stroke: "#1e293b" }}
                                        tickLine={false}
                                    />
                                    <YAxis
                                        tick={{ fill: "#64748b", fontSize: 11 }}
                                        axisLine={false}
                                        tickLine={false}
                                        allowDecimals={false}
                                    />
                                    <Tooltip content={<TooltipOscuro />} />
                                    <Line
                                        type="monotone"
                                        dataKey="total"
                                        name="Reportes"
                                        stroke="#0d9488"
                                        strokeWidth={2.5}
                                        dot={{ fill: "#0d9488", r: 4, strokeWidth: 0 }}
                                        activeDot={{ r: 6, fill: "#0d9488" }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Estado de documentos — ocupa 2 columnas */}
                        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6">
                            <h3 className="text-white font-semibold text-sm mb-1">
                                Estado de documentos
                            </h3>
                            <p className="text-slate-500 text-xs mb-5">Distribución global</p>
                            <ResponsiveContainer width="100%" height={160}>
                                <PieChart>
                                    <Pie
                                        data={graficas?.estadoDocs ?? []}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={50}
                                        outerRadius={72}
                                        paddingAngle={3}
                                        dataKey="value"
                                    >
                                        {graficas?.estadoDocs.map((entry, i) => (
                                            <Cell key={i} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<TooltipOscuro />} />
                                </PieChart>
                            </ResponsiveContainer>
                            {/* Leyenda manual */}
                            <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-3">
                                {graficas?.estadoDocs.map((e) => (
                                    <div key={e.name} className="flex items-center gap-1.5">
                                        <span
                                            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                            style={{ backgroundColor: e.color }}
                                        />
                                        <span className="text-slate-400 text-xs truncate">{e.name}</span>
                                        <span className="text-slate-300 text-xs font-medium ml-auto">
                                            {e.value}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Fila 2: Permanencia + Prácticas */}
                    <div className="grid lg:grid-cols-5 gap-4">
                        {/* Índice de permanencia — ocupa 3 columnas */}
                        <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-xl p-6">
                            <h3 className="text-white font-semibold text-sm mb-1">
                                Índice de permanencia
                            </h3>
                            <p className="text-slate-500 text-xs mb-5">
                                % de practicantes contratados por empresa
                            </p>
                            {graficas?.permanencia.length === 0 ? (
                                <div className="flex items-center justify-center h-[200px]">
                                    <p className="text-slate-600 text-sm">Sin datos suficientes</p>
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height={200}>
                                    <BarChart
                                        data={graficas?.permanencia ?? []}
                                        margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                        <XAxis
                                            dataKey="empresa"
                                            tick={{ fill: "#64748b", fontSize: 10 }}
                                            axisLine={{ stroke: "#1e293b" }}
                                            tickLine={false}
                                        />
                                        <YAxis
                                            domain={[0, 100]}
                                            tick={{ fill: "#64748b", fontSize: 11 }}
                                            axisLine={false}
                                            tickLine={false}
                                            tickFormatter={(v) => `${v}%`}
                                        />
                                        <Tooltip content={<TooltipOscuro />} />
                                        <Bar
                                            dataKey="indice"
                                            name="Índice"
                                            fill="#0d9488"
                                            radius={[4, 4, 0, 0]}
                                            maxBarSize={48}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </div>

                        {/* Prácticas activas vs finalizadas — ocupa 2 columnas */}
                        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6">
                            <h3 className="text-white font-semibold text-sm mb-1">
                                Estado de prácticas
                            </h3>
                            <p className="text-slate-500 text-xs mb-5">Activas vs finalizadas</p>
                            <ResponsiveContainer width="100%" height={200}>
                                <BarChart
                                    data={graficas?.practicas ?? []}
                                    margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                    <XAxis
                                        dataKey="estado"
                                        tick={{ fill: "#64748b", fontSize: 11 }}
                                        axisLine={{ stroke: "#1e293b" }}
                                        tickLine={false}
                                    />
                                    <YAxis
                                        tick={{ fill: "#64748b", fontSize: 11 }}
                                        axisLine={false}
                                        tickLine={false}
                                        allowDecimals={false}
                                    />
                                    <Tooltip content={<TooltipOscuro />} />
                                    <Bar
                                        dataKey="cantidad"
                                        name="Prácticas"
                                        radius={[4, 4, 0, 0]}
                                        maxBarSize={56}
                                    >
                                        {graficas?.practicas.map((entry, i) => (
                                            <Cell
                                                key={i}
                                                fill={entry.estado === "Activas" ? "#0d9488" : "#475569"}
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>

                            {/* Resumen numérico */}
                            <div className="mt-4 grid grid-cols-2 gap-3">
                                {graficas?.practicas.map((p) => (
                                    <div
                                        key={p.estado}
                                        className="bg-slate-800/50 rounded-lg p-3 text-center"
                                    >
                                        <p className={`text-xl font-bold ${p.estado === "Activas" ? "text-teal-400" : "text-slate-400"
                                            }`}>
                                            {p.cantidad}
                                        </p>
                                        <p className="text-slate-500 text-xs mt-0.5">{p.estado}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    const session = await getSession(context);
    if (!session || session.user.role !== "UNIVERSIDAD") {
        return { redirect: { destination: "/auth/login", permanent: false } };
    }
    return { props: {} };
};