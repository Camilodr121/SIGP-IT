// sigp-it/src/pages/dashboard/empresa/index.tsx
import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/layout/DashboardLayout";
import KpiCard from "@/components/ui/KpiCard";
import {
    GraduationCap, FileText, CheckCircle, PenLine, ArrowRight,
    TrendingUp, Users, Award, BarChart2, Building2, Loader2,
} from "lucide-react";


/* ── Panel ─────────────────────────────────────────────────── */
function Panel({ children, delay, mounted }: { children: React.ReactNode; delay: number; mounted: boolean }) {
    return (
        <div style={{
            backgroundColor: "rgba(13,14,21,0.55)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
            border: "1px solid var(--color-border)", borderRadius: "var(--radius-xl)", overflow: "hidden",
            opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(8px)",
            transition: `opacity 360ms cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 360ms cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
        }}>
            {children}
        </div>
    );
}

function PanelHeader({ icon, title, color = "empresa", action }: {
    icon: JSX.Element; title: string; color?: "empresa" | "success" | "neutral"; action?: React.ReactNode;
}) {
    const iconColor = color === "empresa" ? "var(--color-role-empresa)" : color === "success" ? "var(--color-success)" : "var(--color-text-muted)";
    const iconBg = color === "empresa" ? "var(--color-role-empresa-bg)" : color === "success" ? "var(--color-success-bg)" : "var(--color-surface-3)";
    return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: "1px solid var(--color-border)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ width: "24px", height: "24px", borderRadius: "var(--radius-md)", backgroundColor: iconBg, color: iconColor, display: "flex", alignItems: "center", justifyContent: "center" }}>{icon}</div>
                <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--color-text)" }}>{title}</span>
            </div>
            {action}
        </div>
    );
}

/* ── RetentionRing ─────────────────────────────────────────── */
function RetentionRing({ pct }: { pct: number }) {
    const r = 40; const c = 2 * Math.PI * r;
    const filled = (pct / 100) * c;
    return (
        <svg width="100" height="100" viewBox="0 0 100 100" style={{ transform: "rotate(-90deg)" }}>
            <circle cx="50" cy="50" r={r} fill="none" stroke="var(--color-border)" strokeWidth="8" />
            <circle cx="50" cy="50" r={r} fill="none" stroke="var(--color-success)" strokeWidth="8"
                strokeDasharray={`${filled} ${c}`} strokeLinecap="round"
                style={{ transition: "stroke-dasharray 1s ease" }} />
        </svg>
    );
}

/* ── Página ─────────────────────────────────────────────────── */
export default function DashboardEmpresa() {
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

    /* ── Métricas calculadas ── */
    const activas = practicas.filter(p => p.activa);
    const finalizadas = practicas.filter(p => !p.activa);
    const contratados = finalizadas.filter(p => p.quedoContratado);
    const pctContratacion = finalizadas.length > 0
        ? Math.round((contratados.length / finalizadas.length) * 100) : 0;

    const todosLosDocs = practicas.flatMap(p => p.documentos ?? []);
    const docsPendientes = todosLosDocs.filter(d => d.estado === "PENDIENTE");
    const docsFirmados = todosLosDocs.filter(d => d.estado === "APROBADO");

    const linkStyle: React.CSSProperties = {
        display: "flex", alignItems: "center", gap: "3px",
        fontSize: "11px", fontWeight: 500, color: "var(--color-text-faint)",
        textDecoration: "none", transition: "color var(--transition-fast)",
    };

    return (
        <DashboardLayout title="Panel Empresa">
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

            {/* ── BIENVENIDA ── */}
            <div style={{ marginBottom: "18px", opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(-6px)", transition: "opacity 350ms cubic-bezier(0.16,1,0.3,1), transform 350ms cubic-bezier(0.16,1,0.3,1)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                    <span style={{ width: "5px", height: "5px", borderRadius: "50%", backgroundColor: "var(--color-role-empresa)", display: "inline-block" }} />
                    <span style={{ fontSize: "9px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "var(--color-role-empresa)" }}>Panel de empresa</span>
                </div>
                <h2 style={{ fontSize: "clamp(1rem,1.8vw,1.25rem)", fontWeight: 700, color: "var(--color-text)", margin: "0 0 2px", letterSpacing: "-0.02em" }}>
                    Gestión de practicantes
                </h2>
                <p style={{ fontSize: "12px", color: "var(--color-text-muted)", margin: 0 }}>
                    {cargando ? "Cargando datos..." : `${practicas.length} práctica${practicas.length !== 1 ? "s" : ""} registrada${practicas.length !== 1 ? "s" : ""} · ${activas.length} activa${activas.length !== 1 ? "s" : ""}`}
                </p>
            </div>

            {cargando ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 0" }}>
                    <Loader2 size={28} style={{ color: "var(--color-role-empresa)", animation: "spin 0.8s linear infinite" }} />
                </div>
            ) : (
                <>
                    {/* ── KPI GRID ── */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: "12px", marginBottom: "16px" }}>
                        <KpiCard label="Practicantes activos" valor={activas.length}
                            sub={`${practicas.length} total`}
                            icon={<GraduationCap size={14} />}
                            color="var(--color-role-empresa)"
                            href="/dashboard/empresa/practicantes" delay={0} mounted={mounted} />
                        <KpiCard label="Docs por revisar" valor={docsPendientes.length}
                            sub="En espera de aprobación"
                            icon={<PenLine size={14} />}
                            color="var(--color-warning)"
                            href="/dashboard/empresa/practicantes" delay={55} mounted={mounted} />
                        <KpiCard label="Documentos aprobados" valor={docsFirmados.length}
                            sub={`de ${todosLosDocs.length} totales`}
                            icon={<CheckCircle size={14} />}
                            color="var(--color-success)"
                            href="/dashboard/empresa/practicantes" delay={110} mounted={mounted} />
                        <KpiCard label="Tasa de contratación" valor={`${pctContratacion}%`}
                            sub={`${contratados.length} de ${finalizadas.length} contratado${contratados.length !== 1 ? "s" : ""}`}
                            icon={<TrendingUp size={14} />}
                            color="var(--color-accent)"
                            href="/dashboard/empresa/estadisticas" delay={165} mounted={mounted} />
                    </div>

                    {/* ── PANELES ── */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>

                        {/* Docs pendientes */}
                        <Panel delay={260} mounted={mounted}>
                            <PanelHeader icon={<PenLine size={13} />} title="Documentos por revisar" color="empresa"
                                action={
                                    <Link href="/dashboard/empresa/practicantes" style={linkStyle}
                                        onMouseEnter={e => (e.currentTarget.style.color = "var(--color-role-empresa)")}
                                        onMouseLeave={e => (e.currentTarget.style.color = "var(--color-text-faint)")}>
                                        Ver todos <ArrowRight size={10} />
                                    </Link>
                                } />
                            {docsPendientes.length === 0 ? (
                                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "36px 20px", gap: "8px", textAlign: "center" }}>
                                    <div style={{ width: "38px", height: "38px", borderRadius: "var(--radius-lg)", backgroundColor: "var(--color-success-bg)", border: "1px solid rgba(52,201,122,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-success)" }}>
                                        <CheckCircle size={17} />
                                    </div>
                                    <p style={{ fontSize: "12px", fontWeight: 500, color: "var(--color-text-muted)", margin: 0 }}>Todo revisado</p>
                                    <p style={{ fontSize: "11px", color: "var(--color-text-faint)", margin: 0 }}>No hay documentos pendientes</p>
                                </div>
                            ) : (
                                <div style={{ padding: "8px" }}>
                                    {docsPendientes.slice(0, 4).map(d => (
                                        <div key={d.id} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px", borderRadius: "var(--radius-lg)", borderBottom: "1px solid var(--color-border)" }}>
                                            <FileText size={12} style={{ color: "var(--color-warning)", flexShrink: 0 }} />
                                            <p style={{ fontSize: "12px", color: "var(--color-text)", margin: 0, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.titulo}</p>
                                            <span style={{ fontSize: "9px", padding: "2px 7px", borderRadius: "var(--radius-full)", backgroundColor: "var(--color-warning-bg)", color: "var(--color-warning)", border: "1px solid rgba(245,166,35,0.2)", flexShrink: 0 }}>Pendiente</span>
                                        </div>
                                    ))}
                                    {docsPendientes.length > 4 && (
                                        <p style={{ fontSize: "10px", color: "var(--color-text-faint)", textAlign: "center", margin: "8px 0 0" }}>
                                            +{docsPendientes.length - 4} más
                                        </p>
                                    )}
                                </div>
                            )}
                        </Panel>

                        {/* Retención tras prácticas */}
                        <Panel delay={310} mounted={mounted}>
                            <PanelHeader icon={<Award size={13} />} title="Retención de practicantes" color="success"
                                action={
                                    <Link href="/dashboard/empresa/estadisticas" style={linkStyle}
                                        onMouseEnter={e => (e.currentTarget.style.color = "var(--color-success)")}
                                        onMouseLeave={e => (e.currentTarget.style.color = "var(--color-text-faint)")}>
                                        Ver stats <ArrowRight size={10} />
                                    </Link>
                                } />
                            <div style={{ padding: "20px 16px", display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap" }}>
                                {finalizadas.length === 0 ? (
                                    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", padding: "16px", textAlign: "center" }}>
                                        <Users size={20} style={{ color: "var(--color-text-faint)" }} />
                                        <p style={{ fontSize: "12px", color: "var(--color-text-muted)", margin: 0 }}>Sin prácticas finalizadas aún</p>
                                    </div>
                                ) : (
                                    <>
                                        <div style={{ position: "relative", flexShrink: 0 }}>
                                            <RetentionRing pct={pctContratacion} />
                                            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                                                <p style={{ fontSize: "18px", fontWeight: 800, color: "var(--color-success)", margin: 0, lineHeight: 1 }}>{pctContratacion}%</p>
                                                <p style={{ fontSize: "8px", color: "var(--color-text-faint)", margin: "2px 0 0", fontWeight: 600, textTransform: "uppercase" }}>retención</p>
                                            </div>
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                                {[
                                                    { label: "Prácticas finalizadas", valor: finalizadas.length, color: "var(--color-text-muted)" },
                                                    { label: "Contratados tras práctica", valor: contratados.length, color: "var(--color-success)" },
                                                    { label: "No contratados", valor: finalizadas.length - contratados.length, color: "var(--color-text-faint)" },
                                                ].map(s => (
                                                    <div key={s.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                                                        <p style={{ fontSize: "11px", color: "var(--color-text-muted)", margin: 0 }}>{s.label}</p>
                                                        <p style={{ fontSize: "13px", fontWeight: 700, color: s.color, margin: 0 }}>{s.valor}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </Panel>

                    </div>
                </>
            )}
        </DashboardLayout>
    );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    const session = await getSession(context);
    if (!session || session.user.role !== "EMPRESA") {
        return { redirect: { destination: "/auth/login", permanent: false } };
    }
    return { props: {} };
};