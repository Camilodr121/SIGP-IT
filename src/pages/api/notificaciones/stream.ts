import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Mapa global de clientes SSE conectados: userId → res[]
export const sseClientes = new Map<string, NextApiResponse[]>();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getServerSession(req, res, authOptions);
    if (!session) return res.status(401).end();

    if (req.method !== "GET") return res.status(405).end();

    const userId = session.user.id;

    // Headers SSE
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");
    res.flushHeaders();

    // Registrar cliente
    const clientes = sseClientes.get(userId) ?? [];
    clientes.push(res);
    sseClientes.set(userId, clientes);

    // Ping cada 25s para mantener conexión viva
    const ping = setInterval(() => {
        res.write(": ping\n\n");
    }, 25000);

    // Limpiar al desconectar
    req.on("close", () => {
        clearInterval(ping);
        const actualizados = (sseClientes.get(userId) ?? []).filter((r) => r !== res);
        if (actualizados.length > 0) {
            sseClientes.set(userId, actualizados);
        } else {
            sseClientes.delete(userId);
        }
    });
}

// Función helper para enviar un evento SSE a un usuario específico
export function emitirNotificacion(userId: string, payload: object) {
    const clientes = sseClientes.get(userId);
    if (!clientes?.length) return;
    const data = `data: ${JSON.stringify(payload)}\n\n`;
    clientes.forEach((res) => res.write(data));
}