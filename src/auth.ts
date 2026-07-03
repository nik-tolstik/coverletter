import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { verifyAuthUserCredentials } from "@/entities/auth/server";

export const { handlers, signIn, signOut, auth } = NextAuth({
  pages: {
    signIn: "/auth",
  },
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: { type: "password" },
      },
      async authorize(credentials) {
        const email =
          typeof credentials?.email === "string" ? credentials.email : "";
        const password =
          typeof credentials?.password === "string" ? credentials.password : "";

        if (!email || !password) {
          return null;
        }

        const user = await verifyAuthUserCredentials(email, password);

        if (!user) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          emailVerifiedAt: user.emailVerifiedAt,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.emailVerifiedAt = user.emailVerifiedAt ?? null;
      }

      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = typeof token.id === "string" ? token.id : "";
        session.user.email =
          typeof token.email === "string" ? token.email : "";
        session.user.emailVerifiedAt =
          typeof token.emailVerifiedAt === "string"
            ? token.emailVerifiedAt
            : null;
      }

      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
  trustHost: true,
});
