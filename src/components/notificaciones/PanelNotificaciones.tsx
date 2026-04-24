// sigp-it/src/components/notificaciones/PanelNotificaciones.tsx
import { useRef, useEffect } from "react";
import { useRouter } from "next/router";
import {
    Bell, CheckCheck, FileText,
    Building2, Award, X, Inbox,
} from "lucide-react";
import { Notificacion } from "@/hooks/useNotificaciones";

/* ─────────────────────────────────────────────────────────────────────────
   Iconos y colores por tipo — mapeados al design system
───────────────────────────────────────────────────────────────────────── */
const TIPO_CONFIG: Record<string, {
    icon: JSX.Element;
    color: string;
    bg: string;
}> = {
    REPORTE_SUBIDO: {
        icon: <FileText size={13} />,
        color: "var(--color-accent)",
        bg: "var(--color-accent-subtle)",
    },
    DOCUMENTO_APROBADO: {
        icon: <Award size={13} />,
        color: "var(--color-success)",
        bg: "var(--color-success-bg)",
    },
    DOCUMENTO_RECHAZADO: {
        icon: <X size={13} />,
        color: "var(--color-error)",
        bg: "var(--color-error-bg)",
    },
    PRACTICA_ASIGNADA: {
        icon: <Building2 size={13} />,
        color: "var(--color-role-universidad)",
        bg: "var(--color-role-universidad-bg)",
    },
};

const FALLBACK_CONFIG = {
    icon: <Bell size={13} />,
    color: "var(--color-text-muted)",
    bg: "var(--color-surface-3)",
};

/* ─────────────────────────────────────────────────────────────────────────
   Helpers
───────────────────────────────────────────────────────────────────────── */
function tiempoRelativo(fecha: string): string {
    const diff = Date.now() - new Date(fecha).getTime();
    const min = Math.floor(diff / 60000);
    if (min < 1) return "ahora mismo";
    if (min < 60) return `hace ${min}m`;
    const hrs = Math.floor(min / 60);
    if (hrs < 24) return `hace ${hrs}h`;
    return `hace ${Math.floor(hrs / 24)}d`;
}

/* ─────────────────────────────────────────────────────────────────────────
   Props
───────────────────────────────────────────────────────────────────────── */
interface PanelNotificacionesProps {
    notificaciones: Notificacion[];
    noLeidas: number;
    onMarcarTodas: () => void;
    onMarcarUna: (id: string) => void;
    onCerrar: () => void;
}

/* ─────────────────────────────────────────────────────────────────────────
   Componente
───────────────────────────────────────────────────────────────────────── */
export default function PanelNotificaciones({
    notificaciones, noLeidas, onMarcarTodas, onMarcarUna, onCerrar,
}: PanelNotificacionesProps) {
    const router = useRouter();
    const panelRef = useRef<HTMLDivElement>(null);

    /* Cerrar al hacer clic fuera */
    useEffect(() => {
        function handleClickFuera(e: MouseEvent) {
            if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
                onCerrar();
            }
        }
        document.addEventListener("mousedown", handleClickFuera);
        return () => document.removeEventListener("mousedown", handleClickFuera);
    }, [onCerrar]);

    const handleClickNotif = async (n: Notificacion) => {
        if (!n.leida) await onMarcarUna(n.id);
        if (n.enlace) { router.push(n.enlace); onCerrar(); }
    };

    return (
        <div
            ref={panelRef}
            className="animate-scale-in"
            style={{
                position: "absolute",
                right: 0,
                top: "calc(100% + 8px)",
                width: "320px",
                backgroundColor: "var(--color-surface-2)",
                border: "1px solid var(--color-border-medium)",
                borderRadius: "var(--radius-xl)",
                boxShadow: "var(--shadow-xl)",
                overflow: "hidden",
                zIndex: 50,
                transformOrigin: "top right",
            }}
        >
            {/* Shimmer superior */}
            <div style={{
                position: "absolute",
                top: 0,
                left: "15%",
                right: "15%",
                height: "1px",
                background: "linear-gradient(90deg, transparent, var(--color-accent-border), transparent)",
            }} />

            {/* ── Header ── */}
            <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 16px",
                borderBottom: "1px solid var(--color-border)",
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Bell size={14} style={{ color: "var(--color-accent)" }} />
                    <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--color-text)" }}>
                        Notificaciones
                    </span>
                    {noLeidas > 0 && (
                        <span style={{
                            fontSize: "10px",
                            fontWeight: 600,
                            padding: "1px 6px",
                            borderRadius: "var(--radius-full)",
                            backgroundColor: "var(--color-accent-subtle)",
                            color: "var(--color-accent)",
                            border: "1px solid var(--color-accent-border)",
                        }}>
                            {noLeidas}
                        </span>
                    )}
                </div>

                {noLeidas > 0 && (
                    <button
                        onClick={onMarcarTodas}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            fontSize: "11px",
                            fontWeight: 500,
                            color: "var(--color-text-muted)",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            padding: "2px 4px",
                            borderRadius: "var(--radius-sm)",
                            transition: "color var(--transition-fast)",
                        }}
                        onMouseEnter={e => (e.currentTarget.style.color = "var(--color-accent)")}
                        onMouseLeave={e => (e.currentTarget.style.color = "var(--color-text-muted)")}
                    >
                        <CheckCheck size={12} />
                        Leer todas
                    </button>
                )}
            </div>

            {/* ── Lista ── */}
            <div style={{ maxHeight: "360px", overflowY: "auto" }}>
                {notificaciones.length === 0 ? (

                    /* Estado vacío */
                    <div style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "40px 24px",
                        textAlign: "center",
                        gap: "10px",
                    }}>
                        <div style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "var(--radius-lg)",
                            backgroundColor: "var(--color-surface-3)",
                            border: "1px solid var(--color-border)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "var(--color-text-faint)",
                        }}>
                            <Inbox size={18} />
                        </div>
                        <div>
                            <p style={{ fontSize: "13px", fontWeight: 500, color: "var(--color-text-muted)", margin: "0 0 3px" }}>
                                Sin notificaciones
                            </p>
                            <p style={{ fontSize: "12px", color: "var(--color-text-faint)", margin: 0, maxWidth: "24ch" }}>
                                Los eventos importantes aparecerán aquí
                            </p>
                        </div>
                    </div>

                ) : (
                    notificaciones.map((n, i) => {
                        const cfg = TIPO_CONFIG[n.tipo] ?? FALLBACK_CONFIG;
                        return (
                            <button
                                key={n.id}
                                onClick={() => handleClickNotif(n)}
                                style={{
                                    width: "100%",
                                    textAlign: "left",
                                    padding: "12px 16px",
                                    display: "flex",
                                    alignItems: "flex-start",
                                    gap: "10px",
                                    background: !n.leida ? "var(--color-surface-3)" : "transparent",
                                    borderBottom: i < notificaciones.length - 1 ? "1px solid var(--color-border)" : "none",
                                    border: "none",
                                    cursor: "pointer",
                                    transition: "background var(--transition-fast)",
                                }}
                                onMouseEnter={e => (e.currentTarget.style.backgroundColor = "var(--color-surface-hover)")}
                                onMouseLeave={e => (e.currentTarget.style.backgroundColor = !n.leida ? "var(--color-surface-3)" : "transparent")}
                            >
                                {/* Ícono tipo */}
                                <div style={{
                                    flexShrink: 0,
                                    marginTop: "1px",
                                    width: "28px",
                                    height: "28px",
                                    borderRadius: "var(--radius-md)",
                                    backgroundColor: cfg.bg,
                                    color: cfg.color,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}>
                                    {cfg.icon}
                                </div>

                                {/* Contenido */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "6px" }}>
                                        <p style={{
                                            fontSize: "12px",
                                            fontWeight: !n.leida ? 600 : 500,
                                            color: !n.leida ? "var(--color-text)" : "var(--color-text-muted)",
                                            margin: 0,
                                            lineHeight: 1.35,
                                        }}>
                                            {n.titulo}
                                        </p>
                                        {/* Punto de no leída */}
                                        {!n.leida && (
                                            <span style={{
                                                flexShrink: 0,
                                                marginTop: "4px",
                                                width: "6px",
                                                height: "6px",
                                                borderRadius: "50%",
                                                backgroundColor: "var(--color-accent)",
                                            }} />
                                        )}
                                    </div>
                                    <p style={{
                                        fontSize: "11px",
                                        color: "var(--color-text-muted)",
                                        margin: "3px 0 4px",
                                        lineHeight: 1.4,
                                        display: "-webkit-box",
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: "vertical",
                                        overflow: "hidden",
                                    }}>
                                        {n.mensaje}
                                    </p>
                                    <p style={{ fontSize: "10px", color: "var(--color-text-faint)", margin: 0 }}>
                                        {tiempoRelativo(n.createdAt)}
                                    </p>
                                </div>
                            </button>
                        );
                    })
                )}
            </div>
        </div>
    );
}