//src/components/universidad/ModalAsignarPractica.tsx
import { useState, useEffect, useRef } from "react";
import { X, Briefcase, Loader2, AlertCircle, ChevronDown, Check } from "lucide-react";

interface Props {
    onClose: () => void;
    onSuccess: () => void;
}

/* ─── shared modal shell ────────────────────────────────────────────── */
function ModalShell({
    children, onClose, accentColor = "var(--color-accent)",
    accentBg = "var(--color-accent-subtle)", accentBorder = "var(--color-accent-border)",
}: {
    children: React.ReactNode; onClose: () => void;
    accentColor?: string; accentBg?: string; accentBorder?: string;
}) {
    const [vis, setVis] = useState(false);
    useEffect(() => { const t = setTimeout(() => setVis(true), 16); return () => clearTimeout(t); }, []);

    const handleBg = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) onClose();
    };

    return (
        <div
            onClick={handleBg}
            style={{
                position: "fixed", inset: 0, zIndex: 50,
                display: "flex", alignItems: "center", justifyContent: "center", padding: "16px",
                backgroundColor: `rgba(4,5,9,${vis ? 0.75 : 0})`,
                backdropFilter: vis ? "blur(8px)" : "blur(0px)",
                WebkitBackdropFilter: vis ? "blur(8px)" : "blur(0px)",
                transition: "background-color 220ms ease, backdrop-filter 220ms ease",
            }}
        >
            <div
                style={{
                    position: "relative", width: "100%", maxWidth: "460px",
                    backgroundColor: "rgba(10,11,18,0.88)",
                    backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
                    border: `1px solid ${accentBorder}`,
                    borderRadius: "var(--radius-xl)",
                    boxShadow: `0 0 0 1px rgba(255,255,255,0.04), 0 24px 64px rgba(0,0,0,0.55), 0 0 40px ${accentBg}`,
                    overflow: "hidden",
                    opacity: vis ? 1 : 0,
                    transform: vis ? "translateY(0) scale(1)" : "translateY(16px) scale(0.97)",
                    transition: "opacity 280ms cubic-bezier(0.16,1,0.3,1), transform 280ms cubic-bezier(0.16,1,0.3,1)",
                }}
            >
                {/* top accent glow line */}
                <div style={{ position: "absolute", top: 0, left: "15%", right: "15%", height: "1px", background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)`, opacity: 0.6 }} />
                {children}
            </div>
        </div>
    );
}

/* ─── modal header ──────────────────────────────────────────────────── */
function ModalHeader({
    icon, title, subtitle, accentColor, accentBg, accentBorder, onClose,
}: {
    icon: JSX.Element; title: string; subtitle?: string;
    accentColor: string; accentBg: string; accentBorder: string; onClose: () => void;
}) {
    const [hovX, setHovX] = useState(false);
    return (
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--color-border)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "var(--radius-lg)", backgroundColor: accentBg, border: `1px solid ${accentBorder}`, display: "flex", alignItems: "center", justifyContent: "center", color: accentColor, flexShrink: 0 }}>
                    {icon}
                </div>
                <div>
                    <p style={{ fontSize: "13px", fontWeight: 700, color: "var(--color-text)", margin: 0, letterSpacing: "-0.01em" }}>{title}</p>
                    {subtitle && <p style={{ fontSize: "11px", color: "var(--color-text-faint)", margin: 0 }}>{subtitle}</p>}
                </div>
            </div>
            <button
                onClick={onClose} aria-label="Cerrar"
                onMouseEnter={() => setHovX(true)} onMouseLeave={() => setHovX(false)}
                style={{ width: "28px", height: "28px", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)", backgroundColor: hovX ? "var(--color-surface-3)" : "transparent", color: hovX ? "var(--color-text)" : "var(--color-text-faint)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all var(--transition-fast)" }}
            >
                <X size={14} />
            </button>
        </div>
    );
}

/* ─── user info strip ───────────────────────────────────────────────── */
function UserStrip({ name, email, accentColor, accentBg, letter }: { name: string | null; email: string | null; accentColor: string; accentBg: string; letter: string }) {
    return (
        <div style={{ padding: "10px 20px", borderBottom: "1px solid var(--color-border)", backgroundColor: "rgba(255,255,255,0.02)", display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "28px", height: "28px", borderRadius: "50%", backgroundColor: accentBg, border: `1px solid ${accentColor}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 700, color: accentColor, flexShrink: 0 }}>
                {letter}
            </div>
            <div>
                <p style={{ fontSize: "12px", fontWeight: 600, color: "var(--color-text-muted)", margin: 0 }}>{name ?? "—"}</p>
                <p style={{ fontSize: "10px", color: "var(--color-text-faint)", margin: 0 }}>{email}</p>
            </div>
        </div>
    );
}

/* ─── CustomSelect — dropdown oscuro controlado ─────────────────────── */
interface SelectOption { value: string; label: string; }
function CustomSelect({
    value, onChange, options, placeholder, accentColor, focused, onFocus, onBlur,
}: {
    value: string; onChange: (v: string) => void; options: SelectOption[];
    placeholder: string; accentColor: string; focused: boolean;
    onFocus: () => void; onBlur: () => void;
}) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const selectedLabel = options.find(o => o.value === value)?.label ?? placeholder;

    // Cerrar al hacer clic fuera
    useEffect(() => {
        if (!open) return;
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false); onBlur();
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [open, onBlur]);

    const ACCENT = accentColor;
    const isFocused = open || focused;

    return (
        <div ref={ref} style={{ position: "relative" }}>
            {/* Trigger */}
            <button
                type="button"
                onClick={() => { setOpen(p => !p); if (!open) onFocus(); else onBlur(); }}
                style={{
                    width: "100%", padding: "9px 36px 9px 12px",
                    backgroundColor: isFocused ? "rgba(255,255,255,0.06)" : "rgba(13,14,21,0.8)",
                    border: `1px solid ${isFocused ? ACCENT + "80" : "var(--color-border)"}`,
                    borderRadius: "var(--radius-lg)",
                    color: value ? "var(--color-text)" : "var(--color-text-faint)",
                    fontSize: "12px", textAlign: "left", cursor: "pointer",
                    outline: "none", transition: "all 150ms ease",
                    boxShadow: isFocused ? `0 0 0 3px ${ACCENT}18` : "none",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                }}
            >
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
                    {selectedLabel}
                </span>
                <ChevronDown size={13} style={{
                    color: "var(--color-text-faint)", flexShrink: 0, marginLeft: 8,
                    transition: "transform 200ms ease",
                    transform: open ? "rotate(180deg)" : "rotate(0deg)",
                }} />
            </button>

            {/* Popup */}
            {open && (
                <div style={{
                    position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0,
                    backgroundColor: "rgba(10,11,18,0.98)",
                    backdropFilter: "blur(20px)",
                    border: `1px solid ${ACCENT}50`,
                    borderRadius: "var(--radius-lg)",
                    boxShadow: "0 12px 40px rgba(0,0,0,0.6)",
                    zIndex: 9999,
                    overflow: "hidden",
                    maxHeight: "220px",
                    overflowY: "auto",
                }}>
                    {options.map((opt, i) => {
                        const isSelected = opt.value === value;
                        const isPlaceholder = opt.value === "";
                        return (
                            <button
                                key={opt.value + i}
                                type="button"
                                onClick={() => { onChange(opt.value); setOpen(false); onBlur(); }}
                                style={{
                                    width: "100%", padding: "9px 12px",
                                    backgroundColor: isSelected ? `${ACCENT}20` : "transparent",
                                    border: "none",
                                    color: isPlaceholder ? "var(--color-text-faint)" : isSelected ? ACCENT : "var(--color-text)",
                                    fontSize: "12px", textAlign: "left", cursor: "pointer",
                                    display: "flex", alignItems: "center", justifyContent: "space-between",
                                    gap: 8, transition: "background 100ms ease",
                                    fontWeight: isSelected ? 600 : 400,
                                    borderBottom: i < options.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                                }}
                                onMouseEnter={e => { if (!isSelected) e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.06)"; }}
                                onMouseLeave={e => { if (!isSelected) e.currentTarget.style.backgroundColor = "transparent"; }}
                            >
                                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                    {opt.label}
                                </span>
                                {isSelected && <Check size={11} style={{ flexShrink: 0, color: ACCENT }} />}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

/* ─── form field ────────────────────────────────────────────────────── */
function Field({
    label, required, children,
}: { label: string; required?: boolean; children: React.ReactNode }) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            <label style={{ fontSize: "11px", fontWeight: 600, color: "var(--color-text-muted)", letterSpacing: "0.02em" }}>
                {label}{required && <span style={{ color: "var(--color-error)", marginLeft: "2px" }}>*</span>}
            </label>
            {children}
        </div>
    );
}

/* ─── input / select / date shared style ───────────────────────────── */
function inputStyle(focused: boolean, accentColor: string): React.CSSProperties {
    return {
        width: "100%", padding: "9px 12px",
        backgroundColor: focused ? "rgba(255,255,255,0.05)" : "rgba(13,14,21,0.8)",
        border: `1px solid ${focused ? accentColor + "80" : "var(--color-border)"}`,
        borderRadius: "var(--radius-lg)",
        color: "var(--color-text)", fontSize: "12px",
        outline: "none",
        boxShadow: focused ? `0 0 0 3px ${accentColor}18` : "none",
        transition: "border-color 150ms ease, box-shadow 150ms ease, background 150ms ease",
        colorScheme: "dark" as any,
    };
}

/* ─── error box ─────────────────────────────────────────────────────── */
function ErrorBox({ msg }: { msg: string }) {
    return (
        <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 12px", borderRadius: "var(--radius-lg)", backgroundColor: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.2)" }}>
            <AlertCircle size={13} style={{ color: "var(--color-error)", flexShrink: 0 }} />
            <p style={{ fontSize: "12px", color: "var(--color-error)", margin: 0 }}>{msg}</p>
        </div>
    );
}

/* ─── action buttons ────────────────────────────────────────────────── */
function CancelBtn({ onClick }: { onClick: () => void }) {
    const [hov, setHov] = useState(false);
    return (
        <button type="button" onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
            style={{ flex: 1, padding: "10px", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)", backgroundColor: hov ? "var(--color-surface-3)" : "transparent", color: hov ? "var(--color-text)" : "var(--color-text-muted)", fontSize: "12px", fontWeight: 600, cursor: "pointer", transition: "all var(--transition-fast)" }}>
            Cancelar
        </button>
    );
}

function SubmitBtn({ loading, label, loadingLabel, accentColor, accentBg, icon }: { loading: boolean; label: string; loadingLabel: string; accentColor: string; accentBg: string; icon: JSX.Element }) {
    const [hov, setHov] = useState(false);
    return (
        <button type="submit" disabled={loading} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
            style={{
                flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "7px",
                padding: "10px", borderRadius: "var(--radius-lg)", border: "none",
                backgroundColor: hov && !loading ? accentColor : loading ? accentBg : accentColor,
                color: loading ? accentColor : "#fff",
                fontSize: "12px", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
                boxShadow: hov && !loading ? `0 4px 20px ${accentColor}44` : "none",
                transition: "all var(--transition-fast)", filter: hov && !loading ? "brightness(1.12)" : "brightness(1)",
            }}>
            {loading ? <Loader2 size={14} style={{ animation: "spin 0.8s linear infinite" }} /> : icon}
            {loading ? loadingLabel : label}
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </button>
    );
}

/* ══════════════════════════════════════════════════════════════════════
   MODAL ASIGNAR PRÁCTICA
══════════════════════════════════════════════════════════════════════ */
export default function ModalAsignarPractica({ onClose, onSuccess }: Props) {
    const [estudiantes, setEstudiantes] = useState<any[]>([]);
    const [empresas, setEmpresas] = useState<any[]>([]);
    const [form, setForm] = useState({ estudianteId: "", empresaId: "", fechaInicio: "", fechaFin: "", descripcionCargo: "" });
    const [cargando, setCargando] = useState(false);
    const [cargandoDatos, setCargandoDatos] = useState(true);
    const [error, setError] = useState("");
    const [focused, setFocused] = useState("");

    const AC = "var(--color-role-universidad)";
    const ABg = "var(--color-role-universidad-bg)";
    const ABr = "rgba(167,139,250,0.3)";

    useEffect(() => {
        Promise.all([
            fetch("/api/perfiles/estudiantes").then(r => r.json()),
            fetch("/api/perfiles/empresas").then(r => r.json()),
        ]).then(([est, emp]) => {
            setEstudiantes(est.data?.filter((u: any) => u.perfilEstudiante) ?? []);
            setEmpresas(emp.data?.filter((u: any) => u.perfilEmpresa) ?? []);
        }).finally(() => setCargandoDatos(false));
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.estudianteId || !form.empresaId || !form.fechaInicio) {
            setError("Estudiante, empresa y fecha de inicio son requeridos");
            return;
        }
        setCargando(true); setError("");
        const estSel = estudiantes.find(u => u.id === form.estudianteId);
        const empSel = empresas.find(u => u.id === form.empresaId);
        const res = await fetch("/api/practicas", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                estudianteId: estSel.perfilEstudiante.id,
                empresaId: empSel.perfilEmpresa.id,
                fechaInicio: form.fechaInicio,
                fechaFin: form.fechaFin || null,
                descripcionCargo: form.descripcionCargo || null,
            }),
        });
        const json = await res.json();
        if (!res.ok) { setError(json.message); setCargando(false); return; }
        onSuccess();
    };

    const fStyle = (name: string) => inputStyle(focused === name, "var(--color-role-universidad)");

    return (
        <ModalShell onClose={onClose} accentColor={AC} accentBg={ABg} accentBorder={ABr}>
            <ModalHeader icon={<Briefcase size={15} />} title="Asignar práctica" subtitle="Vincula un estudiante con una empresa" accentColor={AC} accentBg={ABg} accentBorder={ABr} onClose={onClose} />

            {cargandoDatos ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 0" }}>
                    <Loader2 size={24} style={{ color: AC, animation: "spin 0.8s linear infinite" }} />
                    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                </div>
            ) : (
                <form onSubmit={handleSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>

                    <Field label="Estudiante" required>
                        <CustomSelect
                            value={form.estudianteId}
                            onChange={v => setForm(p => ({ ...p, estudianteId: v }))}
                            placeholder="Selecciona un estudiante"
                            accentColor={AC}
                            focused={focused === "estudianteId"}
                            onFocus={() => setFocused("estudianteId")}
                            onBlur={() => setFocused("")}
                            options={[
                                { value: "", label: "Selecciona un estudiante" },
                                ...estudiantes.map((u: any) => ({
                                    value: u.id,
                                    label: `${u.name ?? u.email} — ${u.perfilEstudiante?.codigoUsta ?? u.email}`,
                                }))
                            ]}
                        />
                        {estudiantes.length === 0 && (
                            <p style={{ fontSize: "11px", color: "var(--color-warning)", margin: "2px 0 0" }}>
                                No hay estudiantes con perfil. Crea perfiles primero.
                            </p>
                        )}
                    </Field>

                    <Field label="Empresa" required>
                        <CustomSelect
                            value={form.empresaId}
                            onChange={v => setForm(p => ({ ...p, empresaId: v }))}
                            placeholder="Selecciona una empresa"
                            accentColor={AC}
                            focused={focused === "empresaId"}
                            onFocus={() => setFocused("empresaId")}
                            onBlur={() => setFocused("")}
                            options={[
                                { value: "", label: "Selecciona una empresa" },
                                ...empresas.map((u: any) => ({
                                    value: u.id,
                                    label: `${u.perfilEmpresa?.nombreEmpresa ?? u.name} — ${u.perfilEmpresa?.ciudad ?? u.email}`,
                                }))
                            ]}
                        />
                        {empresas.length === 0 && (
                            <p style={{ fontSize: "11px", color: "var(--color-warning)", margin: "2px 0 0" }}>
                                No hay empresas con perfil. Crea perfiles primero.
                            </p>
                        )}
                    </Field>

                    <Field label="Cargo / Descripción">
                        <input type="text" name="descripcionCargo" value={form.descripcionCargo} onChange={handleChange}
                            placeholder="Ej: Practicante de redes y telecomunicaciones"
                            onFocus={() => setFocused("descripcionCargo")} onBlur={() => setFocused("")}
                            style={fStyle("descripcionCargo")} />
                    </Field>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                        <Field label="Fecha inicio" required>
                            <input type="date" name="fechaInicio" value={form.fechaInicio} onChange={handleChange}
                                onFocus={() => setFocused("fechaInicio")} onBlur={() => setFocused("")}
                                style={fStyle("fechaInicio")} />
                        </Field>
                        <Field label="Fecha fin">
                            <input type="date" name="fechaFin" value={form.fechaFin} onChange={handleChange}
                                onFocus={() => setFocused("fechaFin")} onBlur={() => setFocused("")}
                                style={fStyle("fechaFin")} />
                        </Field>
                    </div>

                    {error && <ErrorBox msg={error} />}

                    <div style={{ display: "flex", gap: "10px", paddingTop: "4px" }}>
                        <CancelBtn onClick={onClose} />
                        <SubmitBtn loading={cargando} label="Asignar práctica" loadingLabel="Asignando..." accentColor="var(--color-accent)" accentBg={ABg} icon={<Briefcase size={14} />} />
                    </div>
                </form>
            )}
        </ModalShell>
    );
}