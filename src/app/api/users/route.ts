import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
export const dynamic = 'force-dynamic';
const prisma = new PrismaClient();

// 1. ユーザー一覧を取得する（GET）
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { name: 'asc' }, // 名前順で取得
    });

    // セキュリティのため、暗号化されたパスワードは除外して画面に送る
    const safeUsers = users.map(u => ({
      id: u.id,
      userId: u.userId,
      name: u.name,
      role: u.role,
    }));

    return NextResponse.json(safeUsers);
  } catch (error) {
    return NextResponse.json({ error: "ユーザー取得エラー" }, { status: 500 });
  }
}

// 2. パスワードを強制リセットする（PATCH）
export async function PATCH(req: Request) {
  try {
    const { id, newPassword } = await req.json();

    if (!newPassword || newPassword.length < 4) {
      return NextResponse.json({ error: "パスワードは4文字以上で入力してください" }, { status: 400 });
    }

    // 新しいパスワードを再度暗号化
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });

    return NextResponse.json({ message: "パスワードをリセットしました！" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "パスワード更新エラー" }, { status: 500 });
  }
}

// 3. アカウントを削除する（DELETE）
export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    
    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ message: "アカウントを削除しました" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "アカウント削除エラー" }, { status: 500 });
  }
}
// --- 以下のコードを一番下に追記してください ---

// チーム情報と選手情報を更新（書き換え）する処理
export async function PATCH(req: Request) {
  try {
    const { id, name, color, players } = await req.json();

    if (!id || !name) {
      return NextResponse.json({ error: "チーム名とIDは必須です" }, { status: 400 });
    }

    // 1. チーム名とカラーを更新
    await prisma.team.update({
      where: { id },
      data: { name, color },
    });

    // 2. 所属選手の更新または新規追加
    for (const p of players) {
      if (p.id) {
        // すでに登録されている選手の場合：名前を更新
        // （※過去のスコアデータが消えてしまうのを防ぐため、空欄の場合は更新しない安全設計です）
        if (p.name.trim() !== "") {
          await prisma.player.update({
            where: { id: p.id },
            data: { name: p.name },
          });
        }
      } else if (!p.id && p.name.trim() !== "") {
        // まだ登録されていない（IDがない）新しい選手が入力された場合：新メンバーとして追加
        await prisma.player.create({
          data: {
            name: p.name,
            teamId: id,
          },
        });
      }
    }

    return NextResponse.json({ message: "チーム情報を更新しました！" }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "更新中にエラーが発生しました" }, { status: 500 });
  }
}