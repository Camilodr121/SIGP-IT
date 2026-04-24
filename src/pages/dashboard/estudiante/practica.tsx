// src/pages/dashboard/estudiante/practica.tsx
import { useEffect, useState, useCallback } from "react";
import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import EstadoBadge from "@/components/ui/EstadoBadge";
import ModalSubirDocumento, { TipoDocumento } from "@/components/documentos/ModalSubirDocumento";
import {
    Building2, Calendar, Briefcase, FileText, CheckCircle, Loader2,
    Upload, ExternalLink, Lock, ChevronDown, ChevronUp, Clock,
} from "lucide-react";

/* ── helpers ─────────────────────────────────────────────────────── */
const fmt = (d: string) =>
    new Date(d).toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" });

/* ── Definición de fases ─────────────────────────────────────────── */
type FaseId = TipoDocumento;

interface Fase {
    id: FaseId;
    numero: number;
    label: string;
    sublabel: string;
    color: string;
    bg: string;
    border: string;
}

const FASES: Fase[] = [
    { id: "INICIACION", numero: 1, label: "Documentos de Iniciación", sublabel: "Al inscribirse a la práctica", color: "var(--color-role-universidad)", bg: "var(--color-role-universidad-bg)", border: "rgba(99,102,241,0.25)" },
    { id: "INFORME_1", numero: 2, label: "Primer Informe", sublabel: "2 meses después del inicio", color: "var(--color-accent)", bg: "var(--color-accent-subtle)", border: "var(--color-accent-border)" },
    { id: "INFORME_2", numero: 3, label: "Segundo Informe", sublabel: "4 meses después del inicio", color: "var(--color-warning)", bg: "rgba(245,166,35,0.1)", border: "rgba(245,166,35,0.25)" },
    { id: "INFORME_3", numero: 4, label: "Tercer Informe", sublabel: "6 meses después del inicio", color: "var(--color-role-empresa)", bg: "var(--color-role-empresa-bg)", border: "var(--color-role-empresa-border)" },
    { id: "INFORME_FINAL", numero: 5, label: "Informe Final de Prácticas", sublabel: "15 días hábiles tras el tercer informe", color: "var(--color-success)", bg: "var(--color-success-bg)", border: "rgba(52,201,122,0.25)" },
];

/* ── Calcula qué fases están disponibles ─────────────────────────── */
function calcularFaseActiva(docs: any[]): number {
    // Fase 0 (índice) siempre disponible
    // Fase N disponible si fase N-1 tiene al menos 1 doc APROBADO
    const aprobadosPorFase: Record<FaseId, number> = {
        INICIACION: 0,
        INFORME_1: 0,
        INFORME_2: 0,
        INFORME_3: 0,
        INFORME_FINAL: 0,
    };
    for (const d of docs) {
        const tipo = (d.tipoDocumento ?? "INICIACION") as FaseId;
        if (d.estado === "APROBADO") aprobadosPorFase[tipo]++;
    }
    // Retorna el índice de la última fase desbloqueada
    if (aprobadosPorFase.INFORME_3 > 0) return 4;
    if (aprobadosPorFase.INFORME_2 > 0) return 3;
    if (aprobadosPorFase.INFORME_1 > 0) return 2;
    if (aprobadosPorFase.INICIACION > 0) return 1;
    return 0;
}

/* ── MetaItem ────────────────────────────────────────────────────── */
function MetaItem({ label, value, icon }: { label: string; value: string; icon?: JSX.Element }) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
            <p style={{ fontSize: "10px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--color-text-faint)", margin: 0 }}>{label}</p>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--color-text)", fontWeight: 500 }}>
                {icon}{value}
            </div>
        </div>
    );
}

/* ── DocItem ─────────────────────────────────────────────────────── */
function DocItem({ doc, color }: { doc: any; color: string }) {
    return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px", padding: "10px 12px", backgroundColor: "rgba(255,255,255,0.02)", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "9px", minWidth: 0 }}>
                <FileText size={13} style={{ color, flexShrink: 0 }} />
                <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: "12px", fontWeight: 600, color: "var(--color-text)", margin: "0 0 1px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{doc.titulo}</p>
                    <p style={{ fontSize: "10px", color: "var(--color-text-faint)", margin: 0 }}>{fmt(doc.createdAt)}</p>
                </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                <EstadoBadge estado={doc.estado} />
                {doc.archivoUrl && (
                    <a href={doc.archivoUrl} target="_blank" rel="noopener noreferrer" title="Ver archivo"
                        style={{ width: "26px", height: "26px", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)", backgroundColor: "transparent", color: "var(--color-text-faint)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <ExternalLink size={11} />
                    </a>
                )}
            </div>
        </div>
    );
}

/* ── FaseCard ────────────────────────────────────────────────────── */
function FaseCard({ fase, docs, desbloqueada, esActiva, practicaId, onSubidaExitosa }: {
    fase: Fase; docs: any[]; desbloqueada: boolean; esActiva: boolean; practicaId: string; onSubidaExitosa: () => void;
}) {
    const [expandida, setExpandida] = useState(esActiva);
    const [modalAbierto, setModalAbierto] = useState(false);
    const aprobados = docs.filter(d => d.estado === "APROBADO").length;
    const pendientes = docs.filter(d => d.estado !== "APROBADO").length;

    const estadoFase = aprobados > 0 ? "completada" : docs.length > 0 ? "en-curso" : "pendiente";

    return (
        <>
            <div style={{
                border: `1px solid ${esActiva ? fase.border : "var(--color-border)"}`,
                borderRadius: "var(--radius-xl)", overflow: "hidden",
                backgroundColor: esActiva ? fase.bg : "rgba(13,14,21,0.45)",
                transition: "border-color 200ms ease",
                opacity: desbloqueada ? 1 : 0.55,
            }}>
                {/* cabecera de fase */}
                <button
                    onClick={() => desbloqueada && setExpandida(p => !p)}
                    style={{ width: "100%", padding: "14px 16px", display: "flex", alignItems: "center", gap: "12px", background: "transparent", border: "none", cursor: desbloqueada ? "pointer" : "default", textAlign: "left" }}>
                    {/* número */}
                    <div style={{
                        width: "32px", height: "32px", borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700,
                        backgroundColor: estadoFase === "completada" ? fase.color : "rgba(255,255,255,0.04)",
                        color: estadoFase === "completada" ? "#fff" : desbloqueada ? fase.color : "var(--color-text-faint)",
                        border: `2px solid ${estadoFase === "completada" ? fase.color : desbloqueada ? fase.border : "var(--color-border)"}`
                    }}>
                        {estadoFase === "completada" ? <CheckCircle size={14} /> : desbloqueada ? fase.numero : <Lock size={12} />}
                    </div>
                    {/* info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                            <p style={{ fontSize: "13px", fontWeight: 700, color: desbloqueada ? "var(--color-text)" : "var(--color-text-muted)", margin: 0 }}>{fase.label}</p>
                            {esActiva && <span style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", padding: "2px 7px", borderRadius: "var(--radius-full)", backgroundColor: fase.color, color: "#fff" }}>Activa</span>}
                            {estadoFase === "completada" && <span style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", padding: "2px 7px", borderRadius: "var(--radius-full)", backgroundColor: "var(--color-success-bg)", color: "var(--color-success)", border: "1px solid rgba(52,201,122,0.25)" }}>Completa</span>}
                        </div>
                        <p style={{ fontSize: "10px", color: "var(--color-text-faint)", margin: "2px 0 0" }}>{fase.sublabel} — {docs.length} documento{docs.length !== 1 ? "s" : ""}</p>
                    </div>
                    {/* chevron */}
                    {desbloqueada && (
                        expandida
                            ? <ChevronUp size={14} style={{ color: "var(--color-text-faint)", flexShrink: 0 }} />
                            : <ChevronDown size={14} style={{ color: "var(--color-text-faint)", flexShrink: 0 }} />
                    )}
                </button>

                {/* cuerpo expandible */}
                {desbloqueada && expandida && (
                    <div style={{ padding: "0 16px 14px", borderTop: "1px solid var(--color-border)", paddingTop: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
                        {docs.length === 0 ? (
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "24px", gap: "6px" }}>
                                <Clock size={22} style={{ color: "var(--color-text-faint)" }} />
                                <p style={{ fontSize: "12px", color: "var(--color-text-muted)", margin: 0 }}>Aún no has subido documentos en esta fase</p>
                            </div>
                        ) : (
                            docs.map(d => <DocItem key={d.id} doc={d} color={fase.color} />)
                        )}
                        {/* botón subir */}
                        {esActiva && (
                            <button onClick={() => setModalAbierto(true)}
                                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "7px", padding: "9px 16px", borderRadius: "var(--radius-lg)", border: `1px solid ${fase.border}`, backgroundColor: fase.bg, color: fase.color, fontSize: "12px", fontWeight: 700, cursor: "pointer", marginTop: "4px", transition: "all 150ms ease" }}
                                onMouseEnter={e => { e.currentTarget.style.backgroundColor = fase.color; e.currentTarget.style.color = "#fff"; }}
                                onMouseLeave={e => { e.currentTarget.style.backgroundColor = fase.bg; e.currentTarget.style.color = fase.color; }}>
                                <Upload size={13} /> Subir documento en esta fase
                            </button>
                        )}
                        {!esActiva && estadoFase !== "completada" && desbloqueada && (
                            <p style={{ fontSize: "11px", color: "var(--color-text-faint)", textAlign: "center", margin: 0 }}>
                                Completa la fase anterior para activar la subida aquí
                            </p>
                        )}
                    </div>
                )}
            </div>

            {modalAbierto && (
                <ModalSubirDocumento
                    practicaId={practicaId}
                    tipoDocumento={fase.id}
                    onClose={() => setModalAbierto(false)}
                    onSuccess={() => { setModalAbierto(false); onSubidaExitosa(); }}
                />
            )}
        </>
    );
}

/* ══════════════════════════════════════════════════════════════════
   Página principal
══════════════════════════════════════════════════════════════════ */
export default function PracticaPage() {
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

    const practicaActiva = practicas.find(p => p.activa);
    const practicasAnter = practicas.filter(p => !p.activa);
    const todosLosDocs = practicaActiva?.documentos ?? [];
    const faseActivaIdx = practicaActiva ? calcularFaseActiva(todosLosDocs) : 0;

    return (
        <DashboardLayout title="Mi Práctica">
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

            {/* header */}
            <div style={{ marginBottom: "20px", opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(-6px)", transition: "opacity 350ms cubic-bezier(0.16,1,0.3,1),transform 350ms cubic-bezier(0.16,1,0.3,1)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                    <span style={{ width: "5px", height: "5px", borderRadius: "50%", backgroundColor: "var(--color-role-estudiante)", display: "inline-block" }} />
                    <span style={{ fontSize: "9px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "var(--color-role-estudiante)" }}>Estudiante</span>
                </div>
                <h2 style={{ fontSize: "clamp(1rem,1.8vw,1.25rem)", fontWeight: 700, color: "var(--color-text)", margin: "0 0 2px", letterSpacing: "-0.02em" }}>Mi Práctica</h2>
                <p style={{ fontSize: "12px", color: "var(--color-text-muted)", margin: 0 }}>Información detallada sobre tu práctica y el cronograma de entregas</p>
            </div>

            {cargando ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 0" }}>
                    <Loader2 size={26} style={{ color: "var(--color-role-estudiante)", animation: "spin 0.8s linear infinite" }} />
                </div>
            ) : !practicaActiva ? (
                /* Empty state */
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "60px 24px", gap: "10px", backgroundColor: "rgba(13,14,21,0.45)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-xl)" }}>
                    <Briefcase size={30} style={{ color: "var(--color-text-faint)" }} />
                    <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--color-text)", margin: 0 }}>Sin práctica registrada</p>
                    <p style={{ fontSize: "12px", color: "var(--color-text-muted)", margin: 0, maxWidth: "34ch", textAlign: "center" }}>Tu coordinador universitario debe registrar tu práctica para que aparezca aquí.</p>
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "14px", opacity: mounted ? 1 : 0, transition: "opacity 400ms ease 100ms" }}>

                    {/* ── Tarjeta de info de la práctica ── */}
                    <div style={{ padding: "16px", backgroundColor: "rgba(13,14,21,0.45)", backdropFilter: "blur(8px)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-xl)" }}>
                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px", marginBottom: "12px", flexWrap: "wrap" }}>
                            <div>
                                <p style={{ fontSize: "15px", fontWeight: 700, color: "var(--color-text)", margin: "0 0 3px", letterSpacing: "-0.01em" }}>
                                    {practicaActiva.empresa?.nombreEmpresa ?? "Empresa"}
                                </p>
                                <p style={{ fontSize: "11px", color: "var(--color-text-faint)", margin: 0 }}>{practicaActiva.descripcionCargo ?? "Práctica profesional"}</p>
                            </div>
                            <EstadoBadge estado={practicaActiva.activa ? "APROBADO" : "RECHAZADO"} />
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: "12px", paddingTop: "12px", borderTop: "1px solid var(--color-border)" }}>
                            <MetaItem label="Empresa" value={practicaActiva.empresa?.nombreEmpresa ?? "—"} icon={<Building2 size={11} />} />
                            <MetaItem label="Cargo" value={practicaActiva.descripcionCargo ?? "—"} icon={<Briefcase size={11} />} />
                            <MetaItem label="Inicio" value={fmt(practicaActiva.fechaInicio)} icon={<Calendar size={11} />} />
                            {practicaActiva.fechaFin && <MetaItem label="Fin" value={fmt(practicaActiva.fechaFin)} icon={<Calendar size={11} />} />}
                            <MetaItem label="Documentos" value={`${todosLosDocs.length} entregado${todosLosDocs.length !== 1 ? "s" : ""}`} icon={<FileText size={11} />} />
                        </div>
                    </div>

                    {/* ── Progress strip ── */}
                    <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                        {FASES.map((f, i) => (
                            <div key={f.id} style={{ flex: 1, height: "4px", borderRadius: "var(--radius-full)", backgroundColor: i <= faseActivaIdx ? f.color : "var(--color-border)", transition: "background-color 400ms ease", opacity: i < faseActivaIdx ? 0.55 : 1 }} />
                        ))}
                    </div>
                    <p style={{ fontSize: "10px", color: "var(--color-text-faint)", margin: "-8px 0 0", textAlign: "right" }}>
                        Fase {faseActivaIdx + 1} de {FASES.length} — {FASES[faseActivaIdx].label}
                    </p>

                    {/* ── Timeline de fases ── */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        {FASES.map((fase, idx) => {
                            const docsFase = todosLosDocs.filter((d: any) => (d.tipoDocumento ?? "INICIACION") === fase.id);
                            const desbloqueada = idx <= faseActivaIdx;
                            const esActiva = idx === faseActivaIdx;
                            return (
                                <FaseCard key={fase.id} fase={fase} docs={docsFase} desbloqueada={desbloqueada} esActiva={esActiva}
                                    practicaId={practicaActiva.id} onSubidaExitosa={fetchDatos} />
                            );
                        })}
                    </div>

                    {/* ── Prácticas anteriores ── */}
                    {practicasAnter.length > 0 && (
                        <div style={{ marginTop: "6px" }}>
                            <p style={{ fontSize: "11px", fontWeight: 600, color: "var(--color-text-faint)", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 8px" }}>Prácticas anteriores</p>
                            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                {practicasAnter.map(p => (
                                    <div key={p.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", backgroundColor: "rgba(13,14,21,0.35)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-xl)", flexWrap: "wrap", gap: "8px" }}>
                                        <div>
                                            <p style={{ fontSize: "12px", fontWeight: 600, color: "var(--color-text-muted)", margin: "0 0 2px" }}>{p.empresa?.nombreEmpresa ?? "Empresa"}</p>
                                            <p style={{ fontSize: "10px", color: "var(--color-text-faint)", margin: 0 }}>{fmt(p.fechaInicio)}{p.fechaFin && ` — ${fmt(p.fechaFin)}`}</p>
                                        </div>
                                        <span style={{ fontSize: "10px", color: "var(--color-text-faint)" }}>{p.documentos?.length ?? 0} doc{(p.documentos?.length ?? 0) !== 1 ? "s" : ""}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
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