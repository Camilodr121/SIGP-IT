// src/pages/dashboard/empresa/perfil.tsx
import { useState, useEffect } from "react";
import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { usePerfil } from "@/hooks/usePerfil";
import {
    Building2, Mail, Phone, MapPin,
    Briefcase, Hash, Loader2, CheckCircle, Save, User, AlertCircle,
} from "lucide-react";

/* ─── FieldInput ─────────────────────────────────────────────────────── */
function FieldInput({ name, label, icon, placeholder, value, colSpan, onChange }: {
    name: string; label: string; icon: JSX.Element; placeholder: string;
    value: string; colSpan?: boolean; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
    const [focused, setFocused] = useState(false);
    return (
        <div style={{ gridColumn: colSpan ? "1 / -1" : undefined, display: "flex", flexDirection: "column", gap: "5px" }}>
            <label style={{ fontSize: "11px", fontWeight: 600, color: "var(--color-text-muted)", letterSpacing: "0.02em", display: "flex", alignItems: "center", gap: "5px" }}>
                <span style={{ color: "var(--color-text-faint)" }}>{icon}</span>{label}
            </label>
            <input type="text" name={name} value={value} onChange={onChange} placeholder={placeholder}
                onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
                style={{ width: "100%", padding: "9px 12px", backgroundColor: focused ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.03)", border: `1px solid ${focused ? "var(--color-role-empresa)" : "var(--color-border)"}`, borderRadius: "var(--radius-lg)", color: "var(--color-text)", fontSize: "12px", outline: "none", boxShadow: focused ? `0 0 0 3px var(--color-role-empresa-bg)` : "none", transition: "border-color 150ms ease,box-shadow 150ms ease,background 150ms ease" }} />
        </div>
    );
}

/* ══════════════════════════════════════════════════════════════════════
   PÁGINA PERFIL EMPRESA
══════════════════════════════════════════════════════════════════════ */
export default function PerfilEmpresa() {
    const { perfil, cargando, refetch } = usePerfil();
    const [form, setForm] = useState({ name: "", nombreEmpresa: "", nit: "", sector: "", ciudad: "", telefono: "" });
    const [guardando, setGuardando] = useState(false);
    const [exito, setExito] = useState(false);
    const [error, setError] = useState("");
    const [mounted, setMounted] = useState(false);
    const [hovBtn, setHovBtn] = useState(false);

    useEffect(() => { const t = setTimeout(() => setMounted(true), 40); return () => clearTimeout(t); }, []);

    useEffect(() => {
        if (perfil) setForm({
            name: perfil.name ?? "",
            nombreEmpresa: perfil.perfilEmpresa?.nombreEmpresa ?? "",
            nit: perfil.perfilEmpresa?.nit ?? "",
            sector: perfil.perfilEmpresa?.sector ?? "",
            ciudad: perfil.perfilEmpresa?.ciudad ?? "",
            telefono: perfil.perfilEmpresa?.telefono ?? "",
        });
    }, [perfil]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
        setForm(p => ({ ...p, [e.target.name]: e.target.value }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); setGuardando(true); setError(""); setExito(false);
        try {
            const [r1, r2] = await Promise.all([
                fetch("/api/perfil", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: form.name }) }),
                fetch("/api/perfil/empresa", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ nombreEmpresa: form.nombreEmpresa, nit: form.nit, sector: form.sector, ciudad: form.ciudad, telefono: form.telefono }) }),
            ]);
            if (!r1.ok || !r2.ok) throw new Error();
            await refetch(); setExito(true); setTimeout(() => setExito(false), 3000);
        } catch { setError("No se pudo guardar el perfil"); } finally { setGuardando(false); }
    };

    if (cargando) return (
        <DashboardLayout title="Mi Perfil">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 0" }}>
                <Loader2 size={28} style={{ color: "var(--color-accent)", animation: "spin 0.8s linear infinite" }} />
                <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </div>
        </DashboardLayout>
    );

    const campos = [
        { name: "name", label: "Nombre del contacto", icon: <User size={12} />, placeholder: "Nombre del representante", colSpan: true },
        { name: "nombreEmpresa", label: "Nombre de la empresa", icon: <Building2 size={12} />, placeholder: "Ej: Claro Colombia S.A.", colSpan: true },
        { name: "nit", label: "NIT", icon: <Hash size={12} />, placeholder: "Ej: 800123456-1", colSpan: false },
        { name: "telefono", label: "Teléfono", icon: <Phone size={12} />, placeholder: "Ej: 6017000000", colSpan: false },
        { name: "sector", label: "Sector", icon: <Briefcase size={12} />, placeholder: "Ej: Telecomunicaciones", colSpan: false },
        { name: "ciudad", label: "Ciudad", icon: <MapPin size={12} />, placeholder: "Ej: Bucaramanga", colSpan: false },
    ];

    return (
        <DashboardLayout title="Mi Perfil">

            {/* header */}
            <div style={{ marginBottom: "18px", opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(-6px)", transition: "opacity 350ms cubic-bezier(0.16,1,0.3,1), transform 350ms cubic-bezier(0.16,1,0.3,1)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                    <span style={{ width: "5px", height: "5px", borderRadius: "50%", backgroundColor: "var(--color-role-empresa)", display: "inline-block" }} />
                    <span style={{ fontSize: "9px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "var(--color-role-empresa)" }}>Mi empresa</span>
                </div>
                <h2 style={{ fontSize: "clamp(1rem,1.8vw,1.25rem)", fontWeight: 700, color: "var(--color-text)", margin: "0 0 2px", letterSpacing: "-0.02em" }}>Perfil de empresa</h2>
                <p style={{ fontSize: "12px", color: "var(--color-text-muted)", margin: 0 }}>Información de tu empresa visible para la universidad</p>
            </div>

            <div style={{ maxWidth: "580px", display: "flex", flexDirection: "column", gap: "12px", opacity: mounted ? 1 : 0, transition: "opacity 360ms ease 80ms" }}>

                {/* avatar card */}
                <div style={{ position: "relative", overflow: "hidden", display: "flex", alignItems: "center", gap: "16px", backgroundColor: "rgba(13,14,21,0.55)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", border: "1px solid var(--color-role-empresa-border)", borderRadius: "var(--radius-xl)", padding: "16px 20px" }}>
                    <div style={{ position: "absolute", top: 0, left: "15%", right: "15%", height: "1px", background: "linear-gradient(90deg,transparent,var(--color-role-empresa),transparent)", opacity: 0.4 }} />
                    <div style={{ position: "absolute", top: "-20px", left: "-20px", width: "80px", height: "80px", borderRadius: "50%", backgroundColor: "var(--color-role-empresa-bg)", filter: "blur(30px)", opacity: 0.5, pointerEvents: "none" }} />
                    <div style={{ position: "relative", width: "52px", height: "52px", borderRadius: "var(--radius-xl)", backgroundColor: "var(--color-role-empresa-bg)", border: "1px solid var(--color-role-empresa-border)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "var(--color-role-empresa)" }}>
                        <Building2 size={24} />
                    </div>
                    <div style={{ position: "relative" }}>
                        <p style={{ fontSize: "15px", fontWeight: 700, color: "var(--color-text)", margin: "0 0 2px", letterSpacing: "-0.02em" }}>
                            {perfil?.perfilEmpresa?.nombreEmpresa ?? perfil?.name ?? "Empresa"}
                        </p>
                        <p style={{ fontSize: "11px", color: "var(--color-text-muted)", margin: "0 0 6px", display: "flex", alignItems: "center", gap: "4px" }}>
                            <Mail size={10} />{perfil?.email}
                        </p>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "2px 8px", borderRadius: "var(--radius-full)", backgroundColor: "var(--color-role-empresa-bg)", border: "1px solid var(--color-role-empresa-border)", fontSize: "10px", fontWeight: 600, color: "var(--color-role-empresa)" }}>
                            <Building2 size={10} />Empresa
                        </span>
                    </div>
                </div>

                {/* form */}
                <form onSubmit={handleSubmit} style={{ position: "relative", overflow: "hidden", backgroundColor: "rgba(13,14,21,0.55)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-xl)", padding: "16px 20px" }}>
                    <p style={{ fontSize: "11px", fontWeight: 700, color: "var(--color-text-muted)", letterSpacing: "0.04em", textTransform: "uppercase" as const, margin: "0 0 14px", paddingBottom: "10px", borderBottom: "1px solid var(--color-border)" }}>
                        Información de la empresa
                    </p>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "14px" }}>
                        {campos.map(c => (
                            <FieldInput key={c.name} {...c} value={(form as any)[c.name]} onChange={handleChange} />
                        ))}
                    </div>

                    {/* feedback */}
                    {error && (
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "9px 12px", borderRadius: "var(--radius-lg)", backgroundColor: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.2)", marginBottom: "12px" }}>
                            <AlertCircle size={13} style={{ color: "var(--color-error)", flexShrink: 0 }} />
                            <p style={{ fontSize: "12px", color: "var(--color-error)", margin: 0 }}>{error}</p>
                        </div>
                    )}
                    {exito && (
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "9px 12px", borderRadius: "var(--radius-lg)", backgroundColor: "var(--color-success-bg)", border: "1px solid rgba(52,201,122,0.2)", marginBottom: "12px" }}>
                            <CheckCircle size={13} style={{ color: "var(--color-success)", flexShrink: 0 }} />
                            <p style={{ fontSize: "12px", color: "var(--color-success)", margin: 0 }}>Perfil actualizado correctamente</p>
                        </div>
                    )}

                    <button type="submit" disabled={guardando}
                        onMouseEnter={() => setHovBtn(true)} onMouseLeave={() => setHovBtn(false)}
                        style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "9px 18px", backgroundColor: "var(--color-accent)", color: "#fff", fontWeight: 700, fontSize: "12px", borderRadius: "var(--radius-lg)", border: "none", cursor: guardando ? "not-allowed" : "pointer", opacity: guardando ? 0.7 : 1, boxShadow: hovBtn && !guardando ? "0 4px 16px rgba(52,201,122,0.25)" : "none", transition: "filter var(--transition-fast), transform var(--transition-fast), box-shadow var(--transition-fast)", filter: hovBtn && !guardando ? "brightness(1.1)" : "brightness(1)", transform: hovBtn && !guardando ? "translateY(-1px)" : "translateY(0)" }}>
                        {guardando ? <Loader2 size={14} style={{ animation: "spin 0.8s linear infinite" }} /> : <Save size={14} />}
                        {guardando ? "Guardando..." : "Guardar cambios"}
                        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                    </button>
                </form>
            </div>
        </DashboardLayout>
    );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    const session = await getSession(context);
    if (!session || session.user.role !== "EMPRESA") return { redirect: { destination: "/auth/login", permanent: false } };
    return { props: {} };
};