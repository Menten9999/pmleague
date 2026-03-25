import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

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

    // チームと選手をまとめてデータベースに保存（Prismaの強力な機能）
    const team = await prisma.team.create({
      data: {
        name,
        color,
        players: {
          // 入力された選手名リストから、空欄のものを除外して登録
          create: playerNames
            .filter((pName: string) => pName.trim() !== "")
            .map((pName: string) => ({ name: pName })),
        },
      },
      include: {
        players: true, // 保存した結果に選手情報も含めて返す
      },
    });

    return NextResponse.json({ message: "チームと選手を登録しました！", team }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "登録中にエラーが発生しました" }, { status: 500 });
  }
}
// --- 以下のコードを一番下に追記してください ---

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