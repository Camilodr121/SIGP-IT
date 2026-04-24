// sigp-it/src/components/ui/EstadoBadge.tsx
import { EstadoDocumento } from "@prisma/client";

/**
 * EstadoBadge — badge semántico de estado de documento.
 * Colores mapeados a variables CSS del design system.
 * Incluye punto indicador + label para máxima legibilidad.
 */

interface EstadoConfig {
    label: string;
    dot: string;   /* color del punto */
    textColor: string;
    bgColor: string;
    border: string;
}

const ESTADO_CONFIG: Record<EstadoDocumento, EstadoConfig> = {
    PENDIENTE: {
        label: "Pendiente",
        dot: "var(--color-warning)",
        textColor: "var(--color-warning)",
        bgColor: "var(--color-warning-bg)",
        border: "rgba(245,166,35,0.2)",
    },
    EN_REVISION: {
        label: "En revisión",
        dot: "var(--color-accent)",
        textColor: "var(--color-accent)",
        bgColor: "var(--color-accent-subtle)",
        border: "var(--color-accent-border)",
    },
    APROBADO: {
        label: "Aprobado",
        dot: "var(--color-success)",
        textColor: "var(--color-success)",
        bgColor: "var(--color-success-bg)",
        border: "rgba(52,201,122,0.2)",
    },
    RECHAZADO: {
        label: "Rechazado",
        dot: "var(--color-error)",
        textColor: "var(--color-error)",
        bgColor: "var(--color-error-bg)",
        border: "rgba(240,77,77,0.2)",
    },
};

interface EstadoBadgeProps {
    estado: EstadoDocumento;
}

export default function EstadoBadge({ estado }: EstadoBadgeProps) {
    const c = ESTADO_CONFIG[estado];
    return (
        <span
            style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                padding: "3px 8px",
                borderRadius: "var(--radius-full)",
                fontSize: "11px",
                fontWeight: 500,
                letterSpacing: "0.01em",
                backgroundColor: c.bgColor,
                color: c.textColor,
                border: `1px solid ${c.border}`,
                whiteSpace: "nowrap",
            }}
        >
            {/* Punto indicador */}
            <span
                style={{
                    width: "5px",
                    height: "5px",
                    borderRadius: "50%",
                    backgroundColor: c.dot,
                    flexShrink: 0,
                }}
                aria-hidden="true"
            />
            {c.label}
        </span>
    );
}