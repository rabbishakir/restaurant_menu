import type { ReactNode } from "react";
import Link from "next/link";
import "./globals.css";

export const metadata = {
  title: "Menu Builder",
  description: "Admin UI for building restaurant menus",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <header className="bg-brand text-white">
          <div className="flex w-full flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <Link href="/" className="text-xl font-bold tracking-tight">
              Restaurant Menu Builder
            </Link>
            <nav className="flex flex-wrap items-center gap-3 text-sm sm:text-base">
              <Link className="rounded px-3 py-1 hover:bg-teal-700" href="/login">
                Login
              </Link>
              <Link className="rounded px-3 py-1 hover:bg-teal-700" href="/admin">
                Admin
              </Link>
            </nav>
          </div>
        </header>
        <main className="w-full px-5 py-6">{children}</main>
      </body>
    </html>
  );
}
