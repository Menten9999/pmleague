import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    // 🌟 画面から teamName（チーム名） も受け取るように追加
    const { userId, name, password, inviteCode, teamName } = await req.json();

    const validInviteCode = process.env.INVITE_CODE || "pmleague2026";
    
    if (inviteCode !== validInviteCode) {
      return NextResponse.json({ error: "招待コードが間違っています" }, { status: 403 });
    }

    if (!teamName) {
      return NextResponse.json({ error: "チーム名は必須です" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { userId } });
    if (existingUser) {
      return NextResponse.json({ error: "このログインIDは既に使われています" }, { status: 400 });
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
    return NextResponse.json({ error: "登録中にエラーが発生しました" }, { status: 500 });
  }
}