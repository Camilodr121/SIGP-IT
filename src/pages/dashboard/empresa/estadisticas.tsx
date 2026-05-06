import { useEffect, useState, useCallback } from "react";
import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import KpiCard from "@/components/ui/KpiCard";
import {
    BarChart3, TrendingUp, Users, Award, CheckCircle,
    FileText, GraduationCap, Loader2,
} from "lucide-react";

/* ── StatBox ───────────────────────────────────────────────── */
function StatBox({ label, valor, sub, icon, color, bg, border, delay, mounted }: {
    label: string; valor: string | number; sub?: string;
    icon: JSX.Element; color: string; bg: string; border: string;
    delay: number; mounted: boolean;
}) {
    const [hov, setHov] = useState(false);
    return (
        <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{
            position: "relative",
            backgroundColor: hov ? "var(--color-surface-hover)" : "rgba(13,14,21,0.55)",
            backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
            border: `1px solid ${hov ? border : "var(--color-border)"}`,
            borderRadius: "var(--radius-xl)", padding: "18px", overflow: "hidden",
            transition: "background 160ms ease, border-color 160ms ease, transform 160ms ease, box-shadow 160ms ease",
            transform: hov ? "translateY(-2px)" : "translateY(0)",
            boxShadow: hov ? "0 8px 24px rgba(0,0,0,0.3)" : "none",
            opacity: mounted ? 1 : 0, transitionDelay: `${delay}ms`,
        }}>
            <div style={{ position: "absolute", top: "-20px", right: "-20px", width: "80px", height: "80px", borderRadius: "50%", backgroundColor: bg, filter: "blur(24px)", opacity: hov ? 0.6 : 0.15, transition: "opacity 200ms ease", pointerEvents: "none" }} />
            <div style={{ display: "inline-flex", padding: "8px", borderRadius: "var(--radius-md)", backgroundColor: bg, color, border: `1px solid ${border}`, marginBottom: "14px" }}>
                {icon}
            </div>
            <p style={{ fontSize: "30px", fontWeight: 800, color: "var(--color-text)", margin: "0 0 3px", lineHeight: 1, letterSpacing: "-0.04em", fontVariantNumeric: "tabular-nums" }}>{valor}</p>
            <p style={{ fontSize: "12px", color: "var(--color-text-muted)", margin: 0, fontWeight: 500 }}>{label}</p>
            {sub && <p style={{ fontSize: "10px", color: "var(--color-text-faint)", margin: "3px 0 0" }}>{sub}</p>}
        </div>
    );
}

/* ── RetentionBar ──────────────────────────────────────────── */
function RetentionBar({ label, valor, total, color }: { label: string; valor: number; total: number; color: string }) {
    const pct = total > 0 ? Math.round((valor / total) * 100) : 0;
    return (
        <div style={{ marginBottom: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                <span style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>{label}</span>
                <span style={{ fontSize: "12px", fontWeight: 700, color }}>{valor} <span style={{ color: "var(--color-text-faint)", fontWeight: 400, fontSize: "10px" }}>({pct}%)</span></span>
            </div>
            <div style={{ height: "6px", borderRadius: "var(--radius-full)", backgroundColor: "var(--color-border)", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${pct}%`, borderRadius: "var(--radius-full)", backgroundColor: color, transition: "width 1s cubic-bezier(0.16,1,0.3,1)" }} />
            </div>
        </div>
    );
}

/* ── Página ─────────────────────────────────────────────────── */
export default function EstadisticasEmpresa() {
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

    /* Métricas */
    const activas = practicas.filter(p => p.activa);
    const finalizadas = practicas.filter(p => !p.activa);
    const contratados = finalizadas.filter(p => p.quedoContratado);
    const pctContratacion = finalizadas.length > 0
        ? Math.round((contratados.length / finalizadas.length) * 100) : 0;

    const todosLosDocs = practicas.flatMap(p => p.documentos ?? []);
    const docsAprobados = todosLosDocs.filter(d => d.estado === "APROBADO");
    const docsPendientes = todosLosDocs.filter(d => d.estado === "PENDIENTE");
    const docsRechazados = todosLosDocs.filter(d => d.estado === "RECHAZADO");
    const pctAprobacion = todosLosDocs.length > 0
        ? Math.round((docsAprobados.length / todosLosDocs.length) * 100) : 0;

    return (
        <DashboardLayout title="Estadísticas">
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

            {/* header */}
            <div style={{ marginBottom: "18px", opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(-6px)", transition: "opacity 350ms cubic-bezier(0.16,1,0.3,1), transform 350ms cubic-bezier(0.16,1,0.3,1)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                    <span style={{ width: "5px", height: "5px", borderRadius: "50%", backgroundColor: "var(--color-accent)", display: "inline-block" }} />
                    <span style={{ fontSize: "9px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "var(--color-accent)" }}>Analítica</span>
                </div>
                <h2 style={{ fontSize: "clamp(1rem,1.8vw,1.25rem)", fontWeight: 700, color: "var(--color-text)", margin: "0 0 2px", letterSpacing: "-0.02em" }}>Estadísticas</h2>
                <p style={{ fontSize: "12px", color: "var(--color-text-muted)", margin: 0 }}>Métricas de tus practicantes y documentos</p>
            </div>

            {cargando ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 0" }}>
                    <Loader2 size={28} style={{ color: "var(--color-accent)", animation: "spin 0.8s linear infinite" }} />
                </div>
            ) : (
                <>
                    {/* KPI Grid */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: "12px", marginBottom: "16px" }}>
                        <KpiCard label="Total practicantes" valor={practicas.length}
                            sub={`${activas.length} activos · ${finalizadas.length} finalizados`}
                            icon={<GraduationCap size={15} />}
                            color="var(--color-role-empresa)" delay={0} mounted={mounted} />
                        <KpiCard label="Contratados post-práctica" valor={contratados.length}
                            sub={`${pctContratacion}% tasa de retención`}
                            icon={<Award size={15} />}
                            color="var(--color-success)" delay={60} mounted={mounted} />
                        <KpiCard label="Documentos totales" valor={todosLosDocs.length}
                            sub={`${pctAprobacion}% tasa de aprobación`}
                            icon={<FileText size={15} />}
                            color="var(--color-accent)" delay={120} mounted={mounted} />
                        <KpiCard label="Docs aprobados" valor={docsAprobados.length}
                            sub={`${docsPendientes.length} pendientes de revisión`}
                            icon={<CheckCircle size={15} />}
                            color="var(--color-success)" delay={180} mounted={mounted} />
                    </div>

                    {/* Panels row */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>

                        {/* Retención panel */}
                        <div style={{
                            backgroundColor: "rgba(13,14,21,0.55)", backdropFilter: "blur(12px)",
                            border: "1px solid var(--color-border)", borderRadius: "var(--radius-xl)", overflow: "hidden",
                            opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(8px)",
                            transition: "opacity 360ms cubic-bezier(0.16,1,0.3,1) 260ms, transform 360ms cubic-bezier(0.16,1,0.3,1) 260ms",
                        }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px 16px", borderBottom: "1px solid var(--color-border)" }}>
                                <div style={{ width: "24px", height: "24px", borderRadius: "var(--radius-md)", backgroundColor: "var(--color-success-bg)", color: "var(--color-success)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <TrendingUp size={13} />
                                </div>
                                <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--color-text)" }}>Retención post-práctica</span>
                            </div>
                            <div style={{ padding: "20px 16px" }}>
                                {finalizadas.length === 0 ? (
                                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", padding: "20px", textAlign: "center" }}>
                                        <Users size={24} style={{ color: "var(--color-text-faint)" }} />
                                        <p style={{ fontSize: "12px", color: "var(--color-text-muted)", margin: 0 }}>Sin prácticas finalizadas aún</p>
                                    </div>
                                ) : (
                                    <>
                                        {/* Big number */}
                                        <div style={{ textAlign: "center", marginBottom: "20px" }}>
                                            <p style={{ fontSize: "52px", fontWeight: 900, color: "var(--color-success)", margin: 0, lineHeight: 1, letterSpacing: "-0.04em" }}>
                                                {pctContratacion}<span style={{ fontSize: "24px" }}>%</span>
                                            </p>
                                            <p style={{ fontSize: "11px", color: "var(--color-text-muted)", margin: "4px 0 0" }}>
                                                de practicantes fueron contratados después de finalizar
                                            </p>
                                        </div>
                                        <RetentionBar label="Contratados tras práctica" valor={contratados.length} total={finalizadas.length} color="var(--color-success)" />
                                        <RetentionBar label="No contratados" valor={finalizadas.length - contratados.length} total={finalizadas.length} color="var(--color-text-faint)" />
                                        <div style={{ marginTop: "12px", padding: "10px 12px", backgroundColor: "var(--color-success-bg)", border: "1px solid rgba(52,201,122,0.2)", borderRadius: "var(--radius-lg)" }}>
                                            <p style={{ fontSize: "11px", color: "var(--color-success)", margin: 0, fontWeight: 600 }}>
                                                {contratados.length} de {finalizadas.length} practicantes {contratados.length === 1 ? "fue contratado" : "fueron contratados"} permanentemente
                                            </p>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Documentos panel */}
                        <div style={{
                            backgroundColor: "rgba(13,14,21,0.55)", backdropFilter: "blur(12px)",
                            border: "1px solid var(--color-border)", borderRadius: "var(--radius-xl)", overflow: "hidden",
                            opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(8px)",
                            transition: "opacity 360ms cubic-bezier(0.16,1,0.3,1) 310ms, transform 360ms cubic-bezier(0.16,1,0.3,1) 310ms",
                        }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px 16px", borderBottom: "1px solid var(--color-border)" }}>
                                <div style={{ width: "24px", height: "24px", borderRadius: "var(--radius-md)", backgroundColor: "var(--color-accent-subtle)", color: "var(--color-accent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <BarChart3 size={13} />
                                </div>
                                <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--color-text)" }}>Estado de documentos</span>
                            </div>
                            <div style={{ padding: "20px 16px" }}>
                                {todosLosDocs.length === 0 ? (
                                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", padding: "20px", textAlign: "center" }}>
                                        <FileText size={24} style={{ color: "var(--color-text-faint)" }} />
                                        <p style={{ fontSize: "12px", color: "var(--color-text-muted)", margin: 0 }}>Sin documentos registrados aún</p>
                                    </div>
                                ) : (
                                    <>
                                        <div style={{ textAlign: "center", marginBottom: "20px" }}>
                                            <p style={{ fontSize: "52px", fontWeight: 900, color: "var(--color-accent)", margin: 0, lineHeight: 1, letterSpacing: "-0.04em" }}>
                                                {pctAprobacion}<span style={{ fontSize: "24px" }}>%</span>
                                            </p>
                                            <p style={{ fontSize: "11px", color: "var(--color-text-muted)", margin: "4px 0 0" }}>tasa de aprobación de documentos</p>
                                        </div>
                                        <RetentionBar label="Aprobados" valor={docsAprobados.length} total={todosLosDocs.length} color="var(--color-success)" />
                                        <RetentionBar label="Pendientes de revisión" valor={docsPendientes.length} total={todosLosDocs.length} color="var(--color-warning)" />
                                        <RetentionBar label="Rechazados" valor={docsRechazados.length} total={todosLosDocs.length} color="var(--color-error)" />
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </DashboardLayout>
    );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    const session = await getSession(context);
    if (!session || session.user.role !== "EMPRESA") return { redirect: { destination: "/auth/login", permanent: false } };
    return { props: {} };
};