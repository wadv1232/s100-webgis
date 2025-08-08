import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { initializeServices } from "@/lib/services/service-init";
import Navbar from "@/components/Navbar";
import { AuthProvider } from "@/contexts/AuthContext";

export const metadata: Metadata = {
  title: "S-100海事服务平台",
  description: "基于分层递归架构的全球海事数据服务网络，为终端用户提供统一、可靠的海事信息访问入口",
  keywords: ["S-100", "海事服务", "架构", "电子海图", "水深数据", "IHO"],
  authors: [{ name: "海事数据服务团队" }],
  openGraph: {
    title: "S-100海事服务平台",
    description: "基于分层递归架构的全球海事数据服务网络",
    url: "https://localhost:3000",
    siteName: "S-100海事服务平台",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "S-100海事服务平台",
    description: "基于分层递归架构的全球海事数据服务网络",
  },
};

// 在服务端初始化服务
initializeServices();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body
        className="antialiased bg-background text-foreground font-sans"
      >
        <AuthProvider>
          <Navbar />
          <main className="min-h-screen">
            {children}
          </main>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
