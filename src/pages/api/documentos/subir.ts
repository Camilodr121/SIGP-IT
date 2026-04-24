import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import formidable, { File } from "formidable";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";

export const config = { api: { bodyParser: false } };

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getServerSession(req, res, authOptions);
    if (!session || session.user.role !== "ESTUDIANTE") {
        return res.status(403).json({ message: "Sin permisos" });
    }

    if (req.method !== "POST") {
        return res.status(405).json({ message: "Método no permitido" });
    }

    const form = formidable({ maxFileSize: 10 * 1024 * 1024 });

    const [fields, files] = await form.parse(req);

    const titulo = fields.titulo?.[0];
    const descripcion = fields.descripcion?.[0] ?? null;
    const practicaId = fields.practicaId?.[0];
    const tipoDocumento = fields.tipoDocumento?.[0] ?? null;
    const archivo = files.archivo?.[0] as File | undefined;

    if (!titulo || !practicaId || !archivo) {
        return res.status(400).json({ message: "Faltan campos requeridos" });
    }

    // Verificar que la práctica pertenece al estudiante
    const practica = await prisma.practica.findFirst({
        where: {
            id: practicaId,
            estudiante: { userId: session.user.id },
            activa: true,
        },
    });

    if (!practica) {
        return res.status(403).json({ message: "Práctica no válida o no activa" });
    }

    // Subir a Supabase Storage
    const buffer = fs.readFileSync(archivo.filepath);
    const extension = archivo.originalFilename?.split(".").pop() ?? "pdf";
    const nombreArchivo = `${practicaId}/${Date.now()}.${extension}`;

    const { error: uploadError } = await supabase.storage
        .from("documentos")
        .upload(nombreArchivo, buffer, {
            contentType: archivo.mimetype ?? "application/pdf",
            upsert: false,
        });

    if (uploadError) {
        console.error("Error Supabase Storage:", uploadError);
        return res.status(500).json({ message: "Error al subir el archivo" });
    }

    const { data: urlData } = supabase.storage
        .from("documentos")
        .getPublicUrl(nombreArchivo);

    // Crear documento en BD
    const documento = await prisma.documento.create({
        data: {
            titulo,
            descripcion,
            practicaId,
            archivoUrl: urlData.publicUrl,
            estado: "PENDIENTE",
            ...(tipoDocumento && { tipoDocumento }),
        },
    });


    return res.status(201).json({ data: documento });
}