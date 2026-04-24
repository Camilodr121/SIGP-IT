// sigp-it/src/components/layout/DashboardLayout.tsx
import { ReactNode, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { signOut, useSession } from "next-auth/react";
import {
    LayoutDashboard, FileText, Building2, BarChart2,
    Bell, LogOut, GraduationCap, Users, BookOpen,
    TrendingUp, ChevronRight,
} from "lucide-react";
import { useNotificaciones } from "@/hooks/useNotificaciones";
import PanelNotificaciones from "@/components/notificaciones/PanelNotificaciones";

/* ─────────────────────────────────────────────────────────────────────────
   Logo
───────────────────────────────────────────────────────────────────────── */
function LogoMark({ size = 22 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="2.5" fill="currentColor" opacity="0.95" />
            <circle cx="4" cy="4" r="1.8" fill="currentColor" opacity="0.6" />
            <circle cx="20" cy="4" r="1.8" fill="currentColor" opacity="0.6" />
            <circle cx="4" cy="20" r="1.8" fill="currentColor" opacity="0.6" />
            <circle cx="20" cy="20" r="1.8" fill="currentColor" opacity="0.6" />
            <line x1="5.3" y1="5.3" x2="10.2" y2="10.2" stroke="currentColor" strokeWidth="1.2" opacity="0.4" strokeLinecap="round" />
            <line x1="18.7" y1="5.3" x2="13.8" y2="10.2" stroke="currentColor" strokeWidth="1.2" opacity="0.4" strokeLinecap="round" />
            <line x1="5.3" y1="18.7" x2="10.2" y2="13.8" stroke="currentColor" strokeWidth="1.2" opacity="0.4" strokeLinecap="round" />
            <line x1="18.7" y1="18.7" x2="13.8" y2="13.8" stroke="currentColor" strokeWidth="1.2" opacity="0.4" strokeLinecap="round" />
        </svg>
    );
}

/* ─────────────────────────────────────────────────────────────────────────
   Nav items por rol
───────────────────────────────────────────────────────────────────────── */
const NAV_ESTUDIANTE = [
    { href: "/dashboard/estudiante", icon: <LayoutDashboard size={15} />, label: "Inicio" },
    { href: "/dashboard/estudiante/reportes", icon: <FileText size={15} />, label: "Mis Reportes" },
    { href: "/dashboard/estudiante/practica", icon: <BookOpen size={15} />, label: "Mi Práctica" },
    { href: "/dashboard/estudiante/empresas", icon: <Building2 size={15} />, label: "Empresas" },
];
const NAV_UNIVERSIDAD = [
    { href: "/dashboard/universidad", icon: <LayoutDashboard size={15} />, label: "Inicio" },
    { href: "/dashboard/universidad/practicantes", icon: <Users size={15} />, label: "Practicantes" },
    { href: "/dashboard/universidad/reportes", icon: <FileText size={15} />, label: "Documentos" },
    { href: "/dashboard/universidad/analiticas", icon: <BarChart2 size={15} />, label: "Estadísticas" },
];

const NAV_EMPRESA = [
    { href: "/dashboard/empresa", icon: <LayoutDashboard size={15} />, label: "Inicio" },
    { href: "/dashboard/empresa/practicantes", icon: <Users size={15} />, label: "Practicantes" },
    { href: "/dashboard/empresa/reportes", icon: <FileText size={15} />, label: "Reportes" },
    { href: "/dashboard/empresa/analiticas", icon: <TrendingUp size={15} />, label: "Analíticas" },
];

const NAV_MAP: Record<string, typeof NAV_ESTUDIANTE> = {
    ESTUDIANTE: NAV_ESTUDIANTE,
    UNIVERSIDAD: NAV_UNIVERSIDAD,
    EMPRESA: NAV_EMPRESA,
};

const ROLE_CONFIG: Record<string, { label: string; color: string }> = {
    ESTUDIANTE: { label: "Estudiante", color: "var(--color-role-estudiante)" },
    UNIVERSIDAD: { label: "Universidad", color: "var(--color-role-universidad)" },
    EMPRESA: { label: "Empresa", color: "var(--color-role-empresa)" },
};

/* ─────────────────────────────────────────────────────────────────────────
   Canvas de fondo — partículas + anillo sutil (igual al login, más tenue)
───────────────────────────────────────────────────────────────────────── */
function BackgroundCanvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let raf: number;
        let angle = 0;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener("resize", resize);

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const cx = canvas.width / 2;
            const cy = canvas.height / 2;
            const r1 = Math.min(canvas.width, canvas.height) * 0.45;

            /* Anillo exterior muy sutil */
            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(angle);

            ctx.beginPath();
            ctx.arc(0, 0, r1, 0, Math.PI * 2);
            ctx.strokeStyle = "rgba(79,110,247,0.04)";
            ctx.lineWidth = 1;
            ctx.stroke();

            /* Arco brillante — muy tenue en dashboard */
            ctx.beginPath();
            ctx.arc(0, 0, r1, angle * 0.3, angle * 0.3 + Math.PI * 0.5);
            const g1 = ctx.createLinearGradient(-r1, 0, r1, 0);
            g1.addColorStop(0, "rgba(79,110,247,0.0)");
            g1.addColorStop(0.5, "rgba(79,110,247,0.18)");
            g1.addColorStop(1, "rgba(79,110,247,0.0)");
            ctx.strokeStyle = g1;
            ctx.lineWidth = 1;
            ctx.stroke();

            /* Anillo interior inverso */
            const r2 = r1 * 0.6;
            ctx.beginPath();
            ctx.arc(0, 0, r2, -angle * 1.4, -angle * 1.4 + Math.PI * 0.35);
            const g2 = ctx.createLinearGradient(-r2, 0, r2, 0);
            g2.addColorStop(0, "rgba(147,112,247,0.0)");
            g2.addColorStop(0.5, "rgba(147,112,247,0.12)");
            g2.addColorStop(1, "rgba(147,112,247,0.0)");
            ctx.strokeStyle = g2;
            ctx.lineWidth = 0.8;
            ctx.stroke();

            ctx.restore();

            /* Glow central muy difuso */
            const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, r1 * 0.9);
            glow.addColorStop(0, "rgba(79,110,247,0.03)");
            glow.addColorStop(0.6, "rgba(79,110,247,0.01)");
            glow.addColorStop(1, "rgba(0,0,0,0)");
            ctx.fillStyle = glow;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            angle += 0.003;
            raf = requestAnimationFrame(draw);
        };

        draw();
        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener("resize", resize);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            aria-hidden="true"
            style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}
        />
    );
}

/* ─────────────────────────────────────────────────────────────────────────
   Partículas estáticas
───────────────────────────────────────────────────────────────────────── */
interface Particle { id: number; x: number; y: number; size: number; opacity: number; duration: number; delay: number; }

function StarField() {
    const [stars, setStars] = useState<Particle[]>([]);
    useEffect(() => {
        setStars(Array.from({ length: 60 }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 1.4 + 0.4,
            opacity: Math.random() * 0.35 + 0.08,
            duration: Math.random() * 6 + 4,
            delay: Math.random() * 6,
        })));
    }, []);

    return (
        <>
            {stars.map(s => (
                <div key={s.id} aria-hidden="true" style={{
                    position: "fixed",
                    left: `${s.x}%`,
                    top: `${s.y}%`,
                    width: `${s.size}px`,
                    height: `${s.size}px`,
                    borderRadius: "50%",
                    backgroundColor: s.id % 3 === 0
                        ? `rgba(147,112,247,${s.opacity})`
                        : `rgba(200,210,255,${s.opacity})`,
                    animation: `twinkle-star ${s.duration}s ${s.delay}s ease-in-out infinite alternate`,
                    pointerEvents: "none",
                    zIndex: 0,
                }} />
            ))}
        </>
    );
}

/* ─────────────────────────────────────────────────────────────────────────
   NavItem
───────────────────────────────────────────────────────────────────────── */
function NavItem({ href, icon, label, roleColor }: {
    href: string; icon: JSX.Element; label: string; roleColor: string;
}) {
    const router = useRouter();
    const active = router.pathname === href;
    const [hov, setHov] = useState(false);

    return (
        <Link
            href={href}
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
            style={{
                display: "flex",
                alignItems: "center",
                gap: "9px",
                padding: "7px 10px",
                borderRadius: "var(--radius-lg)",
                textDecoration: "none",
                fontSize: "13px",
                fontWeight: active ? 600 : 400,
                color: active ? "var(--color-text)" : hov ? "var(--color-text)" : "var(--color-text-muted)",
                backgroundColor: active ? "var(--color-surface-3)" : hov ? "var(--color-surface-hover)" : "transparent",
                transition: "all var(--transition-fast)",
                position: "relative",
            }}
        >
            {/* Indicador activo */}
            {active && (
                <span style={{
                    position: "absolute",
                    left: "6px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: "3px",
                    height: "14px",
                    borderRadius: "2px",
                    backgroundColor: roleColor,
                    opacity: 0.9,
                }} />
            )}
            <span style={{
                marginLeft: active ? "8px" : "0",
                color: active ? roleColor : "inherit",
                display: "flex",
                alignItems: "center",
                transition: "margin var(--transition-fast)",
            }}>
                {icon}
            </span>
            {label}
            {active && (
                <ChevronRight size={11} style={{
                    marginLeft: "auto",
                    color: "var(--color-text-faint)",
                    opacity: 0.6,
                }} />
            )}
        </Link>
    );
}

/* ─────────────────────────────────────────────────────────────────────────
   DashboardLayout
───────────────────────────────────────────────────────────────────────── */
interface DashboardLayoutProps {
    children: ReactNode;
    title: string;
}

export default function DashboardLayout({ children, title }: DashboardLayoutProps) {
    const { data: session } = useSession();
    const role = (session?.user?.role as string) ?? "ESTUDIANTE";
    const nombre = session?.user?.name ?? "Usuario";
    const inicial = nombre.charAt(0).toUpperCase();
    const navItems = NAV_MAP[role] ?? NAV_ESTUDIANTE;
    const roleCfg = ROLE_CONFIG[role] ?? ROLE_CONFIG.ESTUDIANTE;
    const [showNotif, setShowNotif] = useState(false);

    const {
        notificaciones, noLeidas,
        marcarTodasLeidas, marcarUnaLeida,
    } = useNotificaciones();

    return (
        <>
            {/* Keyframes globales del layout */}
            <style>{`
        @keyframes twinkle-star {
          0%   { opacity: 0.08; transform: scale(0.8); }
          100% { opacity: 0.45; transform: scale(1.3); }
        }
      `}</style>

            {/* ── Fondo ── */}
            <div style={{
                position: "fixed",
                inset: 0,
                backgroundColor: "var(--color-bg)",
                zIndex: 0,
            }} />
            <StarField />
            <BackgroundCanvas />

            {/* Gradiente focal central */}
            <div aria-hidden="true" style={{
                position: "fixed",
                inset: 0,
                background: "radial-gradient(ellipse 65% 55% at 50% 45%, rgba(79,110,247,0.07) 0%, transparent 70%)",
                pointerEvents: "none",
                zIndex: 0,
            }} />

            {/* Viñeta perimetral */}
            <div aria-hidden="true" style={{
                position: "fixed",
                inset: 0,
                background: "radial-gradient(ellipse 120% 120% at 50% 50%, transparent 45%, rgba(8,9,14,0.7) 100%)",
                pointerEvents: "none",
                zIndex: 0,
            }} />

            {/* ── Shell principal ── */}
            <div style={{
                position: "relative",
                zIndex: 1,
                display: "flex",
                height: "100dvh",
                overflow: "hidden",
            }}>

                {/* ════════════════════════════════════
            SIDEBAR
        ════════════════════════════════════ */}
                <aside style={{
                    width: "210px",
                    flexShrink: 0,
                    display: "flex",
                    flexDirection: "column",
                    height: "100dvh",
                    backgroundColor: "rgba(13,14,21,0.6)",
                    backdropFilter: "blur(20px)",
                    WebkitBackdropFilter: "blur(20px)",
                    borderRight: "1px solid var(--color-border)",
                    padding: "0",
                }}>

                    {/* Logo */}
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "9px",
                        padding: "16px 14px 14px",
                        borderBottom: "1px solid var(--color-border)",
                        flexShrink: 0,
                    }}>
                        <div style={{
                            width: "30px",
                            height: "30px",
                            borderRadius: "var(--radius-md)",
                            backgroundColor: "var(--color-accent-subtle)",
                            border: "1px solid var(--color-accent-border)",
                            color: "var(--color-accent)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                        }}>
                            <LogoMark size={17} />
                        </div>
                        <div style={{ minWidth: 0 }}>
                            <p style={{ fontSize: "13px", fontWeight: 700, color: "var(--color-text)", margin: 0, letterSpacing: "-0.02em", lineHeight: 1.1 }}>SIGP-IT</p>
                            <p style={{ fontSize: "10px", color: "var(--color-text-faint)", margin: 0, lineHeight: 1.2, marginTop: "1px" }}>Gestión de Prácticas</p>
                        </div>
                    </div>

                    {/* Nav */}
                    <nav style={{ flex: 1, padding: "10px 8px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "1px" }} aria-label="Navegación principal">
                        <p style={{ fontSize: "9px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-text-faint)", padding: "8px 10px 6px", margin: 0 }}>
                            Navegación
                        </p>
                        {navItems.map(item => (
                            <NavItem key={item.href} {...item} roleColor={roleCfg.color} />
                        ))}
                    </nav>

                    {/* Usuario — pegado al fondo con separador */}
                    <div style={{
                        flexShrink: 0,
                        borderTop: "1px solid var(--color-border)",
                        padding: "10px 8px",
                    }}>
                        {/* Info usuario */}
                        <div style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "9px",
                            padding: "8px 10px",
                            borderRadius: "var(--radius-lg)",
                            backgroundColor: "var(--color-surface-3)",
                            border: "1px solid var(--color-border)",
                            marginBottom: "6px",
                        }}>
                            <div style={{
                                width: "28px",
                                height: "28px",
                                borderRadius: "50%",
                                backgroundColor: roleCfg.color,
                                color: "#fff",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "11px",
                                fontWeight: 700,
                                flexShrink: 0,
                            }}>
                                {inicial}
                            </div>
                            <div style={{ minWidth: 0, flex: 1 }}>
                                <p style={{ fontSize: "12px", fontWeight: 600, color: "var(--color-text)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                    {nombre.split(" ")[0]}
                                </p>
                                <p style={{ fontSize: "10px", color: roleCfg.color, margin: 0, fontWeight: 500 }}>
                                    {roleCfg.label}
                                </p>
                            </div>
                        </div>

                        {/* Cerrar sesión */}
                        <button
                            onClick={() => signOut({ callbackUrl: "/auth/login" })}
                            style={{
                                width: "100%",
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                padding: "7px 10px",
                                borderRadius: "var(--radius-lg)",
                                border: "none",
                                background: "transparent",
                                cursor: "pointer",
                                fontSize: "12px",
                                fontWeight: 500,
                                color: "var(--color-text-muted)",
                                transition: "all var(--transition-fast)",
                            }}
                            onMouseEnter={e => {
                                const b = e.currentTarget;
                                b.style.backgroundColor = "var(--color-error-bg)";
                                b.style.color = "var(--color-error)";
                            }}
                            onMouseLeave={e => {
                                const b = e.currentTarget;
                                b.style.backgroundColor = "transparent";
                                b.style.color = "var(--color-text-muted)";
                            }}
                        >
                            <LogOut size={13} />
                            Cerrar sesión
                        </button>
                    </div>
                </aside>

                {/* ════════════════════════════════════
            ÁREA PRINCIPAL
        ════════════════════════════════════ */}
                <div style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                    minWidth: 0,
                }}>

                    {/* Topbar */}
                    <header style={{
                        flexShrink: 0,
                        height: "52px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "0 20px",
                        backgroundColor: "rgba(13,14,21,0.5)",
                        backdropFilter: "blur(16px)",
                        WebkitBackdropFilter: "blur(16px)",
                        borderBottom: "1px solid var(--color-border)",
                    }}>
                        <h1 style={{
                            fontSize: "14px",
                            fontWeight: 600,
                            color: "var(--color-text)",
                            margin: 0,
                            letterSpacing: "-0.01em",
                        }}>
                            {title}
                        </h1>

                        {/* Acciones topbar */}
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>

                            {/* Notificaciones */}
                            <div style={{ position: "relative" }}>
                                <button
                                    onClick={() => setShowNotif(p => !p)}
                                    aria-label="Notificaciones"
                                    style={{
                                        width: "32px",
                                        height: "32px",
                                        borderRadius: "var(--radius-md)",
                                        border: "1px solid var(--color-border)",
                                        backgroundColor: showNotif ? "var(--color-surface-3)" : "var(--color-surface-2)",
                                        color: "var(--color-text-muted)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        cursor: "pointer",
                                        position: "relative",
                                        transition: "all var(--transition-fast)",
                                    }}
                                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "var(--color-surface-3)"; (e.currentTarget as HTMLButtonElement).style.color = "var(--color-text)"; }}
                                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = showNotif ? "var(--color-surface-3)" : "var(--color-surface-2)"; (e.currentTarget as HTMLButtonElement).style.color = "var(--color-text-muted)"; }}
                                >
                                    <Bell size={14} />
                                    {noLeidas > 0 && (
                                        <span style={{
                                            position: "absolute",
                                            top: "4px",
                                            right: "4px",
                                            width: "7px",
                                            height: "7px",
                                            borderRadius: "50%",
                                            backgroundColor: "var(--color-accent)",
                                            border: "1.5px solid var(--color-bg)",
                                        }} />
                                    )}
                                </button>

                                {showNotif && (
                                    <PanelNotificaciones
                                        notificaciones={notificaciones}
                                        noLeidas={noLeidas}
                                        onMarcarTodas={marcarTodasLeidas}
                                        onMarcarUna={marcarUnaLeida}
                                        onCerrar={() => setShowNotif(false)}
                                    />
                                )}
                            </div>

                            {/* Avatar */}
                            <div style={{
                                width: "32px",
                                height: "32px",
                                borderRadius: "50%",
                                backgroundColor: roleCfg.color,
                                color: "#fff",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "12px",
                                fontWeight: 700,
                                border: "1.5px solid rgba(255,255,255,0.12)",
                                flexShrink: 0,
                            }}>
                                {inicial}
                            </div>
                        </div>
                    </header>

                    {/* Contenido scrollable */}
                    <main
                        id="main-content"
                        style={{
                            flex: 1,
                            overflowY: "auto",
                            padding: "20px",
                        }}
                    >
                        {children}
                    </main>
                </div>
            </div>
        </>
    );
}