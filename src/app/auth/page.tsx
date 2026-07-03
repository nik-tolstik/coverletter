import { redirect } from "next/navigation";

import { AuthPage } from "@/_pages/auth";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

export default async function AuthRoute() {
  const session = await auth();

  if (session?.user?.email) {
    redirect("/");
  }

  return <AuthPage />;
}
