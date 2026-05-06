// src/pages/dashboard/estudiante/index.tsx
import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/layout/DashboardLayout";
import KpiCard from "@/components/ui/KpiCard";
import {
    FileText, Clock, CheckCircle, AlertCircle,
    TrendingUp, ArrowRight, Building2, Calendar,
    BookOpen, ChevronRight, Briefcase, Award,
} from "lucide-react";

/* ── Tipos de fase ─────────────────────────────────────────── */
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

const fmt = (d: string) =>
    new Date(d).toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" });

/* ── StatCard ───────────────────────────────────────────────── */
function StatCard({ label, valor, icon, color, delay, mounted, sub }: {
    label: string; valor: string | number; icon: JSX.Element; color: string; delay: number; mounted: boolean; sub?: string;
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
                {sub && <p style={{ fontSize: "10px", color: "var(--color-text-faint)", margin: "1px 0 0" }}>{sub}</p>}
            </div>
        </div>
    );
}

/* ── QuickLink ──────────────────────────────────────────────── */
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

/* ── PracticaHistorialCard ──────────────────────────────────── */
function PracticaHistorialCard({ practica, delay, mounted }: { practica: any; delay: number; mounted: boolean }) {
    const docs = practica.documentos ?? [];
    const aprobados = docs.filter((d: any) => d.estado === "APROBADO").length;
    const pendientes = docs.filter((d: any) => d.estado === "PENDIENTE").length;
    const faseActiva: TipoDocumento = docs.length > 0 ? calcularFaseActiva(docs) : "INICIACION";
    const faseIdx = FASES_ORDEN.indexOf(faseActiva);
    const completada = aprobados === docs.length && docs.length > 0;

    return (
        <div style={{
            padding: "16px", backgroundColor: "rgba(13,14,21,0.45)", backdropFilter: "blur(8px)",
            border: "1px solid var(--color-border)", borderRadius: "var(--radius-xl)",
            opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(8px)",
            transition: `opacity 400ms ease ${delay}ms, transform 400ms ease ${delay}ms`,
        }}>
            {/* Header práctica */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px", marginBottom: "12px", flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ width: "36px", height: "36px", borderRadius: "var(--radius-lg)", backgroundColor: "var(--color-success-bg)", border: "1px solid rgba(52,201,122,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-success)", flexShrink: 0 }}>
                        <Building2 size={16} />
                    </div>
                    <div>
                        <p style={{ fontSize: "13px", fontWeight: 700, color: "var(--color-text)", margin: "0 0 2px", letterSpacing: "-0.01em" }}>
                            {practica.empresa?.nombreEmpresa ?? "Empresa"}
                        </p>
                        {practica.descripcionCargo && (
                            <p style={{ fontSize: "10px", color: "var(--color-text-faint)", margin: 0 }}>{practica.descripcionCargo}</p>
                        )}
                    </div>
                </div>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "3px 9px", borderRadius: "var(--radius-full)", backgroundColor: "var(--color-surface-3)", border: "1px solid var(--color-border)", fontSize: "10px", fontWeight: 600, color: "var(--color-text-faint)" }}>
                        Finalizada
                    </span>
                    {practica.quedoContratado && (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "3px 9px", borderRadius: "var(--radius-full)", backgroundColor: "var(--color-success-bg)", border: "1px solid rgba(52,201,122,0.2)", fontSize: "10px", fontWeight: 600, color: "var(--color-success)" }}>
                            <Award size={10} /> Contratado
                        </span>
                    )}
                </div>
            </div>

            {/* Fechas */}
            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", marginBottom: "12px", paddingBottom: "12px", borderBottom: "1px solid var(--color-border)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "10px", color: "var(--color-text-faint)" }}>
                    <Calendar size={10} />
                    {fmt(practica.fechaInicio)}
                    {practica.fechaFin && <> → {fmt(practica.fechaFin)}</>}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "10px", color: "var(--color-text-faint)" }}>
                    <FileText size={10} />
                    {docs.length} documento{docs.length !== 1 ? "s" : ""} entregado{docs.length !== 1 ? "s" : ""}
                </div>
            </div>

            {/* Stats rápidos */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px", marginBottom: docs.length > 0 ? "12px" : "0" }}>
                {[
                    { label: "Entregados", valor: docs.length, color: "var(--color-role-universidad)", icon: <FileText size={11} /> },
                    { label: "Aprobados", valor: aprobados, color: "var(--color-success)", icon: <CheckCircle size={11} /> },
                    { label: "Pendientes", valor: pendientes, color: "var(--color-warning)", icon: <Clock size={11} /> },
                ].map(s => (
                    <div key={s.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "8px", backgroundColor: "rgba(255,255,255,0.02)", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)" }}>
                        <p style={{ fontSize: "16px", fontWeight: 700, color: s.color, margin: "0 0 2px", letterSpacing: "-0.02em" }}>{s.valor}</p>
                        <p style={{ fontSize: "9px", color: "var(--color-text-faint)", margin: 0, display: "flex", alignItems: "center", gap: "3px" }}>{s.icon}{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Progreso de fases */}
            {docs.length > 0 && (
                <div>
                    <div style={{ display: "flex", gap: "3px", alignItems: "center", marginBottom: "4px" }}>
                        {FASES_ORDEN.map((f, i) => (
                            <div key={f} style={{ flex: 1, height: "3px", borderRadius: "var(--radius-full)", backgroundColor: i <= faseIdx ? FASE_COLORS[f] : "var(--color-border)", opacity: i < faseIdx ? 0.55 : 1 }} />
                        ))}
                    </div>
                    <p style={{ fontSize: "10px", color: "var(--color-text-faint)", margin: 0, textAlign: "right" as const }}>
                        {FASE_LABELS[faseActiva]} — {faseIdx + 1} de {FASES_ORDEN.length} fases
                    </p>
                </div>
            )}

            {docs.length > 0 && (
                <Link href="/dashboard/estudiante/practica"
                    style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", fontWeight: 600, color: "var(--color-accent)", textDecoration: "none", marginTop: "10px", paddingTop: "10px", borderTop: "1px solid var(--color-border)" }}>
                    Ver documentos entregados <ChevronRight size={11} />
                </Link>
            )}
        </div>
    );
}

/* ══════════════════════════════════════════════════════════════
   Página
══════════════════════════════════════════════════════════════ */
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

    /* KPIs derivados — considera TODAS las prácticas */
    const practicaActiva = practicas.find(p => p.activa);
    const practicasFinalizadas = practicas.filter(p => !p.activa);
    const todosLosDocs = practicas.flatMap(p => p.documentos ?? []);
    const docsActivos = practicaActiva?.documentos ?? [];

    const totalEnviados = todosLosDocs.length;
    const totalAprobados = todosLosDocs.filter((d: any) => d.estado === "APROBADO").length;
    const totalPendientes = todosLosDocs.filter((d: any) => d.estado === "PENDIENTE").length;

    const faseActiva: TipoDocumento = practicaActiva ? calcularFaseActiva(docsActivos) : "INICIACION";
    const faseIdx = FASES_ORDEN.indexOf(faseActiva);

    const quedoContratado = practicasFinalizadas.some(p => p.quedoContratado);

    const stats = [
        { label: "Documentos totales", valor: totalEnviados, icon: <FileText size={16} />, color: "var(--color-role-universidad)", sub: `${practicas.length} práctica${practicas.length !== 1 ? "s" : ""}` },
        { label: "Aprobados", valor: totalAprobados, icon: <CheckCircle size={16} />, color: "var(--color-success)" },
        { label: "En revisión", valor: totalPendientes, icon: <Clock size={16} />, color: "var(--color-warning)" },
        {
            label: practicaActiva ? "Fase actual" : "Estado",
            valor: practicaActiva ? `${faseIdx + 1}/5` : practicasFinalizadas.length > 0 ? "Finalizada" : "Sin práctica",
            icon: <TrendingUp size={16} />,
            color: practicaActiva ? FASE_COLORS[faseActiva] : practicasFinalizadas.length > 0 ? "var(--color-success)" : "var(--color-text-faint)"
        },
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
                    {practicaActiva
                        ? "Gestiona tus reportes y haz seguimiento a tu práctica profesional."
                        : practicasFinalizadas.length > 0
                            ? "Aquí tienes el historial de tu práctica profesional y tus documentos entregados."
                            : "Tu coordinador universitario debe asignarte una práctica para comenzar."}
                </p>
            </div>

            {/* ── KPIs ── */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: "12px", marginBottom: "16px" }}>
                {stats.map((s, i) => (
                    <KpiCard
                        key={s.label}
                        label={s.label}
                        valor={s.valor}
                        sub={s.sub}
                        icon={s.icon}
                        color={s.color}
                        delay={i * 55}
                        mounted={mounted}
                    />
                ))}
            </div>

            {/* ── Badge "Contratado tras práctica" si aplica ── */}
            {quedoContratado && !practicaActiva && (
                <div style={{
                    marginBottom: "16px", padding: "14px 16px",
                    border: "1px solid rgba(52,201,122,0.3)",
                    borderRadius: "var(--radius-xl)",
                    backgroundColor: "rgba(52,201,122,0.06)",
                    display: "flex", alignItems: "center", gap: "10px",
                    opacity: mounted ? 1 : 0, transition: "opacity 400ms ease 180ms"
                }}>
                    <div style={{ width: "32px", height: "32px", borderRadius: "var(--radius-lg)", backgroundColor: "var(--color-success-bg)", border: "1px solid rgba(52,201,122,0.25)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-success)", flexShrink: 0 }}>
                        <Award size={15} />
                    </div>
                    <div>
                        <p style={{ fontSize: "12px", fontWeight: 700, color: "var(--color-success)", margin: "0 0 2px", textTransform: "uppercase", letterSpacing: "0.05em" }}>¡Contratado tras la práctica!</p>
                        <p style={{ fontSize: "11px", color: "var(--color-text-muted)", margin: 0 }}>La empresa optó por contratarte después de tu práctica profesional.</p>
                    </div>
                </div>
            )}

            {/* ── Fase activa banner (solo si hay práctica activa) ── */}
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

            {/* ── Historial de prácticas finalizadas (visible siempre si existen) ── */}
            {!cargando && practicasFinalizadas.length > 0 && (
                <div style={{ opacity: mounted ? 1 : 0, transition: "opacity 400ms ease 200ms", marginBottom: "16px" }}>
                    <p style={{ fontSize: "11px", fontWeight: 600, color: "var(--color-text-faint)", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 10px" }}>
                        {practicaActiva ? "Prácticas anteriores" : "Mi práctica profesional"}
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        {practicasFinalizadas.map((p, i) => (
                            <PracticaHistorialCard key={p.id} practica={p} delay={i * 60} mounted={mounted} />
                        ))}
                    </div>
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