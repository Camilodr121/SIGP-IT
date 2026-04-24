//src/pages/dashboard/universidad/reportes.tsx
import { useState } from "react";
import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import EstadoBadge from "@/components/ui/EstadoBadge";
import { useDocumentos } from "@/hooks/useDocumentos";
import {
    FileText,
    ExternalLink,
    MessageSquare,
    Loader2,
    CheckCircle,
    Send,
    ChevronDown,
    ChevronUp,
    User,
} from "lucide-react";
import { EstadoDocumento } from "@prisma/client";

export default function ReportesUniversidad() {
    const { practicas, cargando, refetch } = useDocumentos();
    const [expandidos, setExpandidos] = useState<Record<string, boolean>>({});
    const [comentarioActivo, setComentarioActivo] = useState<string | null>(null);
    const [comentario, setComentario] = useState("");
    const [guardando, setGuardando] = useState(false);

    const toggleExpanded = (id: string) => {
        setExpandidos((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    const handleActualizarEstado = async (
        docId: string,
        estado: EstadoDocumento,
        comentarios?: string
    ) => {
        setGuardando(true);
        try {
            const res = await fetch(`/api/documentos/${docId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ estado, ...(comentarios && { comentarios }) }),
            });
            if (res.ok) {
                setComentarioActivo(null);
                setComentario("");
                refetch();
            }
        } finally {
            setGuardando(false);
        }
    };

    const handleEnviarComentario = async (docId: string) => {
        if (!comentario.trim()) return;
        await handleActualizarEstado(docId, "EN_REVISION", comentario);
    };

    return (
        <DashboardLayout title="Reportes">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-white">Reportes de estudiantes</h2>
                <p className="text-slate-400 text-sm mt-1">
                    Revisa, retroalimenta y aprueba los reportes de práctica
                </p>
            </div>

            {cargando && (
                <div className="flex items-center justify-center py-20">
                    <Loader2 size={32} className="text-teal-500 animate-spin" />
                </div>
            )}

            {!cargando && practicas.length === 0 && (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 flex flex-col items-center text-center">
                    <FileText size={26} className="text-slate-600 mb-3" />
                    <h3 className="text-white font-semibold mb-2">Sin reportes aún</h3>
                    <p className="text-slate-400 text-sm">
                        Cuando los estudiantes suban reportes aparecerán aquí
                    </p>
                </div>
            )}

            <div className="space-y-4">
                {practicas.map((practica: any) => (
                    <div key={practica.id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                        {/* Header práctica */}
                        <button
                            onClick={() => toggleExpanded(practica.id)}
                            className="w-full flex items-center justify-between p-5 hover:bg-slate-800/50 transition-all"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-teal-600 flex items-center justify-center text-white text-sm font-bold">
                                    {practica.estudiante?.user?.name?.charAt(0).toUpperCase() ?? "E"}
                                </div>
                                <div className="text-left">
                                    <p className="text-white font-medium text-sm">
                                        {practica.estudiante?.user?.name ?? "Estudiante"}
                                    </p>
                                    <p className="text-slate-500 text-xs">
                                        {practica.empresa?.user?.name ?? "Empresa"} —{" "}
                                        {practica.documentos.length} reporte(s)
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                {practica.documentos.filter((d: any) => d.estado === "PENDIENTE").length > 0 && (
                                    <span className="bg-yellow-500/15 text-yellow-400 border border-yellow-500/25 text-xs px-2 py-0.5 rounded-full font-medium">
                                        {practica.documentos.filter((d: any) => d.estado === "PENDIENTE").length} pendiente(s)
                                    </span>
                                )}
                                {expandidos[practica.id] ? (
                                    <ChevronUp size={16} className="text-slate-400" />
                                ) : (
                                    <ChevronDown size={16} className="text-slate-400" />
                                )}
                            </div>
                        </button>

                        {/* Documentos expandidos */}
                        {expandidos[practica.id] && (
                            <div className="border-t border-slate-800 divide-y divide-slate-800">
                                {practica.documentos.length === 0 ? (
                                    <div className="p-6 text-center text-slate-500 text-sm">
                                        Sin reportes enviados
                                    </div>
                                ) : (
                                    practica.documentos.map((doc: any) => (
                                        <div key={doc.id} className="p-5">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex items-start gap-3 flex-1 min-w-0">
                                                    <FileText size={17} className="text-teal-400 mt-0.5 flex-shrink-0" />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-white text-sm font-medium truncate">{doc.titulo}</p>
                                                        {doc.descripcion && (
                                                            <p className="text-slate-400 text-xs mt-0.5">{doc.descripcion}</p>
                                                        )}
                                                        <p className="text-slate-600 text-xs mt-1">
                                                            {new Date(doc.createdAt).toLocaleDateString("es-CO", {
                                                                day: "numeric", month: "long", year: "numeric",
                                                            })}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 flex-shrink-0">
                                                    <EstadoBadge estado={doc.estado} />
                                                    <a
                                                        href={doc.archivoUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-1.5 text-slate-400 hover:text-teal-400 transition-all rounded-lg hover:bg-teal-500/10"
                                                        aria-label="Ver documento"
                                                    >
                                                        <ExternalLink size={15} />
                                                    </a>
                                                </div>
                                            </div>

                                            {/* Comentario existente */}
                                            {doc.comentarios && comentarioActivo !== doc.id && (
                                                <div className="mt-3 p-3 bg-slate-800/50 rounded-lg flex items-start gap-2">
                                                    <MessageSquare size={14} className="text-blue-400 mt-0.5 flex-shrink-0" />
                                                    <p className="text-slate-300 text-xs">{doc.comentarios}</p>
                                                </div>
                                            )}

                                            {/* Acciones */}
                                            <div className="mt-4 flex flex-wrap gap-2">
                                                {doc.estado !== "APROBADO" && (
                                                    <button
                                                        onClick={() => handleActualizarEstado(doc.id, "APROBADO")}
                                                        disabled={guardando}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600/20 hover:bg-teal-600/30 text-teal-400 text-xs font-medium rounded-lg border border-teal-600/30 transition-all disabled:opacity-50"
                                                    >
                                                        <CheckCircle size={13} />
                                                        Aprobar
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => {
                                                        setComentarioActivo(
                                                            comentarioActivo === doc.id ? null : doc.id
                                                        );
                                                        setComentario(doc.comentarios ?? "");
                                                    }}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-xs font-medium rounded-lg border border-blue-600/30 transition-all"
                                                >
                                                    <MessageSquare size={13} />
                                                    {doc.comentarios ? "Editar comentario" : "Agregar comentario"}
                                                </button>
                                            </div>

                                            {/* Input de comentario */}
                                            {comentarioActivo === doc.id && (
                                                <div className="mt-3 space-y-2">
                                                    <textarea
                                                        value={comentario}
                                                        onChange={(e) => setComentario(e.target.value)}
                                                        placeholder="Escribe tu retroalimentación para el estudiante..."
                                                        rows={3}
                                                        className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                                                    />
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => setComentarioActivo(null)}
                                                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg transition-all"
                                                        >
                                                            Cancelar
                                                        </button>
                                                        <button
                                                            onClick={() => handleEnviarComentario(doc.id)}
                                                            disabled={guardando || !comentario.trim()}
                                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-medium rounded-lg transition-all"
                                                        >
                                                            {guardando ? (
                                                                <Loader2 size={12} className="animate-spin" />
                                                            ) : (
                                                                <Send size={12} />
                                                            )}
                                                            Enviar
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </DashboardLayout>
    );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    const session = await getSession(context);
    if (!session || session.user.role !== "UNIVERSIDAD") {
        return { redirect: { destination: "/auth/login", permanent: false } };
    }
    return { props: {} };
};