//src/pages/dashboard/universidad/perfil.tsx
import { useState, useEffect } from "react";
import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { usePerfil } from "@/hooks/usePerfil";
import {
    User, Mail, Loader2, CheckCircle, Save, School,
} from "lucide-react";

export default function PerfilUniversidad() {
    const { perfil, cargando, refetch } = usePerfil();
    const [form, setForm] = useState({ name: "" });
    const [guardando, setGuardando] = useState(false);
    const [exito, setExito] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (perfil) setForm({ name: perfil.name ?? "" });
    }, [perfil]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setGuardando(true);
        setError("");
        setExito(false);

        const res = await fetch("/api/perfil", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: form.name }),
        });

        if (res.ok) {
            await refetch();
            setExito(true);
            setTimeout(() => setExito(false), 3000);
        } else {
            setError("No se pudo actualizar el nombre");
        }
        setGuardando(false);
    };

    if (cargando) {
        return (
            <DashboardLayout title="Mi Perfil">
                <div className="flex items-center justify-center py-20">
                    <Loader2 size={32} className="text-teal-500 animate-spin" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Mi Perfil">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-white">Perfil universitario</h2>
                <p className="text-slate-400 text-sm mt-1">Información de tu cuenta</p>
            </div>

            <div className="max-w-2xl">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-5 flex items-center gap-5">
                    <div className="w-16 h-16 rounded-xl bg-teal-600/20 border border-teal-600/30 flex items-center justify-center flex-shrink-0">
                        <School size={28} className="text-teal-400" />
                    </div>
                    <div>
                        <p className="text-white font-semibold text-lg">{perfil?.name}</p>
                        <p className="text-slate-400 text-sm flex items-center gap-1.5 mt-0.5">
                            <Mail size={13} />
                            {perfil?.email}
                        </p>
                        <span className="inline-flex items-center gap-1 mt-2 text-xs px-2 py-0.5 bg-teal-500/15 text-teal-400 border border-teal-500/25 rounded-full">
                            <School size={11} />
                            Universidad
                        </span>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5">
                    <h3 className="text-white font-semibold text-sm border-b border-slate-800 pb-4">
                        Información de cuenta
                    </h3>

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-slate-300 flex items-center gap-1.5">
                            <User size={13} /> Nombre
                        </label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={(e) => setForm({ name: e.target.value })}
                            placeholder="Nombre del coordinador"
                            className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-slate-300 flex items-center gap-1.5">
                            <Mail size={13} /> Correo electrónico
                        </label>
                        <input
                            type="email"
                            value={perfil?.email ?? ""}
                            disabled
                            className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-500 text-sm cursor-not-allowed"
                        />
                        <p className="text-slate-600 text-xs">El correo no se puede cambiar</p>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
                            <p className="text-red-400 text-sm">{error}</p>
                        </div>
                    )}
                    {exito && (
                        <div className="bg-teal-500/10 border border-teal-500/20 rounded-lg px-4 py-3 flex items-center gap-2">
                            <CheckCircle size={16} className="text-teal-400" />
                            <p className="text-teal-400 text-sm">Perfil actualizado correctamente</p>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={guardando}
                        className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-2.5 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white font-medium text-sm rounded-lg transition-all"
                    >
                        {guardando ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        {guardando ? "Guardando..." : "Guardar cambios"}
                    </button>
                </form>
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