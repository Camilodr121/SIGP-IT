//src/pages/dashboard/estudiante/empresas.tsx
import { useState, useEffect } from "react";
import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Building2, MapPin, Briefcase, TrendingUp, Loader2, Users, Award, Activity, ChevronRight } from "lucide-react";

/* ─── helpers ─────────────────────────────────────────────── */
function indiceConfig(v: number) {
    if (v >= 66) return { text: "#34c97a", glow: "rgba(52,201,122,0.4)", bg: "rgba(52,201,122,0.1)", border: "rgba(52,201,122,0.28)", nivel: "Alta" };
    if (v >= 33) return { text: "#f5a623", glow: "rgba(245,166,35,0.4)", bg: "rgba(245,166,35,0.1)", border: "rgba(245,166,35,0.28)", nivel: "Media" };
    return { text: "#4a4d62", glow: "rgba(255,255,255,0.06)", bg: "rgba(255,255,255,0.03)", border: "rgba(255,255,255,0.08)", nivel: "Baja" };
}

/* ─── CSS Ring (conic-gradient) ───────────────────────────── */
function RetentionRing({ pct, color, glow, animated }: { pct: number; color: string; glow: string; animated: boolean }) {
    const deg = animated ? Math.round((pct / 100) * 360) : 0;
    return (
        <div style={{ position: "relative", width: "72px", height: "72px", flexShrink: 0 }}>
            {/* outer glow ring */}
            <div style={{
                position: "absolute", inset: "-4px",
                borderRadius: "50%",
                background: `conic-gradient(${glow} 0deg, transparent ${deg}deg, transparent 360deg)`,
                filter: "blur(6px)",
                transition: "background 1.2s cubic-bezier(0.16,1,0.3,1)",
            }} />
            {/* main ring */}
            <div style={{
                position: "absolute", inset: 0,
                borderRadius: "50%",
                background: `conic-gradient(${color} 0deg, ${color} ${deg}deg, rgba(255,255,255,0.06) ${deg}deg, rgba(255,255,255,0.06) 360deg)`,
                transition: "background 1.2s cubic-bezier(0.16,1,0.3,1)",
            }} />
            {/* inner cutout */}
            <div style={{
                position: "absolute", inset: "8px",
                borderRadius: "50%",
                backgroundColor: "#0d0e15",
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                gap: "0px",
            }}>
                <span style={{ fontSize: "14px", fontWeight: 800, color, lineHeight: 1, letterSpacing: "-0.02em" }}>{pct}%</span>
                <span style={{ fontSize: "7px", fontWeight: 600, color: "rgba(255,255,255,0.3)", letterSpacing: "0.06em", textTransform: "uppercase", marginTop: "1px" }}>ret.</span>
            </div>
        </div>
    );
}

/* ─── EmpresaCard ─────────────────────────────────────────── */
function EmpresaCard({ empresa, delay, mounted }: { empresa: any; delay: number; mounted: boolean }) {
    const [hov, setHov] = useState(false);
    const [animated, setAnimated] = useState(false);

    const totalPracticas = empresa._count?.practicas ?? empresa.practicas?.length ?? 0;
    const contratados = empresa.practicas?.filter((p: any) => p.quedoContratado).length ?? 0;
    const activas = empresa.practicas?.filter((p: any) => p.activa).length ?? 0;
    const finalizadas = totalPracticas - activas;
    const indice = finalizadas > 0 ? Math.round((contratados / finalizadas) * 100) : 0;
    const cfg = indiceConfig(indice);
    const inicial = empresa.nombreEmpresa?.charAt(0).toUpperCase() ?? "E";

    useEffect(() => {
        if (!mounted) return;
        const t = setTimeout(() => setAnimated(true), delay + 350);
        return () => clearTimeout(t);
    }, [mounted, delay]);

    return (
        <div
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
            style={{
                position: "relative", overflow: "hidden",
                backgroundColor: hov ? "rgba(255,255,255,0.04)" : "rgba(13,14,21,0.7)",
                backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
                border: `1px solid ${hov ? cfg.border : "rgba(255,255,255,0.07)"}`,
                borderRadius: "20px",
                transition: "all 220ms cubic-bezier(0.16,1,0.3,1)",
                transform: hov ? "translateY(-4px)" : "translateY(0)",
                boxShadow: hov ? `0 20px 50px rgba(0,0,0,0.45), 0 0 0 1px ${cfg.border}` : "none",
                opacity: mounted ? 1 : 0,
                transitionDelay: `${delay}ms`,
            }}
        >
            {/* ambient glow blob */}
            <div style={{
                position: "absolute", top: "-50px", right: "-50px",
                width: "160px", height: "160px", borderRadius: "50%",
                backgroundColor: cfg.glow, filter: "blur(55px)",
                opacity: hov ? 0.65 : 0.18,
                transition: "opacity 400ms ease",
                pointerEvents: "none",
            }} />

            {/* shimmer top border */}
            <div style={{
                position: "absolute", top: 0, left: "12%", right: "12%", height: "1px",
                background: `linear-gradient(90deg, transparent, ${cfg.text}, transparent)`,
                opacity: hov ? 0.6 : 0.12, transition: "opacity 300ms ease",
            }} />

            {/* ── HEADER ── */}
            <div style={{
                display: "flex", alignItems: "flex-start", gap: "14px",
                padding: "18px 18px 14px",
                borderBottom: "1px solid rgba(255,255,255,0.05)",
            }}>
                {/* avatar inicial */}
                <div style={{
                    width: "48px", height: "48px", borderRadius: "14px", flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: `linear-gradient(135deg, ${cfg.text}28, ${cfg.text}0a)`,
                    border: `1px solid ${cfg.border}`,
                    fontSize: "20px", fontWeight: 900, color: cfg.text,
                    fontFamily: "var(--font-body)",
                    boxShadow: hov ? `0 0 22px ${cfg.glow}` : "none",
                    transition: "box-shadow 300ms ease",
                }}>
                    {inicial}
                </div>

                {/* info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                        fontSize: "15px", fontWeight: 800, color: "var(--color-text)",
                        margin: "0 0 6px", letterSpacing: "-0.02em",
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>
                        {empresa.nombreEmpresa}
                    </p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                        {empresa.sector && (
                            <span style={{
                                display: "inline-flex", alignItems: "center", gap: "4px",
                                padding: "2px 8px", borderRadius: "99px",
                                background: "rgba(255,255,255,0.05)",
                                border: "1px solid rgba(255,255,255,0.08)",
                                fontSize: "9px", fontWeight: 700, letterSpacing: "0.06em",
                                textTransform: "uppercase" as const, color: "var(--color-text-muted)",
                            }}>
                                <Briefcase size={8} />{empresa.sector}
                            </span>
                        )}
                        {empresa.ciudad && (
                            <span style={{
                                display: "inline-flex", alignItems: "center", gap: "3px",
                                fontSize: "9px", color: "var(--color-text-faint)",
                            }}>
                                <MapPin size={9} />{empresa.ciudad}
                            </span>
                        )}
                    </div>
                </div>

                {/* nivel badge */}
                <span style={{
                    display: "inline-flex", alignItems: "center", gap: "4px",
                    padding: "4px 10px", borderRadius: "99px",
                    backgroundColor: cfg.bg, border: `1px solid ${cfg.border}`,
                    fontSize: "9px", fontWeight: 700, color: cfg.text,
                    letterSpacing: "0.04em", flexShrink: 0,
                }}>
                    <Activity size={9} />{cfg.nivel}
                </span>
            </div>

            {/* ── BODY ── */}
            <div style={{ padding: "16px 18px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
                    {/* Ring */}
                    <RetentionRing pct={indice} color={cfg.text} glow={cfg.glow} animated={animated} />

                    {/* Stats */}
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "9px" }}>
                        {[
                            { icon: <Users size={10} />, label: "Total practicantes", val: totalPracticas, c: "var(--color-text-muted)" },
                            { icon: <Activity size={10} />, label: "Prácticas activas", val: activas, c: "var(--color-accent)" },
                            { icon: <Award size={10} />, label: "Contratados post-práctica", val: contratados, c: cfg.text },
                        ].map(s => (
                            <div key={s.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                                <span style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "10px", color: "rgba(255,255,255,0.35)" }}>
                                    <span style={{ color: s.c }}>{s.icon}</span>{s.label}
                                </span>
                                <span style={{ fontSize: "13px", fontWeight: 700, color: s.c, fontVariantNumeric: "tabular-nums" }}>
                                    {s.val}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Barra índice ── */}
                <div style={{ marginTop: "16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "7px" }}>
                        <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)", display: "flex", alignItems: "center", gap: "4px" }}>
                            <TrendingUp size={10} />Índice de permanencia
                        </span>
                        <span style={{ fontSize: "11px", fontWeight: 800, color: cfg.text, fontVariantNumeric: "tabular-nums" }}>
                            {indice}%
                        </span>
                    </div>
                    {/* track */}
                    <div style={{ height: "5px", borderRadius: "99px", backgroundColor: "rgba(255,255,255,0.05)", overflow: "hidden", position: "relative" }}>
                        {/* glow */}
                        <div style={{
                            position: "absolute", top: 0, left: 0, height: "100%",
                            width: animated ? `${indice}%` : "0%", borderRadius: "99px",
                            backgroundColor: cfg.glow, filter: "blur(3px)",
                            transition: "width 1.2s cubic-bezier(0.16,1,0.3,1)",
                        }} />
                        {/* bar */}
                        <div style={{
                            position: "relative", height: "100%", borderRadius: "99px",
                            backgroundColor: cfg.text,
                            width: animated ? `${indice}%` : "0%",
                            transition: "width 1.2s cubic-bezier(0.16,1,0.3,1)",
                        }}>
                            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(255,255,255,0.3) 0%,transparent 100%)", borderRadius: "99px" }} />
                        </div>
                    </div>
                    <p style={{ fontSize: "9px", color: "rgba(255,255,255,0.25)", margin: "5px 0 0", textAlign: "right" as const }}>
                        {contratados} de {finalizadas} practicante{finalizadas !== 1 ? "s" : ""} finalizados {contratados !== 1 ? "fueron" : "fue"} contratado{contratados !== 1 ? "s" : ""}
                    </p>
                </div>
            </div>

            {/* ── Footer ── */}
            <div style={{
                borderTop: "1px solid rgba(255,255,255,0.05)",
                padding: "8px 18px",
                display: "flex", justifyContent: "flex-end",
                opacity: hov ? 1 : 0.3,
                transition: "opacity 200ms ease",
            }}>
                <span style={{ fontSize: "10px", fontWeight: 600, color: cfg.text, display: "flex", alignItems: "center", gap: "4px" }}>
                    Ver detalle <ChevronRight size={10} />
                </span>
            </div>
        </div>
    );
}

/* ─── EmptyState ──────────────────────────────────────────── */
function EmptyState() {
    return (
        <div style={{
            gridColumn: "1/-1",
            display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "center", padding: "72px 24px", textAlign: "center",
            backgroundColor: "rgba(13,14,21,0.55)", backdropFilter: "blur(12px)",
            border: "1px solid rgba(255,255,255,0.07)", borderRadius: "20px", gap: "12px",
        }}>
            <div style={{ width: "52px", height: "52px", borderRadius: "16px", backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-text-faint)" }}>
                <Building2 size={22} />
            </div>
            <p style={{ fontSize: "14px", fontWeight: 700, color: "var(--color-text)", margin: 0 }}>Sin empresas registradas</p>
            <p style={{ fontSize: "12px", color: "var(--color-text-muted)", margin: 0, maxWidth: "30ch", lineHeight: 1.7 }}>
                Las empresas aparecerán aquí cuando se registren en el sistema
            </p>
        </div>
    );
}

/* ══════════════════════════════════════════════════════════════
   PÁGINA
══════════════════════════════════════════════════════════════ */
export default function EmpresasEstudiante() {
    const [empresas, setEmpresas] = useState<any[]>([]);
    const [cargando, setCargando] = useState(true);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        fetch("/api/empresas")
            .then(r => r.json())
            .then(json => setEmpresas(json.data ?? []))
            .finally(() => setCargando(false));
    }, []);

    useEffect(() => {
        const t = setTimeout(() => setMounted(true), 40);
        return () => clearTimeout(t);
    }, []);

    const conActivas = empresas.filter(e => e.practicas?.some((p: any) => p.activa)).length;

    return (
        <DashboardLayout title="Empresas">
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

            {/* header */}
            <div style={{
                marginBottom: "22px",
                opacity: mounted ? 1 : 0,
                transform: mounted ? "translateY(0)" : "translateY(-6px)",
                transition: "opacity 350ms cubic-bezier(0.16,1,0.3,1), transform 350ms cubic-bezier(0.16,1,0.3,1)",
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                    <span style={{ width: "5px", height: "5px", borderRadius: "50%", backgroundColor: "var(--color-accent)", display: "inline-block" }} />
                    <span style={{ fontSize: "9px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "var(--color-accent)" }}>Directorio</span>
                </div>
                <h2 style={{ fontSize: "clamp(1rem,1.8vw,1.25rem)", fontWeight: 700, color: "var(--color-text)", margin: "0 0 2px", letterSpacing: "-0.02em" }}>
                    Empresas disponibles
                </h2>
                <p style={{ fontSize: "12px", color: "var(--color-text-muted)", margin: 0 }}>
                    {!cargando && empresas.length > 0
                        ? `${empresas.length} empresa${empresas.length !== 1 ? "s" : ""} · ${conActivas} con practicantes activos`
                        : "Explora las empresas con índice de permanencia de practicantes"
                    }
                </p>
            </div>

            {/* loader */}
            {cargando && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 0" }}>
                    <Loader2 size={28} style={{ color: "var(--color-accent)", animation: "spin 0.8s linear infinite" }} />
                </div>
            )}

            {/* grid */}
            {!cargando && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(320px,100%),1fr))", gap: "14px" }}>
                    {empresas.length === 0
                        ? <EmptyState />
                        : empresas.map((e: any, i: number) => (
                            <EmpresaCard key={e.id} empresa={e} delay={i * 55} mounted={mounted} />
                        ))
                    }
                </div>
            )}
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