import { useState, useEffect, useCallback } from "react";
import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import { useRouter } from "next/router";
import DashboardLayout from "@/components/layout/DashboardLayout";
import EstadoBadge from "@/components/ui/EstadoBadge";
import {
    Building2, Calendar, Target, FileText, ExternalLink,
    CheckCircle, Clock, Lock, ArrowLeft, Loader2, Award,
} from "lucide-react";

/* ── Las 5 fases en orden ─────────────────────────────────────────── */
const FASES = [
    {
        id: 0, titulo: "Documentos de Iniciación",
        subtitulo: "Al inscribirse a la práctica",
        icon: <FileText size={14} />,
        color: "var(--color-role-universidad)", bg: "var(--color-role-universidad-bg)",
        border: "rgba(99,102,241,0.25)", tipoKey: "INICIACION",
    },
    {
        id: 1, titulo: "Primer Informe",
        subtitulo: "2 meses después del inicio",
        icon: <FileText size={14} />,
        color: "var(--color-accent)", bg: "var(--color-accent-subtle)",
        border: "var(--color-accent-border)", tipoKey: "INFORME_1",
    },
    {
        id: 2, titulo: "Segundo Informe",
        subtitulo: "4 meses después del inicio",
        icon: <FileText size={14} />,
        color: "var(--color-warning)", bg: "rgba(245,166,35,0.1)",
        border: "rgba(245,166,35,0.25)", tipoKey: "INFORME_2",
    },
    {
        id: 3, titulo: "Tercer Informe",
        subtitulo: "6 meses después del inicio",
        icon: <FileText size={14} />,
        color: "var(--color-role-empresa)", bg: "var(--color-role-empresa-bg)",
        border: "var(--color-role-empresa-border)", tipoKey: "INFORME_3",
    },
    {
        id: 4, titulo: "Informe Final de Prácticas",
        subtitulo: "15 días hábiles tras el tercer informe",
        icon: <Award size={14} />,
        color: "var(--color-success)", bg: "var(--color-success-bg)",
        border: "rgba(52,201,122,0.25)", tipoKey: "INFORME_FINAL",
    },
];

/* ── Helpers de fecha ─────────────────────────────────────────────── */
function fmtFecha(d: string) {
    return new Date(d).toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" });
}
function addMeses(base: string, n: number) {
    const d = new Date(base); d.setMonth(d.getMonth() + n); return d;
}
function addDiasHabiles(base: Date, dias: number) {
    const d = new Date(base); let c = 0;
    while (c < dias) {
        d.setDate(d.getDate() + 1);
        if (d.getDay() !== 0 && d.getDay() !== 6) c++;
    }
    return d;
}

/* ── InfoChip ─────────────────────────────────────────────────────── */
function InfoChip({ icon, label, value, color, bg, border }: any) {
    return (
        <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", padding: "12px 14px", backgroundColor: bg, border: `1px solid ${border}`, borderRadius: "var(--radius-lg)" }}>
            <div style={{ color, marginTop: "1px", flexShrink: 0 }}>{icon}</div>
            <div>
                <p style={{ fontSize: "9px", fontWeight: 600, color: "var(--color-text-faint)", letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 2px" }}>{label}</p>
                <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--color-text)", margin: 0, lineHeight: 1.3 }}>{value}</p>
            </div>
        </div>
    );
}

/* ── DocCard ──────────────────────────────────────────────────────── */
function DocCard({ doc, faseColor }: { doc: any; faseColor: string }) {
    const [hov, setHov] = useState(false);
    return (
        <div
            onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
            style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px", padding: "12px 14px", backgroundColor: hov ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.02)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)", transition: "all 150ms ease" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", flex: 1, minWidth: 0 }}>
                <div style={{ width: "30px", height: "30px", borderRadius: "var(--radius-md)", backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid var(--color-border)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: faseColor }}>
                    <FileText size={13} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: "12px", fontWeight: 600, color: "var(--color-text)", margin: "0 0 2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{doc.titulo}</p>
                    {doc.descripcion && <p style={{ fontSize: "10px", color: "var(--color-text-faint)", margin: "0 0 3px" }}>{doc.descripcion}</p>}
                    <p style={{ fontSize: "10px", color: "var(--color-text-faint)", margin: 0 }}>{fmtFecha(doc.createdAt)}</p>
                    {doc.comentarios && (
                        <div style={{ marginTop: "6px", padding: "6px 8px", backgroundColor: "rgba(255,255,255,0.02)", border: "1px solid var(--color-divider)", borderRadius: "var(--radius-md)" }}>
                            <p style={{ fontSize: "10px", color: "var(--color-text-muted)", margin: 0 }}>💬 {doc.comentarios}</p>
                        </div>
                    )}
                </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
                <EstadoBadge estado={doc.estado} />
                <a href={doc.archivoUrl} target="_blank" rel="noopener noreferrer"
                    style={{ width: "28px", height: "28px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)", color: "var(--color-text-faint)", transition: "all 150ms ease" }}
                    aria-label="Ver documento"><ExternalLink size={13} /></a>
            </div>
        </div>
    );
}

/* ── FaseCard (accordion por fase) ───────────────────────────────── */
function FaseCard({ fase, docs, fechaEsperada, desbloqueada, idx }: any) {
    const [open, setOpen] = useState(idx === 0);
    const [hov, setHov] = useState(false);
    const aprobados = docs.filter((d: any) => d.estado === "APROBADO").length;
    const completa = docs.length > 0 && aprobados === docs.length;

    return (
        <div style={{ position: "relative" }}>
            {/* línea conectora */}
            {idx < FASES.length - 1 && (
                <div style={{ position: "absolute", left: "19px", top: "100%", width: "2px", height: "16px", backgroundColor: completa ? "var(--color-success)" : "var(--color-divider)", zIndex: 0 }} />
            )}
            <div style={{ position: "relative", zIndex: 1, backgroundColor: "rgba(13,14,21,0.6)", backdropFilter: "blur(12px)", border: `1px solid ${open ? fase.border : "var(--color-border)"}`, borderRadius: "var(--radius-xl)", overflow: "hidden", transition: "border-color 200ms ease", opacity: desbloqueada ? 1 : 0.5 }}>
                {open && <div style={{ position: "absolute", top: 0, left: "10%", right: "10%", height: "1px", background: `linear-gradient(90deg,transparent,${fase.color},transparent)`, opacity: 0.5 }} />}

                {/* header fase */}
                <button
                    onClick={() => desbloqueada && setOpen(p => !p)} disabled={!desbloqueada}
                    onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
                    style={{ width: "100%", display: "flex", alignItems: "center", gap: "12px", padding: "13px 16px", backgroundColor: open || hov ? "rgba(255,255,255,0.02)" : "transparent", cursor: desbloqueada ? "pointer" : "not-allowed", border: "none", borderBottom: open ? "1px solid var(--color-border)" : "none", transition: "background 150ms ease", flexWrap: "wrap" }}>
                    {/* círculo fase */}
                    <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: fase.bg, border: `1.5px solid ${fase.border}`, display: "flex", alignItems: "center", justifyContent: "center", color: fase.color, flexShrink: 0 }}>
                        {!desbloqueada ? <Lock size={13} style={{ color: "var(--color-text-faint)" }} /> : fase.icon}
                    </div>
                    <div style={{ flex: 1, textAlign: "left" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <p style={{ fontSize: "13px", fontWeight: 700, color: "var(--color-text)", margin: 0 }}>{fase.titulo}</p>
                            {completa && <CheckCircle size={12} style={{ color: "var(--color-success)" }} />}
                        </div>
                        <p style={{ fontSize: "10px", color: "var(--color-text-faint)", margin: "1px 0 0", display: "flex", alignItems: "center", gap: "4px" }}>
                            <Clock size={9} />{fase.subtitulo}
                            {fechaEsperada && <> · <span style={{ color: fase.color }}>{fechaEsperada.toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" })}</span></>}
                        </p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        {docs.length > 0 && (
                            <span style={{ padding: "2px 8px", borderRadius: "var(--radius-full)", backgroundColor: fase.bg, border: `1px solid ${fase.border}`, fontSize: "10px", fontWeight: 600, color: fase.color }}>
                                {docs.length} doc{docs.length > 1 ? "s" : ""}
                            </span>
                        )}
                        {docs.length === 0 && desbloqueada && (
                            <span style={{ padding: "2px 8px", borderRadius: "var(--radius-full)", backgroundColor: "rgba(245,166,35,0.08)", border: "1px solid rgba(245,166,35,0.2)", fontSize: "10px", fontWeight: 600, color: "var(--color-warning)" }}>Pendiente</span>
                        )}
                        <span style={{ fontSize: "16px", color: "var(--color-text-faint)", display: "inline-block", transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 200ms ease" }}>⌄</span>
                    </div>
                </button>

                {/* docs de la fase */}
                {open && (
                    <div style={{ padding: "12px" }}>
                        {!desbloqueada
                            ? <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "14px", justifyContent: "center" }}>
                                <Lock size={13} style={{ color: "var(--color-text-faint)" }} />
                                <p style={{ fontSize: "11px", color: "var(--color-text-faint)", margin: 0 }}>Esta fase aún no está disponible</p>
                            </div>
                            : docs.length === 0
                                ? <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "20px", gap: "6px", textAlign: "center" }}>
                                    <FileText size={18} style={{ color: "var(--color-text-faint)" }} />
                                    <p style={{ fontSize: "11px", color: "var(--color-text-muted)", margin: 0 }}>Sin documentos entregados en esta fase</p>
                                </div>
                                : <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                    {docs.map((doc: any) => <DocCard key={doc.id} doc={doc} faseColor={fase.color} />)}
                                    <p style={{ fontSize: "10px", color: completa ? "var(--color-success)" : "var(--color-text-faint)", textAlign: "right", margin: 0 }}>
                                        {aprobados}/{docs.length} aprobados
                                    </p>
                                </div>
                        }
                    </div>
                )}
            </div>
        </div>
    );
}

/* ══ PÁGINA PRINCIPAL ══════════════════════════════════════════════ */
export default function DetallePracticante() {
    const router = useRouter();
    const { id } = router.query;
    const [practica, setPractica] = useState<any>(null);
    const [cargando, setCargando] = useState(true);
    const [mounted, setMounted] = useState(false);

    useEffect(() => { const t = setTimeout(() => setMounted(true), 40); return () => clearTimeout(t); }, []);

    const fetchData = useCallback(async () => {
        if (!id) return;
        const res = await fetch(`/api/practicas/${id}`);
        const data = await res.json();
        setPractica(data.practica ?? data);
        setCargando(false);
    }, [id]);

    useEffect(() => { fetchData(); }, [fetchData]);

    if (cargando) return (
        <DashboardLayout title="Detalle practicante">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 0" }}>
                <Loader2 size={28} style={{ color: "var(--color-accent)", animation: "spin 0.8s linear infinite" }} />
                <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </div>
        </DashboardLayout>
    );

    if (!practica) return (
        <DashboardLayout title="Detalle practicante">
            <div style={{ textAlign: "center", padding: "60px 24px" }}>
                <p style={{ color: "var(--color-text-muted)", fontSize: "13px" }}>Práctica no encontrada</p>
            </div>
        </DashboardLayout>
    );

    const nombre = practica.estudiante?.user?.name ?? "Estudiante";
    const email = practica.estudiante?.user?.email ?? "";
    const empresa = practica.empresa?.nombreEmpresa ?? "—";
    const sector = practica.empresa?.sector ?? "";
    const ciudad = practica.empresa?.ciudad ?? "";
    const docs = practica.documentos ?? [];
    const inicio = practica.fechaInicio;

    /* Fechas esperadas por fase */
    const fechasEsperadas = [
        null,
        inicio ? addMeses(inicio, 2) : null,
        inicio ? addMeses(inicio, 4) : null,
        inicio ? addMeses(inicio, 6) : null,
        inicio ? addDiasHabiles(addMeses(inicio, 6), 15) : null,
    ];

    /* Clasificar docs por tipoDocumento */
    const hayTipos = docs.some((d: any) => d.tipoDocumento);
    const docsClasificados = FASES.map(f => {
        if (hayTipos) return docs.filter((d: any) => d.tipoDocumento === f.tipoKey);
        // fallback sin tipoDocumento: todos en fase 0
        return f.id === 0 ? docs : [];
    });

    /* Desbloqueo: una fase se desbloquea cuando la anterior tiene >= 1 doc aprobado */
    const desbloqueadas = FASES.map((_, i) => {
        if (i === 0) return true;
        return docsClasificados[i - 1].some((d: any) => d.estado === "APROBADO");
    });

    const totalAprobados = docs.filter((d: any) => d.estado === "APROBADO").length;
    const progreso = docs.length > 0 ? Math.round((totalAprobados / docs.length) * 100) : 0;

    return (
        <DashboardLayout title={`Practicante: ${nombre}`}>
            {/* back */}
            <button
                onClick={() => router.back()}
                style={{ display: "inline-flex", alignItems: "center", gap: "6px", marginBottom: "16px", padding: "6px 10px", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)", backgroundColor: "transparent", color: "var(--color-text-muted)", fontSize: "11px", fontWeight: 600, cursor: "pointer", transition: "all var(--transition-fast)" }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = "var(--color-text)"; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "var(--color-text-muted)"; }}>
                <ArrowLeft size={12} />Volver a practicantes
            </button>

            {/* hero card */}
            <div style={{ position: "relative", overflow: "hidden", backgroundColor: "rgba(13,14,21,0.6)", backdropFilter: "blur(16px)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-xl)", padding: "20px", marginBottom: "16px", opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(-6px)", transition: "opacity 350ms cubic-bezier(0.16,1,0.3,1),transform 350ms cubic-bezier(0.16,1,0.3,1)" }}>
                <div style={{ position: "absolute", top: 0, left: "15%", right: "15%", height: "1px", background: "linear-gradient(90deg,transparent,var(--color-role-universidad),transparent)", opacity: 0.5 }} />
                <div style={{ position: "absolute", top: "-24px", right: "-24px", width: "80px", height: "80px", borderRadius: "50%", backgroundColor: "var(--color-role-universidad-bg)", filter: "blur(20px)", opacity: 0.4 }} />

                <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "16px" }}>
                    <div style={{ width: "48px", height: "48px", borderRadius: "50%", backgroundColor: "var(--color-role-universidad-bg)", border: "1.5px solid rgba(99,102,241,0.35)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", fontWeight: 700, color: "var(--color-role-universidad)", flexShrink: 0 }}>
                        {nombre.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h2 style={{ fontSize: "clamp(0.95rem,1.5vw,1.2rem)", fontWeight: 700, color: "var(--color-text)", margin: "0 0 2px", letterSpacing: "-0.02em" }}>{nombre}</h2>
                        <p style={{ fontSize: "11px", color: "var(--color-text-faint)", margin: 0 }}>{email}</p>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", marginTop: "4px", padding: "2px 8px", borderRadius: "var(--radius-full)", backgroundColor: practica.activa ? "var(--color-success-bg)" : "rgba(255,255,255,0.04)", border: practica.activa ? "1px solid rgba(52,201,122,0.2)" : "1px solid var(--color-border)", fontSize: "10px", fontWeight: 600, color: practica.activa ? "var(--color-success)" : "var(--color-text-faint)" }}>
                            {practica.activa ? "Activa" : "Finalizada"}
                        </span>
                    </div>
                </div>

                {/* info grid */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(190px,1fr))", gap: "8px" }}>
                    <InfoChip icon={<Building2 size={14} />} label="Empresa" value={empresa} color="var(--color-role-empresa)" bg="var(--color-role-empresa-bg)" border="var(--color-role-empresa-border)" />
                    <InfoChip icon={<Calendar size={14} />} label="Periodo" value={`${inicio ? fmtFecha(inicio) : "—"}${practica.fechaFin ? ` → ${fmtFecha(practica.fechaFin)}` : ""}`} color="var(--color-accent)" bg="var(--color-accent-subtle)" border="var(--color-accent-border)" />
                    <InfoChip icon={<Target size={14} />} label="Objetivo / Cargo" value={practica.descripcionCargo ?? "—"} color="var(--color-warning)" bg="rgba(245,166,35,0.08)" border="rgba(245,166,35,0.2)" />
                    {(sector || ciudad) && <InfoChip icon={<Building2 size={14} />} label="Sector / Ciudad" value={[sector, ciudad].filter(Boolean).join(" · ")} color="var(--color-text-muted)" bg="rgba(255,255,255,0.02)" border="var(--color-border)" />}
                </div>

                {/* barra de progreso */}
                {docs.length > 0 && (
                    <div style={{ marginTop: "14px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                            <span style={{ fontSize: "10px", color: "var(--color-text-faint)" }}>Progreso general</span>
                            <span style={{ fontSize: "10px", fontWeight: 600, color: progreso === 100 ? "var(--color-success)" : "var(--color-text-muted)" }}>
                                {totalAprobados}/{docs.length} aprobados · {progreso}%
                            </span>
                        </div>
                        <div style={{ height: "4px", backgroundColor: "rgba(255,255,255,0.06)", borderRadius: "var(--radius-full)", overflow: "hidden" }}>
                            <div style={{ height: "100%", width: `${progreso}%`, borderRadius: "var(--radius-full)", background: "linear-gradient(90deg,var(--color-role-universidad),var(--color-success))", transition: "width 600ms cubic-bezier(0.16,1,0.3,1)" }} />
                        </div>
                    </div>
                )}
            </div>

            {/* Timeline de fases */}
            <p style={{ fontSize: "9px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-text-faint)", margin: "0 0 12px" }}>Entregables por fase</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {FASES.map((fase, i) => (
                    <FaseCard
                        key={fase.id} fase={fase} idx={i}
                        docs={docsClasificados[i]}
                        fechaEsperada={fechasEsperadas[i]}
                        desbloqueada={desbloqueadas[i]}
                    />
                ))}
            </div>
        </DashboardLayout>
    );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    const session = await getSession(context);
    if (!session || session.user.role !== "UNIVERSIDAD") return { redirect: { destination: "/auth/login", permanent: false } };
    return { props: {} };
};