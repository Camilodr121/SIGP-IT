// src/pages/dashboard/universidad/analiticas.tsx
import { useState, useEffect } from "react";
import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer,
} from "recharts";
import { TrendingUp, FileText, CheckCircle, Briefcase, Loader2 } from "lucide-react";

/* ─── Tokens universidad ───────────────────────────────────────── */
const UNI = "var(--color-role-universidad)";
const UNI_BG = "var(--color-role-universidad-bg)";
const UNI_BORDER = "rgba(167,139,250,0.25)";

interface Kpis { practicasActivas: number; reportesMes: number; tasaAprobacion: number; tasaContratacion: number; }
interface Graficas {
    reportesMes: { mes: string; total: number }[];
    estadoDocs: { name: string; value: number; color: string }[];
    permanencia: { empresa: string; indice: number; total: number }[];
    practicas: { estado: string; cantidad: number }[];
}

/* ─── Tooltip oscuro ───────────────────────────────────────────── */
const TooltipOscuro = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{ backgroundColor: "rgba(13,14,21,0.95)", backdropFilter: "blur(12px)", border: "1px solid var(--color-border-medium)", borderRadius: "var(--radius-lg)", padding: "8px 12px", boxShadow: "var(--shadow-lg)" }}>
            {label && <p style={{ fontSize: "10px", color: "var(--color-text-faint)", margin: "0 0 4px" }}>{label}</p>}
            {payload.map((p: any, i: number) => (
                <p key={i} style={{ fontSize: "12px", fontWeight: 600, margin: "1px 0", color: p.color ?? p.fill ?? UNI }}>
                    {p.name ? `${p.name}: ` : ""}{p.value}
                    {p.name?.toLowerCase().includes("índice") || p.name?.toLowerCase().includes("tasa") ? "%" : ""}
                </p>
            ))}
        </div>
    );
};

/* ─── KPI Card ─────────────────────────────────────────────────── */
function KpiCard({ label, valor, sufijo, icon, color, bg, border }: {
    label: string; valor: number; sufijo: string; icon: JSX.Element; color: string; bg: string; border: string;
}) {
    const [hov, setHov] = useState(false);
    return (
        <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
            style={{
                position: "relative", backgroundColor: hov ? "var(--color-surface-hover)" : "rgba(13,14,21,0.55)",
                backdropFilter: "blur(12px)", border: `1px solid ${hov ? border : "var(--color-border)"}`,
                borderRadius: "var(--radius-xl)", padding: "16px 18px", overflow: "hidden",
                transition: "all 160ms ease", transform: hov ? "translateY(-2px)" : "translateY(0)",
                boxShadow: hov ? "0 8px 24px rgba(0,0,0,0.35)" : "none",
            }}>
            <div style={{ position: "absolute", top: "-16px", right: "-16px", width: "60px", height: "60px", borderRadius: "50%", backgroundColor: bg, filter: "blur(18px)", opacity: hov ? 0.8 : 0, transition: "opacity 200ms" }} />
            <div style={{ display: "inline-flex", padding: "7px", borderRadius: "var(--radius-md)", backgroundColor: bg, color, border: `1px solid ${border}`, marginBottom: "10px" }}>
                {icon}
            </div>
            <p style={{ fontSize: "28px", fontWeight: 700, color: "var(--color-text)", margin: "0 0 1px", lineHeight: 1, letterSpacing: "-0.03em", fontVariantNumeric: "tabular-nums" }}>
                {valor}<span style={{ fontSize: "16px", color: "var(--color-text-muted)", fontWeight: 400 }}>{sufijo}</span>
            </p>
            <p style={{ fontSize: "11px", color: "var(--color-text-muted)", margin: 0, fontWeight: 500 }}>{label}</p>
        </div>
    );
}

/* ─── Panel glassmorphism ──────────────────────────────────────── */
function Panel({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
    return (
        <div style={{
            backgroundColor: "rgba(13,14,21,0.55)", backdropFilter: "blur(12px)",
            border: "1px solid var(--color-border)", borderRadius: "var(--radius-xl)", padding: "18px 20px",
            ...style,
        }}>
            {children}
        </div>
    );
}

/* ══ PÁGINA ══════════════════════════════════════════════════════ */
export default function AnaliticasUniversidad() {
    const [kpis, setKpis] = useState<Kpis | null>(null);
    const [graficas, setGraficas] = useState<Graficas | null>(null);
    const [cargando, setCargando] = useState(true);
    const [mounted, setMounted] = useState(false);

    useEffect(() => { const t = setTimeout(() => setMounted(true), 40); return () => clearTimeout(t); }, []);

    useEffect(() => {
        fetch("/api/analiticas")
            .then(r => r.json())
            .then(json => { setKpis(json.kpis); setGraficas(json.graficas); })
            .finally(() => setCargando(false));
    }, []);

    const kpiItems = kpis ? [
        { label: "Prácticas activas",   valor: kpis.practicasActivas,  sufijo: "",  icon: <Briefcase size={15} />,    color: UNI,                      bg: UNI_BG,                     border: UNI_BORDER },
        { label: "Reportes este mes",   valor: kpis.reportesMes,       sufijo: "",  icon: <FileText size={15} />,     color: "var(--color-accent)",    bg: "var(--color-accent-subtle)", border: "var(--color-accent-border)" },
        { label: "Tasa de aprobación",  valor: kpis.tasaAprobacion,    sufijo: "%", icon: <CheckCircle size={15} />,  color: "var(--color-success)",   bg: "var(--color-success-bg)",  border: "rgba(52,201,122,0.25)" },
        { label: "Tasa contratación",   valor: kpis.tasaContratacion,  sufijo: "%", icon: <TrendingUp size={15} />,   color: "var(--color-role-empresa)", bg: "var(--color-role-empresa-bg)", border: "rgba(52,211,153,0.25)" },
    ] : [];

    return (
        <DashboardLayout title="Estadísticas">
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

            {/* Header */}
            <div style={{ marginBottom: "20px", opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(-6px)", transition: "opacity 350ms cubic-bezier(0.16,1,0.3,1),transform 350ms cubic-bezier(0.16,1,0.3,1)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                    <span style={{ width: "5px", height: "5px", borderRadius: "50%", backgroundColor: UNI, display: "inline-block" }} />
                    <span style={{ fontSize: "9px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: UNI }}>Universidad</span>
                </div>
                <h2 style={{ fontSize: "clamp(1rem,1.8vw,1.25rem)", fontWeight: 700, color: "var(--color-text)", margin: "0 0 2px", letterSpacing: "-0.02em" }}>Estadísticas del programa</h2>
                <p style={{ fontSize: "12px", color: "var(--color-text-muted)", margin: 0 }}>Métricas generales del programa de prácticas</p>
            </div>

            {cargando ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 0" }}>
                    <Loader2 size={28} style={{ color: UNI, animation: "spin 0.8s linear infinite" }} />
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>

                    {/* KPIs */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "10px" }}>
                        {kpiItems.map(k => <KpiCard key={k.label} {...k} />)}
                    </div>

                    {/* Fila 1: Línea + Dona */}
                    <div style={{ display: "grid", gridTemplateColumns: "3fr 2fr", gap: "12px" }}>
                        <Panel>
                            <p style={{ fontSize: "12px", fontWeight: 700, color: "var(--color-text)", margin: "0 0 2px" }}>Reportes entregados</p>
                            <p style={{ fontSize: "10px", color: "var(--color-text-faint)", margin: "0 0 14px" }}>Últimos 6 meses</p>
                            <ResponsiveContainer width="100%" height={200}>
                                <LineChart data={graficas?.reportesMes ?? []}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                    <XAxis dataKey="mes" tick={{ fill: "var(--color-text-faint)", fontSize: 10 }} axisLine={{ stroke: "rgba(255,255,255,0.07)" }} tickLine={false} />
                                    <YAxis tick={{ fill: "var(--color-text-faint)", fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                                    <Tooltip content={<TooltipOscuro />} />
                                    <Line type="monotone" dataKey="total" name="Reportes" stroke="var(--color-role-universidad)" strokeWidth={2.5}
                                        dot={{ fill: "var(--color-role-universidad)", r: 4, strokeWidth: 0 }}
                                        activeDot={{ r: 6, fill: "var(--color-role-universidad)" }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </Panel>

                        <Panel>
                            <p style={{ fontSize: "12px", fontWeight: 700, color: "var(--color-text)", margin: "0 0 2px" }}>Estado de documentos</p>
                            <p style={{ fontSize: "10px", color: "var(--color-text-faint)", margin: "0 0 10px" }}>Distribución global</p>
                            <ResponsiveContainer width="100%" height={140}>
                                <PieChart>
                                    <Pie data={graficas?.estadoDocs ?? []} cx="50%" cy="50%" innerRadius={44} outerRadius={64} paddingAngle={3} dataKey="value">
                                        {graficas?.estadoDocs.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                                    </Pie>
                                    <Tooltip content={<TooltipOscuro />} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 12px", marginTop: "8px" }}>
                                {graficas?.estadoDocs.map(e => (
                                    <div key={e.name} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                        <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: e.color, flexShrink: 0 }} />
                                        <span style={{ fontSize: "10px", color: "var(--color-text-faint)", flex: 1 }}>{e.name}</span>
                                        <span style={{ fontSize: "10px", fontWeight: 600, color: "var(--color-text-muted)" }}>{e.value}</span>
                                    </div>
                                ))}
                            </div>
                        </Panel>
                    </div>

                    {/* Fila 2: Permanencia + Prácticas */}
                    <div style={{ display: "grid", gridTemplateColumns: "3fr 2fr", gap: "12px" }}>
                        <Panel>
                            <p style={{ fontSize: "12px", fontWeight: 700, color: "var(--color-text)", margin: "0 0 2px" }}>Índice de permanencia</p>
                            <p style={{ fontSize: "10px", color: "var(--color-text-faint)", margin: "0 0 14px" }}>% de practicantes contratados por empresa</p>
                            {graficas?.permanencia.length === 0 ? (
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "180px" }}>
                                    <p style={{ fontSize: "12px", color: "var(--color-text-faint)" }}>Sin datos suficientes</p>
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height={180}>
                                    <BarChart data={graficas?.permanencia ?? []} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                        <XAxis dataKey="empresa" tick={{ fill: "var(--color-text-faint)", fontSize: 10 }} axisLine={{ stroke: "rgba(255,255,255,0.07)" }} tickLine={false} />
                                        <YAxis domain={[0, 100]} tick={{ fill: "var(--color-text-faint)", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
                                        <Tooltip content={<TooltipOscuro />} />
                                        <Bar dataKey="indice" name="Índice" fill="var(--color-role-universidad)" radius={[4, 4, 0, 0]} maxBarSize={48} />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </Panel>

                        <Panel>
                            <p style={{ fontSize: "12px", fontWeight: 700, color: "var(--color-text)", margin: "0 0 2px" }}>Estado de prácticas</p>
                            <p style={{ fontSize: "10px", color: "var(--color-text-faint)", margin: "0 0 14px" }}>Activas vs finalizadas</p>
                            <ResponsiveContainer width="100%" height={150}>
                                <BarChart data={graficas?.practicas ?? []} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                    <XAxis dataKey="estado" tick={{ fill: "var(--color-text-faint)", fontSize: 10 }} axisLine={{ stroke: "rgba(255,255,255,0.07)" }} tickLine={false} />
                                    <YAxis tick={{ fill: "var(--color-text-faint)", fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                                    <Tooltip content={<TooltipOscuro />} />
                                    <Bar dataKey="cantidad" name="Prácticas" radius={[4, 4, 0, 0]} maxBarSize={56}>
                                        {graficas?.practicas.map((entry, i) => (
                                            <Cell key={i} fill={entry.estado === "Activas" ? "var(--color-role-universidad)" : "rgba(255,255,255,0.1)"} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginTop: "10px" }}>
                                {graficas?.practicas.map(p => (
                                    <div key={p.estado} style={{ padding: "10px 12px", backgroundColor: "rgba(255,255,255,0.02)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)", textAlign: "center" }}>
                                        <p style={{ fontSize: "22px", fontWeight: 700, margin: "0 0 2px", color: p.estado === "Activas" ? UNI : "var(--color-text-muted)" }}>{p.cantidad}</p>
                                        <p style={{ fontSize: "10px", color: "var(--color-text-faint)", margin: 0 }}>{p.estado}</p>
                                    </div>
                                ))}
                            </div>
                        </Panel>
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