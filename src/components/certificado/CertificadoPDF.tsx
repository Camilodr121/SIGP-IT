// src/components/certificado/CertificadoPDF.tsx
// Certificado rediseñado — paleta actualizada del sistema SIGP-IT
import {
    Document, Page, Text, View, StyleSheet, Svg, Path, Circle, Line, G,
} from "@react-pdf/renderer";

/* ─── Paleta de colores ─────────────────────────────────────────────── */
const C = {
    navy:       "#0A0B12",   // fondo header — igual al dashboard
    navyMid:    "#10111C",
    surface:    "#F8F9FC",   // fondo página
    surfaceAlt: "#EFF1F7",   // filas alternas
    border:     "#E2E5EF",
    purple:     "#A78BFA",   // color-role-universidad
    purpleDark: "#7C3AED",
    accent:     "#34C97A",   // color-accent del sistema
    text:       "#0F1120",
    textMid:    "#374151",
    textMuted:  "#6B7280",
    textFaint:  "#9CA3AF",
    white:      "#FFFFFF",
    gold:       "#F59E0B",
};

const styles = StyleSheet.create({
    page: {
        fontFamily: "Helvetica",
        backgroundColor: C.surface,
        fontSize: 11,
        color: C.text,
    },

    /* ── Header band oscuro ── */
    headerBand: {
        backgroundColor: C.navy,
        paddingHorizontal: 48,
        paddingTop: 32,
        paddingBottom: 28,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    headerLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
    },
    logoWrap: {
        width: 44,
        height: 44,
        backgroundColor: "#1C1D2E",
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
        border: "1px solid #2A2B40",
    },
    brandName: {
        fontFamily: "Helvetica-Bold",
        fontSize: 17,
        color: C.white,
        letterSpacing: 0.5,
    },
    brandSub: {
        fontSize: 8,
        color: "#8B8FA8",
        marginTop: 3,
    },
    folioBox: {
        backgroundColor: "#1C1D2E",
        borderRadius: 6,
        paddingHorizontal: 12,
        paddingVertical: 7,
        border: "1px solid #2A2B40",
        alignItems: "flex-end",
    },
    folioLabel: {
        fontSize: 7,
        color: "#6B6F8A",
        letterSpacing: 0.8,
        textTransform: "uppercase",
        marginBottom: 2,
    },
    folioValue: {
        fontFamily: "Helvetica-Bold",
        fontSize: 9,
        color: C.purple,
    },
    folioDate: {
        fontSize: 7,
        color: "#6B6F8A",
        marginTop: 3,
    },

    /* ── Accent bar bajo el header ── */
    accentBar: {
        height: 3,
        backgroundColor: C.purpleDark,
    },
    accentBarInner: {
        width: "30%",
        height: 3,
        backgroundColor: C.accent,
    },

    /* ── Cuerpo principal ── */
    body: {
        paddingHorizontal: 48,
        paddingTop: 36,
        paddingBottom: 100,
    },

    /* ── Sello central ── */
    sealRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 24,
        gap: 14,
    },
    sealLine: {
        flex: 1,
        height: 1,
        backgroundColor: C.border,
    },
    sealTag: {
        backgroundColor: "#EDE9FE",
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 5,
        border: "1px solid #C4B5FD",
    },
    sealTagText: {
        fontSize: 8,
        fontFamily: "Helvetica-Bold",
        color: C.purpleDark,
        letterSpacing: 1.2,
        textTransform: "uppercase",
    },

    /* ── Título ── */
    titulo: {
        fontSize: 20,
        fontFamily: "Helvetica-Bold",
        color: C.text,
        textAlign: "center",
        letterSpacing: 0.3,
        marginBottom: 6,
    },
    subtitulo: {
        fontSize: 9,
        color: C.textMuted,
        textAlign: "center",
        marginBottom: 32,
    },

    /* ── Párrafo ── */
    parrafo: {
        fontSize: 10.5,
        lineHeight: 1.85,
        color: C.textMid,
        marginBottom: 16,
        textAlign: "justify",
    },
    bold: {
        fontFamily: "Helvetica-Bold",
        color: C.text,
    },

    /* ── Tabla de datos ── */
    tabla: {
        marginVertical: 22,
        borderRadius: 8,
        border: "1px solid #E2E5EF",
        overflow: "hidden",
    },
    tablaHeader: {
        flexDirection: "row",
        backgroundColor: C.navy,
        paddingHorizontal: 16,
        paddingVertical: 9,
    },
    tablaHeaderText: {
        fontSize: 8,
        fontFamily: "Helvetica-Bold",
        color: "#8B8FA8",
        letterSpacing: 0.8,
        textTransform: "uppercase",
        flex: 1,
    },
    tablaFila: {
        flexDirection: "row",
        borderBottom: "1px solid #E2E5EF",
        backgroundColor: C.white,
    },
    tablaFilaAlterna: {
        flexDirection: "row",
        borderBottom: "1px solid #E2E5EF",
        backgroundColor: C.surfaceAlt,
    },
    tablaCelda: {
        flex: 1,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRight: "1px solid #E2E5EF",
    },
    tablaCeldaUltima: {
        flex: 1,
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
    tablaCeldaLabel: {
        fontSize: 7.5,
        color: C.textFaint,
        marginBottom: 3,
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    tablaCeldaValor: {
        fontSize: 10.5,
        fontFamily: "Helvetica-Bold",
        color: C.text,
    },
    tablaCeldaValorAccent: {
        fontSize: 10.5,
        fontFamily: "Helvetica-Bold",
        color: C.purpleDark,
    },

    /* ── Firmas ── */
    firmaSection: {
        marginTop: 40,
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 32,
    },
    firmaBox: {
        flex: 1,
        alignItems: "center",
    },
    firmaLinea: {
        width: "100%",
        borderTop: "1.5px solid #C4B5FD",
        marginBottom: 10,
    },
    firmaNombre: {
        fontSize: 10.5,
        fontFamily: "Helvetica-Bold",
        color: C.text,
        textAlign: "center",
    },
    firmaCargo: {
        fontSize: 8.5,
        color: C.textMuted,
        textAlign: "center",
        marginTop: 2,
    },
    firmaEmpresa: {
        fontSize: 8,
        color: C.purpleDark,
        textAlign: "center",
        marginTop: 2,
        fontFamily: "Helvetica-Bold",
    },

    /* ── Footer ── */
    footer: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: C.navyMid,
        paddingHorizontal: 48,
        paddingVertical: 16,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    footerText: {
        fontSize: 7.5,
        color: "#6B6F8A",
    },
    footerFolio: {
        fontSize: 7.5,
        color: C.purple,
        fontFamily: "Helvetica-Bold",
    },
    footerDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: C.accent,
        marginHorizontal: 10,
    },
});

/* ─── Logo SVG (idéntico al del dashboard) ──────────────────────────── */
function LogoSVG() {
    return (
        <Svg width={26} height={26} viewBox="0 0 24 24">
            <Circle cx="12" cy="12" r="2.5" fill={C.white} opacity={0.95} />
            <Circle cx="4" cy="4" r="1.8" fill={C.white} opacity={0.5} />
            <Circle cx="20" cy="4" r="1.8" fill={C.white} opacity={0.5} />
            <Circle cx="4" cy="20" r="1.8" fill={C.white} opacity={0.5} />
            <Circle cx="20" cy="20" r="1.8" fill={C.white} opacity={0.5} />
            <Line x1="5.3" y1="5.3" x2="10.2" y2="10.2" stroke={C.white} strokeWidth={1} opacity={0.35} />
            <Line x1="18.7" y1="5.3" x2="13.8" y2="10.2" stroke={C.white} strokeWidth={1} opacity={0.35} />
            <Line x1="5.3" y1="18.7" x2="10.2" y2="13.8" stroke={C.white} strokeWidth={1} opacity={0.35} />
            <Line x1="18.7" y1="18.7" x2="13.8" y2="13.8" stroke={C.white} strokeWidth={1} opacity={0.35} />
        </Svg>
    );
}

/* ─── Props ─────────────────────────────────────────────────────────── */
interface CertificadoPDFProps {
    estudiante: string;
    codigoUsta: string;
    programa: string;
    empresa: string;
    cargo: string;
    fechaInicio: string;
    fechaFin: string;
    totalReportes: number;
    representante: string;
    generadoEn: string;
    folio: string;
}

/* ─── Componente principal ──────────────────────────────────────────── */
export default function CertificadoPDF({
    estudiante, codigoUsta, programa, empresa,
    cargo, fechaInicio, fechaFin, totalReportes,
    representante, generadoEn, folio,
}: CertificadoPDFProps) {
    return (
        <Document
            title={`Certificado de Práctica — ${estudiante}`}
            author="SIGP-IT"
            subject="Constancia de Práctica Profesional"
            creator="SIGP-IT · Sistema Integral de Gestión de Prácticas"
        >
            <Page size="A4" style={styles.page}>

                {/* ── Header oscuro ── */}
                <View style={styles.headerBand}>
                    <View style={styles.headerLeft}>
                        <View style={styles.logoWrap}>
                            <LogoSVG />
                        </View>
                        <View>
                            <Text style={styles.brandName}>SIGP-IT</Text>
                            <Text style={styles.brandSub}>Sistema Integral de Gestión de Prácticas</Text>
                            <Text style={styles.brandSub}>Ingeniería de Telecomunicaciones</Text>
                        </View>
                    </View>
                    <View style={styles.folioBox}>
                        <Text style={styles.folioLabel}>Folio</Text>
                        <Text style={styles.folioValue}>{folio}</Text>
                        <Text style={styles.folioDate}>Expedido: {generadoEn}</Text>
                    </View>
                </View>

                {/* ── Barra de acento ── */}
                <View style={styles.accentBar}>
                    <View style={styles.accentBarInner} />
                </View>

                {/* ── Cuerpo ── */}
                <View style={styles.body}>

                    {/* Sello oficial */}
                    <View style={styles.sealRow}>
                        <View style={styles.sealLine} />
                        <View style={styles.sealTag}>
                            <Text style={styles.sealTagText}>✦  Documento Oficial  ✦</Text>
                        </View>
                        <View style={styles.sealLine} />
                    </View>

                    {/* Título */}
                    <Text style={styles.titulo}>CONSTANCIA DE PRÁCTICA PROFESIONAL</Text>
                    <Text style={styles.subtitulo}>
                        Generado digitalmente por la plataforma SIGP-IT · Válido sin firma manuscrita
                    </Text>

                    {/* Párrafo 1 */}
                    <Text style={styles.parrafo}>
                        La empresa{" "}
                        <Text style={styles.bold}>{empresa}</Text>
                        {", representada por "}
                        <Text style={styles.bold}>{representante}</Text>
                        {", hace constar que el/la estudiante "}
                        <Text style={styles.bold}>{estudiante}</Text>
                        {", identificado/a con código institucional "}
                        <Text style={styles.bold}>{codigoUsta || "N/A"}</Text>
                        {", perteneciente al programa de "}
                        <Text style={styles.bold}>{programa || "Ingeniería de Telecomunicaciones"}</Text>
                        {", realizó su práctica profesional en esta empresa de manera satisfactoria, cumpliendo con todas las responsabilidades asignadas."}
                    </Text>

                    {/* Tabla de datos */}
                    <View style={styles.tabla}>
                        <View style={styles.tablaHeader}>
                            <Text style={[styles.tablaHeaderText, { flex: 1 }]}>Cargo</Text>
                            <Text style={[styles.tablaHeaderText, { flex: 1 }]}>Reportes aprobados</Text>
                        </View>
                        <View style={styles.tablaFila}>
                            <View style={styles.tablaCelda}>
                                <Text style={styles.tablaCeldaLabel}>Cargo desempeñado</Text>
                                <Text style={styles.tablaCeldaValor}>{cargo || "Practicante"}</Text>
                            </View>
                            <View style={styles.tablaCeldaUltima}>
                                <Text style={styles.tablaCeldaLabel}>Total de reportes verificados</Text>
                                <Text style={styles.tablaCeldaValorAccent}>{totalReportes} reporte(s)</Text>
                            </View>
                        </View>
                        <View style={styles.tablaFilaAlterna}>
                            <View style={styles.tablaCelda}>
                                <Text style={styles.tablaCeldaLabel}>Fecha de inicio</Text>
                                <Text style={styles.tablaCeldaValor}>{fechaInicio}</Text>
                            </View>
                            <View style={styles.tablaCeldaUltima}>
                                <Text style={styles.tablaCeldaLabel}>Fecha de finalización</Text>
                                <Text style={styles.tablaCeldaValor}>{fechaFin}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Párrafo 2 */}
                    <Text style={styles.parrafo}>
                        {"Durante su período de práctica, el/la estudiante demostró responsabilidad, iniciativa y compromiso en el cumplimiento de sus funciones. Se entregaron un total de "}
                        <Text style={styles.bold}>{totalReportes} reporte(s)</Text>
                        {" de seguimiento, los cuales fueron revisados, verificados y aprobados a través de la plataforma digital SIGP-IT."}
                    </Text>

                    <Text style={styles.parrafo}>
                        {"Esta constancia se expide a solicitud del/la interesado/a para los fines que estime convenientes, en la fecha indicada en el presente documento. Su autenticidad puede verificarse mediante el folio "}
                        <Text style={styles.bold}>{folio}</Text>
                        {" en el sistema SIGP-IT."}
                    </Text>

                    {/* Firmas */}
                    <View style={styles.firmaSection}>
                        <View style={styles.firmaBox}>
                            <View style={styles.firmaLinea} />
                            <Text style={styles.firmaNombre}>{representante}</Text>
                            <Text style={styles.firmaCargo}>Representante Legal / Supervisor</Text>
                            <Text style={styles.firmaEmpresa}>{empresa}</Text>
                        </View>
                        <View style={styles.firmaBox}>
                            <View style={styles.firmaLinea} />
                            <Text style={styles.firmaNombre}>{estudiante}</Text>
                            <Text style={styles.firmaCargo}>Estudiante Practicante</Text>
                            <Text style={styles.firmaCargo}>{programa || "Ing. Telecomunicaciones"}</Text>
                        </View>
                    </View>
                </View>

                {/* ── Footer oscuro ── */}
                <View style={styles.footer} fixed>
                    <Text style={styles.footerText}>
                        SIGP-IT · Sistema Integral de Gestión de Prácticas · Documento generado digitalmente
                    </Text>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <View style={styles.footerDot} />
                        <Text style={styles.footerFolio}>{folio}</Text>
                    </View>
                </View>

            </Page>
        </Document>
    );
}