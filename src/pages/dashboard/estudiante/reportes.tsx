//src/pages/dashboard/estudiante/reportes.tsx
import { useState, useEffect } from "react";
import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import EstadoBadge from "@/components/ui/EstadoBadge";
import ModalSubirDocumento from "@/components/documentos/ModalSubirDocumento";
import { useDocumentos } from "@/hooks/useDocumentos";
import { Plus, FileText, ExternalLink, MessageSquare, Loader2, Building2, Upload, Award, ChevronDown, ChevronUp } from "lucide-react";

/* ─── DocRow ─────────────────────────────────────────────────────────── */
function DocRow({ doc, delay, mounted }: { doc: any; delay: number; mounted: boolean }) {
    const [hov, setHov] = useState(false);
    const [hovLink, setHovLink] = useState(false);

    return (
        <div
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
            style={{
                position: "relative", overflow: "hidden",
                backgroundColor: hov ? "rgba(255,255,255,0.05)" : "rgba(13,14,21,0.55)",
                backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
                border: `1px solid ${hov ? "var(--color-accent-border)" : "var(--color-border)"}`,
                borderRadius: "var(--radius-xl)", padding: "14px 16px",
                transition: "all 180ms cubic-bezier(0.16,1,0.3,1)",
                opacity: mounted ? 1 : 0,
                transform: mounted ? "translateY(0)" : "translateY(8px)",
                transitionDelay: `${delay}ms`,
            }}
        >
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
                {/* icon + info */}
                <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", flex: 1, minWidth: 0 }}>
                    <div style={{ width: "34px", height: "34px", borderRadius: "var(--radius-lg)", backgroundColor: "var(--color-accent-subtle)", border: "1px solid var(--color-accent-border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-accent)", flexShrink: 0, marginTop: "1px" }}>
                        <FileText size={16} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--color-text)", margin: "0 0 2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {doc.titulo}
                        </p>
                        {doc.descripcion && (
                            <p style={{ fontSize: "11px", color: "var(--color-text-muted)", margin: "0 0 4px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                                {doc.descripcion}
                            </p>
                        )}
                        <p style={{ fontSize: "10px", color: "var(--color-text-faint)", margin: 0 }}>
                            {new Date(doc.createdAt).toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" })}
                        </p>
                    </div>
                </div>

                {/* actions */}
                <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
                    <EstadoBadge estado={doc.estado} />
                    {doc.archivoUrl && (
                        <a href={doc.archivoUrl} target="_blank" rel="noopener noreferrer" aria-label="Ver documento"
                            onMouseEnter={() => setHovLink(true)} onMouseLeave={() => setHovLink(false)}
                            style={{ width: "28px", height: "28px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)", backgroundColor: hovLink ? "var(--color-accent-subtle)" : "transparent", color: hovLink ? "var(--color-accent)" : "var(--color-text-faint)", transition: "all var(--transition-fast)", textDecoration: "none" }}>
                            <ExternalLink size={13} />
                        </a>
                    )}
                </div>
            </div>

            {/* retroalimentación */}
            {doc.comentarios && (
                <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px solid var(--color-border)", display: "flex", alignItems: "flex-start", gap: "8px" }}>
                    <MessageSquare size={12} style={{ color: "var(--color-role-universidad)", marginTop: "2px", flexShrink: 0 }} />
                    <div>
                        <p style={{ fontSize: "10px", fontWeight: 600, color: "var(--color-role-universidad)", margin: "0 0 3px", letterSpacing: "0.02em" }}>
                            Retroalimentación del coordinador
                        </p>
                        <p style={{ fontSize: "12px", color: "var(--color-text-muted)", margin: 0, lineHeight: 1.5 }}>{doc.comentarios}</p>
                    </div>
                </div>
            )}
        </div>
    );
}

/* ─── PracticaHistorialSection ────────────────────────────────────── */
function PracticaHistorialSection({ practica, delay, mounted }: { practica: any; delay: number; mounted: boolean }) {
    const [expandida, setExpandida] = useState(true);
    const docs = practica.documentos ?? [];

    return (
        <div style={{
            border: "1px solid var(--color-border)", borderRadius: "var(--radius-xl)", overflow: "hidden",
            backgroundColor: "rgba(13,14,21,0.35)",
            opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(8px)",
            transition: `opacity 400ms ease ${delay}ms, transform 400ms ease ${delay}ms`,
        }}>
            {/* Header colapsable */}
            <button onClick={() => setExpandida(p => !p)} style={{
                width: "100%", padding: "12px 16px", display: "flex", alignItems: "center", gap: "10px",
                background: "transparent", border: "none", cursor: "pointer", textAlign: "left",
                borderBottom: expandida ? "1px solid var(--color-border)" : "none",
            }}>
                <div style={{ width: "30px", height: "30px", borderRadius: "var(--radius-lg)", backgroundColor: "var(--color-surface-3)", border: "1px solid var(--color-border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-text-faint)", flexShrink: 0 }}>
                    <Building2 size={13} />
                </div>
                <div style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                        <p style={{ fontSize: "12px", fontWeight: 600, color: "var(--color-text)", margin: 0 }}>
                            {practica.empresa?.nombreEmpresa ?? "Empresa"}
                        </p>
                        <span style={{ display: "inline-flex", alignItems: "center", padding: "1px 7px", borderRadius: "var(--radius-full)", backgroundColor: "var(--color-surface-3)", border: "1px solid var(--color-border)", fontSize: "9px", fontWeight: 600, color: "var(--color-text-faint)" }}>
                            Finalizada
                        </span>
                        {practica.quedoContratado && (
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "3px", padding: "1px 7px", borderRadius: "var(--radius-full)", backgroundColor: "var(--color-success-bg)", border: "1px solid rgba(52,201,122,0.2)", fontSize: "9px", fontWeight: 600, color: "var(--color-success)" }}>
                                <Award size={9} /> Contratado
                            </span>
                        )}
                    </div>
                    <p style={{ fontSize: "10px", color: "var(--color-text-faint)", margin: "2px 0 0" }}>
                        {docs.length} documento{docs.length !== 1 ? "s" : ""} entregado{docs.length !== 1 ? "s" : ""}
                        {practica.fechaInicio && ` · ${new Date(practica.fechaInicio).toLocaleDateString("es-CO", { month: "long", year: "numeric" })}`}
                    </p>
                </div>
                {expandida ? <ChevronUp size={14} style={{ color: "var(--color-text-faint)", flexShrink: 0 }} /> : <ChevronDown size={14} style={{ color: "var(--color-text-faint)", flexShrink: 0 }} />}
            </button>

            {expandida && (
                <div style={{ padding: "12px" }}>
                    {docs.length === 0 ? (
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "28px 16px", gap: "6px", textAlign: "center" }}>
                            <FileText size={20} style={{ color: "var(--color-text-faint)" }} />
                            <p style={{ fontSize: "12px", color: "var(--color-text-muted)", margin: 0 }}>No se entregaron documentos en esta práctica</p>
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            {docs.map((doc: any, i: number) => (
                                <DocRow key={doc.id} doc={doc} delay={i * 30} mounted={true} />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

/* ══════════════════════════════════════════════════════════════════════
   PÁGINA REPORTES ESTUDIANTE
══════════════════════════════════════════════════════════════════════ */
export default function ReportesEstudiante() {
    const { practicas, cargando, refetch } = useDocumentos();
    const [modalAbierto, setModalAbierto] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => { const t = setTimeout(() => setMounted(true), 40); return () => clearTimeout(t); }, []);

    const practicaActiva = practicas.find((p: any) => p.activa);
    const practicasFinalizadas = practicas.filter((p: any) => !p.activa);
    const handleExito = () => { setModalAbierto(false); refetch(); };
    const [hovBtn, setHovBtn] = useState(false);

    const totalDocs = practicas.reduce((acc: number, p: any) => acc + (p.documentos?.length ?? 0), 0);
    const totalAprobados = practicas.reduce((acc: number, p: any) => acc + (p.documentos?.filter((d: any) => d.estado === "APROBADO").length ?? 0), 0);

    if (cargando) {
        return (
            <DashboardLayout title="Mis Reportes">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 0" }}>
                    <Loader2 size={28} style={{ color: "var(--color-accent)", animation: "spin 0.8s linear infinite" }} />
                    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Mis Reportes">

            {/* header */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" as const, marginBottom: "18px", opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(-6px)", transition: "opacity 350ms cubic-bezier(0.16,1,0.3,1), transform 350ms cubic-bezier(0.16,1,0.3,1)" }}>
                <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                        <span style={{ width: "5px", height: "5px", borderRadius: "50%", backgroundColor: "var(--color-accent)", display: "inline-block" }} />
                        <span style={{ fontSize: "9px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "var(--color-accent)" }}>Documentación</span>
                    </div>
                    <h2 style={{ fontSize: "clamp(1rem,1.8vw,1.25rem)", fontWeight: 700, color: "var(--color-text)", margin: "0 0 2px", letterSpacing: "-0.02em" }}>Mis reportes</h2>
                    <p style={{ fontSize: "12px", color: "var(--color-text-muted)", margin: 0 }}>
                        Historial completo de todos tus reportes de práctica
                        {totalDocs > 0 && ` · ${totalDocs} doc${totalDocs !== 1 ? "s" : ""}, ${totalAprobados} aprobado${totalAprobados !== 1 ? "s" : ""}`}
                    </p>
                </div>
                {practicaActiva && (
                    <button
                        onClick={() => setModalAbierto(true)}
                        onMouseEnter={() => setHovBtn(true)}
                        onMouseLeave={() => setHovBtn(false)}
                        style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", backgroundColor: "var(--color-accent)", color: "#fff", fontWeight: 700, fontSize: "12px", borderRadius: "var(--radius-lg)", border: "none", cursor: "pointer", boxShadow: `0 4px 16px rgba(52,201,122,0.25)`, transition: "filter var(--transition-fast), transform var(--transition-fast)", filter: hovBtn ? "brightness(1.1)" : "brightness(1)", transform: hovBtn ? "translateY(-1px)" : "translateY(0)", flexShrink: 0 }}>
                        <Plus size={14} />Subir reporte
                    </button>
                )}
            </div>

            {/* Sin ninguna práctica */}
            {practicas.length === 0 && (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "56px 24px", textAlign: "center", backgroundColor: "rgba(13,14,21,0.55)", backdropFilter: "blur(12px)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-xl)", gap: "10px", opacity: mounted ? 1 : 0, transition: "opacity 400ms ease 100ms" }}>
                    <div style={{ width: "44px", height: "44px", borderRadius: "var(--radius-xl)", backgroundColor: "var(--color-surface-3)", border: "1px solid var(--color-border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-text-faint)" }}>
                        <Building2 size={20} />
                    </div>
                    <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--color-text)", margin: 0 }}>Sin práctica registrada</p>
                    <p style={{ fontSize: "12px", color: "var(--color-text-muted)", margin: 0, maxWidth: "32ch", lineHeight: 1.6 }}>
                        Tu coordinador universitario debe asignarte una práctica para que puedas subir reportes.
                    </p>
                </div>
            )}

            {/* práctica activa */}
            {practicaActiva && (
                <div style={{ opacity: mounted ? 1 : 0, transition: "opacity 350ms ease 60ms", marginBottom: "16px" }}>
                    {/* empresa strip */}
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", backgroundColor: "rgba(13,14,21,0.45)", backdropFilter: "blur(8px)", border: "1px solid var(--color-accent-border)", borderRadius: "var(--radius-xl)", padding: "10px 14px", marginBottom: "14px" }}>
                        <div style={{ width: "32px", height: "32px", borderRadius: "var(--radius-lg)", backgroundColor: "var(--color-accent-subtle)", border: "1px solid var(--color-accent-border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-accent)", flexShrink: 0 }}>
                            <Building2 size={14} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: "12px", fontWeight: 600, color: "var(--color-text)", margin: 0 }}>{practicaActiva.empresa?.nombreEmpresa ?? "Empresa"}</p>
                            <div style={{ display: "flex", alignItems: "center", gap: "5px", marginTop: "1px" }}>
                                <span style={{ width: "5px", height: "5px", borderRadius: "50%", backgroundColor: "var(--color-success)", display: "inline-block", animation: "pulse-dot 1.5s ease-in-out infinite" }} />
                                <p style={{ fontSize: "10px", color: "var(--color-success)", margin: 0, fontWeight: 600 }}>Práctica activa</p>
                                <style>{`@keyframes pulse-dot{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
                            </div>
                        </div>
                        <p style={{ fontSize: "11px", color: "var(--color-text-faint)", margin: 0, flexShrink: 0 }}>
                            {practicaActiva.documentos?.length ?? 0} doc{(practicaActiva.documentos?.length ?? 0) !== 1 ? "s" : ""}
                        </p>
                    </div>

                    {/* sin documentos en práctica activa */}
                    {practicaActiva.documentos.length === 0 ? (
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "48px 24px", textAlign: "center", backgroundColor: "rgba(13,14,21,0.45)", backdropFilter: "blur(8px)", border: "1px dashed var(--color-border)", borderRadius: "var(--radius-xl)", gap: "8px" }}>
                            <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "var(--color-surface-3)", border: "1px solid var(--color-border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-text-faint)" }}>
                                <Upload size={18} />
                            </div>
                            <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--color-text)", margin: 0 }}>Sin reportes aún</p>
                            <p style={{ fontSize: "12px", color: "var(--color-text-muted)", margin: 0 }}>
                                Usa el botón <span style={{ color: "var(--color-accent)", fontWeight: 600 }}>"Subir reporte"</span> para comenzar
                            </p>
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                            {practicaActiva.documentos.map((doc: any, i: number) => (
                                <DocRow key={doc.id} doc={doc} delay={i * 40} mounted={mounted} />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Prácticas finalizadas con sus documentos */}
            {practicasFinalizadas.length > 0 && (
                <div style={{ opacity: mounted ? 1 : 0, transition: "opacity 400ms ease 200ms" }}>
                    {practicaActiva && (
                        <p style={{ fontSize: "11px", fontWeight: 600, color: "var(--color-text-faint)", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 10px" }}>
                            Prácticas anteriores
                        </p>
                    )}
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        {practicasFinalizadas.map((p: any, i: number) => (
                            <PracticaHistorialSection key={p.id} practica={p} delay={i * 60} mounted={mounted} />
                        ))}
                    </div>
                </div>
            )}

            {/* modal */}
            {modalAbierto && practicaActiva && (
                <ModalSubirDocumento
                    practicaId={practicaActiva.id}
                    onClose={() => setModalAbierto(false)}
                    onSuccess={handleExito}
                />
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