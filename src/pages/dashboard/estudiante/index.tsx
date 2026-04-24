// src/pages/dashboard/estudiante/index.tsx
import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
    FileText, Clock, CheckCircle, AlertCircle,
    TrendingUp, ArrowRight, Building2, Calendar,
    BookOpen, ChevronRight,
} from "lucide-react";

/* ── Tipos de fase (sincronizados con practica.tsx) ─────────────── */
type TipoDocumento = "INICIACION" | "INFORME_1" | "INFORME_2" | "INFORME_3" | "INFORME_FINAL";

const FASE_LABELS: Record<TipoDocumento, string> = {
    INICIACION: "Documentos de Iniciación",
    INFORME_1: "Primer Informe",
    INFORME_2: "Segundo Informe",
    INFORME_3: "Tercer Informe",
    INFORME_FINAL: "Informe Final",
};
const FASE_COLORS: Record<TipoDocumento, string> = {
    INICIACION: "var(--color-role-universidad)",
    INFORME_1: "var(--color-accent)",
    INFORME_2: "var(--color-warning)",
    INFORME_3: "var(--color-role-empresa)",
    INFORME_FINAL: "var(--color-success)",
};
const FASES_ORDEN: TipoDocumento[] = ["INICIACION", "INFORME_1", "INFORME_2", "INFORME_3", "INFORME_FINAL"];

function calcularFaseActiva(docs: any[]): TipoDocumento {
    const aprobados: Record<TipoDocumento, number> = {
        INICIACION: 0, INFORME_1: 0, INFORME_2: 0, INFORME_3: 0, INFORME_FINAL: 0,
    };
    for (const d of docs) {
        const tipo = (d.tipoDocumento ?? "INICIACION") as TipoDocumento;
        if (d.estado === "APROBADO") aprobados[tipo]++;
    }
    if (aprobados.INFORME_3 > 0) return "INFORME_FINAL";
    if (aprobados.INFORME_2 > 0) return "INFORME_3";
    if (aprobados.INFORME_1 > 0) return "INFORME_2";
    if (aprobados.INICIACION > 0) return "INFORME_1";
    return "INICIACION";
}

/* ── StatCard ────────────────────────────────────────────────────── */
function StatCard({ label, valor, icon, color, delay, mounted }: {
    label: string; valor: string | number; icon: JSX.Element; color: string; delay: number; mounted: boolean;
}) {
    return (
        <div style={{
            display: "flex", alignItems: "center", gap: "12px", padding: "14px 16px",
            backgroundColor: "rgba(13,14,21,0.45)", backdropFilter: "blur(8px)",
            border: "1px solid var(--color-border)", borderRadius: "var(--radius-xl)",
            opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(10px)",
            transition: `opacity 380ms cubic-bezier(0.16,1,0.3,1) ${delay}ms,transform 380ms cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
        }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "var(--radius-lg)", backgroundColor: `color-mix(in srgb,${color} 12%,transparent)`, border: `1px solid color-mix(in srgb,${color} 25%,transparent)`, color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {icon}
            </div>
            <div>
                <p style={{ fontSize: "20px", fontWeight: 800, color: "var(--color-text)", margin: 0, letterSpacing: "-0.03em", lineHeight: 1 }}>{valor}</p>
                <p style={{ fontSize: "11px", color: "var(--color-text-muted)", margin: "3px 0 0" }}>{label}</p>
            </div>
        </div>
    );
}

/* ── QuickLink ───────────────────────────────────────────────────── */
function QuickLink({ href, label, sub, icon, color, delay, mounted }: {
    href: string; label: string; sub: string; icon: JSX.Element; color: string; delay: number; mounted: boolean;
}) {
    const [hov, setHov] = useState(false);
    return (
        <Link href={href} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{
            display: "flex", alignItems: "center", gap: "12px", padding: "14px 16px",
            backgroundColor: hov ? "rgba(255,255,255,0.04)" : "rgba(13,14,21,0.45)",
            backdropFilter: "blur(8px)",
            border: `1px solid ${hov ? `color-mix(in srgb,${color} 30%,transparent)` : "var(--color-border)"}`,
            borderRadius: "var(--radius-xl)", textDecoration: "none",
            transition: "all 160ms cubic-bezier(0.16,1,0.3,1)",
            transform: hov ? "translateX(3px)" : "translateX(0)",
            opacity: mounted ? 1 : 0,
            transitionDelay: `${delay}ms`,
        }}>
            <div style={{ width: "34px", height: "34px", borderRadius: "var(--radius-lg)", backgroundColor: `color-mix(in srgb,${color} 12%,transparent)`, border: `1px solid color-mix(in srgb,${color} 25%,transparent)`, color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {icon}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--color-text)", margin: "0 0 1px" }}>{label}</p>
                <p style={{ fontSize: "10px", color: "var(--color-text-faint)", margin: 0 }}>{sub}</p>
            </div>
            <ArrowRight size={13} style={{ color: "var(--color-text-faint)", flexShrink: 0 }} />
        </Link>
    );
}

/* ══════════════════════════════════════════════════════════════════
   Página
══════════════════════════════════════════════════════════════════ */
export default function EstudianteDashboard() {
    const [practicas, setPracticas] = useState<any[]>([]);
    const [cargando, setCargando] = useState(true);
    const [mounted, setMounted] = useState(false);

    useEffect(() => { const t = setTimeout(() => setMounted(true), 40); return () => clearTimeout(t); }, []);

    const fetchDatos = useCallback(async () => {
        setCargando(true);
        const res = await fetch("/api/documentos");
        const data = await res.json();
        setPracticas(data.data ?? []);
        setCargando(false);
    }, []);

    useEffect(() => { fetchDatos(); }, [fetchDatos]);

    /* KPIs derivados */
    const practicaActiva = practicas.find(p => p.activa);
    const todosLosDocs = practicaActiva?.documentos ?? [];
    const enviados = todosLosDocs.length;
    const aprobados = todosLosDocs.filter((d: any) => d.estado === "APROBADO").length;
    const pendientes = todosLosDocs.filter((d: any) => d.estado === "PENDIENTE").length;
    const faseActiva: TipoDocumento = practicaActiva ? calcularFaseActiva(todosLosDocs) : "INICIACION";
    const faseIdx = FASES_ORDEN.indexOf(faseActiva);

    const stats = [
        { label: "Documentos enviados", valor: enviados, icon: <FileText size={16} />, color: "var(--color-role-universidad)" },
        { label: "Aprobados", valor: aprobados, icon: <CheckCircle size={16} />, color: "var(--color-success)" },
        { label: "En revisión", valor: pendientes, icon: <Clock size={16} />, color: "var(--color-warning)" },
        { label: "Fase actual", valor: `${faseIdx + 1}/5`, icon: <TrendingUp size={16} />, color: FASE_COLORS[faseActiva] },
    ];

    return (
        <DashboardLayout title="Inicio">
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

            {/* ── greeting ── */}
            <div style={{ marginBottom: "20px", opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(-6px)", transition: "opacity 350ms cubic-bezier(0.16,1,0.3,1),transform 350ms cubic-bezier(0.16,1,0.3,1)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                    <span style={{ width: "5px", height: "5px", borderRadius: "50%", backgroundColor: "var(--color-role-estudiante)", display: "inline-block" }} />
                    <span style={{ fontSize: "9px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "var(--color-role-estudiante)" }}>Estudiante</span>
                </div>
                <h2 style={{ fontSize: "clamp(1rem,1.8vw,1.25rem)", fontWeight: 700, color: "var(--color-text)", margin: "0 0 2px", letterSpacing: "-0.02em" }}>Bienvenido de vuelta</h2>
                <p style={{ fontSize: "12px", color: "var(--color-text-muted)", margin: 0 }}>
                    Gestiona tus reportes y haz seguimiento a tu práctica profesional.
                </p>
            </div>

            {/* ── KPIs ── */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: "10px", marginBottom: "16px" }}>
                {stats.map((s, i) => (
                    <StatCard key={s.label} {...s} delay={i * 50} mounted={mounted} />
                ))}
            </div>

            {/* ── Fase activa banner ── */}
            {practicaActiva && !cargando && (
                <div style={{
                    marginBottom: "16px", padding: "14px 16px", border: `1px solid color-mix(in srgb,${FASE_COLORS[faseActiva]} 30%,transparent)`, borderRadius: "var(--radius-xl)", backgroundColor: `color-mix(in srgb,${FASE_COLORS[faseActiva]} 8%,transparent)`, display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap",
                    opacity: mounted ? 1 : 0, transition: "opacity 400ms ease 220ms"
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: FASE_COLORS[faseActiva], boxShadow: `0 0 8px ${FASE_COLORS[faseActiva]}` }} />
                        <div>
                            <p style={{ fontSize: "11px", fontWeight: 700, color: FASE_COLORS[faseActiva], margin: "0 0 1px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Fase activa</p>
                            <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--color-text)", margin: 0 }}>{FASE_LABELS[faseActiva]}</p>
                        </div>
                    </div>
                    <Link href="/dashboard/estudiante/practica"
                        style={{ display: "flex", alignItems: "center", gap: "6px", padding: "7px 14px", borderRadius: "var(--radius-lg)", border: `1px solid color-mix(in srgb,${FASE_COLORS[faseActiva]} 35%,transparent)`, backgroundColor: "transparent", color: FASE_COLORS[faseActiva], fontSize: "12px", fontWeight: 700, textDecoration: "none", transition: "all 150ms ease" }}
                        onMouseEnter={e => { e.currentTarget.style.backgroundColor = FASE_COLORS[faseActiva]; e.currentTarget.style.color = "#fff"; }}
                        onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = FASE_COLORS[faseActiva]; }}>
                        Ir a subir documento <ChevronRight size={12} />
                    </Link>
                </div>
            )}

            {/* ── Quick links ── */}
            <div style={{ opacity: mounted ? 1 : 0, transition: "opacity 400ms ease 260ms" }}>
                <p style={{ fontSize: "11px", fontWeight: 600, color: "var(--color-text-faint)", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 10px" }}>Acceso rápido</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <QuickLink href="/dashboard/estudiante/practica" label="Mi Práctica" sub="Timeline de fases y subida de documentos"
                        icon={<BookOpen size={15} />} color="var(--color-role-universidad)" delay={280} mounted={mounted} />
                    <QuickLink href="/dashboard/estudiante/reportes" label="Mis Reportes" sub="Historial completo de todos tus documentos"
                        icon={<FileText size={15} />} color="var(--color-accent)" delay={310} mounted={mounted} />
                    <QuickLink href="/dashboard/estudiante/empresas" label="Empresas" sub="Directorio de empresas disponibles"
                        icon={<Building2 size={15} />} color="var(--color-role-empresa)" delay={340} mounted={mounted} />
                </div>
            </div>
        </DashboardLayout>
    );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    const session = await getSession(context);
    if (!session || session.user.role !== "ESTUDIANTE") {
        return { redirect: { destination: "/auth/login", permanent: false } };
    }
    return { props: {} };
};