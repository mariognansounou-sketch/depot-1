import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe Auth.js configuration — used by `middleware.ts` (Edge runtime).
 * Deliberately contains NO providers: the Credentials provider's
 * `authorize()` callback depends on bcryptjs and Prisma, both Node-only,
 * so it lives exclusively in `auth.ts` (Node runtime) alongside this base
 * config. Middleware only needs `callbacks.authorized` to gate routes —
 * it never calls `authorize()` itself.
 */
export const authConfig = {
  // Auth.js v5 refuses requests whose Host header it doesn't recognize
  // unless explicitly told to trust it. Vercel sets this automatically;
  // every other deployment target (Docker, Railway, Fly.io, a plain VPS
  // behind Nginx...) needs it set explicitly or every sign-in fails with
  // an "UntrustedHost" error the moment the app goes live behind a proxy.
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = Boolean(auth?.user);
      const isDashboardRoute = request.nextUrl.pathname.startsWith("/dashboard");
      if (isDashboardRoute) return isLoggedIn;
      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.plan = user.plan;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
        session.user.plan = token.plan as string;
        session.user.id = token.sub as string;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
