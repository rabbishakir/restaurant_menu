import type { ReactNode } from "react";
import "./globals.css";

export const metadata = {
  title: "Menu Builder",
  description: "Admin UI for building restaurant menus",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
