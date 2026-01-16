import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: {
    template: '%s | 茶韵 - 中国茶文化百科',
    default: '茶韵 | 探索中国茶文化的历史、艺术与生活方式',
  },
  description: '茶韵(Tea Culture Hub)致力于传承和弘扬中国茶文化。提供全面深入的茶叶百科、六大茶类详解、茶道历史渊源、专业冲泡技艺、茶具鉴赏指南及茶文化生活文章。无论您是茶艺初学者还是资深茶客，都能在这里发现东方树叶的独特魅力，品味修身养性的茶生活美学。',
  keywords: ['中国茶', '茶文化', '茶叶百科', '茶道', '茶艺', '绿茶', '红茶', '普洱茶', '乌龙茶', '紫砂壶', '茶具', '泡茶技巧', '养生茶'],
  openGraph: {
    title: '茶韵 | 探索中国茶文化的历史、艺术与生活方式',
    description: '深入了解中国六大茶类、茶道精神与传统技艺。茶韵带您领略东方树叶的神奇魅力，开启修身养性的茶生活。',
    type: 'website',
    locale: 'zh_CN',
    siteName: '茶韵 - 中国茶文化百科',
  },
  twitter: {
    card: 'summary_large_image',
    title: '茶韵 | 中国茶文化百科',
    description: '探索中国茶文化的历史、艺术与生活方式。',
  },
  robots: {
    index: true,
    follow: true,
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
