import {
    Document, Page, Text, View, StyleSheet,
} from "@react-pdf/renderer";

// Sin Font.register — usamos Helvetica que viene built-in en @react-pdf/renderer
// Fuentes built-in disponibles: Helvetica, Courier, Times-Roman (y sus variantes Bold/Oblique)

const styles = StyleSheet.create({
    page: {
        fontFamily: "Helvetica",
        backgroundColor: "#ffffff",
        padding: 60,
        fontSize: 11,
        color: "#1a1a1a",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 40,
        paddingBottom: 20,
        borderBottom: "2px solid #0d9488",
    },
    logoBox: {
        width: 48,
        height: 48,
        backgroundColor: "#0d9488",
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
    },
    logoText: {
        color: "#ffffff",
        fontFamily: "Helvetica-Bold",
        fontSize: 10,
    },
    orgName: {
        fontSize: 18,
        fontFamily: "Helvetica-Bold",
        color: "#0d9488",
    },
    orgSub: {
        fontSize: 9,
        color: "#6b7280",
        marginTop: 2,
    },
    fechaText: {
        fontSize: 9,
        color: "#9ca3af",
        textAlign: "right",
    },
    titulo: {
        fontSize: 18,
        fontFamily: "Helvetica-Bold",
        color: "#111827",
        textAlign: "center",
        marginBottom: 8,
        letterSpacing: 0.5,
    },
    subtitulo: {
        fontSize: 10,
        color: "#6b7280",
        textAlign: "center",
        marginBottom: 36,
    },
    parrafo: {
        fontSize: 11,
        lineHeight: 1.8,
        color: "#374151",
        marginBottom: 16,
        textAlign: "justify",
    },
    destacado: {
        fontFamily: "Helvetica-Bold",
        color: "#111827",
    },
    tabla: {
        marginVertical: 24,
    },
    tablaFila: {
        flexDirection: "row",
        borderBottom: "1px solid #e5e7eb",
    },
    tablaFilaAlterna: {
        flexDirection: "row",
        borderBottom: "1px solid #e5e7eb",
        backgroundColor: "#f9fafb",
    },
    tablaCelda: {
        flex: 1,
        padding: "8 12",
    },
    tablaCeldaLabel: {
        fontSize: 9,
        color: "#9ca3af",
        marginBottom: 2,
    },
    tablaCeldaValor: {
        fontSize: 11,
        fontFamily: "Helvetica-Bold",
        color: "#111827",
    },
    firmaSection: {
        marginTop: 48,
        flexDirection: "row",
        justifyContent: "space-between",
    },
    firmaBox: {
        width: "45%",
        alignItems: "center",
    },
    firmaLinea: {
        borderTop: "1px solid #d1d5db",
        width: "100%",
        marginBottom: 8,
    },
    firmaNombre: {
        fontSize: 11,
        fontFamily: "Helvetica-Bold",
        color: "#111827",
        textAlign: "center",
    },
    firmaCargo: {
        fontSize: 9,
        color: "#6b7280",
        textAlign: "center",
        marginTop: 2,
    },
    footer: {
        position: "absolute",
        bottom: 40,
        left: 60,
        right: 60,
        borderTop: "1px solid #e5e7eb",
        paddingTop: 12,
        flexDirection: "row",
        justifyContent: "space-between",
    },
    footerText: {
        fontSize: 8,
        color: "#9ca3af",
    },
    footerFolio: {
        fontSize: 8,
        color: "#0d9488",
    },
});

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
        >
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                        <View style={styles.logoBox}>
                            <Text style={styles.logoText}>SIGP</Text>
                        </View>
                        <View>
                            <Text style={styles.orgName}>SIGP-IT</Text>
                            <Text style={styles.orgSub}>Sistema Integral de Gestión de Prácticas</Text>
                            <Text style={styles.orgSub}>Ingeniería de Telecomunicaciones</Text>
                        </View>
                    </View>
                    <View>
                        <Text style={styles.fechaText}>Folio: {folio}</Text>
                        <Text style={styles.fechaText}>Expedido: {generadoEn}</Text>
                    </View>
                </View>

                {/* Título */}
                <Text style={styles.titulo}>CONSTANCIA DE PRÁCTICA PROFESIONAL</Text>
                <Text style={styles.subtitulo}>
                    Documento oficial generado por el sistema SIGP-IT
                </Text>

                {/* Cuerpo */}
                <Text style={styles.parrafo}>
                    La empresa{" "}
                    <Text style={styles.destacado}>{empresa}</Text>
                    {" "}hace constar que el/la estudiante{" "}
                    <Text style={styles.destacado}>{estudiante}</Text>
                    {" "}identificado/a con código institucional{" "}
                    <Text style={styles.destacado}>{codigoUsta || "N/A"}</Text>
                    {" "}del programa de{" "}
                    <Text style={styles.destacado}>
                        {programa || "Ingeniería de Telecomunicaciones"}
                    </Text>
                    {", realizó su práctica profesional en esta empresa satisfactoriamente."}
                </Text>

                {/* Tabla de datos */}
                <View style={styles.tabla}>
                    <View style={styles.tablaFila}>
                        <View style={styles.tablaCelda}>
                            <Text style={styles.tablaCeldaLabel}>Cargo desempeñado</Text>
                            <Text style={styles.tablaCeldaValor}>{cargo || "Practicante"}</Text>
                        </View>
                        <View style={styles.tablaCelda}>
                            <Text style={styles.tablaCeldaLabel}>Reportes entregados</Text>
                            <Text style={styles.tablaCeldaValor}>{totalReportes} reporte(s)</Text>
                        </View>
                    </View>
                    <View style={styles.tablaFilaAlterna}>
                        <View style={styles.tablaCelda}>
                            <Text style={styles.tablaCeldaLabel}>Fecha de inicio</Text>
                            <Text style={styles.tablaCeldaValor}>{fechaInicio}</Text>
                        </View>
                        <View style={styles.tablaCelda}>
                            <Text style={styles.tablaCeldaLabel}>Fecha de finalización</Text>
                            <Text style={styles.tablaCeldaValor}>{fechaFin}</Text>
                        </View>
                    </View>
                </View>

                <Text style={styles.parrafo}>
                    {"Durante su periodo de práctica, el/la estudiante demostró responsabilidad y compromiso en el cumplimiento de sus funciones, entregando un total de "}
                    <Text style={styles.destacado}>{totalReportes} reporte(s)</Text>
                    {" de seguimiento verificados y aprobados a través de la plataforma SIGP-IT."}
                </Text>

                <Text style={styles.parrafo}>
                    {"Esta constancia se expide a solicitud del interesado/a para los fines que estime conveniente, en la fecha indicada en el presente documento."}
                </Text>

                {/* Firmas */}
                <View style={styles.firmaSection}>
                    <View style={styles.firmaBox}>
                        <View style={styles.firmaLinea} />
                        <Text style={styles.firmaNombre}>{representante}</Text>
                        <Text style={styles.firmaCargo}>Representante de la Empresa</Text>
                        <Text style={styles.firmaCargo}>{empresa}</Text>
                    </View>
                    <View style={styles.firmaBox}>
                        <View style={styles.firmaLinea} />
                        <Text style={styles.firmaNombre}>{estudiante}</Text>
                        <Text style={styles.firmaCargo}>Estudiante Practicante</Text>
                        <Text style={styles.firmaCargo}>
                            {programa || "Ing. Telecomunicaciones"}
                        </Text>
                    </View>
                </View>

                {/* Footer */}
                <View style={styles.footer} fixed>
                    <Text style={styles.footerText}>
                        SIGP-IT — Sistema Integral de Gestión de Prácticas
                    </Text>
                    <Text style={styles.footerFolio}>Folio: {folio}</Text>
                </View>
            </Page>
        </Document>
    );
}