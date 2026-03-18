import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { title, results } = await req.json();

    const match = await prisma.$transaction(async (tx) => {
      // 1. ステータスを「SCHEDULED（予定）」として試合枠を作成
      const newMatch = await tx.match.create({
        data: {
          title: title || "次回 対戦カード",
          status: "SCHEDULED",
        },
      });

      // 2. 4人分の枠を作成（順番に保存されるので、ID順＝東南西北になります）
      for (const res of results) {
        await tx.matchResult.create({
          data: {
            matchId: newMatch.id,
            playerId: res.playerId,
            rawScore: 0, // まだ試合前なので0点
            points: 0,
          },
        });
      }

      return newMatch;
    });

    return NextResponse.json({ message: "次回予告を登録しました！", match }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "登録中にエラーが発生しました" }, { status: 500 });
  }
}