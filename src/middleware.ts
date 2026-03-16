import { auth } from "@/auth";
import { NextResponse } from "next/server";

// auth関数でラップすることで、第一引数の 'req' に 'auth' プロパティが追加されます
export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const role = (req.auth?.user as any)?.role;
  const { nextUrl } = req;

  // 1. 未ログインで管理画面/監督画面へアクセスしようとした場合
  const isProtectedArea = nextUrl.pathname.startsWith("/admin") || nextUrl.pathname.startsWith("/manager");
  
  if (isProtectedArea && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  // 2. 権限チェック (ADMIN専用ページにMANAGERが来た場合など)
  if (nextUrl.pathname.startsWith("/admin") && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", nextUrl));
  }

  return NextResponse.next();
});

// matcherで指定したパスに対してのみ、このmiddlewareが実行されます
export const config = {
  matcher: ["/admin/:path*", "/manager/:path*"],
};