import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "../../../../../lib/prisma";
import { compareSync } from "bcrypt";
import { NextAuthOptions } from "next-auth";


export const authOptions: NextAuthOptions  = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        staffid: { label: "Staff ID", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.staffid || !credentials.password) {
          throw new Error("Please enter both staff ID and password.");
        }

        const user = await prisma.user.findUnique({
          where: { staffid: credentials.staffid },
        });

        if (!user) throw new Error("No user found with that staff ID.");

        const passwordIsValid = compareSync(credentials.password, user.password);
        if (!passwordIsValid) throw new Error("Invalid password.");

        return {
          id: user.staffid,
          staffid: user.staffid,
          name: user.fullname,
          email: user.email,
        };
      },
    }),
  ],

  session: { strategy: "jwt" },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.staffid = user.staffid;
        token.name = user.name!;
        token.email = user.email!;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          staffid: token.staffid,
          name: token.name,
          email: token.email,
        };
      }
      return session;
    },
  },

  pages: { signIn: "/login" },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
