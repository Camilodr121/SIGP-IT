// src/pages/dashboard/universidad/reportes.tsx
import { useState, useCallback } from "react";
import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useDocumentos } from "@/hooks/useDocumentos";
import { EstadoDocumento } from "@prisma/client";
import {
    FileText, ExternalLink, MessageSquare, Loader2,
    CheckCircle, Send, ChevronDown, ChevronUp, XCircle,
    Clock, Award,
} from "lucide-react";

/* ─── Design tokens universidad ───────────────────────────────── */
const UNI = "var(--color-role-universidad)";
const UNI_BG = "var(--color-role-universidad-bg)";
const UNI_BORDER = "rgba(167,139,250,0.25)";

/* ─── Fases ────────────────────────────────────────────────────── */
const FASES = [
    { key: "INICIACION",    label: "Iniciación",        icon: <FileText size={12} />,  color: UNI,                         bg: UNI_BG,                                border: UNI_BORDER },
    { key: "INFORME_1",     label: "Primer Informe",    icon: <FileText size={12} />,  color: "var(--color-accent)",       bg: "var(--color-accent-subtle)",          border: "var(--color-accent-border)" },
    { key: "INFORME_2",     label: "Segundo Informe",   icon: <FileText size={12} />,  color: "var(--color-warning)",      bg: "rgba(245,166,35,0.10)",               border: "rgba(245,166,35,0.25)" },
    { key: "INFORME_3",     label: "Tercer Informe",    icon: <FileText size={12} />,  color: "var(--color-role-empresa)", bg: "var(--color-role-empresa-bg)",        border: "rgba(52,211,153,0.25)" },
    { key: "INFORME_FINAL", label: "Informe Final",     icon: <Award size={12} />,     color: "var(--color-success)",      bg: "var(--color-success-bg)",             border: "rgba(52,201,122,0.25)" },
];

/* ─── Estado badge ─────────────────────────────────────────────── */
const ESTADO_CFG: Record<string, { label: string; color: string; bg: string; border: string }> = {
    PENDIENTE:   { label: "Pendiente",   color: "var(--color-warning)",      bg: "rgba(245,166,35,0.10)",  border: "rgba(245,166,35,0.25)" },
    EN_REVISION: { label: "En revisión", color: "var(--color-accent)",       bg: "var(--color-accent-subtle)", border: "var(--color-accent-border)" },
    APROBADO:    { label: "Aprobado",    color: "var(--color-success)",      bg: "var(--color-success-bg)", border: "rgba(52,201,122,0.25)" },
    RECHAZADO:   { label: "Rechazado",   color: "var(--color-error)",        bg: "var(--color-error-bg)",   border: "rgba(240,77,77,0.25)" },
};

function EstadoPill({ estado }: { estado: string }) {
    const cfg = ESTADO_CFG[estado] ?? ESTADO_CFG.PENDIENTE;
    return (
        <span style={{
            display: "inline-flex", alignItems: "center", gap: "4px",
            padding: "2px 8px", borderRadius: "var(--radius-full)",
            fontSize: "10px", fontWeight: 600,
            backgroundColor: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
            whiteSpace: "nowrap",
        }}>
            {estado === "APROBADO" && <CheckCircle size={9} />}
            {estado === "RECHAZADO" && <XCircle size={9} />}
            {estado === "PENDIENTE" && <Clock size={9} />}
            {cfg.label}
        </span>
    );
}

/* ─── DocRow: fila de un documento con acciones ───────────────── */
function DocRow({ doc, onAprobar, onRechazar, onComentar, guardando }: {
    doc: any; onAprobar: () => void; onRechazar: () => void; onComentar: (texto: string) => void; guardando: boolean;
}) {
    const [showForm, setShowForm] = useState(false);
    const [texto, setTexto] = useState(doc.comentarios ?? "");
    const [hov, setHov] = useState(false);

    return (
        <div
            onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
            style={{
                padding: "12px 14px",
                backgroundColor: hov ? "rgba(167,139,250,0.04)" : "rgba(255,255,255,0.015)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-lg)",
                transition: "all 150ms ease",
            }}
        >
            {/* fila principal */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", flex: 1, minWidth: 0 }}>
                    <div style={{ width: "30px", height: "30px", borderRadius: "var(--radius-md)", backgroundColor: UNI_BG, border: `1px solid ${UNI_BORDER}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: UNI }}>
                        <FileText size={13} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: "12px", fontWeight: 600, color: "var(--color-text)", margin: "0 0 2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{doc.titulo}</p>
                        {doc.descripcion && <p style={{ fontSize: "10px", color: "var(--color-text-faint)", margin: "0 0 2px" }}>{doc.descripcion}</p>}
                        <p style={{ fontSize: "10px", color: "var(--color-text-faint)", margin: 0 }}>
                            {new Date(doc.createdAt).toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" })}
                        </p>
                        {doc.comentarios && !showForm && (
                            <div style={{ marginTop: "6px", padding: "6px 8px", backgroundColor: "rgba(79,110,247,0.06)", border: "1px solid rgba(79,110,247,0.15)", borderRadius: "var(--radius-md)" }}>
                                <p style={{ fontSize: "10px", color: "var(--color-text-muted)", margin: 0 }}>💬 {doc.comentarios}</p>
                            </div>
                        )}
                    </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
                    <EstadoPill estado={doc.estado} />
                    <a href={doc.archivoUrl} target="_blank" rel="noopener noreferrer"
                        style={{ width: "28px", height: "28px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)", color: "var(--color-text-faint)", transition: "all 150ms ease" }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = UNI; e.currentTarget.style.color = UNI; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--color-border)"; e.currentTarget.style.color = "var(--color-text-faint)"; }}
                        aria-label="Ver documento">
                        <ExternalLink size={13} />
                    </a>
                </div>
            </div>

            {/* acciones */}
            <div style={{ display: "flex", gap: "6px", marginTop: "10px", flexWrap: "wrap" }}>
                {doc.estado !== "APROBADO" && (
                    <button onClick={onAprobar} disabled={guardando}
                        style={{ display: "flex", alignItems: "center", gap: "5px", padding: "4px 10px", borderRadius: "var(--radius-md)", border: "1px solid rgba(52,201,122,0.3)", backgroundColor: "var(--color-success-bg)", color: "var(--color-success)", fontSize: "10px", fontWeight: 600, cursor: "pointer", transition: "all 150ms ease" }}
                        onMouseEnter={e => { e.currentTarget.style.backgroundColor = "rgba(52,201,122,0.2)"; }}
                        onMouseLeave={e => { e.currentTarget.style.backgroundColor = "var(--color-success-bg)"; }}>
                        <CheckCircle size={11} />Aprobar
                    </button>
                )}
                {doc.estado !== "RECHAZADO" && (
                    <button
                        disabled={guardando}
                        onClick={onRechazar}
                        style={{ display: "flex", alignItems: "center", gap: "5px", padding: "4px 10px", borderRadius: "var(--radius-md)", border: "1px solid rgba(240,77,77,0.25)", backgroundColor: "var(--color-error-bg)", color: "var(--color-error)", fontSize: "10px", fontWeight: 600, cursor: "pointer", transition: "all 150ms ease" }}
                        onMouseEnter={e => { e.currentTarget.style.backgroundColor = "rgba(240,77,77,0.2)"; }}
                        onMouseLeave={e => { e.currentTarget.style.backgroundColor = "var(--color-error-bg)"; }}>
                        <XCircle size={11} />Rechazar
                    </button>
                )}
                <button onClick={() => { setShowForm(p => !p); setTexto(doc.comentarios ?? ""); }}
                    style={{ display: "flex", alignItems: "center", gap: "5px", padding: "4px 10px", borderRadius: "var(--radius-md)", border: `1px solid ${UNI_BORDER}`, backgroundColor: showForm ? UNI_BG : "transparent", color: UNI, fontSize: "10px", fontWeight: 600, cursor: "pointer", transition: "all 150ms ease" }}>
                    <MessageSquare size={11} />{doc.comentarios ? "Editar retroalimentación" : "Añadir retroalimentación"}
                </button>
            </div>

            {/* formulario comentario */}
            {showForm && (
                <div style={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "6px" }}>
                    <textarea value={texto} onChange={e => setTexto(e.target.value)}
                        placeholder="Escribe tu retroalimentación para el estudiante..."
                        rows={3}
                        style={{ width: "100%", padding: "10px 12px", backgroundColor: "rgba(13,14,21,0.6)", backdropFilter: "blur(8px)", border: `1px solid ${UNI_BORDER}`, borderRadius: "var(--radius-lg)", color: "var(--color-text)", fontSize: "12px", outline: "none", resize: "none", transition: "border-color 150ms" }}
                        onFocus={e => { e.currentTarget.style.borderColor = UNI; }}
                        onBlur={e => { e.currentTarget.style.borderColor = UNI_BORDER; }}
                    />
                    <div style={{ display: "flex", gap: "6px" }}>
                        <button onClick={() => setShowForm(false)}
                            style={{ padding: "5px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)", backgroundColor: "transparent", color: "var(--color-text-muted)", fontSize: "10px", fontWeight: 600, cursor: "pointer" }}>
                            Cancelar
                        </button>
                        <button onClick={() => { onComentar(texto); setShowForm(false); }} disabled={guardando || !texto.trim()}
                            style={{ display: "flex", alignItems: "center", gap: "5px", padding: "5px 12px", borderRadius: "var(--radius-md)", border: `1px solid ${UNI_BORDER}`, backgroundColor: UNI, color: "#fff", fontSize: "10px", fontWeight: 600, cursor: "pointer", opacity: guardando || !texto.trim() ? 0.5 : 1, transition: "filter 150ms" }}
                            onMouseEnter={e => { if (!guardando) e.currentTarget.style.filter = "brightness(1.12)"; }}
                            onMouseLeave={e => { e.currentTarget.style.filter = "brightness(1)"; }}>
                            {guardando ? <Loader2 size={10} style={{ animation: "spin 0.8s linear infinite" }} /> : <Send size={10} />}
                            Enviar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

/* ─── FaseAccordion ────────────────────────────────────────────── */
function FaseAccordion({ fase, docs, practicaId, refetch }: {
    fase: typeof FASES[0]; docs: any[]; practicaId: string; refetch: () => void;
}) {
    const [open, setOpen] = useState(false);
    const [guardando, setGuardando] = useState(false);
    const pendientes = docs.filter(d => d.estado === "PENDIENTE").length;
    const aprobados = docs.filter(d => d.estado === "APROBADO").length;

    const actualizarDoc = useCallback(async (docId: string, estado: EstadoDocumento, comentarios?: string) => {
        setGuardando(true);
        try {
            await fetch(`/api/documentos/${docId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ estado, ...(comentarios !== undefined && { comentarios }) }),
            });
            refetch();
        } finally {
            setGuardando(false);
        }
    }, [refetch]);

    return (
        <div style={{ border: `1px solid ${open ? fase.border : "var(--color-border)"}`, borderRadius: "var(--radius-xl)", overflow: "hidden", backgroundColor: "rgba(13,14,21,0.55)", backdropFilter: "blur(12px)", transition: "border-color 200ms ease" }}>
            {open && <div style={{ position: "absolute", top: 0, left: "10%", right: "10%", height: "1px", background: `linear-gradient(90deg,transparent,${fase.color},transparent)`, opacity: 0.4, pointerEvents: "none" }} />}

            {/* header */}
            <button onClick={() => setOpen(p => !p)}
                style={{ width: "100%", display: "flex", alignItems: "center", gap: "12px", padding: "13px 16px", backgroundColor: open ? "rgba(255,255,255,0.02)" : "transparent", border: "none", borderBottom: open && docs.length > 0 ? "1px solid var(--color-border)" : "none", cursor: "pointer", transition: "background 150ms ease" }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: fase.bg, border: `1.5px solid ${fase.border}`, display: "flex", alignItems: "center", justifyContent: "center", color: fase.color, flexShrink: 0 }}>
                    {fase.icon}
                </div>
                <div style={{ flex: 1, textAlign: "left" }}>
                    <p style={{ fontSize: "12px", fontWeight: 700, color: "var(--color-text)", margin: 0 }}>{fase.label}</p>
                    <p style={{ fontSize: "10px", color: "var(--color-text-faint)", margin: "1px 0 0" }}>
                        {docs.length === 0 ? "Sin entregas" : `${docs.length} entrega${docs.length > 1 ? "s" : ""} · ${aprobados} aprobado${aprobados !== 1 ? "s" : ""}`}
                    </p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    {pendientes > 0 && (
                        <span style={{ padding: "2px 8px", borderRadius: "var(--radius-full)", backgroundColor: "rgba(245,166,35,0.10)", border: "1px solid rgba(245,166,35,0.25)", fontSize: "10px", fontWeight: 600, color: "var(--color-warning)" }}>
                            {pendientes} pendiente{pendientes > 1 ? "s" : ""}
                        </span>
                    )}
                    {aprobados === docs.length && docs.length > 0 && (
                        <CheckCircle size={13} style={{ color: "var(--color-success)" }} />
                    )}
                    <span style={{ display: "inline-block", transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 200ms ease", color: "var(--color-text-faint)", fontSize: "14px" }}>⌄</span>
                </div>
            </button>

            {/* docs */}
            {open && (
                <div style={{ padding: "10px" }}>
                    {docs.length === 0 ? (
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "24px", gap: "6px", textAlign: "center" }}>
                            <FileText size={20} style={{ color: "var(--color-text-faint)" }} />
                            <p style={{ fontSize: "11px", color: "var(--color-text-muted)", margin: 0 }}>Sin documentos entregados en esta fase</p>
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                            {docs.map(doc => (
                                <DocRow key={doc.id} doc={doc} guardando={guardando}
                                    onAprobar={() => actualizarDoc(doc.id, "APROBADO")}
                                    onRechazar={() => actualizarDoc(doc.id, "RECHAZADO")}
                                    onComentar={(texto) => actualizarDoc(doc.id, "EN_REVISION", texto)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

/* ─── Card por práctica ─────────────────────────────────────────── */
function PracticaCard({ practica, refetch }: { practica: any; refetch: () => void }) {
    const [expandida, setExpandida] = useState(false);
    const docs = practica.documentos ?? [];
    const pendientes = docs.filter((d: any) => d.estado === "PENDIENTE").length;

    // Clasificar docs por tipoDocumento
    const docsPorFase = FASES.map(f => docs.filter((d: any) => d.tipoDocumento === f.key));

    const nombre = practica.estudiante?.user?.name ?? "Estudiante";
    const empresa = practica.empresa?.nombreEmpresa ?? "—";

    return (
        <div style={{ backgroundColor: "rgba(13,14,21,0.45)", backdropFilter: "blur(8px)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-xl)", overflow: "hidden" }}>
            {/* header clickeable */}
            <button onClick={() => setExpandida(p => !p)}
                style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", backgroundColor: "transparent", border: "none", borderBottom: expandida ? "1px solid var(--color-border)" : "none", cursor: "pointer", transition: "background 150ms" }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = "rgba(167,139,250,0.04)"; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: UNI_BG, border: `1.5px solid ${UNI_BORDER}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: 700, color: UNI, flexShrink: 0 }}>
                        {nombre.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ textAlign: "left" }}>
                        <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--color-text)", margin: "0 0 1px" }}>{nombre}</p>
                        <p style={{ fontSize: "11px", color: "var(--color-text-faint)", margin: 0 }}>{empresa} · {docs.length} entrega{docs.length !== 1 ? "s" : ""}</p>
                    </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    {pendientes > 0 && (
                        <span style={{ padding: "2px 8px", borderRadius: "var(--radius-full)", backgroundColor: "rgba(245,166,35,0.10)", border: "1px solid rgba(245,166,35,0.25)", fontSize: "10px", fontWeight: 600, color: "var(--color-warning)" }}>
                            {pendientes} pendiente{pendientes > 1 ? "s" : ""}
                        </span>
                    )}
                    {expandida ? <ChevronUp size={15} style={{ color: "var(--color-text-faint)" }} /> : <ChevronDown size={15} style={{ color: "var(--color-text-faint)" }} />}
                </div>
            </button>

            {/* fases expandidas */}
            {expandida && (
                <div style={{ padding: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
                    {FASES.map((fase, i) => (
                        <FaseAccordion
                            key={fase.key}
                            fase={fase}
                            docs={docsPorFase[i]}
                            practicaId={practica.id}
                            refetch={refetch}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

/* ══ PÁGINA ══════════════════════════════════════════════════════ */
export default function ReportesUniversidad() {
    const { practicas, cargando, refetch } = useDocumentos();

    return (
        <DashboardLayout title="Documentos">
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

            {/* Header */}
            <div style={{ marginBottom: "20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                    <span style={{ width: "5px", height: "5px", borderRadius: "50%", backgroundColor: UNI, display: "inline-block" }} />
                    <span style={{ fontSize: "9px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: UNI }}>Universidad</span>
                </div>
                <h2 style={{ fontSize: "clamp(1rem,1.8vw,1.25rem)", fontWeight: 700, color: "var(--color-text)", margin: "0 0 2px", letterSpacing: "-0.02em" }}>Documentos de prácticas</h2>
                <p style={{ fontSize: "12px", color: "var(--color-text-muted)", margin: 0 }}>
                    Revisa, retroalimenta y aprueba los reportes de cada fase
                </p>
            </div>

            {cargando ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 0" }}>
                    <Loader2 size={28} style={{ color: UNI, animation: "spin 0.8s linear infinite" }} />
                </div>
            ) : practicas.length === 0 ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "60px 24px", gap: "10px", backgroundColor: "rgba(13,14,21,0.45)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-xl)", textAlign: "center" }}>
                    <div style={{ width: "44px", height: "44px", borderRadius: "var(--radius-lg)", backgroundColor: UNI_BG, border: `1px solid ${UNI_BORDER}`, display: "flex", alignItems: "center", justifyContent: "center", color: UNI }}>
                        <FileText size={20} />
                    </div>
                    <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--color-text)", margin: 0 }}>Sin reportes aún</p>
                    <p style={{ fontSize: "12px", color: "var(--color-text-muted)", margin: 0 }}>Cuando los estudiantes suban documentos aparecerán aquí por fases</p>
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {practicas.map((p: any) => (
                        <PracticaCard key={p.id} practica={p} refetch={refetch} />
                    ))}
                </div>
            )}
        </DashboardLayout>
    );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    const session = await getSession(context);
    if (!session || session.user.role !== "UNIVERSIDAD") {
        return { redirect: { destination: "/auth/login", permanent: false } };
    }
    return { props: {} };
};