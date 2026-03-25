import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type MatchScheduleInput = {
  title?: string;
  results: Array<{ playerId: string }>;
};

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const matches: MatchScheduleInput[] = Array.isArray(body.matches)
      ? body.matches
      : [{ title: body.title, results: body.results }];

    if (matches.length === 0 || matches.length > 2) {
      return NextResponse.json({ error: "登録できる試合数は1〜2件です" }, { status: 400 });
    }

    for (const match of matches) {
      if (!Array.isArray(match.results) || match.results.length !== 4) {
        return NextResponse.json({ error: "各試合は4家分の選手指定が必要です" }, { status: 400 });
      }

      const playerIds = match.results.map((res) => res.playerId).filter(Boolean);
      if (playerIds.length !== 4) {
        return NextResponse.json({ error: "選手が未選択の家があります" }, { status: 400 });
      }

      if (new Set(playerIds).size !== 4) {
        return NextResponse.json({ error: "同一試合に同じ選手を重複登録できません" }, { status: 400 });
      }
    }

    const createdMatches = await prisma.$transaction(async (tx) => {
      const inserted = [];

      for (const match of matches) {
        // 1. ステータスを「SCHEDULED（予定）」として試合枠を作成
        const newMatch = await tx.match.create({
          data: {
            title: match.title || "次回 対戦カード",
            status: "SCHEDULED",
          },
        });

        // 2. 4人分の枠を作成（順番に保存されるので、ID順＝東南西北になります）
        for (const res of match.results) {
          await tx.matchResult.create({
            data: {
              matchId: newMatch.id,
              playerId: res.playerId,
              rawScore: 0, // まだ試合前なので0点
              points: 0,
            },
          });
        }

        inserted.push(newMatch);
      }

      return inserted;
    });

    return NextResponse.json(
      {
        message: `${createdMatches.length}件の次回予告を登録しました！`,
        matches: createdMatches,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "登録中にエラーが発生しました" }, { status: 500 });
  }
}