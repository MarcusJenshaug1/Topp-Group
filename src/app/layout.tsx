import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { PageEnter } from "@/components/motion/page-enter";

const fontSans = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Topp Group",
  description: "Strategiske investeringer og eiendomsutvikling.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="no" suppressHydrationWarning>
      <body
        id="top"
        suppressHydrationWarning
        className={`${fontSans.variable} antialiased min-h-screen flex flex-col`}
      >
        <Header />
        <main className="flex-1">
          <PageEnter>{children}</PageEnter>
        </main>
        <Footer />
      </body>
    </html>
  );
}
