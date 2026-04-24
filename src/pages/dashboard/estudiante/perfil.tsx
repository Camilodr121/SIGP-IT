//src/pages/dashboard/estudiante/perfil.tsx
import { useEffect, useState } from "react";
import { GetServerSideProps } from "next";
import { getSession, useSession } from "next-auth/react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { FileText, Clock, CheckCircle, AlertCircle, TrendingUp, Sparkles } from "lucide-react";

/* ─── KPI config ─────────────────────────────────────────────────────── */
const STATS = [
    { label: "Enviados", icon: <FileText size={14} />, color: "var(--color-role-universidad)", bg: "var(--color-role-universidad-bg)", border: "rgba(99,102,241,0.22)" },
    { label: "En revisión", icon: <Clock size={14} />, color: "var(--color-warning)", bg: "var(--color-warning-bg)", border: "rgba(245,166,35,0.2)" },
    { label: "Aprobados", icon: <CheckCircle size={14} />, color: "var(--color-success)", bg: "var(--color-success-bg)", border: "rgba(52,201,122,0.2)" },
    { label: "Rechazados", icon: <AlertCircle size={14} />, color: "var(--color-error)", bg: "var(--color-error-bg, rgba(220,38,38,0.12))", border: "rgba(220,38,38,0.2)" },
];

/* ─── KpiCard ────────────────────────────────────────────────────────── */
function KpiCard({ s, delay, mounted }: { s: typeof STATS[0]; delay: number; mounted: boolean }) {
    const [hov, setHov] = useState(false);
    return (
        <div
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
            style={{
                position: "relative",
                backgroundColor: hov ? "rgba(255,255,255,0.05)" : "rgba(13,14,21,0.55)",
                backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
                border: `1px solid ${hov ? s.border : "var(--color-border)"}`,
                borderRadius: "var(--radius-xl)", padding: "16px", overflow: "hidden",
                transition: "all 180ms cubic-bezier(0.16,1,0.3,1)",
                transform: hov ? "translateY(-2px)" : "translateY(0)",
                boxShadow: hov ? `0 8px 24px rgba(0,0,0,0.35)` : "none",
                opacity: mounted ? 1 : 0,
                transitionDelay: `${delay}ms`,
            }}
        >
            <div style={{ position: "absolute", top: "-18px", right: "-18px", width: "60px", height: "60px", borderRadius: "50%", backgroundColor: s.bg, filter: "blur(18px)", opacity: hov ? 0.65 : 0, transition: "opacity 200ms ease", pointerEvents: "none" }} />
            <div style={{ position: "absolute", top: 0, left: "10%", right: "10%", height: "1px", background: `linear-gradient(90deg,transparent,${s.color},transparent)`, opacity: hov ? 0.5 : 0, transition: "opacity 200ms ease" }} />
            <div style={{ display: "inline-flex", padding: "7px", borderRadius: "var(--radius-md)", backgroundColor: s.bg, color: s.color, border: `1px solid ${s.border}`, marginBottom: "10px" }}>{s.icon}</div>
            <p style={{ fontSize: "26px", fontWeight: 700, color: "var(--color-text)", margin: "0 0 1px", lineHeight: 1, letterSpacing: "-0.03em", fontVariantNumeric: "tabular-nums" }}>0</p>
            <p style={{ fontSize: "11px", color: "var(--color-text-muted)", margin: 0, fontWeight: 500 }}>{s.label}</p>
        </div>
    );
}

/* ─── PanelCard ──────────────────────────────────────────────────────── */
function PanelCard({ icon, title, delay, mounted, children }: {
    icon: JSX.Element; title: string; delay: number; mounted: boolean; children: React.ReactNode;
}) {
    return (
        <div style={{
            position: "relative", overflow: "hidden",
            backgroundColor: "rgba(13,14,21,0.55)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
            border: "1px solid var(--color-border)", borderRadius: "var(--radius-xl)",
            opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(8px)",
            transition: `opacity 360ms cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 360ms cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
        }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "64px", background: "linear-gradient(to bottom,rgba(99,102,241,0.04),transparent)", pointerEvents: "none" }} />
            {/* panel header */}
            <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--color-border)", display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ width: "24px", height: "24px", borderRadius: "var(--radius-md)", backgroundColor: "var(--color-role-universidad-bg)", color: "var(--color-role-universidad)", display: "flex", alignItems: "center", justifyContent: "center" }}>{icon}</div>
                <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--color-text)" }}>{title}</span>
            </div>
            {children}
        </div>
    );
}

/* ─── EmptyPanel ─────────────────────────────────────────────────────── */
function EmptyPanel({ icon, label, sublabel }: { icon: JSX.Element; label: string; sublabel: string }) {
    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "36px 20px", textAlign: "center", gap: "8px" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid var(--color-border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-text-faint)", marginBottom: "2px" }}>{icon}</div>
            <p style={{ fontSize: "12px", fontWeight: 500, color: "var(--color-text-muted)", margin: 0 }}>{label}</p>
            <p style={{ fontSize: "11px", color: "var(--color-text-faint)", margin: 0, maxWidth: "22ch", lineHeight: 1.5 }}>{sublabel}</p>
        </div>
    );
}

/* ══════════════════════════════════════════════════════════════════════
   PÁGINA PERFIL ESTUDIANTE
══════════════════════════════════════════════════════════════════════ */
export default function PerfilEstudiante() {
    const { data: session } = useSession();
    const nombre = session?.user?.name?.split(" ")[0] ?? "Estudiante";
    const [mounted, setMounted] = useState(false);
    useEffect(() => { const t = setTimeout(() => setMounted(true), 40); return () => clearTimeout(t); }, []);

    return (
        <DashboardLayout title="Mi Dashboard">

            {/* bienvenida */}
            <div style={{ marginBottom: "18px", opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(-6px)", transition: "opacity 350ms cubic-bezier(0.16,1,0.3,1), transform 350ms cubic-bezier(0.16,1,0.3,1)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                    <Sparkles size={10} style={{ color: "var(--color-role-universidad)" }} />
                    <span style={{ fontSize: "9px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "var(--color-role-universidad)" }}>Panel del estudiante</span>
                </div>
                <h2 style={{ fontSize: "clamp(1rem,1.8vw,1.25rem)", fontWeight: 700, color: "var(--color-text)", margin: "0 0 2px", letterSpacing: "-0.02em" }}>
                    Bienvenido, {nombre}
                </h2>
                <p style={{ fontSize: "12px", color: "var(--color-text-muted)", margin: 0 }}>
                    Gestiona tus reportes y haz seguimiento a tu práctica profesional.
                </p>
            </div>

            {/* KPIs */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "10px", marginBottom: "14px" }}>
                {STATS.map((s, i) => <KpiCard key={s.label} s={s} delay={i * 50} mounted={mounted} />)}
            </div>

            {/* paneles */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <PanelCard icon={<TrendingUp size={13} />} title="Estado de práctica" delay={260} mounted={mounted}>
                    <EmptyPanel icon={<FileText size={18} />} label="No tienes una práctica activa" sublabel="Contacta a la universidad para registrar tu empresa" />
                </PanelCard>
                <PanelCard icon={<Clock size={13} />} title="Actividad reciente" delay={310} mounted={mounted}>
                    <EmptyPanel icon={<Clock size={18} />} label="Sin actividad reciente" sublabel="Tus reportes y actualizaciones aparecerán aquí" />
                </PanelCard>
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