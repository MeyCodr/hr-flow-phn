import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compareSync } from "bcrypt";
import { prisma } from "../../lib/prisma";
import { withBasePath } from "../../lib/base-path";

export const authOptions: NextAuthOptions = {
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

        if (!user) {
          throw new Error("No user found with that staff ID.");
        }

        const passwordIsValid = compareSync(
          credentials.password,
          user.password,
        );

        if (!passwordIsValid) {
          throw new Error("Invalid password.");
        }

        return {
          id: user.staffid,
          staffid: user.staffid,
          name: user.fullname,
          email: user.email,
        };
      },
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: 60 * 60,
    updateAge: 15 * 60,
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.staffid = user.staffid;
      }

      if (token.staffid) {
        const dbUser = await prisma.user.findUnique({
          where: { staffid: token.staffid },
        });

        if (dbUser) {
          token.name = dbUser.fullname;
          token.email = dbUser.email;
          token.role = dbUser.role;
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user = {
          staffid: token.staffid,
          name: token.name,
          email: token.email,
          role: token.role,
        };
      }

      return session;
    },
  },

  pages: { signIn: withBasePath("/login") },
};
