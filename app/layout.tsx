import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/auth-context";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "next-themes";

export const metadata: Metadata = {
  title: "Pickup Web - 生产级前端应用",
  description:
    "基于 Next.js 16.1.1 + TailwindCSS + shadcn 构建的生产级前端项目",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>
        <AuthProvider>
            {children}
            <Toaster position="top-center" />
        </AuthProvider>
      </body>
    </html>
  );
}
