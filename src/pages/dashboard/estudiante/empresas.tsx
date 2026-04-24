//src/pages/dashboard/estudiante/empresas.tsx
import { useState, useEffect } from "react";
import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Building2, MapPin, Briefcase, TrendingUp, Loader2 } from "lucide-react";

/* ─── helpers ───────────────────────────────────────────────────────── */
function indiceColor(v: number): string {
    if (v >= 50) return "var(--color-success)";
    if (v >= 25) return "var(--color-warning)";
    return "var(--color-text-faint)";
}

/* ─── EmpresaCard ────────────────────────────────────────────────────── */
function EmpresaCard({ empresa, delay, mounted }: { empresa: any; delay: number; mounted: boolean }) {
    const [hov, setHov] = useState(false);
    const totalPracticas = empresa._count?.practicas ?? 0;
    const contratados = empresa.practicas?.filter((p: any) => p.quedoContratado).length ?? 0;
    const indice = totalPracticas > 0 ? Math.round((contratados / totalPracticas) * 100) : 0;
    const color = indiceColor(indice);

    return (
        <div
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
            style={{
                position: "relative",
                backgroundColor: hov ? "rgba(255,255,255,0.05)" : "rgba(13,14,21,0.55)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                border: `1px solid ${hov ? "var(--color-accent-border)" : "var(--color-border)"}`,
                borderRadius: "var(--radius-xl)",
                padding: "16px",
                overflow: "hidden",
                transition: "all 180ms cubic-bezier(0.16,1,0.3,1)",
                transform: hov ? "translateY(-2px)" : "translateY(0)",
                boxShadow: hov ? "0 8px 28px rgba(0,0,0,0.35)" : "none",
                opacity: mounted ? 1 : 0,
                transitionDelay: `${delay}ms`,
            }}
        >
            {/* top shimmer on hover */}
            <div style={{ position: "absolute", top: 0, left: "10%", right: "10%", height: "1px", background: `linear-gradient(90deg,transparent,var(--color-accent),transparent)`, opacity: hov ? 0.5 : 0, transition: "opacity 200ms ease" }} />

            {/* header */}
            <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", marginBottom: "14px" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "var(--radius-lg)", backgroundColor: "var(--color-accent-subtle)", border: "1px solid var(--color-accent-border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-accent)", flexShrink: 0 }}>
                    <Building2 size={18} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: "13px", fontWeight: 700, color: "var(--color-text)", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", letterSpacing: "-0.01em" }}>
                        {empresa.nombreEmpresa}
                    </p>
                    {empresa.sector && (
                        <p style={{ fontSize: "11px", color: "var(--color-text-muted)", margin: "2px 0 0", display: "flex", alignItems: "center", gap: "4px" }}>
                            <Briefcase size={10} />{empresa.sector}
                        </p>
                    )}
                    {empresa.ciudad && (
                        <p style={{ fontSize: "10px", color: "var(--color-text-faint)", margin: "1px 0 0", display: "flex", alignItems: "center", gap: "4px" }}>
                            <MapPin size={10} />{empresa.ciudad}
                        </p>
                    )}
                </div>
            </div>

            {/* índice de permanencia */}
            <div style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)", padding: "10px 12px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                    <span style={{ fontSize: "10px", color: "var(--color-text-faint)", display: "flex", alignItems: "center", gap: "4px" }}>
                        <TrendingUp size={11} />Índice de permanencia
                    </span>
                    <span style={{ fontSize: "13px", fontWeight: 700, color, fontVariantNumeric: "tabular-nums" }}>{indice}%</span>
                </div>
                {/* progress bar */}
                <div style={{ width: "100%", height: "4px", backgroundColor: "rgba(255,255,255,0.07)", borderRadius: "var(--radius-full)", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${indice}%`, backgroundColor: color, borderRadius: "var(--radius-full)", transition: "width 600ms cubic-bezier(0.16,1,0.3,1)" }} />
                </div>
                <p style={{ fontSize: "10px", color: "var(--color-text-faint)", margin: "6px 0 0" }}>
                    {contratados} de {totalPracticas} practicante{totalPracticas !== 1 ? "s" : ""} contratado{contratados !== 1 ? "s" : ""}
                </p>
            </div>
        </div>
    );
}

/* ─── EmptyState ─────────────────────────────────────────────────────── */
function EmptyState() {
    return (
        <div style={{ gridColumn: "1/-1", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "56px 24px", textAlign: "center", backgroundColor: "rgba(13,14,21,0.55)", backdropFilter: "blur(12px)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-xl)", gap: "10px" }}>
            <div style={{ width: "44px", height: "44px", borderRadius: "var(--radius-xl)", backgroundColor: "var(--color-surface-3)", border: "1px solid var(--color-border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-text-faint)" }}>
                <Building2 size={20} />
            </div>
            <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--color-text)", margin: 0 }}>Sin empresas registradas</p>
            <p style={{ fontSize: "12px", color: "var(--color-text-muted)", margin: 0, maxWidth: "28ch", lineHeight: 1.6 }}>
                Las empresas aparecerán aquí cuando se registren en el sistema
            </p>
        </div>
    );
}

/* ══════════════════════════════════════════════════════════════════════
   PÁGINA EMPRESAS ESTUDIANTE
══════════════════════════════════════════════════════════════════════ */
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

    useEffect(() => { const t = setTimeout(() => setMounted(true), 40); return () => clearTimeout(t); }, []);

    return (
        <DashboardLayout title="Empresas">

            {/* header */}
            <div style={{ marginBottom: "18px", opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(-6px)", transition: "opacity 350ms cubic-bezier(0.16,1,0.3,1), transform 350ms cubic-bezier(0.16,1,0.3,1)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                    <span style={{ width: "5px", height: "5px", borderRadius: "50%", backgroundColor: "var(--color-accent)", display: "inline-block" }} />
                    <span style={{ fontSize: "9px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "var(--color-accent)" }}>Directorio</span>
                </div>
                <h2 style={{ fontSize: "clamp(1rem,1.8vw,1.25rem)", fontWeight: 700, color: "var(--color-text)", margin: "0 0 2px", letterSpacing: "-0.02em" }}>
                    Empresas disponibles
                </h2>
                <p style={{ fontSize: "12px", color: "var(--color-text-muted)", margin: 0 }}>
                    Explora las empresas con índices de permanencia de practicantes
                </p>
            </div>

            {/* loader */}
            {cargando && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 0" }}>
                    <Loader2 size={28} style={{ color: "var(--color-accent)", animation: "spin 0.8s linear infinite" }} />
                    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                </div>
            )}

            {/* grid */}
            {!cargando && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(280px,100%),1fr))", gap: "12px" }}>
                    {empresas.length === 0
                        ? <EmptyState />
                        : empresas.map((e: any, i: number) => (
                            <EmpresaCard key={e.id} empresa={e} delay={i * 40} mounted={mounted} />
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