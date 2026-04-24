import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { Role } from "@prisma/client";

const ROLE_REDIRECTS: Record<Role, string> = {
    ESTUDIANTE: "/dashboard/estudiante",
    UNIVERSIDAD: "/dashboard/universidad",
    EMPRESA: "/dashboard/empresa",
};

export function useAuth(redirectIfFound = false) {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        // Esperamos a que NextAuth termine de resolver el estado
        if (status === "loading") return;

        // Solo redirigir si hay sesión confirmada Y el token tiene rol
        if (redirectIfFound && status === "authenticated" && session?.user?.role) {
            const destino = ROLE_REDIRECTS[session.user.role];
            router.replace(destino);
        }
    }, [session, status, redirectIfFound, router]);

    return { session, status, isLoading: status === "loading" };
}