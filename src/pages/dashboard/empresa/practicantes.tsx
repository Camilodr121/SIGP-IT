// src/pages/dashboard/empresa/practicantes.tsx
import { useEffect, useState } from "react";
import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import { useDocumentos } from "@/hooks/useDocumentos";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { GraduationCap, FileText, CheckCircle, Loader2 } from "lucide-react";

/* ─── PracticanteCard ────────────────────────────────────────────────── */
function PracticanteCard({ practica, delay, mounted }: { practica: any; delay: number; mounted: boolean }) {
    const [hov, setHov] = useState(false);
    const nombre = practica.estudiante?.user?.name ?? "Estudiante";
    const email = practica.estudiante?.user?.email ?? "";
    const aprobados = practica.documentos?.filter((d: any) => d.estado === "APROBADO").length ?? 0;
    const total = practica.documentos?.length ?? 0;
    const activa = practica.activa;

    return (
        <div
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
            style={{
                display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" as const,
                backgroundColor: hov ? "rgba(255,255,255,0.05)" : "rgba(13,14,21,0.55)",
                backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
                border: `1px solid ${hov ? "var(--color-accent-border)" : "var(--color-border)"}`,
                borderRadius: "var(--radius-xl)", padding: "14px 16px",
                transition: "all 180ms cubic-bezier(0.16,1,0.3,1)",
                transform: hov ? "translateY(-1px)" : "translateY(0)",
                boxShadow: hov ? "0 6px 20px rgba(0,0,0,0.3)" : "none",
                opacity: mounted ? 1 : 0,
                transitionDelay: `${delay}ms`,
            }}
        >
            {/* left: avatar + info */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "var(--color-role-empresa-bg)", border: "1px solid var(--color-role-empresa-border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: 700, color: "var(--color-role-empresa)", flexShrink: 0 }}>
                    {nombre.charAt(0).toUpperCase()}
                </div>
                <div>
                    <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--color-text)", margin: "0 0 1px", letterSpacing: "-0.01em" }}>{nombre}</p>
                    <p style={{ fontSize: "10px", color: "var(--color-text-faint)", margin: 0 }}>{email}</p>
                </div>
            </div>

            {/* right: stats + badge */}
            <div style={{ display: "flex", alignItems: "center", gap: "16px", flexShrink: 0 }}>
                {/* stat: reportes */}
                <div style={{ textAlign: "center" as const }}>
                    <p style={{ fontSize: "15px", fontWeight: 700, color: "var(--color-text)", margin: "0 0 1px", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{total}</p>
                    <p style={{ fontSize: "9px", color: "var(--color-text-faint)", margin: 0, display: "flex", alignItems: "center", gap: "3px", justifyContent: "center" }}>
                        <FileText size={9} />Reportes
                    </p>
                </div>
                {/* divider */}
                <div style={{ width: "1px", height: "28px", backgroundColor: "var(--color-border)" }} />
                {/* stat: aprobados */}
                <div style={{ textAlign: "center" as const }}>
                    <p style={{ fontSize: "15px", fontWeight: 700, color: "var(--color-success)", margin: "0 0 1px", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{aprobados}</p>
                    <p style={{ fontSize: "9px", color: "var(--color-text-faint)", margin: 0, display: "flex", alignItems: "center", gap: "3px", justifyContent: "center" }}>
                        <CheckCircle size={9} />Aprobados
                    </p>
                </div>
                {/* divider */}
                <div style={{ width: "1px", height: "28px", backgroundColor: "var(--color-border)" }} />
                {/* estado badge */}
                <span style={{
                    display: "inline-flex", alignItems: "center", padding: "3px 9px",
                    borderRadius: "var(--radius-full)",
                    backgroundColor: activa ? "var(--color-success-bg)" : "rgba(255,255,255,0.04)",
                    border: activa ? "1px solid rgba(52,201,122,0.22)" : "1px solid var(--color-border)",
                    fontSize: "10px", fontWeight: 600,
                    color: activa ? "var(--color-success)" : "var(--color-text-faint)",
                }}>
                    {activa
                        ? <><span style={{ width: "5px", height: "5px", borderRadius: "50%", backgroundColor: "var(--color-success)", display: "inline-block", marginRight: "4px", animation: "pulse-dot 1.5s ease-in-out infinite" }} />Activo</>
                        : "Finalizado"
                    }
                    <style>{`@keyframes pulse-dot{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
                </span>
            </div>
        </div>
    );
}

/* ══════════════════════════════════════════════════════════════════════
   PÁGINA PRACTICANTES EMPRESA
══════════════════════════════════════════════════════════════════════ */
export default function PracticantesEmpresa() {
    const { practicas, cargando } = useDocumentos();
    const [mounted, setMounted] = useState(false);
    useEffect(() => { const t = setTimeout(() => setMounted(true), 40); return () => clearTimeout(t); }, []);

    return (
        <DashboardLayout title="Practicantes">

            {/* header */}
            <div style={{ marginBottom: "18px", opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(-6px)", transition: "opacity 350ms cubic-bezier(0.16,1,0.3,1), transform 350ms cubic-bezier(0.16,1,0.3,1)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                    <span style={{ width: "5px", height: "5px", borderRadius: "50%", backgroundColor: "var(--color-role-empresa)", display: "inline-block" }} />
                    <span style={{ fontSize: "9px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "var(--color-role-empresa)" }}>Equipo</span>
                </div>
                <h2 style={{ fontSize: "clamp(1rem,1.8vw,1.25rem)", fontWeight: 700, color: "var(--color-text)", margin: "0 0 2px", letterSpacing: "-0.02em" }}>Mis practicantes</h2>
                <p style={{ fontSize: "12px", color: "var(--color-text-muted)", margin: 0 }}>Estudiantes asignados a tu empresa</p>
            </div>

            {/* loader */}
            {cargando && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 0" }}>
                    <Loader2 size={28} style={{ color: "var(--color-accent)", animation: "spin 0.8s linear infinite" }} />
                    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                </div>
            )}

            {/* empty */}
            {!cargando && practicas.length === 0 && (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "56px 24px", textAlign: "center", backgroundColor: "rgba(13,14,21,0.55)", backdropFilter: "blur(12px)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-xl)", gap: "10px", opacity: mounted ? 1 : 0, transition: "opacity 400ms ease 100ms" }}>
                    <div style={{ width: "44px", height: "44px", borderRadius: "var(--radius-xl)", backgroundColor: "var(--color-surface-3)", border: "1px solid var(--color-border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-text-faint)" }}>
                        <GraduationCap size={20} />
                    </div>
                    <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--color-text)", margin: 0 }}>Sin practicantes</p>
                    <p style={{ fontSize: "12px", color: "var(--color-text-muted)", margin: 0, maxWidth: "30ch", lineHeight: 1.6 }}>
                        Los estudiantes asignados a tu empresa aparecerán aquí
                    </p>
                </div>
            )}

            {/* lista */}
            {!cargando && practicas.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {practicas.map((p: any, i: number) => (
                        <PracticanteCard key={p.id} practica={p} delay={i * 45} mounted={mounted} />
                    ))}
                </div>
            )}
        </DashboardLayout>
    );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    const session = await getSession(context);
    if (!session || session.user.role !== "EMPRESA") return { redirect: { destination: "/auth/login", permanent: false } };
    return { props: {} };
};