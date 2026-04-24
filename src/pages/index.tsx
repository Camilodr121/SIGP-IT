import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import { Role } from "@prisma/client";

const ROLE_REDIRECTS: Record<Role, string> = {
  ESTUDIANTE: "/dashboard/estudiante",
  UNIVERSIDAD: "/dashboard/universidad",
  EMPRESA: "/dashboard/empresa",
};

export default function Home() {
  return null;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);

  if (!session) {
    return { redirect: { destination: "/auth/login", permanent: false } };
  }

  const destino = ROLE_REDIRECTS[session.user.role];
  return { redirect: { destination: destino, permanent: false } };
};