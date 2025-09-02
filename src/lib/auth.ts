import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import { compare } from "bcryptjs";

const prisma = new PrismaClient();

export const authOptions = {
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await prisma.user.findUnique({ where: { email: credentials.email } });
        if (!user) return null;
        const isValid = await compare(credentials.password, user.password);
        return isValid ? { id: user.id, name: user.name, role: user.role } : null;
      },
    }),
  ],
  callbacks: {
    session: async ({ session, token }) => {
      if (token?.sub) session.user.id = token.sub;
      session.user.role = token.role;
      return session;
    },
    jwt: async ({ token, user }) => {
      if (user) token.role = (user as any).role;
      return token;
    },
  },
  pages: { signIn: "/login" },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
