import { auth } from "@/auth";

export default async function LoginMember() {
  const session = await auth();
  
  return (
    <div className="p-8 text-white">
      <h1 className="text-2xl font-bold">選手登録ページ</h1>
      <p>ようこそ、{session?.user?.name} さん</p>
      <p>あなたの管理チームID: {(session?.user as any)?.teamId}</p>
      
      {/* ここに所属チームの選手一覧と登録フォームを表示 */}
    </div>
  );
}