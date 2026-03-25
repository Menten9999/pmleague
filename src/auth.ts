import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const authSecret =
  process.env.AUTH_SECRET ||
  process.env.NEXTAUTH_SECRET ||
  "pmleague-temporary-secret-change-me";

if (!process.env.AUTH_SECRET && !process.env.NEXTAUTH_SECRET) {
  console.warn(
    "[auth] AUTH_SECRET is not set. Using temporary fallback secret. Configure AUTH_SECRET in Vercel."
  );
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: authSecret,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        userId: { label: "ユーザーID", type: "text" },
        password: { label: "パスワード", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.userId || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { userId: credentials.userId as string },
        });

        if (!user) return null;

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isPasswordValid) return null;

        // 🌟 修正1：デフォルトの id, name に加えて、必要な全情報を返す
        return {
          id: user.id,
          name: user.name,
          userId: user.userId, // カスタムフィールド
          role: user.role,     // カスタムフィールド
          teamId: user.teamId, // カスタムフィールド
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    // 🌟 修正2：authorizeで返したデータを受け取り、JWTトークンに焼き付ける
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.userId = (user as any).userId;
        token.role = (user as any).role;
        token.teamId = (user as any).teamId;
      }
      return token;
    },
    // 🌟 修正3：JWTトークンのデータを、画面側で使える session オブジェクトに渡す
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as any).userId = token.userId;
        (session.user as any).role = token.role;
        (session.user as any).teamId = token.teamId;
      }
      return session;
    },
  },
  pages: {
    signIn: "/Login",
  },
  // 🌟 Vercel以外（ローカル開発など）で動かす際のエラーを防ぐおまじない
  trustHost: true, 
});