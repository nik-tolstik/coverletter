import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      emailVerifiedAt: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    emailVerifiedAt?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    emailVerifiedAt?: string | null;
  }
}
