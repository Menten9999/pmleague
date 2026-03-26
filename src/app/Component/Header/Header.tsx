import Link from "next/link";
import Image from "next/image";
// 🌟 修正ポイント1： auth と一緒に signOut もインポートする
import { auth, signOut } from "@/auth";
import type { Session } from "next-auth";
import styles from "./Header.module.css";

export default async function Header() {
  let session: Session | null = null;

  try {
    session = await auth();
  } catch (error) {
    // Fallback to logged-out UI when auth config/env is missing in production.
    const isExpectedDynamicError =
      typeof error === "object" &&
      error !== null &&
      "digest" in error &&
      (error as { digest?: string }).digest === "DYNAMIC_SERVER_USAGE";

    if (!isExpectedDynamicError) {
      console.error("[header] Failed to resolve session", error);
    }
  }

  return (
    <header className={styles.headerContainer}>
      <div className={styles.innerContainer}>
        
        {/* =========================================
            左側：ロゴとトップページリンク
            ========================================= */}
        <Link href="/" className={styles.logoGroup}>
          <div className={`${styles.logoBadge} w-12 h-12 md:w-14 md:h-14 bg-[#0a0a0a] border border-white/10 flex items-center justify-center transform -skew-x-12 overflow-hidden relative transition-colors duration-300 group-hover:border-yellow-500`}>
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            
            <div className="transform skew-x-12 relative w-full h-full">
              <Image
                src="/pmlogo.jpg"
                alt="PM LEAGUE Logo"
                width={80}
                height={80}
                className="object-cover"
                priority
              />
            </div>
          </div>
          
          <div className="flex flex-col">
            <span className={`text-lg md:text-xl font-black italic tracking-tighter ${styles.logoText}`}>
              PM LEAGUE
            </span>
            <span className={`text-[6px] md:text-[8px] text-yellow-600 tracking-widest uppercase font-bold mt-0.5 ${styles.logoSubText}`}>
              Official Website
            </span>
          </div>
        </Link>

        {/* =========================================
            右側：ナビゲーションとボタン
            ========================================= */}
        <nav className={styles.navWrapper}>
          
          <div className={styles.navLinks}>
            <Link href="/Teams" className={styles.navLink}>Teams</Link>
            <Link href="/Matches" className={styles.navLink}>Matches</Link>
            <Link href="/Rankings" className={styles.navLink}>Rankings</Link>
            <Link href="/Archive" className={styles.navLink}>Archive</Link>
          </div>

          <div className={styles.authSection}>
            {/* 🌟 セッション（ログイン情報）があるか無いかで表示を分岐 */}
            {session?.user ? (
              <div className="flex items-center gap-3">
                
                {/* サイト管理者（ADMIN）の時だけ表示されるボタン */}
                {(session.user as any).role === "ADMIN" && (
                  <Link href="/Admin/Users" className={`${styles.skewBtnAdmin} !border-red-500 !text-red-500 hover:!bg-red-500 hover:!text-black`}>
                    <span>System</span>
                  </Link>
                )}
                
                {/* 監督・管理者共通のスコア入力ボタン */}
                <Link href="/Admin/Scores" className={styles.skewBtnAdmin}>
                  <span>Admin</span>
                </Link>

                {/* 🌟 修正ポイント2：ログアウト専用ボタンを追加 */}
                {/* formとServer Actionを使って安全にログアウトさせ、トップページにリダイレクト */}
                <form action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}>
                  <button type="submit" className={styles.skewBtnLogin}>
                    <span>Logout</span>
                  </button>
                </form>

              </div>
            ) : (
              // ログインしていない時は Login ボタンのみ表示
              <Link href="/Login" className={styles.skewBtnLogin}>
                <span>Login</span>
              </Link>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}