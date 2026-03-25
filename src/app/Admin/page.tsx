import { redirect } from "next/navigation";

export default function AdminRootPage() {
  // /Admin にアクセスされたら、自動的にスコア管理画面へリダイレクトする
  redirect("/Admin/Scores");
}