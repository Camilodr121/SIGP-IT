// src/components/documentos/ModalSubirDocumento.tsx
import { useState, useRef, useEffect } from "react";
import { X, Upload, FileText, Loader2, AlertCircle, Lock } from "lucide-react";

export type TipoDocumento =
    | "INICIACION"
    | "INFORME_1"
    | "INFORME_2"
    | "INFORME_3"
    | "INFORME_FINAL";

const TIPO_LABELS: Record<TipoDocumento, { label: string; desc: string; color: string; bg: string; border: string }> = {
    INICIACION: { label: "Documentos de Iniciación", desc: "Al inscribirse a la práctica", color: "var(--color-role-universidad)", bg: "var(--color-role-universidad-bg)", border: "rgba(99,102,241,0.25)" },
    INFORME_1: { label: "Primer Informe", desc: "2 meses después del inicio", color: "var(--color-accent)", bg: "var(--color-accent-subtle)", border: "var(--color-accent-border)" },
    INFORME_2: { label: "Segundo Informe", desc: "4 meses después del inicio", color: "var(--color-warning)", bg: "rgba(245,166,35,0.1)", border: "rgba(245,166,35,0.25)" },
    INFORME_3: { label: "Tercer Informe", desc: "6 meses después del inicio", color: "var(--color-role-empresa)", bg: "var(--color-role-empresa-bg)", border: "var(--color-role-empresa-border)" },
    INFORME_FINAL: { label: "Informe Final de Prácticas", desc: "15 días hábiles tras el tercer informe", color: "var(--color-success)", bg: "var(--color-success-bg)", border: "rgba(52,201,122,0.25)" },
};

interface Props {
    practicaId: string;
    tipoDocumento: TipoDocumento;
    onClose: () => void;
    onSuccess: () => void;
}

function iStyle(focused: boolean, color: string): React.CSSProperties {
    return {
        width: "100%", padding: "9px 12px",
        backgroundColor: focused ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.03)",
        border: `1px solid ${focused ? color : "var(--color-border)"}`,
        borderRadius: "var(--radius-lg)", color: "var(--color-text)", fontSize: "12px", outline: "none",
        boxShadow: focused ? `0 0 0 3px ${TIPO_LABELS[color as TipoDocumento]?.bg ?? "rgba(99,102,241,0.1)"}` : "none",
        transition: "border-color 150ms ease,box-shadow 150ms ease,background 150ms ease",
    };
}

export default function ModalSubirDocumento({ practicaId, tipoDocumento, onClose, onSuccess }: Props) {
    const meta = TIPO_LABELS[tipoDocumento];
    const [titulo, setTitulo] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [archivo, setArchivo] = useState<File | null>(null);
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState("");
    const [focusTitulo, setFocusTitulo] = useState(false);
    const [focusDesc, setFocusDesc] = useState(false);
    const [vis, setVis] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => { const t = setTimeout(() => setVis(true), 16); return () => clearTimeout(t); }, []);

    const handleArchivo = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const permitidos = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
        if (!permitidos.includes(file.type)) { setError("Solo se permiten archivos PDF o Word (.doc, .docx)"); return; }
        if (file.size > 10 * 1024 * 1024) { setError("El archivo no puede superar los 10MB"); return; }
        setError(""); setArchivo(file);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!titulo.trim() || !archivo) { setError("El título y el archivo son requeridos"); return; }
        setCargando(true); setError("");
        const formData = new FormData();
        formData.append("titulo", titulo.trim());
        formData.append("descripcion", descripcion);
        formData.append("practicaId", practicaId);
        formData.append("tipoDocumento", tipoDocumento);   // ← NUEVO
        formData.append("archivo", archivo);
        try {
            const res = await fetch("/api/documentos/subir", { method: "POST", body: formData });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message);
            onSuccess();
        } catch (err: any) {
            setError(err.message || "Error al subir el documento");
            setCargando(false);
        }
    };

    const ACCENT = meta.color;
    const BORDER = meta.border;
    const BG = meta.bg;

    return (
        <div
            onClick={e => { if (e.target === e.currentTarget) onClose(); }}
            style={{
                position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px",
                backgroundColor: `rgba(4,5,9,${vis ? 0.75 : 0})`, backdropFilter: vis ? "blur(8px)" : "blur(0px)",
                transition: "background-color 220ms ease"
            }}>
            <div style={{
                position: "relative", width: "100%", maxWidth: "480px",
                backgroundColor: "rgba(10,11,18,0.92)", backdropFilter: "blur(24px)",
                border: `1px solid ${BORDER}`, borderRadius: "var(--radius-xl)",
                boxShadow: `0 0 0 1px rgba(255,255,255,0.04),0 24px 64px rgba(0,0,0,0.55),0 0 40px ${BG}`,
                overflow: "hidden",
                opacity: vis ? 1 : 0, transform: vis ? "translateY(0) scale(1)" : "translateY(16px) scale(0.97)",
                transition: "opacity 280ms cubic-bezier(0.16,1,0.3,1),transform 280ms cubic-bezier(0.16,1,0.3,1)"
            }}>
                <div style={{
                    position: "absolute", top: 0, left: "15%", right: "15%", height: "1px",
                    background: `linear-gradient(90deg,transparent,${ACCENT},transparent)`, opacity: 0.6
                }} />

                {/* header */}
                <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--color-border)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{ width: "32px", height: "32px", borderRadius: "var(--radius-lg)", backgroundColor: BG, border: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "center", color: ACCENT, flexShrink: 0 }}>
                            <Upload size={14} />
                        </div>
                        <div>
                            <p style={{ fontSize: "13px", fontWeight: 700, color: "var(--color-text)", margin: 0 }}>Subir documento</p>
                            <p style={{ fontSize: "10px", color: "var(--color-text-faint)", margin: 0 }}>{meta.desc}</p>
                        </div>
                    </div>
                    <button onClick={onClose} aria-label="Cerrar"
                        style={{ width: "28px", height: "28px", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)", backgroundColor: "transparent", color: "var(--color-text-faint)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                        <X size={13} />
                    </button>
                </div>

                {/* badge de fase */}
                <div style={{ padding: "10px 18px", borderBottom: "1px solid var(--color-border)", backgroundColor: BG }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <Lock size={11} style={{ color: ACCENT }} />
                        <div>
                            <p style={{ fontSize: "11px", fontWeight: 700, color: ACCENT, margin: 0 }}>{meta.label}</p>
                            <p style={{ fontSize: "10px", color: "var(--color-text-faint)", margin: 0 }}>Este documento se registrará en la fase correspondiente</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} style={{ padding: "18px", display: "flex", flexDirection: "column", gap: "12px" }}>
                    {/* título */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                        <label style={{ fontSize: "11px", fontWeight: 600, color: "var(--color-text-muted)", letterSpacing: "0.02em" }}>Título *</label>
                        <input type="text" value={titulo} onChange={e => setTitulo(e.target.value)}
                            placeholder={`Ej: ${meta.label}`}
                            onFocus={() => setFocusTitulo(true)} onBlur={() => setFocusTitulo(false)}
                            style={{ width: "100%", padding: "9px 12px", backgroundColor: focusTitulo ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.03)", border: `1px solid ${focusTitulo ? ACCENT : "var(--color-border)"}`, borderRadius: "var(--radius-lg)", color: "var(--color-text)", fontSize: "12px", outline: "none", boxShadow: focusTitulo ? `0 0 0 3px ${BG}` : "none", transition: "all 150ms ease" }} />
                    </div>

                    {/* descripción */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                        <label style={{ fontSize: "11px", fontWeight: 600, color: "var(--color-text-muted)", letterSpacing: "0.02em" }}>Descripción <span style={{ fontWeight: 400, opacity: 0.6 }}>(opcional)</span></label>
                        <textarea value={descripcion} onChange={e => setDescripcion(e.target.value)}
                            placeholder="Describe brevemente el contenido del documento…" rows={3}
                            onFocus={() => setFocusDesc(true)} onBlur={() => setFocusDesc(false)}
                            style={{ width: "100%", padding: "9px 12px", backgroundColor: focusDesc ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.03)", border: `1px solid ${focusDesc ? ACCENT : "var(--color-border)"}`, borderRadius: "var(--radius-lg)", color: "var(--color-text)", fontSize: "12px", outline: "none", resize: "none", fontFamily: "inherit", boxShadow: focusDesc ? `0 0 0 3px ${BG}` : "none", transition: "all 150ms ease" }} />
                    </div>

                    {/* archivo */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                        <label style={{ fontSize: "11px", fontWeight: 600, color: "var(--color-text-muted)", letterSpacing: "0.02em" }}>Archivo *</label>
                        <input ref={inputRef} type="file" accept=".pdf,.doc,.docx" onChange={handleArchivo} style={{ display: "none" }} />
                        <button type="button" onClick={() => inputRef.current?.click()}
                            style={{ padding: "20px 16px", border: `2px dashed ${archivo ? BORDER : "var(--color-border)"}`, borderRadius: "var(--radius-lg)", backgroundColor: archivo ? BG : "rgba(255,255,255,0.02)", cursor: "pointer", transition: "all 150ms ease", textAlign: "center" }}
                            onMouseEnter={e => { if (!archivo) e.currentTarget.style.borderColor = ACCENT; }}
                            onMouseLeave={e => { if (!archivo) e.currentTarget.style.borderColor = "var(--color-border)"; }}>
                            {archivo ? (
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                                    <FileText size={16} style={{ color: ACCENT }} />
                                    <span style={{ fontSize: "12px", fontWeight: 600, color: ACCENT }}>{archivo.name}</span>
                                </div>
                            ) : (
                                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                                    <Upload size={20} style={{ color: "var(--color-text-faint)" }} />
                                    <p style={{ fontSize: "12px", color: "var(--color-text-muted)", margin: 0 }}>Haz clic para seleccionar un archivo</p>
                                    <p style={{ fontSize: "10px", color: "var(--color-text-faint)", margin: 0 }}>PDF, DOC, DOCX — Máx. 10MB</p>
                                </div>
                            )}
                        </button>
                    </div>

                    {error && (
                        <div style={{ display: "flex", alignItems: "center", gap: "7px", padding: "9px 12px", borderRadius: "var(--radius-lg)", backgroundColor: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.2)" }}>
                            <AlertCircle size={12} style={{ color: "var(--color-error)", flexShrink: 0 }} />
                            <p style={{ fontSize: "12px", color: "var(--color-error)", margin: 0 }}>{error}</p>
                        </div>
                    )}

                    <div style={{ display: "flex", gap: "8px", paddingTop: "2px" }}>
                        <button type="button" onClick={onClose}
                            style={{ flex: 1, padding: "9px", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)", backgroundColor: "transparent", color: "var(--color-text-muted)", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>
                            Cancelar
                        </button>
                        <button type="submit" disabled={cargando}
                            style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", padding: "9px", borderRadius: "var(--radius-lg)", border: "none", backgroundColor: ACCENT, color: "#fff", fontSize: "12px", fontWeight: 700, cursor: cargando ? "not-allowed" : "pointer", opacity: cargando ? 0.7 : 1 }}>
                            {cargando ? <Loader2 size={13} style={{ animation: "spin 0.8s linear infinite" }} /> : <Upload size={13} />}
                            {cargando ? "Subiendo…" : "Subir documento"}
                            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}