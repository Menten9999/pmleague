import Link from "next/link";
import { auth } from "@/auth";
import styles from "./Header.module.css";


export default async function Header() {
  const session = await auth();

  return (
    <header className={styles.headerContainer}>
      {/* 🌟 cssモジュールの .innerContainer を適用 */}
      <div className={styles.innerContainer}>
        
        {/* =========================================
            左側：ロゴとトップページリンク
            ========================================= */}
        {/* 🌟 cssモジュールの .logoGroup を適用 */}
        <Link href="/" className={styles.logoGroup}>
          <div className="w-10 h-10 md:w-12 md:h-12 bg-[#0a0a0a] border border-white/10 flex items-center justify-center transform -skew-x-12 overflow-hidden relative transition-colors duration-300 group-hover:border-yellow-500">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <img src="/pmlogo.jpg" alt="" className={styles.img}></img>
          </div>
          
          <div className="flex flex-col">
            <span className={`text-lg md:text-xl font-black italic tracking-tighter ${styles.logoText}`}>
              PM LEAGUE Official Website
            </span>
          </div>
        </Link>

        {/* =========================================
            右側：ナビゲーションとボタン
            ========================================= */}
        {/* 🌟 cssモジュールの .navWrapper を適用 */}
        <nav className={styles.navWrapper}>
          
          {/* 🌟 cssモジュールの .navLinks を適用 */}
          <div className={styles.navLinks}>
            <Link href="/Teams" className={styles.navLink}>Teams</Link>
            <Link href="/Matches" className={styles.navLink}>Matches</Link>
            <Link href="/Rankings" className={styles.navLink}>Rankings</Link>
            <Link href="/Archive" className={styles.navLink}>Archive</Link>
          </div>

          {/* 🌟 cssモジュールの .authSection を適用 */}
          <div className={styles.authSection}>
            {session?.user ? (
              <Link href="/Admin/Scores" className={styles.skewBtnAdmin}>
                <span>Admin Panel</span>
              </Link>
            ) : (
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