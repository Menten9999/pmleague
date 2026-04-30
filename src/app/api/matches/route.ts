import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { title, results } = await req.json();
    const rankedResults = [...results]
      .map((res: any, index: number) => ({
        ...res,
        rawScore: Number(res.rawScore),
        points: Number(res.points),
        originalIndex: index,
      }))
      .sort((a, b) => {
        if (b.points !== a.points) {
          return b.points - a.points;
        }

        if (b.rawScore !== a.rawScore) {
          return b.rawScore - a.rawScore;
        }

        return a.originalIndex - b.originalIndex;
      });

    // トランザクション（以下の処理を「すべて成功するか、すべて失敗するか」のセットにする）
    const match = await prisma.$transaction(async (tx) => {
      // 1. 試合（Match）データを作成
      const newMatch = await tx.match.create({
        data: {
          title: title || "リーグ戦",
          status: "FINISHED",
        },
      });

      // 2. 4人分の成績（MatchResult）を保存し、トータルスコアを更新
      for (const [index, res] of rankedResults.entries()) {
        // 成績を保存
        await tx.matchResult.create({
          data: {
            matchId: newMatch.id,
            playerId: res.playerId,
            rawScore: res.rawScore,
            points: res.points,
            rank: index + 1,
          },
        });

        // 選手のトータルスコアを加算
        await tx.player.update({
          where: { id: res.playerId },
          data: { totalScore: { increment: Number(res.points) } },
        });

        // チームのトータルスコアを加算
        await tx.team.update({
          where: { id: res.teamId },
          data: { totalScore: { increment: Number(res.points) } },
        });
      }

      return newMatch;
    });

    return NextResponse.json({ message: "試合結果を登録しました！", match }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "登録中にエラーが発生しました" }, { status: 500 });
  }
}