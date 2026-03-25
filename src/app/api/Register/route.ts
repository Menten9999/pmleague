import { NextResponse } from "next/server";
import { Prisma, PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        {
          error:
            "DATABASE_URL が未設定です。Vercel の Environment Variables に設定してください",
        },
        { status: 500 }
      );
    }

    // 🌟 画面から teamName（チーム名） も受け取るように追加
    const body = await req.json();
    const userId = String(body.userId ?? "").trim();
    const name = String(body.name ?? "").trim();
    const password = String(body.password ?? "");
    const inviteCode = String(body.inviteCode ?? "").trim();
    const teamName = String(body.teamName ?? "").trim();

    const validInviteCode = process.env.INVITE_CODE || "pmleague2026";

    if (!userId || !name || !password || !inviteCode || !teamName) {
      return NextResponse.json({ error: "入力項目が不足しています" }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "パスワードは8文字以上で入力してください" }, { status: 400 });
    }
    
    if (inviteCode !== validInviteCode) {
      return NextResponse.json({ error: "招待コードが間違っています" }, { status: 403 });
    }

    const existingUser = await prisma.user.findUnique({ where: { userId } });
    if (existingUser) {
      return NextResponse.json({ error: "このログインIDは既に使われています" }, { status: 400 });
    }

    const existingTeam = await prisma.team.findUnique({ where: { name: teamName } });
    if (existingTeam) {
      return NextResponse.json({ error: "そのチーム名は既に使われています" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // 🌟 トランザクション（チーム作成とユーザー作成を同時に、失敗したら両方取り消す安全な処理）
    await prisma.$transaction(async (tx) => {
      // 1. 新しいチームを作成
      const newTeam = await tx.team.create({
        data: {
          name: teamName,
          color: "#eab308", // 仮のチームカラー（後から変更可能）
          totalScore: 0,
        }
      });

      // 2. そのチームIDを持った監督(MANAGER)アカウントを作成
      await tx.user.create({
        data: { 
          userId, 
          name, 
          password: hashedPassword, 
          role: "MANAGER",
          teamId: newTeam.id // 🌟 ここで紐付け！
        },
      });
    });

    return NextResponse.json({ message: "チームと監督の登録が完了しました！" }, { status: 201 });
  } catch (error) {
    console.error(error);

    if (error instanceof Prisma.PrismaClientInitializationError) {
      return NextResponse.json(
        {
          error:
            "データベースに接続できません。Vercelの環境変数 DATABASE_URL を確認してください",
        },
        { status: 500 }
      );
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        const target = Array.isArray(error.meta?.target)
          ? (error.meta?.target as string[])
          : [];

        if (target.includes("name")) {
          return NextResponse.json({ error: "そのチーム名は既に使われています" }, { status: 400 });
        }

        if (target.includes("userId")) {
          return NextResponse.json({ error: "このログインIDは既に使われています" }, { status: 400 });
        }

        return NextResponse.json({ error: "重複データがあるため登録できません" }, { status: 400 });
      }
    }

    return NextResponse.json({ error: "登録中にエラーが発生しました" }, { status: 500 });
  }
}