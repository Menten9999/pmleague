import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { userId, name, password } = await req.json();
    const existingUser = await prisma.user.findUnique({ where: { userId } });

    if (existingUser) {
      return NextResponse.json({ error: "このログインIDは既に使われています" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: { userId, name, password: hashedPassword, role: "MANAGER" },
    });

    return NextResponse.json({ message: "登録が完了しました！" }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "登録中にエラーが発生しました" }, { status: 500 });
  }
}