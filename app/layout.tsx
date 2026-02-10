import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./App.css"
import { AuthProvider } from "@/contexts/auth-context";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "next-themes";
import Providers from "./providers";
import "./globals.css";
import { Inter, Noto_Sans_SC } from "next/font/google";

import "@/utils/dayjs";
import { MessagesProvider } from "@/contexts/messages-context";
import { NotificationCenter } from "@/components/biz/notification/NotificationCenter";


export const metadata: Metadata = {
  title: "Pickup",
  description:
    "拾念",
};


const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

const notoSansSC = Noto_Sans_SC({
  // 注意：中文字体通常没有 subsets 可选，体积会更大，尽量少选 weight
  weight: ["400", "500", "600"],
  variable: "--font-cjk",
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className={`${inter.variable} ${notoSansSC.variable}`}>
      <body>
        <Providers>
          <AuthProvider>
            <MessagesProvider>
              {children}
              <Toaster position="top-center" />

              <NotificationCenter />
            </MessagesProvider>
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
