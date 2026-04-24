//src/components/universidad/ModalCrearPerfilEmpresa.tsx
import { useState } from "react";
import { X, Building2, Loader2, AlertCircle } from "lucide-react";

interface Props {
    usuario: { id: string; name: string | null; email: string | null };
    onClose: () => void;
    onSuccess: () => void;
}

/* ─── shell ─────────────────────────────────────────────────────────── */
function ModalShell({ children, onClose, accentColor, accentBg, accentBorder }: {
    children: React.ReactNode; onClose: () => void;
    accentColor: string; accentBg: string; accentBorder: string;
}) {
    const [vis, setVis] = useState(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useState(() => { const t = setTimeout(() => setVis(true), 16); return () => clearTimeout(t); });
    return (
        <div onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
            style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px", backgroundColor: `rgba(4,5,9,${vis ? 0.75 : 0})`, backdropFilter: vis ? "blur(8px)" : "blur(0px)", WebkitBackdropFilter: vis ? "blur(8px)" : "blur(0px)", transition: "background-color 220ms ease, backdrop-filter 220ms ease" }}>
            <div style={{ position: "relative", width: "100%", maxWidth: "460px", backgroundColor: "rgba(10,11,18,0.88)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", border: `1px solid ${accentBorder}`, borderRadius: "var(--radius-xl)", boxShadow: `0 0 0 1px rgba(255,255,255,0.04), 0 24px 64px rgba(0,0,0,0.55), 0 0 40px ${accentBg}`, overflow: "hidden", opacity: vis ? 1 : 0, transform: vis ? "translateY(0) scale(1)" : "translateY(16px) scale(0.97)", transition: "opacity 280ms cubic-bezier(0.16,1,0.3,1), transform 280ms cubic-bezier(0.16,1,0.3,1)" }}>
                <div style={{ position: "absolute", top: 0, left: "15%", right: "15%", height: "1px", background: `linear-gradient(90deg,transparent,${accentColor},transparent)`, opacity: 0.6 }} />
                {children}
            </div>
        </div>
    );
}

function ModalHeader({ icon, title, subtitle, accentColor, accentBg, accentBorder, onClose }: {
    icon: JSX.Element; title: string; subtitle?: string;
    accentColor: string; accentBg: string; accentBorder: string; onClose: () => void;
}) {
    const [hov, setHov] = useState(false);
    return (
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--color-border)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "var(--radius-lg)", backgroundColor: accentBg, border: `1px solid ${accentBorder}`, display: "flex", alignItems: "center", justifyContent: "center", color: accentColor, flexShrink: 0 }}>{icon}</div>
                <div>
                    <p style={{ fontSize: "13px", fontWeight: 700, color: "var(--color-text)", margin: 0, letterSpacing: "-0.01em" }}>{title}</p>
                    {subtitle && <p style={{ fontSize: "11px", color: "var(--color-text-faint)", margin: 0 }}>{subtitle}</p>}
                </div>
            </div>
            <button onClick={onClose} aria-label="Cerrar" onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
                style={{ width: "28px", height: "28px", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)", backgroundColor: hov ? "var(--color-surface-3)" : "transparent", color: hov ? "var(--color-text)" : "var(--color-text-faint)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all var(--transition-fast)" }}>
                <X size={14} />
            </button>
        </div>
    );
}

function UserStrip({ name, email, accentColor, accentBg, letter }: { name: string | null; email: string | null; accentColor: string; accentBg: string; letter: string }) {
    return (
        <div style={{ padding: "10px 20px", borderBottom: "1px solid var(--color-border)", backgroundColor: "rgba(255,255,255,0.02)", display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "28px", height: "28px", borderRadius: "50%", backgroundColor: accentBg, border: `1px solid ${accentColor}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 700, color: accentColor, flexShrink: 0 }}>{letter}</div>
            <div>
                <p style={{ fontSize: "12px", fontWeight: 600, color: "var(--color-text-muted)", margin: 0 }}>{name ?? "—"}</p>
                <p style={{ fontSize: "10px", color: "var(--color-text-faint)", margin: 0 }}>{email}</p>
            </div>
        </div>
    );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            <label style={{ fontSize: "11px", fontWeight: 600, color: "var(--color-text-muted)", letterSpacing: "0.02em" }}>
                {label}{required && <span style={{ color: "var(--color-error)", marginLeft: "2px" }}>*</span>}
            </label>
            {children}
        </div>
    );
}

function iStyle(focused: boolean, ac: string): React.CSSProperties {
    return { width: "100%", padding: "9px 12px", backgroundColor: focused ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.03)", border: `1px solid ${focused ? ac + "80" : "var(--color-border)"}`, borderRadius: "var(--radius-lg)", color: "var(--color-text)", fontSize: "12px", outline: "none", boxShadow: focused ? `0 0 0 3px ${ac}18` : "none", transition: "border-color 150ms ease,box-shadow 150ms ease,background 150ms ease" };
}

function ErrorBox({ msg }: { msg: string }) {
    return (
        <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 12px", borderRadius: "var(--radius-lg)", backgroundColor: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.2)" }}>
            <AlertCircle size={13} style={{ color: "var(--color-error)", flexShrink: 0 }} />
            <p style={{ fontSize: "12px", color: "var(--color-error)", margin: 0 }}>{msg}</p>
        </div>
    );
}

function CancelBtn({ onClick }: { onClick: () => void }) {
    const [hov, setHov] = useState(false);
    return <button type="button" onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{ flex: 1, padding: "10px", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)", backgroundColor: hov ? "var(--color-surface-3)" : "transparent", color: hov ? "var(--color-text)" : "var(--color-text-muted)", fontSize: "12px", fontWeight: 600, cursor: "pointer", transition: "all var(--transition-fast)" }}>Cancelar</button>;
}

function SubmitBtn({ loading, label, loadingLabel, accentColor, accentBg, icon }: { loading: boolean; label: string; loadingLabel: string; accentColor: string; accentBg: string; icon: JSX.Element }) {
    const [hov, setHov] = useState(false);
    return (
        <button type="submit" disabled={loading} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
            style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "7px", padding: "10px", borderRadius: "var(--radius-lg)", border: "none", backgroundColor: loading ? accentBg : accentColor, color: loading ? accentColor : "#fff", fontSize: "12px", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, boxShadow: hov && !loading ? `0 4px 20px ${accentColor}44` : "none", transition: "all var(--transition-fast)", filter: hov && !loading ? "brightness(1.12)" : "brightness(1)" }}>
            {loading ? <Loader2 size={14} style={{ animation: "spin 0.8s linear infinite" }} /> : icon}
            {loading ? loadingLabel : label}
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </button>
    );
}

/* ══════════════════════════════════════════════════════════════════════
   MODAL CREAR PERFIL EMPRESA
══════════════════════════════════════════════════════════════════════ */
export default function ModalCrearPerfilEmpresa({ usuario, onClose, onSuccess }: Props) {
    const [form, setForm] = useState({ nombreEmpresa: "", nit: "", sector: "", ciudad: "", telefono: "" });
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState("");
    const [focused, setFocused] = useState("");

    const AC = "var(--color-accent)";
    const ABg = "var(--color-accent-subtle)";
    const ABr = "var(--color-accent-border)";

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.nombreEmpresa.trim()) { setError("El nombre de la empresa es requerido"); return; }
        setCargando(true); setError("");
        const res = await fetch("/api/perfiles/empresas", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: usuario.id, ...form }),
        });
        const json = await res.json();
        if (!res.ok) { setError(json.message); setCargando(false); return; }
        onSuccess();
    };

    const campos = [
        { name: "nombreEmpresa", label: "Nombre de la empresa", required: true, placeholder: "Ej: Claro Colombia S.A." },
        { name: "nit", label: "NIT", required: false, placeholder: "Ej: 800123456-1" },
        { name: "sector", label: "Sector", required: false, placeholder: "Ej: Telecomunicaciones" },
        { name: "ciudad", label: "Ciudad", required: false, placeholder: "Ej: Bucaramanga" },
        { name: "telefono", label: "Teléfono", required: false, placeholder: "Ej: 6017000000" },
    ];

    return (
        <ModalShell onClose={onClose} accentColor={AC} accentBg={ABg} accentBorder={ABr}>
            <ModalHeader icon={<Building2 size={15} />} title="Crear perfil de empresa" subtitle="Completa los datos de la organización" accentColor={AC} accentBg={ABg} accentBorder={ABr} onClose={onClose} />
            <UserStrip name={usuario.name} email={usuario.email} accentColor={AC} accentBg={ABg} letter={(usuario.name?.[0] ?? usuario.email?.[0] ?? "E").toUpperCase()} />

            <form onSubmit={handleSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
                {campos.map(c => (
                    <Field key={c.name} label={c.label} required={c.required}>
                        <input type="text" name={c.name} value={(form as any)[c.name]} onChange={handleChange}
                            placeholder={c.placeholder}
                            onFocus={() => setFocused(c.name)} onBlur={() => setFocused("")}
                            style={iStyle(focused === c.name, "#34c97a")} />
                    </Field>
                ))}

                {error && <ErrorBox msg={error} />}

                <div style={{ display: "flex", gap: "10px", paddingTop: "4px" }}>
                    <CancelBtn onClick={onClose} />
                    <SubmitBtn loading={cargando} label="Crear perfil" loadingLabel="Guardando..." accentColor={AC} accentBg={ABg} icon={<Building2 size={14} />} />
                </div>
            </form>
        </ModalShell>
    );
}