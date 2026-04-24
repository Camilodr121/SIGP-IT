// sigp-it/src/pages/dashboard/universidad/index.tsx
import { useState, useEffect, useCallback } from "react";
import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ModalCrearPerfilEmpresa from "@/components/universidad/ModalCrearPerfilEmpresa";
import ModalCrearPerfilEstudiante from "@/components/universidad/ModalCrearPerfilEstudiante";
import ModalAsignarPractica from "@/components/universidad/ModalAsignarPractica";
import ModalCrearEmpresa from "@/components/universidad/ModalCrearEmpresa";  // ← NUEVO
import {
    GraduationCap, Building2, Briefcase, Plus,
    CheckCircle, AlertCircle, Loader2, Users,
    FileText, TrendingUp,
} from "lucide-react";


/* ─────────────────────────────────────────────────────────────────────────
   Tipos
───────────────────────────────────────────────────────────────────────── */
type TabId = "overview" | "estudiantes" | "empresas" | "practicas";
type Modal =
    | { tipo: "perfilEmpresa"; usuario: any }
    | { tipo: "perfilEstudiante"; usuario: any }
    | { tipo: "asignarPractica" }
    | { tipo: "crearEmpresa" }   // ← NUEVO
    | null;


/* ─────────────────────────────────────────────────────────────────────────
   Helpers
───────────────────────────────────────────────────────────────────────── */
const conPerfil = (lista: any[], campo: string) => lista.filter(u => u[campo]);
const sinPerfil = (lista: any[], campo: string) => lista.filter(u => !u[campo]);


/* ─────────────────────────────────────────────────────────────────────────
   Subcomponentes UI
───────────────────────────────────────────────────────────────────────── */
function Panel({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
    return (
        <div style={{
            backgroundColor: "rgba(13,14,21,0.55)",
            backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-xl)",
            overflow: "hidden",
            ...style,
        }}>
            {children}
        </div>
    );
}


function Badge({ children, color }: { children: React.ReactNode; color: "success" | "warning" | "muted" | "uni" | "empresa" }) {
    const map = {
        success: { bg: "var(--color-success-bg)", text: "var(--color-success)", border: "rgba(52,201,122,0.2)" },
        warning: { bg: "var(--color-warning-bg)", text: "var(--color-warning)", border: "rgba(245,166,35,0.2)" },
        muted: { bg: "var(--color-surface-3)", text: "var(--color-text-muted)", border: "var(--color-border)" },
        uni: { bg: "var(--color-role-universidad-bg)", text: "var(--color-role-universidad)", border: "rgba(99,102,241,0.2)" },
        empresa: { bg: "var(--color-role-empresa-bg)", text: "var(--color-role-empresa)", border: "rgba(245,130,32,0.2)" },
    };
    const c = map[color];
    return (
        <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "2px 8px", borderRadius: "var(--radius-full)", fontSize: "10px", fontWeight: 600, backgroundColor: c.bg, color: c.text, border: `1px solid ${c.border}`, whiteSpace: "nowrap" }}>
            {children}
        </span>
    );
}


function ActionBtn({ onClick, color, children }: { onClick: () => void; color: "uni" | "empresa"; children: React.ReactNode }) {
    const [hov, setHov] = useState(false);
    const col = color === "uni" ? "var(--color-role-universidad)" : "var(--color-role-empresa)";
    const bg = color === "uni" ? "var(--color-role-universidad-bg)" : "var(--color-role-empresa-bg)";
    const bdr = color === "uni" ? "rgba(167,139,250,0.3)" : "rgba(52,211,153,0.3)";
    return (
        <button onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
            style={{ display: "flex", alignItems: "center", gap: "5px", padding: "5px 10px", borderRadius: "var(--radius-md)", border: `1px solid ${bdr}`, backgroundColor: hov ? bg : "transparent", color: col, fontSize: "11px", fontWeight: 600, cursor: "pointer", transition: "background var(--transition-fast)" }}>
            <Plus size={11} />{children}
        </button>
    );
}


function FinalizarBtn({ onClick, variant, children }: { onClick: () => void; variant: "primary" | "ghost"; children: React.ReactNode }) {
    const [hov, setHov] = useState(false);
    return (
        <button onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
            style={{
                padding: "4px 10px", borderRadius: "var(--radius-md)", fontSize: "10px", fontWeight: 600, cursor: "pointer", transition: "background var(--transition-fast)",
                backgroundColor: variant === "primary"
                    ? hov ? "var(--color-success)" : "var(--color-success-bg)"
                    : hov ? "var(--color-surface-3)" : "rgba(255,255,255,0.04)",
                color: variant === "primary" ? hov ? "#fff" : "var(--color-success)" : "var(--color-text-muted)",
                border: variant === "primary" ? "1px solid rgba(52,201,122,0.25)" : "1px solid var(--color-border)",
            }}>
            {children}
        </button>
    );
}


function EmptyCard({ icon, label }: { icon: JSX.Element; label: string }) {
    return (
        <Panel style={{ padding: "40px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
            <div style={{ width: "38px", height: "38px", borderRadius: "var(--radius-lg)", backgroundColor: "var(--color-surface-3)", border: "1px solid var(--color-border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-text-faint)" }}>{icon}</div>
            <p style={{ fontSize: "12px", color: "var(--color-text-muted)", margin: 0 }}>{label}</p>
        </Panel>
    );
}


/* ─────────────────────────────────────────────────────────────────────────
   Tabs
───────────────────────────────────────────────────────────────────────── */
const TABS: { id: TabId; label: string; icon: JSX.Element }[] = [
    { id: "overview", label: "Resumen", icon: <Users size={13} /> },
    { id: "estudiantes", label: "Estudiantes", icon: <GraduationCap size={13} /> },
    { id: "empresas", label: "Empresas", icon: <Building2 size={13} /> },
    { id: "practicas", label: "Prácticas", icon: <Briefcase size={13} /> },
];


function TabBar({ activa, onChange }: { activa: TabId; onChange: (id: TabId) => void }) {
    return (
        <div style={{ display: "flex", gap: "2px", backgroundColor: "rgba(13,14,21,0.55)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-xl)", padding: "4px", width: "fit-content", marginBottom: "16px" }}>
            {TABS.map(tab => {
                const active = activa === tab.id;
                return (
                    <button key={tab.id} onClick={() => onChange(tab.id)}
                        style={{
                            display: "flex", alignItems: "center", gap: "6px", padding: "6px 14px",
                            borderRadius: "var(--radius-lg)", border: "none", cursor: "pointer", fontSize: "12px", fontWeight: active ? 600 : 400,
                            backgroundColor: active ? "var(--color-role-universidad)" : "transparent",
                            color: active ? "#fff" : "var(--color-text-muted)",
                            transition: "all var(--transition-fast)",
                        }}>
                        {tab.icon}{tab.label}
                    </button>
                );
            })}
        </div>
    );
}


/* ─────────────────────────────────────────────────────────────────────────
   KPI Card
───────────────────────────────────────────────────────────────────────── */
interface StatCfg { label: string; valor: string | number; sub: string; icon: JSX.Element; color: string; bg: string; border: string; }


function KpiCard({ s, delay, mounted }: { s: StatCfg; delay: number; mounted: boolean }) {
    const [hov, setHov] = useState(false);
    return (
        <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
            style={{
                position: "relative", backgroundColor: hov ? "var(--color-surface-hover)" : "rgba(13,14,21,0.55)",
                backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
                border: `1px solid ${hov ? s.border : "var(--color-border)"}`,
                borderRadius: "var(--radius-xl)", padding: "16px", overflow: "hidden",
                transition: "background 160ms ease,border-color 160ms ease,transform 160ms ease,box-shadow 160ms ease",
                transform: hov ? "translateY(-2px)" : "translateY(0)",
                boxShadow: hov ? "0 8px 24px rgba(0,0,0,0.35)" : "none",
                opacity: mounted ? 1 : 0, transitionDelay: `${delay}ms`,
            }}>
            <div style={{ position: "absolute", top: "-16px", right: "-16px", width: "64px", height: "64px", borderRadius: "50%", backgroundColor: s.bg, filter: "blur(20px)", opacity: hov ? 0.7 : 0, transition: "opacity 200ms ease", pointerEvents: "none" }} />
            <div style={{ display: "inline-flex", padding: "7px", borderRadius: "var(--radius-md)", backgroundColor: s.bg, color: s.color, border: `1px solid ${s.border}`, marginBottom: "10px" }}>{s.icon}</div>
            <p style={{ fontSize: "26px", fontWeight: 700, color: "var(--color-text)", margin: "0 0 1px", lineHeight: 1, letterSpacing: "-0.03em", fontVariantNumeric: "tabular-nums" }}>{s.valor}</p>
            <p style={{ fontSize: "11px", color: "var(--color-text-muted)", margin: "0 0 1px", fontWeight: 500 }}>{s.label}</p>
            <p style={{ fontSize: "10px", color: "var(--color-text-faint)", margin: 0 }}>{s.sub}</p>
        </div>
    );
}


/* ─────────────────────────────────────────────────────────────────────────
   Página principal
───────────────────────────────────────────────────────────────────────── */
export default function DashboardUniversidad() {
    const [estudiantes, setEstudiantes] = useState<any[]>([]);
    const [empresas, setEmpresas] = useState<any[]>([]);
    const [practicas, setPracticas] = useState<any[]>([]);
    const [cargando, setCargando] = useState(true);
    const [modal, setModal] = useState<Modal>(null);
    const [tabActiva, setTabActiva] = useState<TabId>("overview");
    const [mounted, setMounted] = useState(false);


    const fetchDatos = useCallback(async () => {
        setCargando(true);
        const [est, emp, prac] = await Promise.all([
            fetch("/api/perfiles/estudiantes").then(r => r.json()),
            fetch("/api/perfiles/empresas").then(r => r.json()),
            fetch("/api/practicas").then(r => r.json()),
        ]);
        setEstudiantes(est.data ?? []);
        setEmpresas(emp.data ?? []);
        setPracticas(prac.data ?? []);
        setCargando(false);
    }, []);


    useEffect(() => { fetchDatos(); }, [fetchDatos]);
    useEffect(() => { const t = setTimeout(() => setMounted(true), 40); return () => clearTimeout(t); }, []);


    const handleExito = () => { setModal(null); fetchDatos(); };


    const handleFinalizarPractica = async (practicaId: string, quedoContratado: boolean) => {
        await fetch(`/api/practicas/${practicaId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ activa: false, quedoContratado }),
        });
        fetchDatos();
    };


    const stats: StatCfg[] = [
        {
            label: "Estudiantes", valor: estudiantes.length,
            sub: `${conPerfil(estudiantes, "perfilEstudiante").length} con perfil`,
            icon: <GraduationCap size={14} />, color: "var(--color-role-universidad)",
            bg: "var(--color-role-universidad-bg)", border: "rgba(99,102,241,0.22)",
        },
        {
            label: "Empresas", valor: empresas.length,
            sub: `${conPerfil(empresas, "perfilEmpresa").length} con perfil`,
            icon: <Building2 size={14} />, color: "var(--color-accent)",
            bg: "var(--color-accent-subtle)", border: "var(--color-accent-border)",
        },
        {
            label: "Prácticas activas", valor: practicas.filter(p => p.activa).length,
            sub: `${practicas.length} total`,
            icon: <Briefcase size={14} />, color: "var(--color-success)",
            bg: "var(--color-success-bg)", border: "rgba(52,201,122,0.2)",
        },
        {
            label: "Tasa de contratación",
            valor: `${practicas.length > 0 ? Math.round((practicas.filter(p => p.quedoContratado).length / practicas.length) * 100) : 0}%`,
            sub: `${practicas.filter(p => p.quedoContratado).length} contratados`,
            icon: <TrendingUp size={14} />, color: "var(--color-role-empresa)",
            bg: "var(--color-role-empresa-bg)", border: "rgba(245,130,32,0.22)",
        },
    ];


    const rowStyle: React.CSSProperties = {
        backgroundColor: "rgba(13,14,21,0.45)",
        backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-xl)",
        padding: "14px 16px",
    };


    return (
        <DashboardLayout title="Panel Universidad">


            {/* ── HEADER ── */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" as const, marginBottom: "18px", opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(-6px)", transition: "opacity 350ms cubic-bezier(0.16,1,0.3,1), transform 350ms cubic-bezier(0.16,1,0.3,1)" }}>
                <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                        <span style={{ width: "5px", height: "5px", borderRadius: "50%", backgroundColor: "var(--color-role-universidad)", display: "inline-block" }} />
                        <span style={{ fontSize: "9px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "var(--color-role-universidad)" }}>Panel de universidad</span>
                    </div>
                    <h2 style={{ fontSize: "clamp(1rem,1.8vw,1.25rem)", fontWeight: 700, color: "var(--color-text)", margin: "0 0 2px", letterSpacing: "-0.02em" }}>Panel de control</h2>
                    <p style={{ fontSize: "12px", color: "var(--color-text-muted)", margin: 0 }}>Gestiona estudiantes, empresas y prácticas</p>
                </div>

                {/* ── Botones de acción header ── */}
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" as const }}>

                    {/* Nueva práctica */}
                    <button
                        onClick={() => setModal({ tipo: "asignarPractica" })}
                        style={{
                            display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px",
                            backgroundColor: "var(--color-role-universidad)", color: "#fff",
                            fontWeight: 600, fontSize: "12px", borderRadius: "var(--radius-lg)", border: "none", cursor: "pointer",
                            boxShadow: "0 4px 16px rgba(99,102,241,0.25)",
                            transition: "filter var(--transition-fast), transform var(--transition-fast)",
                            flexShrink: 0,
                        }}
                        onMouseEnter={e => { e.currentTarget.style.filter = "brightness(1.12)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                        onMouseLeave={e => { e.currentTarget.style.filter = "brightness(1)"; e.currentTarget.style.transform = "translateY(0)"; }}
                    >
                        <Plus size={14} />Nueva práctica
                    </button>

                </div>
            </div>


            {/* ── KPI GRID ── */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "10px", marginBottom: "16px" }}>
                {stats.map((s, i) => <KpiCard key={s.label} s={s} delay={i * 50} mounted={mounted} />)}
            </div>


            {/* ── TABS ── */}
            <div style={{ opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(6px)", transition: "opacity 400ms cubic-bezier(0.16,1,0.3,1) 220ms, transform 400ms cubic-bezier(0.16,1,0.3,1) 220ms" }}>
                <TabBar activa={tabActiva} onChange={setTabActiva} />
            </div>


            {/* ── CONTENIDO ── */}
            <div style={{ opacity: mounted ? 1 : 0, transition: "opacity 400ms ease 280ms" }}>
                {cargando ? (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 0" }}>
                        <Loader2 size={28} style={{ color: "var(--color-role-universidad)", animation: "spin 0.8s linear infinite" }} />
                        <style>{`@keyframes spin { to { transform:rotate(360deg); } }`}</style>
                    </div>
                ) : (
                    <>

                        {/* ══ TAB: OVERVIEW ══ */}
                        {tabActiva === "overview" && (
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>

                                {sinPerfil(estudiantes, "perfilEstudiante").length > 0 && (
                                    <Panel>
                                        <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--color-border)", display: "flex", alignItems: "center", gap: "8px" }}>
                                            <AlertCircle size={13} style={{ color: "var(--color-warning)" }} />
                                            <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--color-text)" }}>
                                                Estudiantes sin perfil <span style={{ color: "var(--color-text-muted)", fontWeight: 400 }}>({sinPerfil(estudiantes, "perfilEstudiante").length})</span>
                                            </span>
                                        </div>
                                        <div style={{ padding: "8px" }}>
                                            {sinPerfil(estudiantes, "perfilEstudiante").map((u: any) => (
                                                <div key={u.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 8px", borderRadius: "var(--radius-lg)" }}>
                                                    <p style={{ fontSize: "12px", color: "var(--color-text-muted)", margin: 0 }}>{u.name ?? u.email}</p>
                                                    <ActionBtn color="uni" onClick={() => setModal({ tipo: "perfilEstudiante", usuario: u })}>Crear perfil</ActionBtn>
                                                </div>
                                            ))}
                                        </div>
                                    </Panel>
                                )}

                                {sinPerfil(empresas, "perfilEmpresa").length > 0 && (
                                    <Panel>
                                        <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--color-border)", display: "flex", alignItems: "center", gap: "8px" }}>
                                            <AlertCircle size={13} style={{ color: "var(--color-warning)" }} />
                                            <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--color-text)" }}>
                                                Empresas sin perfil <span style={{ color: "var(--color-text-muted)", fontWeight: 400 }}>({sinPerfil(empresas, "perfilEmpresa").length})</span>
                                            </span>
                                        </div>
                                        <div style={{ padding: "8px" }}>
                                            {sinPerfil(empresas, "perfilEmpresa").map((u: any) => (
                                                <div key={u.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 8px", borderRadius: "var(--radius-lg)" }}>
                                                    <p style={{ fontSize: "12px", color: "var(--color-text-muted)", margin: 0 }}>{u.name ?? u.email}</p>
                                                    <ActionBtn color="uni" onClick={() => setModal({ tipo: "perfilEmpresa", usuario: u })}>Crear perfil</ActionBtn>
                                                </div>
                                            ))}
                                        </div>
                                    </Panel>
                                )}

                                {sinPerfil(estudiantes, "perfilEstudiante").length === 0 && sinPerfil(empresas, "perfilEmpresa").length === 0 && (
                                    <Panel style={{ padding: "40px 24px", gridColumn: "1 / -1", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
                                        <div style={{ width: "38px", height: "38px", borderRadius: "var(--radius-lg)", backgroundColor: "var(--color-success-bg)", border: "1px solid rgba(52,201,122,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-success)" }}>
                                            <CheckCircle size={18} />
                                        </div>
                                        <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--color-text)", margin: 0 }}>Todo al día</p>
                                        <p style={{ fontSize: "12px", color: "var(--color-text-muted)", margin: 0, textAlign: "center" as const }}>Todos los usuarios tienen sus perfiles completos</p>
                                    </Panel>
                                )}
                            </div>
                        )}


                        {/* ══ TAB: ESTUDIANTES ══ */}
                        {tabActiva === "estudiantes" && (
                            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                {estudiantes.length === 0 && <EmptyCard icon={<GraduationCap size={18} />} label="Sin estudiantes registrados" />}
                                {estudiantes.map((u: any) => (
                                    <div key={u.id} style={rowStyle}>
                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" as const }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                                <div style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "var(--color-role-universidad)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 700, flexShrink: 0 }}>
                                                    {u.name?.charAt(0).toUpperCase() ?? "E"}
                                                </div>
                                                <div>
                                                    <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--color-text)", margin: 0 }}>{u.name}</p>
                                                    <p style={{ fontSize: "11px", color: "var(--color-text-faint)", margin: 0 }}>{u.email}</p>
                                                    {u.perfilEstudiante?.codigoUsta && (
                                                        <p style={{ fontSize: "10px", color: "var(--color-text-faint)", margin: 0 }}>Código: {u.perfilEstudiante.codigoUsta}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <div>
                                                {u.perfilEstudiante
                                                    ? <Badge color="success"><CheckCircle size={10} />Perfil completo</Badge>
                                                    : <ActionBtn color="uni" onClick={() => setModal({ tipo: "perfilEstudiante", usuario: u })}>Crear perfil</ActionBtn>
                                                }
                                            </div>
                                        </div>
                                        {u.perfilEstudiante && (
                                            <div style={{ marginTop: "10px", paddingTop: "10px", borderTop: "1px solid var(--color-border)", display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "8px" }}>
                                                {[["Programa", u.perfilEstudiante.programa], ["Semestre", u.perfilEstudiante.semestre], ["Teléfono", u.perfilEstudiante.telefono]].map(([k, v]) => (
                                                    <div key={k}>
                                                        <p style={{ fontSize: "10px", color: "var(--color-text-faint)", margin: "0 0 1px" }}>{k}</p>
                                                        <p style={{ fontSize: "11px", color: "var(--color-text-muted)", margin: 0 }}>{v ?? "—"}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}


                        {/* ══ TAB: EMPRESAS ══ */}
                        {tabActiva === "empresas" && (
                            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>

                                {/* Botón agregar empresa dentro del tab también */}
                                <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "4px" }}>
                                    <button
                                        onClick={() => setModal({ tipo: "crearEmpresa" })}
                                        style={{
                                            display: "flex", alignItems: "center", gap: "6px", padding: "7px 14px",
                                            borderRadius: "var(--radius-lg)", border: "1px solid rgba(167,139,250,0.3)",
                                            backgroundColor: "transparent", color: "var(--color-role-universidad)",
                                            fontSize: "11px", fontWeight: 600, cursor: "pointer",
                                            transition: "background var(--transition-fast)",
                                        }}
                                        onMouseEnter={e => { e.currentTarget.style.backgroundColor = "var(--color-role-universidad-bg)"; }}
                                        onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; }}
                                    >
                                        <Building2 size={12} /><Plus size={10} />Agregar empresa
                                    </button>
                                </div>

                                {empresas.length === 0 && <EmptyCard icon={<Building2 size={18} />} label="Sin empresas registradas" />}
                                {empresas.map((u: any) => (
                                    <div key={u.id} style={rowStyle}>
                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" as const }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                                <div style={{ width: "32px", height: "32px", borderRadius: "var(--radius-lg)", backgroundColor: "var(--color-accent-subtle)", border: "1px solid var(--color-accent-border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-accent)", flexShrink: 0 }}>
                                                    <Building2 size={14} />
                                                </div>
                                                <div>
                                                    <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--color-text)", margin: 0 }}>{u.perfilEmpresa?.nombreEmpresa ?? u.name ?? u.email}</p>
                                                    <p style={{ fontSize: "11px", color: "var(--color-text-faint)", margin: 0 }}>{u.email}</p>
                                                </div>
                                            </div>
                                            <div>
                                                {u.perfilEmpresa
                                                    ? <Badge color="success"><CheckCircle size={10} />Perfil completo</Badge>
                                                    : <ActionBtn color="uni" onClick={() => setModal({ tipo: "perfilEmpresa", usuario: u })}>Crear perfil</ActionBtn>
                                                }
                                            </div>
                                        </div>
                                        {u.perfilEmpresa && (
                                            <div style={{ marginTop: "10px", paddingTop: "10px", borderTop: "1px solid var(--color-border)", display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "8px" }}>
                                                {[["Sector", u.perfilEmpresa.sector], ["Ciudad", u.perfilEmpresa.ciudad], ["NIT", u.perfilEmpresa.nit]].map(([k, v]) => (
                                                    <div key={k}>
                                                        <p style={{ fontSize: "10px", color: "var(--color-text-faint)", margin: "0 0 1px" }}>{k}</p>
                                                        <p style={{ fontSize: "11px", color: "var(--color-text-muted)", margin: 0 }}>{v ?? "—"}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}


                        {/* ══ TAB: PRÁCTICAS ══ */}
                        {tabActiva === "practicas" && (
                            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "4px" }}>
                                    <button onClick={() => setModal({ tipo: "asignarPractica" })}
                                        style={{ display: "flex", alignItems: "center", gap: "6px", padding: "7px 14px", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)", backgroundColor: "var(--color-surface-3)", color: "var(--color-text-muted)", fontSize: "11px", fontWeight: 600, cursor: "pointer", transition: "all var(--transition-fast)" }}
                                        onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--color-role-universidad)"; e.currentTarget.style.color = "var(--color-role-universidad)"; }}
                                        onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--color-border)"; e.currentTarget.style.color = "var(--color-text-muted)"; }}
                                    >
                                        <Plus size={12} />Asignar práctica
                                    </button>
                                </div>

                                {practicas.length === 0 && <EmptyCard icon={<Briefcase size={18} />} label="Sin prácticas asignadas" />}

                                {practicas.map((p: any) => (
                                    <div key={p.id} style={rowStyle}>
                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" as const }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                                <div style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "var(--color-success)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 700, flexShrink: 0 }}>
                                                    {p.estudiante?.user?.name?.charAt(0).toUpperCase() ?? "E"}
                                                </div>
                                                <div>
                                                    <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--color-text)", margin: 0 }}>{p.estudiante?.user?.name}</p>
                                                    <p style={{ fontSize: "11px", color: "var(--color-text-faint)", margin: "1px 0", display: "flex", alignItems: "center", gap: "4px" }}>
                                                        <Building2 size={10} />{p.empresa?.nombreEmpresa}{p.descripcionCargo && ` — ${p.descripcionCargo}`}
                                                    </p>
                                                    <p style={{ fontSize: "10px", color: "var(--color-text-faint)", margin: 0 }}>
                                                        {new Date(p.fechaInicio).toLocaleDateString("es-CO")}
                                                        {p.fechaFin && ` → ${new Date(p.fechaFin).toLocaleDateString("es-CO")}`}
                                                    </p>
                                                </div>
                                            </div>

                                            <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" as const }}>
                                                <Badge color={p.activa ? "success" : "muted"}>{p.activa ? "Activa" : "Finalizada"}</Badge>
                                                {p.quedoContratado && <Badge color="success"><CheckCircle size={10} />Contratado</Badge>}
                                                <span style={{ fontSize: "10px", color: "var(--color-text-faint)", display: "flex", alignItems: "center", gap: "3px" }}>
                                                    <FileText size={10} />{p.documentos?.length ?? 0} reportes
                                                </span>
                                                {p.activa && (
                                                    <div style={{ display: "flex", gap: "4px" }}>
                                                        <FinalizarBtn variant="primary" onClick={() => handleFinalizarPractica(p.id, true)}>Finalizó + Contrató</FinalizarBtn>
                                                        <FinalizarBtn variant="ghost" onClick={() => handleFinalizarPractica(p.id, false)}>Finalizar</FinalizarBtn>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>


            {/* ── MODALES ── */}
            {modal?.tipo === "perfilEstudiante" && (
                <ModalCrearPerfilEstudiante usuario={modal.usuario} onClose={() => setModal(null)} onSuccess={handleExito} />
            )}
            {modal?.tipo === "perfilEmpresa" && (
                <ModalCrearPerfilEmpresa usuario={modal.usuario} onClose={() => setModal(null)} onSuccess={handleExito} />
            )}
            {modal?.tipo === "asignarPractica" && (
                <ModalAsignarPractica onClose={() => setModal(null)} onSuccess={handleExito} />
            )}
            {/* NUEVO */}
            {modal?.tipo === "crearEmpresa" && (
                <ModalCrearEmpresa onClose={() => setModal(null)} onSuccess={handleExito} />
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