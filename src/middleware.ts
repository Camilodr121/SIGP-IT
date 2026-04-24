import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(req) {
        const { pathname } = req.nextUrl;
        const role = req.nextauth.token?.role;

        // Protección por rol
        if (pathname.startsWith("/dashboard/universidad") && role !== "UNIVERSIDAD") {
            return NextResponse.redirect(new URL("/auth/login", req.url));
        }

        if (pathname.startsWith("/dashboard/empresa") && role !== "EMPRESA") {
            return NextResponse.redirect(new URL("/auth/login", req.url));
        }

        if (pathname.startsWith("/dashboard/estudiante") && role !== "ESTUDIANTE") {
            return NextResponse.redirect(new URL("/auth/login", req.url));
        }

        return NextResponse.next();
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token,
        },
    }
);

export const config = {
    matcher: ["/dashboard/:path*"],
};