import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    // 画面から送られてきたデータを受け取る
    const { userId, name, password } = await req.json();

    // 既に同じIDが使われていないかチェック
    const existingUser = await prisma.user.findUnique({
      where: { userId },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "このログインIDは既に使われています" },
        { status: 400 }
      );
    }

    // パスワードを暗号化（ハッシュ化）
    const hashedPassword = await bcrypt.hash(password, 10);

    // データベースにユーザーを保存
    const user = await prisma.user.create({
      data: {
        userId,
        name,
        password: hashedPassword,
        role: "MANAGER", // とりあえず最初は全員「監督(MANAGER)」として登録
      },
    });

    return NextResponse.json(
      { message: "登録が完了しました！" },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "登録中にエラーが発生しました" },
      { status: 500 }
    );
  }
}