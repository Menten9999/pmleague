import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/auth";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
    }

    const role = (session.user as any).role as "ADMIN" | "MANAGER" | undefined;
    if (role !== "ADMIN") {
      return NextResponse.json({ error: "この一覧は管理者のみ閲覧できます" }, { status: 403 });
    }

    const scheduledMatches = await prisma.match.findMany({
      where: { status: "SCHEDULED" },
      orderBy: { date: "asc" },
      include: {
        _count: {
          select: { results: true },
        },
      },
    });

    return NextResponse.json(
      scheduledMatches.map((match) => ({
        id: match.id,
        title: match.title,
        date: match.date,
        resultsCount: match._count.results,
      }))
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "試合予定一覧の取得に失敗しました" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
    }

    const role = (session.user as any).role as "ADMIN" | "MANAGER" | undefined;
    if (role !== "ADMIN") {
      return NextResponse.json({ error: "削除は管理者のみ実行できます" }, { status: 403 });
    }

    const body = await req.json();
    const matchId = String(body.matchId || "").trim();

    if (!matchId) {
      return NextResponse.json({ error: "削除対象の試合IDが必要です" }, { status: 400 });
    }

    const target = await prisma.match.findUnique({
      where: { id: matchId },
      select: { id: true, status: true },
    });

    if (!target) {
      return NextResponse.json({ error: "対象試合が見つかりません" }, { status: 404 });
    }

    if (target.status !== "SCHEDULED") {
      return NextResponse.json({ error: "試合予定（SCHEDULED）のみ削除できます" }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.matchResult.deleteMany({ where: { matchId } });
      await tx.match.delete({ where: { id: matchId } });
    });

    return NextResponse.json({ message: "試合予定を削除しました（試合結果データは保持されます）" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "削除中にエラーが発生しました" }, { status: 500 });
  }
}
