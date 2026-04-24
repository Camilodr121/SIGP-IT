// src/pages/dashboard/empresa/estadisticas.tsx
import { useEffect, useState } from "react";
import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { BarChart3, Sparkles } from "lucide-react";

export default function EstadisticasEmpresa() {
    const [mounted, setMounted] = useState(false);
    useEffect(() => { const t = setTimeout(() => setMounted(true), 40); return () => clearTimeout(t); }, []);

    return (
        <DashboardLayout title="Estadísticas">
            {/* header */}
            <div style={{ marginBottom: "18px", opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(-6px)", transition: "opacity 350ms cubic-bezier(0.16,1,0.3,1), transform 350ms cubic-bezier(0.16,1,0.3,1)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                    <span style={{ width: "5px", height: "5px", borderRadius: "50%", backgroundColor: "var(--color-accent)", display: "inline-block" }} />
                    <span style={{ fontSize: "9px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "var(--color-accent)" }}>Analítica</span>
                </div>
                <h2 style={{ fontSize: "clamp(1rem,1.8vw,1.25rem)", fontWeight: 700, color: "var(--color-text)", margin: "0 0 2px", letterSpacing: "-0.02em" }}>Estadísticas</h2>
                <p style={{ fontSize: "12px", color: "var(--color-text-muted)", margin: 0 }}>Métricas de tus practicantes y documentos</p>
            </div>

            {/* coming soon card */}
            <div style={{ position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "64px 24px", textAlign: "center", backgroundColor: "rgba(13,14,21,0.55)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-xl)", gap: "12px", opacity: mounted ? 1 : 0, transition: "opacity 400ms ease 80ms" }}>
                {/* glow ambient */}
                <div style={{ position: "absolute", top: "-40px", left: "50%", transform: "translateX(-50%)", width: "200px", height: "200px", borderRadius: "50%", backgroundColor: "var(--color-accent-subtle)", filter: "blur(60px)", opacity: 0.4, pointerEvents: "none" }} />
                {/* shimmer top */}
                <div style={{ position: "absolute", top: 0, left: "20%", right: "20%", height: "1px", background: "linear-gradient(90deg,transparent,var(--color-accent),transparent)", opacity: 0.35 }} />

                <div style={{ position: "relative", width: "48px", height: "48px", borderRadius: "var(--radius-xl)", backgroundColor: "var(--color-accent-subtle)", border: "1px solid var(--color-accent-border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-accent)" }}>
                    <BarChart3 size={22} />
                </div>

                <div style={{ position: "relative" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "5px", marginBottom: "6px" }}>
                        <Sparkles size={10} style={{ color: "var(--color-accent)" }} />
                        <span style={{ fontSize: "9px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "var(--color-accent)" }}>Próximamente</span>
                    </div>
                    <p style={{ fontSize: "14px", fontWeight: 700, color: "var(--color-text)", margin: "0 0 4px", letterSpacing: "-0.02em" }}>
                        Estadísticas detalladas
                    </p>
                    <p style={{ fontSize: "12px", color: "var(--color-text-muted)", margin: 0, maxWidth: "30ch", lineHeight: 1.6 }}>
                        Las métricas avanzadas se construirán en la Etapa 4 del proyecto
                    </p>
                </div>

                {/* pills de preview */}
                <div style={{ position: "relative", display: "flex", flexWrap: "wrap" as const, gap: "6px", justifyContent: "center", marginTop: "4px" }}>
                    {["Documentos por mes", "Tasa de aprobación", "Permanencia de practicantes", "Comparativa de reportes"].map(label => (
                        <span key={label} style={{ padding: "3px 10px", borderRadius: "var(--radius-full)", backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid var(--color-border)", fontSize: "10px", color: "var(--color-text-faint)" }}>
                            {label}
                        </span>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    const session = await getSession(context);
    if (!session || session.user.role !== "EMPRESA") return { redirect: { destination: "/auth/login", permanent: false } };
    return { props: {} };
};