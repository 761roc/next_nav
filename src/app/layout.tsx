import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ToolNext",
  description: "Cloudflare-ready multilingual glassmorphism navigation hub.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh" suppressHydrationWarning>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
