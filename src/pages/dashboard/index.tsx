import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import { Role } from "@prisma/client";

const ROLE_REDIRECTS: Record<Role, string> = {
    ESTUDIANTE: "/dashboard/estudiante",
    UNIVERSIDAD: "/dashboard/universidad",
    EMPRESA: "/dashboard/empresa",
};

export default function Dashboard() {
    return null;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    const session = await getSession(context);

    if (!session) {
        return { redirect: { destination: "/auth/login", permanent: false } };
    }

    return {
        redirect: {
            destination: ROLE_REDIRECTS[session.user.role],
            permanent: false,
        },
    };
};