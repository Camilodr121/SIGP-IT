//src/pages/dashboard/universidad/estudiantes.tsx
import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { GraduationCap, Building2, FileText, Loader2, CheckCircle } from "lucide-react";

export default function EstudiantesUniversidad() {
    const [practicas, setPracticas] = useState<any[]>([]);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        fetch("/api/practicas")
            .then((r) => r.json())
            .then((json) => setPracticas(json.data ?? []))
            .finally(() => setCargando(false));
    }, []);

    return (
        <DashboardLayout title="Estudiantes">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-white">Estudiantes en práctica</h2>
                <p className="text-slate-400 text-sm mt-1">
                    Listado de todos los estudiantes con prácticas registradas
                </p>
            </div>

            {cargando && (
                <div className="flex items-center justify-center py-20">
                    <Loader2 size={32} className="text-teal-500 animate-spin" />
                </div>
            )}

            {!cargando && practicas.length === 0 && (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 flex flex-col items-center text-center">
                    <GraduationCap size={26} className="text-slate-600 mb-3" />
                    <h3 className="text-white font-semibold mb-2">Sin estudiantes registrados</h3>
                    <p className="text-slate-400 text-sm max-w-sm">
                        Aún no hay prácticas registradas en el sistema
                    </p>
                </div>
            )}

            <div className="space-y-3">
                {practicas.map((practica: any) => (
                    <div
                        key={practica.id}
                        className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all"
                    >
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                    {practica.estudiante?.user?.name?.charAt(0).toUpperCase() ?? "E"}
                                </div>
                                <div>
                                    <p className="text-white font-medium text-sm">
                                        {practica.estudiante?.user?.name ?? "Estudiante"}
                                    </p>
                                    <p className="text-slate-500 text-xs">
                                        {practica.estudiante?.user?.email}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-6 text-center">
                                <div>
                                    <p className="text-white font-semibold text-sm">
                                        {practica.empresa?.nombreEmpresa ?? "—"}
                                    </p>
                                    <p className="text-slate-500 text-xs flex items-center gap-1 justify-center">
                                        <Building2 size={11} />
                                        Empresa
                                    </p>
                                </div>
                                <div>
                                    <p className="text-white font-semibold text-sm">
                                        {practica.documentos?.length ?? 0}
                                    </p>
                                    <p className="text-slate-500 text-xs flex items-center gap-1 justify-center">
                                        <FileText size={11} />
                                        Reportes
                                    </p>
                                </div>
                                <div>
                                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${practica.activa
                                        ? "bg-teal-500/15 text-teal-400 border border-teal-500/25"
                                        : "bg-slate-700 text-slate-400"
                                        }`}>
                                        {practica.activa ? "Activa" : "Finalizada"}
                                    </span>
                                </div>
                            </div>
                        </div>
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