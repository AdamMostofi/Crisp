import type { Metadata } from "next";
import { Sora } from "next/font/google";
import "./globals.css";

const soraSans = Sora({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
});

const soraMono = Sora({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Crisp — Clean & Shorten URLs",
  description:
    "Paste a messy URL full of tracking junk. Get a clean, short link to share.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${soraSans.variable} ${soraMono.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
