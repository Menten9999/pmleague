import { redirect } from "next/navigation";
import { auth } from "@/auth";

// この Layout が「門番」となり、page.tsx が表示される前に権限をチェックします
export default async function ScoresLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const role = (session?.user as any)?.role;

  // ADMIN と MANAGER のみアクセスを許可する
  if (!session?.user || (role !== "ADMIN" && role !== "MANAGER")) {
    redirect("/");
  }

  // ADMINであれば、そのまま中身（page.tsx）を表示する
  return <>{children}</>;
}