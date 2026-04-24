import { useState, useEffect, useCallback } from "react";

export function useDocumentos() {
    const [practicas, setPracticas] = useState<any[]>([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");

    const fetchDocumentos = useCallback(async () => {
        try {
            setCargando(true);
            const res = await fetch("/api/documentos");
            const json = await res.json();
            if (!res.ok) throw new Error(json.message);
            setPracticas(json.data);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setCargando(false);
        }
    }, []);

    useEffect(() => {
        fetchDocumentos();
    }, [fetchDocumentos]);

    return { practicas, cargando, error, refetch: fetchDocumentos };
}