// src/components/ui/KpiCard.tsx
import { useState, useEffect, useRef } from "react";

export interface KpiCardProps {
    label: string;
    valor: string | number;
    sub?: string;
    icon: JSX.Element;
    /** Color principal hex/var */
    color: string;
    /** Delay de entrada en ms */
    delay?: number;
    mounted?: boolean;
    /** href opcional — convierte el card en link */
    href?: string;
}

export default function KpiCard({
    label, valor, sub, icon, color,
    delay = 0, mounted = true, href,
}: KpiCardProps) {
    const [hov, setHov] = useState(false);
    const [numAnimated, setNumAnimated] = useState(false);
    const prevValRef = useRef<string | number>(valor);

    // Animar número cuando cambia el valor
    useEffect(() => {
        setNumAnimated(false);
        const t = setTimeout(() => setNumAnimated(true), 40);
        return () => clearTimeout(t);
    }, [valor]);

    const Tag = href ? "a" : "div";

    return (
        <Tag
            href={href}
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
            style={{
                display: "block",
                position: "relative",
                backgroundColor: hov ? "rgba(255,255,255,0.04)" : "rgba(13,14,21,0.65)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                border: `1px solid ${hov ? `color-mix(in srgb, ${color} 35%, transparent)` : "rgba(255,255,255,0.07)"}`,
                borderRadius: "18px",
                padding: "18px",
                overflow: "hidden",
                textDecoration: "none",
                cursor: href ? "pointer" : "default",
                transition: "all 200ms cubic-bezier(0.16,1,0.3,1)",
                transform: hov ? "translateY(-3px) scale(1.01)" : "translateY(0) scale(1)",
                boxShadow: hov
                    ? `0 16px 40px rgba(0,0,0,0.4), 0 0 0 1px color-mix(in srgb, ${color} 25%, transparent)`
                    : "none",
                opacity: mounted ? 1 : 0,
                transitionDelay: mounted ? `${delay}ms` : "0ms",
            } as React.CSSProperties}
        >
            {/* ── ambient glow blob ── */}
            <div style={{
                position: "absolute", top: "-30px", right: "-30px",
                width: "120px", height: "120px", borderRadius: "50%",
                backgroundColor: color, filter: "blur(45px)",
                opacity: hov ? 0.2 : 0.07,
                transition: "opacity 350ms ease",
                pointerEvents: "none",
            }} />

            {/* ── shimmer top line ── */}
            <div style={{
                position: "absolute", top: 0, left: "12%", right: "12%", height: "1px",
                background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
                opacity: hov ? 0.55 : 0.1,
                transition: "opacity 300ms ease",
            }} />

            {/* ── icon badge ── */}
            <div style={{
                display: "inline-flex", padding: "9px", borderRadius: "12px", marginBottom: "14px",
                backgroundColor: `color-mix(in srgb, ${color} 15%, transparent)`,
                border: `1px solid color-mix(in srgb, ${color} 30%, transparent)`,
                color,
                boxShadow: hov ? `0 0 18px color-mix(in srgb, ${color} 30%, transparent)` : "none",
                transition: "box-shadow 300ms ease",
            }}>
                {icon}
            </div>

            {/* ── value ── */}
            <p style={{
                fontSize: "28px", fontWeight: 800, color: "var(--color-text)",
                margin: "0 0 3px", lineHeight: 1, letterSpacing: "-0.04em",
                fontVariantNumeric: "tabular-nums",
                transform: numAnimated ? "translateY(0)" : "translateY(4px)",
                opacity: numAnimated ? 1 : 0,
                transition: "transform 350ms cubic-bezier(0.16,1,0.3,1), opacity 350ms ease",
            }}>
                {valor}
            </p>

            {/* ── label ── */}
            <p style={{ fontSize: "11px", fontWeight: 600, color: "var(--color-text-muted)", margin: "0 0 2px" }}>
                {label}
            </p>

            {/* ── sub ── */}
            {sub && (
                <p style={{ fontSize: "10px", color: "var(--color-text-faint)", margin: 0 }}>
                    {sub}
                </p>
            )}

            {/* ── bottom accent line ── */}
            <div style={{
                position: "absolute", bottom: 0, left: "20%", right: "20%", height: "2px",
                background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
                borderRadius: "99px",
                opacity: hov ? 0.5 : 0,
                transition: "opacity 300ms ease",
            }} />
        </Tag>
    );
}
