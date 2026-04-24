//src/components/universidad/ModalCrearEmpresa.tsx
import { useState } from "react";
import { Building2, X, Loader2, AlertCircle } from "lucide-react";

interface Props { onClose: () => void; onSuccess: () => void; }

function iStyle(focused: boolean): React.CSSProperties {
    return {
        width: "100%", padding: "9px 12px",
        backgroundColor: focused ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.03)",
        border: `1px solid ${focused ? "var(--color-role-universidad)" : "var(--color-border)"}`,
        borderRadius: "var(--radius-lg)", color: "var(--color-text)", fontSize: "12px", outline: "none",
        boxShadow: focused ? "0 0 0 3px var(--color-role-universidad-bg)" : "none",
        transition: "border-color 150ms ease,box-shadow 150ms ease,background 150ms ease",
    };
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            <label style={{ fontSize: "11px", fontWeight: 600, color: "var(--color-text-muted)", letterSpacing: "0.02em" }}>
                {label}
            </label>
            {children}
        </div>
    );
}

export default function ModalCrearEmpresa({ onClose, onSuccess }: Props) {
    const [form, setForm] = useState({ nombreEmpresa: "", nit: "", sector: "", ciudad: "", telefono: "" });
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState("");
    const [focused, setFocused] = useState("");
    const [vis, setVis] = useState(false);

    useState(() => { const t = setTimeout(() => setVis(true), 16); return () => clearTimeout(t); });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
        setForm(p => ({ ...p, [e.target.name]: e.target.value }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.nombreEmpresa.trim()) { setError("El nombre de la empresa es requerido"); return; }
        setCargando(true); setError("");
        const res = await fetch("/api/empresas", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
        });
        const json = await res.json();
        if (!res.ok) { setError(json.message ?? "Error al crear la empresa"); setCargando(false); return; }
        onSuccess();
    };

    const AC = "var(--color-role-universidad)";
    const ABg = "var(--color-role-universidad-bg)";
    const ABr = "rgba(99,102,241,0.25)";

    const campos = [
        { name: "nombreEmpresa", label: "Nombre de la empresa *", placeholder: "Ej: Claro Colombia S.A.", full: true },
        { name: "nit", label: "NIT", placeholder: "Ej: 800123456-1", full: false },
        { name: "telefono", label: "Teléfono", placeholder: "Ej: 6017000000", full: false },
        { name: "sector", label: "Sector", placeholder: "Ej: Telecomunicaciones", full: false },
        { name: "ciudad", label: "Ciudad", placeholder: "Ej: Bucaramanga", full: false },
    ];

    return (
        <div
            onClick={e => { if (e.target === e.currentTarget) onClose(); }}
            style={{
                position: "fixed", inset: 0, zIndex: 50,
                display: "flex", alignItems: "center", justifyContent: "center", padding: "16px",
                backgroundColor: `rgba(4,5,9,${vis ? 0.75 : 0})`,
                backdropFilter: vis ? "blur(8px)" : "blur(0px)",
                transition: "background-color 220ms ease",
            }}>
            <div style={{
                position: "relative", width: "100%", maxWidth: "480px",
                backgroundColor: "rgba(10,11,18,0.9)", backdropFilter: "blur(24px)",
                border: `1px solid ${ABr}`, borderRadius: "var(--radius-xl)",
                boxShadow: `0 0 0 1px rgba(255,255,255,0.04),0 24px 64px rgba(0,0,0,0.55),0 0 40px ${ABg}`,
                overflow: "hidden",
                opacity: vis ? 1 : 0,
                transform: vis ? "translateY(0) scale(1)" : "translateY(16px) scale(0.97)",
                transition: "opacity 280ms cubic-bezier(0.16,1,0.3,1),transform 280ms cubic-bezier(0.16,1,0.3,1)",
            }}>
                {/* shimmer line */}
                <div style={{ position: "absolute", top: 0, left: "15%", right: "15%", height: "1px", background: `linear-gradient(90deg,transparent,${AC},transparent)`, opacity: 0.6 }} />

                {/* header */}
                <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--color-border)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{ width: "30px", height: "30px", borderRadius: "var(--radius-lg)", backgroundColor: ABg, border: `1px solid ${ABr}`, display: "flex", alignItems: "center", justifyContent: "center", color: AC }}>
                            <Building2 size={14} />
                        </div>
                        <div>
                            <p style={{ fontSize: "13px", fontWeight: 700, color: "var(--color-text)", margin: 0 }}>Agregar empresa</p>
                            <p style={{ fontSize: "10px", color: "var(--color-text-faint)", margin: 0 }}>Registrar nueva empresa en el sistema</p>
                        </div>
                    </div>
                    <button onClick={onClose} aria-label="Cerrar"
                        style={{ width: "28px", height: "28px", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)", backgroundColor: "transparent", color: "var(--color-text-faint)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                        <X size={13} />
                    </button>
                </div>

                {/* form */}
                <form onSubmit={handleSubmit} style={{ padding: "18px", display: "flex", flexDirection: "column", gap: "10px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                        {campos.map(c => (
                            <div key={c.name} style={{ gridColumn: c.full ? "1/-1" : undefined }}>
                                <Field label={c.label}>
                                    <input
                                        type="text" name={c.name} value={(form as any)[c.name]}
                                        onChange={handleChange} placeholder={c.placeholder}
                                        onFocus={() => setFocused(c.name)} onBlur={() => setFocused("")}
                                        style={iStyle(focused === c.name)}
                                    />
                                </Field>
                            </div>
                        ))}
                    </div>

                    {error && (
                        <div style={{ display: "flex", alignItems: "center", gap: "7px", padding: "9px 12px", borderRadius: "var(--radius-lg)", backgroundColor: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.2)" }}>
                            <AlertCircle size={12} style={{ color: "var(--color-error)", flexShrink: 0 }} />
                            <p style={{ fontSize: "12px", color: "var(--color-error)", margin: 0 }}>{error}</p>
                        </div>
                    )}

                    <div style={{ display: "flex", gap: "8px", paddingTop: "4px" }}>
                        <button type="button" onClick={onClose}
                            style={{ flex: 1, padding: "9px", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)", backgroundColor: "transparent", color: "var(--color-text-muted)", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>
                            Cancelar
                        </button>
                        <button type="submit" disabled={cargando}
                            style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", padding: "9px", borderRadius: "var(--radius-lg)", border: "none", backgroundColor: AC, color: "#fff", fontSize: "12px", fontWeight: 700, cursor: cargando ? "not-allowed" : "pointer", opacity: cargando ? 0.7 : 1 }}>
                            {cargando ? <Loader2 size={13} style={{ animation: "spin 0.8s linear infinite" }} /> : <Building2 size={13} />}
                            {cargando ? "Guardando..." : "Crear empresa"}
                            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}