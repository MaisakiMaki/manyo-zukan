import type { Metadata } from "next";
import { Noto_Sans_JP, Shippori_Mincho } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import AuthGuard from "@/components/AuthGuard";

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const shipporiMincho = Shippori_Mincho({
  variable: "--font-shippori-mincho",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "万葉植物図鑑",
  description: "植物と一緒に同じ月日を過ごすアプリ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${notoSansJP.variable} ${shipporiMincho.variable} h-full`}
    >
      <body
        className="min-h-full flex flex-col"
        style={{ fontFamily: "var(--font-noto-sans-jp), sans-serif" }}
      >
        <div className="max-w-sm mx-auto w-full min-h-screen flex flex-col">
          <AuthProvider>
            <AuthGuard>{children}</AuthGuard>
          </AuthProvider>
        </div>
      </body>
    </html>
  );
}
