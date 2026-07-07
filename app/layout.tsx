import type { Metadata } from "next";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import "vazirmatn/Vazirmatn-font-face.css";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  ),
  title: {
    default: "وبلاگ من",
    template: "%s | وبلاگ من",
  },
  description: "وبلاگ ساخته‌شده با Next.js و Markdown",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem("theme");if(t==="dark"||(!t&&matchMedia("(prefers-color-scheme:dark)").matches))document.documentElement.classList.add("dark")})()`,
          }}
        />
      </head>
      <body>
        <header className="site-header">
          <div className="container header-inner">

            <nav className="nav">
              <ThemeToggle />
              <Link href="/">خانه</Link>
              <Link href="/blog">وبلاگ</Link>
            </nav>
            <Link className="brand" href="/">
              Front Docs
            </Link>
          </div>
        </header>

        <main>{children}</main>

        <footer className="site-footer">
          <div className="container">
            ساخته‌شده با ❤️ توسط <Link href="https://www.linkedin.com/in/mmsaeidi/">M.Mahdi Saeidi</Link>
          </div>
        </footer>
      </body>
    </html>
  );
}
