import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "S-100海事服务平台",
  description: "基于分层递归架构的全球海事数据服务网络",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>
        {children}
      </body>
    </html>
  );
}