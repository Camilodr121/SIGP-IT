import { useState, useEffect, useCallback } from "react";

export function usePerfil() {
    const [perfil, setPerfil] = useState<any>(null);
    const [cargando, setCargando] = useState(true);

    const fetchPerfil = useCallback(async () => {
        setCargando(true);
        const res = await fetch("/api/perfil");
        const json = await res.json();
        if (res.ok) setPerfil(json.data);
        setCargando(false);
    }, []);

    useEffect(() => { fetchPerfil(); }, [fetchPerfil]);

    return { perfil, cargando, refetch: fetchPerfil };
}