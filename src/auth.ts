import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      // フォームの項目定義
      credentials: {
        id: { label: "ID", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        // --- 本来はここでデータベースを参照します ---
        // 簡易的なモックユーザー例
        const users = [
          { id: "admin01", name: "責任者A", password: "password123", role: "ADMIN" },
          { id: "manager01", name: "ドリブンズ監督", password: "password123", role: "MANAGER", teamId: "team_a" },
        ];

        const user = users.find(u => u.id === credentials.id && u.password === credentials.password);
        
        if (!user) return null;
        return { id: user.id, name: user.name, role: user.role, teamId: user.teamId };
      },
    }),
  ],
  callbacks: {
    // セッションデータに role と teamId を含める設定
    jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.teamId = (user as any).teamId;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).teamId = token.teamId;
      }
      return session;
    },
  },
  pages: {
    signIn: "/Login", // カスタムログインページを使う場合
  },
});