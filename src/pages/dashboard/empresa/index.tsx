// sigp-it/src/pages/dashboard/empresa/index.tsx
import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { GraduationCap, FileText, CheckCircle, PenLine, ArrowRight } from "lucide-react";

/* ─────────────────────────────────────────────────────────────────────────
   KPI config
───────────────────────────────────────────────────────────────────────── */
const STATS = [
    {
        label: "Practicantes activos",
        valor: "0",
        icon: <GraduationCap size={14} />,
        color: "var(--color-role-empresa)",
        bg: "var(--color-role-empresa-bg)",
        border: "rgba(245,130,32,0.22)",
        href: "/dashboard/empresa/practicantes",
    },
    {
        label: "Documentos por firmar",
        valor: "0",
        icon: <PenLine size={14} />,
        color: "var(--color-warning)",
        bg: "var(--color-warning-bg)",
        border: "rgba(245,166,35,0.2)",
        href: "/dashboard/empresa/practicantes",
    },
    {
        label: "Documentos firmados",
        valor: "0",
        icon: <CheckCircle size={14} />,
        color: "var(--color-success)",
        bg: "var(--color-success-bg)",
        border: "rgba(52,201,122,0.2)",
        href: "/dashboard/empresa/practicantes",
    },
    {
        label: "Total reportes",
        valor: "0",
        icon: <FileText size={14} />,
        color: "var(--color-accent)",
        bg: "var(--color-accent-subtle)",
        border: "var(--color-accent-border)",
        href: "/dashboard/empresa/practicantes",
    },
];

/* ─────────────────────────────────────────────────────────────────────────
   KPI Card
───────────────────────────────────────────────────────────────────────── */
function KpiCard({ stat, delay, mounted }: { stat: typeof STATS[0]; delay: number; mounted: boolean }) {
    const [hov, setHov] = useState(false);
    return (
        <Link
            href={stat.href}
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
            style={{
                display: "block",
                position: "relative",
                backgroundColor: hov ? "var(--color-surface-hover)" : "rgba(13,14,21,0.55)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                border: `1px solid ${hov ? stat.border : "var(--color-border)"}`,
                borderRadius: "var(--radius-xl)",
                padding: "16px",
                overflow: "hidden",
                textDecoration: "none",
                transition: "background 160ms ease, border-color 160ms ease, transform 160ms ease, box-shadow 160ms ease",
                transform: hov ? "translateY(-2px)" : "translateY(0)",
                boxShadow: hov ? "0 8px 24px rgba(0,0,0,0.35)" : "none",
                opacity: mounted ? 1 : 0,
                transitionDelay: `${delay}ms`,
                cursor: "pointer",
            }}
        >
            <div style={{ position: "absolute", top: "-16px", right: "-16px", width: "64px", height: "64px", borderRadius: "50%", backgroundColor: stat.bg, filter: "blur(20px)", opacity: hov ? 0.7 : 0, transition: "opacity 200ms ease", pointerEvents: "none" }} />
            <div style={{ position: "absolute", top: 0, left: "10%", right: "10%", height: "1px", background: `linear-gradient(90deg,transparent,${stat.bg},transparent)`, opacity: hov ? 1 : 0, transition: "opacity 200ms ease" }} />
            <div style={{ display: "inline-flex", padding: "7px", borderRadius: "var(--radius-md)", backgroundColor: stat.bg, color: stat.color, border: `1px solid ${stat.border}`, marginBottom: "12px" }}>
                {stat.icon}
            </div>
            <p style={{ fontSize: "26px", fontWeight: 700, color: "var(--color-text)", margin: "0 0 2px", lineHeight: 1, letterSpacing: "-0.03em", fontVariantNumeric: "tabular-nums" }}>{stat.valor}</p>
            <p style={{ fontSize: "11px", color: "var(--color-text-muted)", margin: 0, fontWeight: 500 }}>{stat.label}</p>
            <div style={{ position: "absolute", right: "12px", bottom: "12px", color: stat.color, opacity: hov ? 1 : 0, transform: hov ? "translateX(0)" : "translateX(-4px)", transition: "opacity 150ms ease, transform 150ms ease" }}>
                <ArrowRight size={12} />
            </div>
        </Link>
    );
}

/* ─────────────────────────────────────────────────────────────────────────
   Panel + EmptyState
───────────────────────────────────────────────────────────────────────── */
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

function PanelHeader({ icon, title, color = "accent", action }: { icon: JSX.Element; title: string; color?: "accent" | "empresa" | "neutral"; action?: React.ReactNode }) {
    const iconColor = color === "accent" ? "var(--color-accent)" : color === "empresa" ? "var(--color-role-empresa)" : "var(--color-text-muted)";
    const iconBg = color === "accent" ? "var(--color-accent-subtle)" : color === "empresa" ? "var(--color-role-empresa-bg)" : "var(--color-surface-3)";
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

function EmptyState({ icon, title, subtitle }: { icon: JSX.Element; title: string; subtitle: string }) {
    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "36px 20px", textAlign: "center", gap: "8px" }}>
            <div style={{ width: "38px", height: "38px", borderRadius: "var(--radius-lg)", backgroundColor: "var(--color-surface-3)", border: "1px solid var(--color-border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-text-faint)", marginBottom: "2px" }}>{icon}</div>
            <p style={{ fontSize: "12px", fontWeight: 500, color: "var(--color-text-muted)", margin: 0 }}>{title}</p>
            <p style={{ fontSize: "11px", color: "var(--color-text-faint)", margin: 0, maxWidth: "22ch", lineHeight: 1.5 }}>{subtitle}</p>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────────────────
   Página
───────────────────────────────────────────────────────────────────────── */
export default function DashboardEmpresa() {
    const [mounted, setMounted] = useState(false);
    useEffect(() => { const t = setTimeout(() => setMounted(true), 40); return () => clearTimeout(t); }, []);

    const linkStyle: React.CSSProperties = { display: "flex", alignItems: "center", gap: "3px", fontSize: "11px", fontWeight: 500, color: "var(--color-text-faint)", textDecoration: "none", transition: "color var(--transition-fast)" };

    return (
        <DashboardLayout title="Panel Empresa">

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
                    Revisa el trabajo de tus practicantes y certifica sus documentos.
                </p>
            </div>

            {/* ── KPI GRID ── */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "10px", marginBottom: "16px" }}>
                {STATS.map((s, i) => <KpiCard key={s.label} stat={s} delay={i * 50} mounted={mounted} />)}
            </div>

            {/* ── PANELES ── */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>

                <Panel delay={260} mounted={mounted}>
                    <PanelHeader
                        icon={<PenLine size={13} />} title="Documentos pendientes de firma" color="empresa"
                        action={
                            <Link href="/dashboard/empresa/practicantes" style={linkStyle}
                                onMouseEnter={e => (e.currentTarget.style.color = "var(--color-role-empresa)")}
                                onMouseLeave={e => (e.currentTarget.style.color = "var(--color-text-faint)")}
                            >Ver todos <ArrowRight size={10} /></Link>
                        }
                    />
                    <EmptyState icon={<FileText size={16} />} title="Sin documentos por firmar" subtitle="Los documentos pendientes aparecerán aquí" />
                </Panel>

                <Panel delay={310} mounted={mounted}>
                    <PanelHeader
                        icon={<GraduationCap size={13} />} title="Practicantes activos" color="empresa"
                        action={
                            <Link href="/dashboard/empresa/practicantes" style={linkStyle}
                                onMouseEnter={e => (e.currentTarget.style.color = "var(--color-role-empresa)")}
                                onMouseLeave={e => (e.currentTarget.style.color = "var(--color-text-faint)")}
                            >Ver todos <ArrowRight size={10} /></Link>
                        }
                    />
                    <EmptyState icon={<GraduationCap size={16} />} title="Sin practicantes registrados" subtitle="Los practicantes asignados aparecerán aquí" />
                </Panel>

            </div>
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