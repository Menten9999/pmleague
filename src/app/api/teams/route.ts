import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

// 🌟 これがビルドエラーを防ぐ最強の魔法です（必ずimportの直後に書きます）
export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { name, color, playerNames } = await req.json();

    if (!name) {
      return NextResponse.json({ error: "チーム名は必須です" }, { status: 400 });
    }

    // 既に同じチーム名がないかチェック
    const existingTeam = await prisma.team.findUnique({ where: { name } });
    if (existingTeam) {
      return NextResponse.json({ error: "このチーム名は既に登録されています" }, { status: 400 });
    }

    // チームと選手をまとめてデータベースに保存
    const team = await prisma.team.create({
      data: {
        name,
        color,
        players: {
          create: playerNames
            .filter((pName: string) => pName.trim() !== "")
            .map((pName: string) => ({ name: pName })),
        },
      },
      include: {
        players: true,
      },
    });

    return NextResponse.json({ message: "チームと選手を登録しました！", team }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "登録中にエラーが発生しました" }, { status: 500 });
  }
}

export async function GET() {
  try {
    // 全チームと所属選手をデータベースから取得
    const teams = await prisma.team.findMany({
      include: {
        players: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
    return NextResponse.json(teams);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "チーム情報の取得に失敗しました" }, { status: 500 });
  }
}

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
        if (p.name.trim() !== "") {
          await prisma.player.update({
            where: { id: p.id },
            data: { name: p.name },
          });
        }
      } else if (!p.id && p.name.trim() !== "") {
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