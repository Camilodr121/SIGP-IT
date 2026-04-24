// sigp-it/src/components/layout/AuthLayout.tsx
import Head from "next/head";
import { ReactNode } from "react";

/**
 * AuthLayout — contenedor base para páginas de autenticación.
 * Solo provee el <Head> y el fondo raíz.
 * Todo el diseño visual e impacto está en cada página (login / register).
 */
interface AuthLayoutProps {
    children: ReactNode;
    title: string;
}

export default function AuthLayout({ children, title }: AuthLayoutProps) {
    return (
        <>
            <Head>
                <title>{`${title} — SIGP-IT`}</title>
            </Head>
            <div
                className="min-h-screen"
                style={{ backgroundColor: "var(--color-bg)", fontFamily: "var(--font-body)" }}
            >
                {children}
            </div>
        </>
    );
}