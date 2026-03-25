import { redirect } from "next/navigation";
import { auth } from "@/auth";

// この Layout が「門番」となり、page.tsx が表示される前に権限をチェックします
export default async function ScoresLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // 🌟【最重要セキュリティ】
  // ADMIN（サイト管理者）以外がアクセスしようとしたら、問答無用でトップページに弾く
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    redirect("/");
  }

  // ADMINであれば、そのまま中身（page.tsx）を表示する
  return <>{children}</>;
}