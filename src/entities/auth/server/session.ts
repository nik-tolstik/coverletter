import "server-only";

import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { normalizeAuthEmail } from "@/entities/auth/model";

export type AuthenticatedUser = {
  id: string;
  email: string;
  emailVerifiedAt: string | null;
};

export async function getAuthenticatedUser() {
  const session = await auth();
  const email = session?.user?.email;

  if (!email) {
    return null;
  }

  return {
    id: session.user.id,
    email: normalizeAuthEmail(email),
    emailVerifiedAt: session.user.emailVerifiedAt,
  } satisfies AuthenticatedUser;
}

export async function requireAuthenticatedUser() {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/auth");
  }

  return user;
}

export async function requireApiAuthenticatedUser() {
  const user = await getAuthenticatedUser();

  if (!user) {
    return null;
  }

  return user;
}
