import { useState, useEffect, useCallback, useRef } from "react";

export interface Notificacion {
    id: string;
    titulo: string;
    mensaje: string;
    tipo: string;
    leida: boolean;
    enlace: string | null;
    createdAt: string;
}

export function useNotificaciones() {
    const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
    const [noLeidas, setNoLeidas] = useState(0);
    const eventSourceRef = useRef<EventSource | null>(null);

    const fetchNotificaciones = useCallback(async () => {
        const res = await fetch("/api/notificaciones");
        const json = await res.json();
        if (res.ok) {
            setNotificaciones(json.data);
            setNoLeidas(json.noLeidas);
        }
    }, []);

    // Conectar SSE
    useEffect(() => {
        fetchNotificaciones();

        const es = new EventSource("/api/notificaciones/stream");
        eventSourceRef.current = es;

        es.onmessage = () => {
            // Al recibir cualquier evento, refetch para obtener datos frescos de BD
            fetchNotificaciones();
        };

        es.onerror = () => {
            // Reconectar automáticamente — el browser lo hace solo con SSE
            es.close();
        };

        return () => es.close();
    }, [fetchNotificaciones]);

    const marcarTodasLeidas = useCallback(async () => {
        await fetch("/api/notificaciones", { method: "PATCH" });
        setNotificaciones((prev) => prev.map((n) => ({ ...n, leida: true })));
        setNoLeidas(0);
    }, []);

    const marcarUnaLeida = useCallback(async (id: string) => {
        await fetch(`/api/notificaciones/${id}`, { method: "PATCH" });
        setNotificaciones((prev) =>
            prev.map((n) => (n.id === id ? { ...n, leida: true } : n))
        );
        setNoLeidas((prev) => Math.max(0, prev - 1));
    }, []);

    return { notificaciones, noLeidas, marcarTodasLeidas, marcarUnaLeida, refetch: fetchNotificaciones };
}