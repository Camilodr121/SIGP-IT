import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import AuthLayout from "@/components/layout/AuthLayout";

/* ─────────────────────────────────────────────────────────────────────────
   Logo mark
───────────────────────────────────────────────────────────────────────── */
function LogoMark({ size = 26 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="2.5" fill="currentColor" opacity="0.95" />
            <circle cx="4" cy="4" r="1.8" fill="currentColor" opacity="0.6" />
            <circle cx="20" cy="4" r="1.8" fill="currentColor" opacity="0.6" />
            <circle cx="4" cy="20" r="1.8" fill="currentColor" opacity="0.6" />
            <circle cx="20" cy="20" r="1.8" fill="currentColor" opacity="0.6" />
            <line x1="5.3" y1="5.3" x2="10.2" y2="10.2" stroke="currentColor" strokeWidth="1.3" opacity="0.4" strokeLinecap="round" />
            <line x1="18.7" y1="5.3" x2="13.8" y2="10.2" stroke="currentColor" strokeWidth="1.3" opacity="0.4" strokeLinecap="round" />
            <line x1="5.3" y1="18.7" x2="10.2" y2="13.8" stroke="currentColor" strokeWidth="1.3" opacity="0.4" strokeLinecap="round" />
            <line x1="18.7" y1="18.7" x2="13.8" y2="13.8" stroke="currentColor" strokeWidth="1.3" opacity="0.4" strokeLinecap="round" />
        </svg>
    );
}

/* ─────────────────────────────────────────────────────────────────────────
   Partículas
───────────────────────────────────────────────────────────────────────── */
interface Particle { id: number; x: number; y: number; size: number; opacity: number; duration: number; delay: number; }
function useParticles(count: number): Particle[] {
    const [particles, setParticles] = useState<Particle[]>([]);
    useEffect(() => {
        setParticles(Array.from({ length: count }, (_, i) => ({
            id: i,
            x: Math.random() * 100, y: Math.random() * 100,
            size: Math.random() * 1.5 + 0.5,
            opacity: Math.random() * 0.4 + 0.1,
            duration: Math.random() * 6 + 4,
            delay: Math.random() * 5,
        })));
    }, [count]);
    return particles;
}

/* ─────────────────────────────────────────────────────────────────────────
   AuthInput
───────────────────────────────────────────────────────────────────────── */
interface InputProps {
    id: string; label: string; type?: string; value: string;
    onChange: (v: string) => void; placeholder?: string;
    autoComplete?: string; delay?: number; mounted: boolean;
    showPasswordToggle?: boolean;
    children?: React.ReactNode;
}
function AuthInput({ id, label, type = "text", value, onChange, placeholder, autoComplete, delay = 0, mounted, showPasswordToggle, children }: InputProps) {
    const [showPw, setShowPw] = useState(false);
    const inputType = showPasswordToggle ? (showPw ? "text" : "password") : type;
    if (children) {
        return (
            <div style={{ opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(12px)", transition: `opacity 500ms cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 500ms cubic-bezier(0.16,1,0.3,1) ${delay}ms` }}>
                <label htmlFor={id} style={{ display: "block", fontSize: "11px", fontWeight: 500, letterSpacing: "0.04em", textTransform: "uppercase" as const, color: "var(--color-text-muted)", marginBottom: "6px" }}>{label}</label>
                {children}
            </div>
        );
    }
    return (
        <div style={{ opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(12px)", transition: `opacity 500ms cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 500ms cubic-bezier(0.16,1,0.3,1) ${delay}ms` }}>
            <label htmlFor={id} style={{ display: "block", fontSize: "11px", fontWeight: 500, letterSpacing: "0.04em", textTransform: "uppercase" as const, color: "var(--color-text-muted)", marginBottom: "6px" }}>{label}</label>
            <div style={{ position: "relative" }}>
                <input id={id} type={inputType} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} autoComplete={autoComplete} required
                    style={{ width: "100%", padding: showPasswordToggle ? "11px 40px 11px 14px" : "11px 14px", backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid var(--color-border-medium)", borderRadius: "var(--radius-lg)", fontSize: "14px", color: "var(--color-text)", outline: "none", transition: "border-color 150ms ease, box-shadow 150ms ease, background 150ms ease" }}
                    onFocus={e => { e.target.style.borderColor = "var(--color-accent)"; e.target.style.boxShadow = "0 0 0 3px var(--color-accent-glow)"; e.target.style.backgroundColor = "rgba(79,110,247,0.04)"; }}
                    onBlur={e => { e.target.style.borderColor = "var(--color-border-medium)"; e.target.style.boxShadow = "none"; e.target.style.backgroundColor = "rgba(255,255,255,0.04)"; }}
                />
                {showPasswordToggle && (
                    <button type="button" onClick={() => setShowPw(p => !p)} aria-label={showPw ? "Ocultar contraseña" : "Mostrar contraseña"}
                        style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--color-text-faint)", padding: "2px", display: "flex", alignItems: "center" }}>
                        {showPw
                            ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                            : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                        }
                    </button>
                )}
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────────────────
   Selector de rol
───────────────────────────────────────────────────────────────────────── */
const ROLES = [
    { value: "ESTUDIANTE", label: "Estudiante", desc: "Gestiona y sube tus reportes", color: "var(--color-role-estudiante)", bg: "var(--color-role-estudiante-bg)" },
    { value: "UNIVERSIDAD", label: "Universidad", desc: "Supervisa y da retroalimentación", color: "var(--color-role-universidad)", bg: "var(--color-role-universidad-bg)" },
    { value: "EMPRESA", label: "Empresa", desc: "Certifica y valida el trabajo", color: "var(--color-role-empresa)", bg: "var(--color-role-empresa-bg)" },
];

function RoleSelector({ value, onChange, mounted }: { value: string; onChange: (v: string) => void; mounted: boolean }) {
    return (
        <div style={{ opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(12px)", transition: "opacity 500ms cubic-bezier(0.16,1,0.3,1) 150ms, transform 500ms cubic-bezier(0.16,1,0.3,1) 150ms" }}>
            <p style={{ fontSize: "11px", fontWeight: 500, letterSpacing: "0.04em", textTransform: "uppercase" as const, color: "var(--color-text-muted)", marginBottom: "8px" }}>Tipo de cuenta</p>
            <div style={{ display: "flex", gap: "8px" }}>
                {ROLES.map(role => {
                    const selected = value === role.value;
                    return (
                        <button key={role.value} type="button" onClick={() => onChange(role.value)}
                            style={{
                                flex: 1, padding: "10px 8px", borderRadius: "var(--radius-lg)", cursor: "pointer", border: "none", textAlign: "center" as const, transition: "all 150ms cubic-bezier(0.16,1,0.3,1)",
                                backgroundColor: selected ? role.bg : "rgba(255,255,255,0.03)",
                                outline: selected ? `1.5px solid ${role.color}` : "1px solid var(--color-border-medium)",
                                boxShadow: selected ? `0 0 12px ${role.bg}` : "none",
                            }}
                            onMouseEnter={e => { if (!selected) (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(255,255,255,0.06)"; }}
                            onMouseLeave={e => { if (!selected) (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(255,255,255,0.03)"; }}
                        >
                            <p style={{ fontSize: "12px", fontWeight: 600, color: selected ? role.color : "var(--color-text-muted)", margin: "0 0 2px", transition: "color 150ms" }}>{role.label}</p>
                            <p style={{ fontSize: "10px", color: selected ? role.color : "var(--color-text-faint)", opacity: selected ? 0.85 : 1, margin: 0, lineHeight: 1.3 }}>{role.desc}</p>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────────────────
   Página Register
───────────────────────────────────────────────────────────────────────── */
export default function RegisterPage() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("ESTUDIANTE");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [mounted, setMounted] = useState(false);
    const particles = useParticles(55);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => { const t = setTimeout(() => setMounted(true), 60); return () => clearTimeout(t); }, []);

    /* Canvas — mismo efecto que login */
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        let raf: number;
        let angle = 0;
        const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
        resize();
        window.addEventListener("resize", resize);
        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const cx = canvas.width / 2, cy = canvas.height / 2;
            const r1 = Math.min(canvas.width, canvas.height) * 0.42;
            ctx.save(); ctx.translate(cx, cy); ctx.rotate(angle);
            ctx.beginPath(); ctx.arc(0, 0, r1, 0, Math.PI * 2);
            ctx.strokeStyle = "rgba(79,110,247,0.08)"; ctx.lineWidth = 1; ctx.stroke();
            ctx.beginPath(); ctx.arc(0, 0, r1, angle * 0.3, angle * 0.3 + Math.PI * 0.6);
            const g1 = ctx.createLinearGradient(-r1, 0, r1, 0);
            g1.addColorStop(0, "rgba(79,110,247,0.0)"); g1.addColorStop(0.5, "rgba(79,110,247,0.5)"); g1.addColorStop(1, "rgba(79,110,247,0.0)");
            ctx.strokeStyle = g1; ctx.lineWidth = 1.5; ctx.stroke();
            const r2 = r1 * 0.68;
            ctx.beginPath(); ctx.arc(0, 0, r2, -angle * 1.3, -angle * 1.3 + Math.PI * 0.4);
            const g2 = ctx.createLinearGradient(-r2, 0, r2, 0);
            g2.addColorStop(0, "rgba(147,112,247,0.0)"); g2.addColorStop(0.5, "rgba(147,112,247,0.3)"); g2.addColorStop(1, "rgba(147,112,247,0.0)");
            ctx.strokeStyle = g2; ctx.lineWidth = 1; ctx.stroke();
            ctx.restore();
            const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, r1 * 0.8);
            glow.addColorStop(0, "rgba(79,110,247,0.06)"); glow.addColorStop(0.5, "rgba(79,110,247,0.02)"); glow.addColorStop(1, "rgba(0,0,0,0)");
            ctx.fillStyle = glow; ctx.fillRect(0, 0, canvas.width, canvas.height);
            angle += 0.004;
            raf = requestAnimationFrame(draw);
        };
        draw();
        return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        if (password.length < 6) { setError("La contraseña debe tener al menos 6 caracteres."); return; }
        setLoading(true);
        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password, role }),
            });
            const data = await res.json();
            if (!res.ok) { setError(data.message ?? "Error al crear la cuenta."); }
            else { router.push("/auth/login"); }
        } catch { setError("Error de conexión. Intenta nuevamente."); }
        finally { setLoading(false); }
    };

    return (
        <AuthLayout title="Crear Cuenta">
            {/* Fondo */}
            <div style={{ position: "fixed", inset: 0, backgroundColor: "var(--color-bg)", overflow: "hidden" }}>
                <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(79,110,247,0.10) 0%, rgba(8,9,14,0) 70%)", pointerEvents: "none" }} />
                <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, pointerEvents: "none" }} aria-hidden="true" />
                {particles.map(p => (
                    <div key={p.id} style={{ position: "absolute", left: `${p.x}%`, top: `${p.y}%`, width: `${p.size}px`, height: `${p.size}px`, borderRadius: "50%", backgroundColor: p.x % 3 === 0 ? `rgba(147,112,247,${p.opacity})` : `rgba(200,210,255,${p.opacity})`, animation: `twinkle ${p.duration}s ${p.delay}s ease-in-out infinite alternate`, pointerEvents: "none" }} />
                ))}
                <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 100% 100% at 50% 50%, transparent 40%, rgba(8,9,14,0.85) 100%)", pointerEvents: "none" }} />
            </div>

            <style>{`
        @keyframes twinkle { 0%{opacity:0.1;transform:scale(0.8)} 100%{opacity:0.7;transform:scale(1.2)} }
        @keyframes pulse-glow { 0%,100%{opacity:0.6;transform:scale(1)} 50%{opacity:1;transform:scale(1.1)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        input::placeholder,select::placeholder { color: var(--color-text-faint); }
      `}</style>

            {/* Layout */}
            <div style={{ position: "relative", zIndex: 10, minHeight: "100dvh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px 16px" }}>

                {/* Logo */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", marginBottom: "28px", opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(-16px)", transition: "opacity 600ms cubic-bezier(0.16,1,0.3,1) 0ms, transform 600ms cubic-bezier(0.16,1,0.3,1) 0ms" }}>
                    <div style={{ position: "relative" }}>
                        <div style={{ position: "absolute", inset: "-12px", borderRadius: "50%", background: "radial-gradient(circle, rgba(79,110,247,0.25) 0%, transparent 70%)", animation: "pulse-glow 3s ease-in-out infinite" }} />
                        <div style={{ position: "relative", width: "56px", height: "56px", borderRadius: "16px", backgroundColor: "var(--color-accent-subtle)", border: "1px solid var(--color-accent-border)", color: "var(--color-accent)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 32px rgba(79,110,247,0.2), inset 0 1px 0 rgba(255,255,255,0.08)" }}>
                            <LogoMark size={28} />
                        </div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                        <h1 style={{ fontSize: "22px", fontWeight: 700, letterSpacing: "-0.03em", color: "var(--color-text)", lineHeight: 1, margin: 0 }}>SIGP-IT</h1>
                        <p style={{ fontSize: "12px", color: "var(--color-text-faint)", marginTop: "4px", letterSpacing: "0.02em" }}>Sistema de Gestión de Prácticas</p>
                    </div>
                </div>

                {/* Card */}
                <div style={{ width: "100%", maxWidth: "420px", position: "relative", opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0) scale(1)" : "translateY(20px) scale(0.98)", transition: "opacity 600ms cubic-bezier(0.16,1,0.3,1) 80ms, transform 600ms cubic-bezier(0.16,1,0.3,1) 80ms" }}>
                    {/* Borde degradado */}
                    <div style={{ position: "absolute", inset: "-1px", borderRadius: "20px", background: "linear-gradient(135deg, rgba(79,110,247,0.3) 0%, rgba(255,255,255,0.05) 40%, rgba(147,112,247,0.15) 100%)", pointerEvents: "none" }} />
                    {/* Cuerpo */}
                    <div style={{ position: "relative", borderRadius: "20px", backgroundColor: "rgba(13,14,21,0.75)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", border: "1px solid rgba(255,255,255,0.08)", padding: "32px", boxShadow: "0 24px 64px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04) inset" }}>
                        {/* Shimmer */}
                        <div style={{ position: "absolute", top: 0, left: "20%", right: "20%", height: "1px", background: "linear-gradient(90deg, transparent, rgba(79,110,247,0.5), transparent)", borderRadius: "1px" }} />

                        {/* Header */}
                        <div style={{ marginBottom: "24px" }}>
                            <h2 style={{ fontSize: "20px", fontWeight: 700, letterSpacing: "-0.03em", color: "var(--color-text)", margin: "0 0 6px" }}>Crear cuenta</h2>
                            <p style={{ fontSize: "13px", color: "var(--color-text-muted)", margin: 0 }}>Completa el formulario para comenzar</p>
                        </div>

                        <form onSubmit={handleSubmit} noValidate>
                            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                <RoleSelector value={role} onChange={setRole} mounted={mounted} />
                                <AuthInput id="name" label="Nombre completo" value={name} onChange={setName} placeholder="Juan García" autoComplete="name" delay={220} mounted={mounted} />
                                <AuthInput id="email" label="Correo electrónico" type="email" value={email} onChange={setEmail} placeholder="tu@correo.edu.co" autoComplete="email" delay={290} mounted={mounted} />
                                <AuthInput id="password" label="Contraseña" value={password} onChange={setPassword} placeholder="Mínimo 6 caracteres" autoComplete="new-password" delay={360} mounted={mounted} showPasswordToggle />
                            </div>

                            {error && (
                                <div style={{ marginTop: "14px", padding: "10px 14px", borderRadius: "var(--radius-lg)", backgroundColor: "var(--color-error-bg)", border: "1px solid rgba(240,77,77,0.2)", fontSize: "13px", color: "var(--color-error)" }}>
                                    {error}
                                </div>
                            )}

                            <div style={{ marginTop: "24px", opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(8px)", transition: "opacity 500ms cubic-bezier(0.16,1,0.3,1) 430ms, transform 500ms cubic-bezier(0.16,1,0.3,1) 430ms" }}>
                                <button type="submit" disabled={loading}
                                    style={{ width: "100%", padding: "12px", borderRadius: "var(--radius-lg)", backgroundColor: loading ? "var(--color-accent-hover)" : "var(--color-accent)", color: "#fff", fontWeight: 600, fontSize: "14px", letterSpacing: "-0.01em", border: "none", cursor: loading ? "not-allowed" : "pointer", transition: "background 150ms ease, transform 100ms ease, box-shadow 150ms ease", boxShadow: loading ? "none" : "0 4px 20px rgba(79,110,247,0.35)", opacity: loading ? 0.8 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
                                    onMouseEnter={e => { if (!loading) { const b = e.currentTarget as HTMLButtonElement; b.style.backgroundColor = "var(--color-accent-hover)"; b.style.boxShadow = "0 6px 28px rgba(79,110,247,0.45)"; b.style.transform = "translateY(-1px)"; } }}
                                    onMouseLeave={e => { if (!loading) { const b = e.currentTarget as HTMLButtonElement; b.style.backgroundColor = "var(--color-accent)"; b.style.boxShadow = "0 4px 20px rgba(79,110,247,0.35)"; b.style.transform = "translateY(0)"; } }}
                                    onMouseDown={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0) scale(0.99)"; }}
                                    onMouseUp={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px) scale(1)"; }}
                                >
                                    {loading ? (
                                        <>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: "spin 0.7s linear infinite" }}>
                                                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                                            </svg>
                                            Creando cuenta...
                                        </>
                                    ) : "Crear cuenta"}
                                </button>
                            </div>
                        </form>

                        <p style={{ marginTop: "20px", textAlign: "center", fontSize: "13px", color: "var(--color-text-muted)", opacity: mounted ? 1 : 0, transition: "opacity 500ms ease 500ms" }}>
                            ¿Ya tienes cuenta?{" "}
                            <Link href="/auth/login" style={{ color: "var(--color-accent)", fontWeight: 500, textDecoration: "none" }}
                                onMouseEnter={e => (e.currentTarget.style.textDecoration = "underline")}
                                onMouseLeave={e => (e.currentTarget.style.textDecoration = "none")}
                            >
                                Iniciar sesión
                            </Link>
                        </p>
                    </div>
                </div>

                <p style={{ marginTop: "28px", fontSize: "11px", color: "var(--color-text-faint)", textAlign: "center", opacity: mounted ? 1 : 0, transition: "opacity 500ms ease 560ms", letterSpacing: "0.02em" }}>
                    Ingeniería de Telecomunicaciones — USTA
                </p>
            </div>
        </AuthLayout>
    );
}