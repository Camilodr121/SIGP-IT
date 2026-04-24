import { useState, useEffect, useCallback } from "react";
import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import { useRouter } from "next/router";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Users, Building2, Calendar, FileText, Loader2, ChevronRight, Search } from "lucide-react";

function EstadoBadge({ activa }: { activa: boolean }) {
    return (
        <span style={{
            display: "inline-flex", alignItems: "center", gap: "4px",
            padding: "2px 8px", borderRadius: "var(--radius-full)",
            fontSize: "10px", fontWeight: 600,
            backgroundColor: activa ? "var(--color-success-bg)" : "rgba(255,255,255,0.04)",
            color: activa ? "var(--color-success)" : "var(--color-text-faint)",
            border: activa ? "1px solid rgba(52,201,122,0.2)" : "1px solid var(--color-border)",
        }}>
            {activa ? "Activa" : "Finalizada"}
        </span>
    );
}

export default function PracticantesPage() {
    const router = useRouter();
    const [practicas, setPracticas] = useState<any[]>([]);
    const [cargando, setCargando] = useState(true);
    const [busqueda, setBusqueda] = useState("");
    const [filtro, setFiltro] = useState<"todas" | "activas" | "finalizadas">("todas");
    const [mounted, setMounted] = useState(false);

    useEffect(() => { const t = setTimeout(() => setMounted(true), 40); return () => clearTimeout(t); }, []);

    const fetchDatos = useCallback(async () => {
        setCargando(true);
        const res = await fetch("/api/practicas");
        const data = await res.json();
        setPracticas(data.data ?? []);
        setCargando(false);
    }, []);

    useEffect(() => { fetchDatos(); }, [fetchDatos]);

    const practicasFiltradas = practicas.filter(p => {
        const nombre = p.estudiante?.user?.name?.toLowerCase() ?? "";
        const empresa = p.empresa?.nombreEmpresa?.toLowerCase() ?? "";
        const q = busqueda.toLowerCase();
        const coincide = nombre.includes(q) || empresa.includes(q);
        if (filtro === "activas") return p.activa && coincide;
        if (filtro === "finalizadas") return !p.activa && coincide;
        return coincide;
    });

    const FILTROS = [
        { id: "todas", label: "Todas", count: practicas.length },
        { id: "activas", label: "Activas", count: practicas.filter(p => p.activa).length },
        { id: "finalizadas", label: "Finalizadas", count: practicas.filter(p => !p.activa).length },
    ] as const;

    return (
        <DashboardLayout title="Practicantes">
            {/* Header */}
            <div style={{ marginBottom: "18px", opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(-6px)", transition: "opacity 350ms cubic-bezier(0.16,1,0.3,1),transform 350ms cubic-bezier(0.16,1,0.3,1)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                    <span style={{ width: "5px", height: "5px", borderRadius: "50%", backgroundColor: "var(--color-role-universidad)", display: "inline-block" }} />
                    <span style={{ fontSize: "9px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "var(--color-role-universidad)" }}>Universidad</span>
                </div>
                <h2 style={{ fontSize: "clamp(1rem,1.8vw,1.25rem)", fontWeight: 700, color: "var(--color-text)", margin: "0 0 2px", letterSpacing: "-0.02em" }}>Practicantes</h2>
                <p style={{ fontSize: "12px", color: "var(--color-text-muted)", margin: 0 }}>
                    {practicas.length} práctica{practicas.length !== 1 ? "s" : ""} registrada{practicas.length !== 1 ? "s" : ""}
                </p>
            </div>

            {/* Barra de búsqueda + filtros */}
            <div style={{ display: "flex", gap: "10px", marginBottom: "14px", flexWrap: "wrap" as const, opacity: mounted ? 1 : 0, transition: "opacity 400ms ease 120ms" }}>
                {/* Search */}
                <div style={{ position: "relative", flex: 1, minWidth: "200px" }}>
                    <Search size={13} style={{ position: "absolute", left: "11px", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-faint)", pointerEvents: "none" }} />
                    <input
                        type="text"
                        placeholder="Buscar por nombre o empresa…"
                        value={busqueda}
                        onChange={e => setBusqueda(e.target.value)}
                        style={{
                            width: "100%", padding: "8px 12px 8px 32px",
                            backgroundColor: "rgba(13,14,21,0.55)", backdropFilter: "blur(12px)",
                            border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)",
                            color: "var(--color-text)", fontSize: "12px", outline: "none",
                        }}
                        onFocus={e => { e.currentTarget.style.borderColor = "var(--color-role-universidad)"; e.currentTarget.style.boxShadow = "0 0 0 3px var(--color-role-universidad-bg)"; }}
                        onBlur={e => { e.currentTarget.style.borderColor = "var(--color-border)"; e.currentTarget.style.boxShadow = "none"; }}
                    />
                </div>

                {/* Filtros */}
                <div style={{ display: "flex", gap: "4px", backgroundColor: "rgba(13,14,21,0.55)", backdropFilter: "blur(12px)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-xl)", padding: "3px" }}>
                    {FILTROS.map(f => {
                        const active = filtro === f.id;
                        return (
                            <button key={f.id} onClick={() => setFiltro(f.id)}
                                style={{
                                    display: "flex", alignItems: "center", gap: "5px", padding: "5px 12px",
                                    borderRadius: "var(--radius-lg)", border: "none", cursor: "pointer",
                                    fontSize: "11px", fontWeight: active ? 600 : 400,
                                    backgroundColor: active ? "var(--color-role-universidad)" : "transparent",
                                    color: active ? "#fff" : "var(--color-text-muted)",
                                    transition: "all var(--transition-fast)",
                                }}>
                                {f.label}
                                <span style={{ fontSize: "10px", opacity: 0.75 }}>({f.count})</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Lista */}
            {cargando ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 0" }}>
                    <Loader2 size={26} style={{ color: "var(--color-role-universidad)", animation: "spin 0.8s linear infinite" }} />
                    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                </div>
            ) : practicasFiltradas.length === 0 ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "48px 24px", gap: "8px", backgroundColor: "rgba(13,14,21,0.45)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-xl)" }}>
                    <Users size={28} style={{ color: "var(--color-text-faint)" }} />
                    <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--color-text)", margin: 0 }}>Sin resultados</p>
                    <p style={{ fontSize: "12px", color: "var(--color-text-muted)", margin: 0 }}>
                        {busqueda ? `No se encontraron prácticas para "${busqueda}"` : "No hay prácticas en esta categoría"}
                    </p>
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {practicasFiltradas.map((p: any, i: number) => {
                        const nombre = p.estudiante?.user?.name ?? "Estudiante";
                        const email = p.estudiante?.user?.email ?? "";
                        const empresa = p.empresa?.nombreEmpresa ?? "—";
                        const cargo = p.descripcionCargo ?? "";
                        const docs = p.documentos?.length ?? 0;

                        return (
                            <div key={p.id}
                                onClick={() => router.push(`/dashboard/universidad/practicantes/${p.id}`)}
                                style={{
                                    display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" as const,
                                    padding: "14px 16px",
                                    backgroundColor: "rgba(13,14,21,0.45)", backdropFilter: "blur(8px)",
                                    border: "1px solid var(--color-border)", borderRadius: "var(--radius-xl)",
                                    cursor: "pointer", transition: "all 150ms ease",
                                    opacity: mounted ? 1 : 0,
                                    transitionDelay: `${i * 30}ms`,
                                }}
                                onMouseEnter={e => { e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.04)"; e.currentTarget.style.borderColor = "rgba(99,102,241,0.25)"; e.currentTarget.style.transform = "translateX(2px)"; }}
                                onMouseLeave={e => { e.currentTarget.style.backgroundColor = "rgba(13,14,21,0.45)"; e.currentTarget.style.borderColor = "var(--color-border)"; e.currentTarget.style.transform = "translateX(0)"; }}
                            >
                                {/* Avatar + info */}
                                <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1, minWidth: 0 }}>
                                    <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "var(--color-role-universidad)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: 700, flexShrink: 0 }}>
                                        {nombre.charAt(0).toUpperCase()}
                                    </div>
                                    <div style={{ minWidth: 0 }}>
                                        <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--color-text)", margin: "0 0 2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{nombre}</p>
                                        <p style={{ fontSize: "10px", color: "var(--color-text-faint)", margin: 0 }}>{email}</p>
                                        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "3px", flexWrap: "wrap" as const }}>
                                            <span style={{ fontSize: "11px", color: "var(--color-text-muted)", display: "flex", alignItems: "center", gap: "4px" }}>
                                                <Building2 size={10} />{empresa}{cargo && ` — ${cargo}`}
                                            </span>
                                            <span style={{ fontSize: "10px", color: "var(--color-text-faint)", display: "flex", alignItems: "center", gap: "3px" }}>
                                                <Calendar size={9} />
                                                {new Date(p.fechaInicio).toLocaleDateString("es-CO")}
                                                {p.fechaFin && ` → ${new Date(p.fechaFin).toLocaleDateString("es-CO")}`}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Derecha */}
                                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                                    <span style={{ fontSize: "10px", color: "var(--color-text-faint)", display: "flex", alignItems: "center", gap: "3px" }}>
                                        <FileText size={10} />{docs} doc{docs !== 1 ? "s" : ""}
                                    </span>
                                    <EstadoBadge activa={p.activa} />
                                    <ChevronRight size={13} style={{ color: "var(--color-text-faint)" }} />
                                </div>
                            </div>
                        );
                    })}
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