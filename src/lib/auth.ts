import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  callbacks: {
    // Sincroniza el usuario con PostgreSQL al loguearse con Google
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email) {
        try {
          // Si el usuario no existe en la base de datos, lo creamos
          await prisma.user.upsert({
            where: { email: user.email },
            update: {
              name: user.name,
              image: user.image,
            },
            create: {
              id: user.id, // Reutiliza el ID único o deja que Prisma maneje un cuid
              email: user.email,
              name: user.name,
              image: user.image,
            },
          });
          return true;
        } catch (error) {
          console.error("Error sincronizando usuario en SignIn:", error);
          return false;
        }
      }
      return true;
    },
    // Inyecta el ID de la base de datos dentro del token JWT de la sesión
    async jwt({ token, user }) {
      if (user) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email! },
          select: { id: true },
        });
        if (dbUser) {
          token.id = dbUser.id;
        }
      }
      return token;
    },
    // Hace accesible el userId en componentes del cliente y Server Actions
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id;
      }
      return session;
    },
  },
  pages: {
    signIn: "/", // Redirige a la raíz si requiere autenticación
  },
  session: {
    strategy: "jwt",
  },
};