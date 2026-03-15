import { auth } from "@/auth";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { nextUrl } = req;

  // 保護したいルートの判定
  const isAdminRoute = nextUrl.pathname.startsWith("/admin");
  const isManagerRoute = nextUrl.pathname.startsWith("/manager");

  if (isAdminRoute || isManagerRoute) {
    if (!isLoggedIn) {
      return Response.redirect(new URL("/api/auth/signin", nextUrl));
    }
    
    // ロールのチェック例（ADMINルートにMANAGERがアクセスした場合など）
    const role = (req.auth?.user as any)?.role;
    if (isAdminRoute && role !== "ADMIN") {
      return Response.redirect(new URL("/", nextUrl));
    }
  }
});

export const config = {
  matcher: ["/admin/:path*", "/manager/:path*"],
};