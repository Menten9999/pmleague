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
