// src/pages/dashboard/empresa/documentos.tsx
import { useState, useEffect } from "react";
import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import EstadoBadge from "@/components/ui/EstadoBadge";
import { useDocumentos } from "@/hooks/useDocumentos";
import {
    FileText, ExternalLink, CheckCircle, XCircle,
    Loader2, ChevronDown, Award,
} from "lucide-react";
import { EstadoDocumento } from "@prisma/client";

/* ─── Avatar inicial ─────────────────────────────────────────────────── */
function StudentAvatar({ name }: { name: string }) {
    return (
        <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "var(--color-role-empresa-bg)", border: "1px solid var(--color-role-empresa-border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: 700, color: "var(--color-role-empresa)", flexShrink: 0 }}>
            {name.charAt(0).toUpperCase()}
        </div>
    );
}

/* ─── Pill badge rápido ──────────────────────────────────────────────── */
function QuickBadge({ count, color, bg, border, label }: { count: number; color: string; bg: string; border: string; label: string }) {
    if (count === 0) return null;
    return (
        <span style={{ display: "inline-flex", alignItems: "center", padding: "2px 8px", borderRadius: "var(--radius-full)", backgroundColor: bg, border: `1px solid ${border}`, fontSize: "10px", fontWeight: 600, color, whiteSpace: "nowrap" as const }}>
            {count} {label}
        </span>
    );
}

/* ─── ActionBtn ──────────────────────────────────────────────────────── */
function ActionBtn({ onClick, disabled, color, bg, border, icon, label }: {
    onClick: () => void; disabled: boolean; color: string; bg: string; border: string; icon: JSX.Element; label: string;
}) {
    const [hov, setHov] = useState(false);
    return (
        <button onClick={onClick} disabled={disabled}
            onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
            style={{ display: "flex", alignItems: "center", gap: "5px", padding: "5px 10px", borderRadius: "var(--radius-lg)", backgroundColor: hov && !disabled ? `color-mix(in oklch,${bg} 140%,transparent)` : bg, border: `1px solid ${border}`, color, fontSize: "11px", fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1, transition: "all var(--transition-fast)" }}>
            {icon}{label}
        </button>
    );
}

/* ─── DocItem ────────────────────────────────────────────────────────── */
function DocItem({ doc, actualizando, onActualizar }: {
    doc: any; actualizando: string | null; onActualizar: (id: string, estado: EstadoDocumento) => void;
}) {
    const [hovLink, setHovLink] = useState(false);
    const isLoading = actualizando === doc.id;

    return (
        <div style={{ padding: "14px 16px", borderTop: "1px solid var(--color-border)" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "10px" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", flex: 1, minWidth: 0 }}>
                    <div style={{ width: "32px", height: "32px", borderRadius: "var(--radius-lg)", backgroundColor: "var(--color-accent-subtle)", border: "1px solid var(--color-accent-border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-accent)", flexShrink: 0, marginTop: "1px" }}>
                        <FileText size={14} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: "12px", fontWeight: 600, color: "var(--color-text)", margin: "0 0 2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{doc.titulo}</p>
                        {doc.descripcion && <p style={{ fontSize: "11px", color: "var(--color-text-muted)", margin: "0 0 4px", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical" }}>{doc.descripcion}</p>}
                        <p style={{ fontSize: "10px", color: "var(--color-text-faint)", margin: 0 }}>
                            {new Date(doc.createdAt).toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" })}
                        </p>
                    </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
                    <EstadoBadge estado={doc.estado} />
                    <a href={doc.archivoUrl} target="_blank" rel="noopener noreferrer" aria-label="Ver documento"
                        onMouseEnter={() => setHovLink(true)} onMouseLeave={() => setHovLink(false)}
                        style={{ width: "26px", height: "26px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)", backgroundColor: hovLink ? "var(--color-accent-subtle)" : "transparent", color: hovLink ? "var(--color-accent)" : "var(--color-text-faint)", transition: "all var(--transition-fast)", textDecoration: "none" }}>
                        <ExternalLink size={12} />
                    </a>
                </div>
            </div>

            {/* acciones */}
            {doc.estado !== "APROBADO" && doc.estado !== "RECHAZADO" && (
                <div style={{ display: "flex", gap: "6px", marginTop: "10px" }}>
                    <ActionBtn onClick={() => onActualizar(doc.id, "APROBADO")} disabled={isLoading}
                        color="var(--color-success)" bg="var(--color-success-bg)" border="rgba(52,201,122,0.22)"
                        icon={isLoading ? <Loader2 size={11} style={{ animation: "spin 0.8s linear infinite" }} /> : <CheckCircle size={11} />}
                        label={isLoading ? "Guardando..." : "Aprobar"} />
                    <ActionBtn onClick={() => onActualizar(doc.id, "RECHAZADO")} disabled={isLoading}
                        color="var(--color-error)" bg="var(--color-error-bg,rgba(220,38,38,0.1))" border="rgba(220,38,38,0.22)"
                        icon={<XCircle size={11} />} label="Rechazar" />
                </div>
            )}
            {(doc.estado === "APROBADO" || doc.estado === "RECHAZADO") && (
                <button onClick={() => onActualizar(doc.id, doc.estado === "APROBADO" ? "RECHAZADO" : "APROBADO")} disabled={isLoading}
                    style={{ marginTop: "8px", fontSize: "10px", color: "var(--color-text-faint)", background: "none", border: "none", cursor: "pointer", padding: 0, transition: "color var(--transition-fast)" }}
                    onMouseEnter={e => (e.currentTarget.style.color = "var(--color-text-muted)")}
                    onMouseLeave={e => (e.currentTarget.style.color = "var(--color-text-faint)")}>
                    Cambiar a {doc.estado === "APROBADO" ? "Rechazado" : "Aprobado"}
                </button>
            )}
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
    );
}

/* ─── PracticaAccordion ──────────────────────────────────────────────── */
function PracticaAccordion({ practica, open, onToggle, actualizando, generando, onActualizar, onCertificado, delay, mounted }: {
    practica: any; open: boolean; onToggle: () => void;
    actualizando: string | null; generando: string | null;
    onActualizar: (id: string, estado: EstadoDocumento) => void;
    onCertificado: (id: string, nombre: string) => void;
    delay: number; mounted: boolean;
}) {
    const [hov, setHov] = useState(false);
    const nombre = practica.estudiante?.user?.name ?? "Estudiante";
    const aprobados = practica.documentos?.filter((d: any) => d.estado === "APROBADO").length ?? 0;
    const pendientes = practica.documentos?.filter((d: any) => d.estado === "PENDIENTE").length ?? 0;
    const total = practica.documentos?.length ?? 0;
    const isGen = generando === practica.id;

    return (
        <div style={{ position: "relative", overflow: "hidden", backgroundColor: "rgba(13,14,21,0.55)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", border: `1px solid ${open ? "var(--color-accent-border)" : "var(--color-border)"}`, borderRadius: "var(--radius-xl)", transition: "border-color 180ms ease", opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(8px)", transitionDelay: `${delay}ms` }}>

            {/* accordion trigger */}
            <button onClick={onToggle} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
                style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", backgroundColor: hov ? "rgba(255,255,255,0.03)" : "transparent", border: "none", cursor: "pointer", transition: "background var(--transition-fast)", textAlign: "left" as const, gap: "10px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <StudentAvatar name={nombre} />
                    <div>
                        <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--color-text)", margin: "0 0 1px", letterSpacing: "-0.01em" }}>{nombre}</p>
                        <p style={{ fontSize: "10px", color: "var(--color-text-faint)", margin: 0 }}>
                            {practica.descripcionCargo ?? "Practicante"} · {total} reporte{total !== 1 ? "s" : ""}
                        </p>
                    </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
                    <QuickBadge count={pendientes} color="var(--color-warning)" bg="rgba(245,166,35,0.1)" border="rgba(245,166,35,0.2)" label="pendiente(s)" />
                    <QuickBadge count={aprobados} color="var(--color-success)" bg="var(--color-success-bg)" border="rgba(52,201,122,0.2)" label="aprobado(s)" />
                    <ChevronDown size={15} style={{ color: "var(--color-text-faint)", transition: "transform 220ms ease", transform: open ? "rotate(180deg)" : "rotate(0deg)" }} />
                </div>
            </button>

            {/* contenido expandible */}
            <div style={{ maxHeight: open ? "2000px" : "0", overflow: "hidden", transition: "max-height 320ms cubic-bezier(0.16,1,0.3,1)" }}>
                {/* barra de certificado */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px", flexWrap: "wrap" as const, padding: "8px 16px", backgroundColor: "rgba(255,255,255,0.02)", borderTop: "1px solid var(--color-border)" }}>
                    <p style={{ fontSize: "11px", color: "var(--color-text-faint)", margin: 0 }}>
                        {aprobados} de {total} reportes aprobados
                    </p>
                    <button onClick={() => onCertificado(practica.id, nombre)} disabled={isGen || aprobados === 0}
                        style={{ display: "flex", alignItems: "center", gap: "5px", padding: "5px 10px", borderRadius: "var(--radius-lg)", backgroundColor: "var(--color-accent-subtle)", border: "1px solid var(--color-accent-border)", color: "var(--color-accent)", fontSize: "11px", fontWeight: 600, cursor: isGen || aprobados === 0 ? "not-allowed" : "pointer", opacity: aprobados === 0 ? 0.45 : 1, transition: "all var(--transition-fast)" }}>
                        {isGen ? <Loader2 size={12} style={{ animation: "spin 0.8s linear infinite" }} /> : <Award size={12} />}
                        {isGen ? "Generando..." : "Generar certificado PDF"}
                    </button>
                </div>

                {/* docs */}
                <div>
                    {practica.documentos.length === 0
                        ? <p style={{ padding: "20px 16px", textAlign: "center", fontSize: "12px", color: "var(--color-text-faint)", margin: 0 }}>Sin reportes enviados aún</p>
                        : practica.documentos.map((doc: any) => (
                            <DocItem key={doc.id} doc={doc} actualizando={actualizando} onActualizar={onActualizar} />
                        ))
                    }
                </div>
            </div>
        </div>
    );
}

/* ══════════════════════════════════════════════════════════════════════
   PÁGINA DOCUMENTOS EMPRESA
══════════════════════════════════════════════════════════════════════ */
export default function DocumentosEmpresa() {
    const { practicas, cargando, refetch } = useDocumentos();
    const [expandidos, setExpandidos] = useState<Record<string, boolean>>({});
    const [actualizando, setActualizando] = useState<string | null>(null);
    const [generando, setGenerando] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => { const t = setTimeout(() => setMounted(true), 40); return () => clearTimeout(t); }, []);

    const toggle = (id: string) => setExpandidos(p => ({ ...p, [id]: !p[id] }));

    const handleActualizar = async (docId: string, estado: EstadoDocumento) => {
        setActualizando(docId);
        await fetch(`/api/documentos/${docId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ estado }) });
        await refetch();
        setActualizando(null);
    };

    const handleCertificado = async (practicaId: string, nombreEstudiante: string) => {
        setGenerando(practicaId);
        try {
            const res = await fetch(`/api/certificado/${practicaId}`);
            if (!res.ok) throw new Error();
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url; a.download = `certificado-${nombreEstudiante.replace(/\s+/g, "-")}.pdf`; a.click();
            URL.revokeObjectURL(url);
        } catch (e) { console.error(e); } finally { setGenerando(null); }
    };

    if (cargando) return (
        <DashboardLayout title="Documentos">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 0" }}>
                <Loader2 size={28} style={{ color: "var(--color-accent)", animation: "spin 0.8s linear infinite" }} />
                <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </div>
        </DashboardLayout>
    );

    return (
        <DashboardLayout title="Documentos">
            {/* header */}
            <div style={{ marginBottom: "18px", opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(-6px)", transition: "opacity 350ms cubic-bezier(0.16,1,0.3,1),transform 350ms cubic-bezier(0.16,1,0.3,1)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                    <span style={{ width: "5px", height: "5px", borderRadius: "50%", backgroundColor: "var(--color-accent)", display: "inline-block" }} />
                    <span style={{ fontSize: "9px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "var(--color-accent)" }}>Revisión</span>
                </div>
                <h2 style={{ fontSize: "clamp(1rem,1.8vw,1.25rem)", fontWeight: 700, color: "var(--color-text)", margin: "0 0 2px", letterSpacing: "-0.02em" }}>Documentos de practicantes</h2>
                <p style={{ fontSize: "12px", color: "var(--color-text-muted)", margin: 0 }}>Revisa, aprueba y certifica los reportes de tus practicantes</p>
            </div>

            {/* empty */}
            {practicas.length === 0 && (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "56px 24px", textAlign: "center", backgroundColor: "rgba(13,14,21,0.55)", backdropFilter: "blur(12px)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-xl)", gap: "10px", opacity: mounted ? 1 : 0, transition: "opacity 400ms ease 100ms" }}>
                    <div style={{ width: "44px", height: "44px", borderRadius: "var(--radius-xl)", backgroundColor: "var(--color-surface-3)", border: "1px solid var(--color-border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-text-faint)" }}>
                        <FileText size={20} />
                    </div>
                    <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--color-text)", margin: 0 }}>Sin practicantes asignados</p>
                    <p style={{ fontSize: "12px", color: "var(--color-text-muted)", margin: 0, maxWidth: "30ch", lineHeight: 1.6 }}>Los documentos aparecerán aquí cuando la universidad asigne practicantes</p>
                </div>
            )}

            {/* accordion list */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {practicas.map((p: any, i: number) => (
                    <PracticaAccordion key={p.id} practica={p} open={!!expandidos[p.id]} onToggle={() => toggle(p.id)}
                        actualizando={actualizando} generando={generando}
                        onActualizar={handleActualizar} onCertificado={handleCertificado}
                        delay={i * 50} mounted={mounted} />
                ))}
            </div>
        </DashboardLayout>
    );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    const session = await getSession(context);
    if (!session || session.user.role !== "EMPRESA") return { redirect: { destination: "/auth/login", permanent: false } };
    return { props: {} };
};