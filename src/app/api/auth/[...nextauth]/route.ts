import { handlers } from "@/auth";

// 🌟 これを追加：ビルド時の事前通信を禁止し、常に動的に処理させる
export const dynamic = "force-dynamic";

export const { GET, POST } = handlers;