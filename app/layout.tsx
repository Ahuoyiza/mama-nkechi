import type { Metadata } from "next";
import { DM_Sans, Itim } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const itim = Itim({
  variable: "--font-itim",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mama Nkechi's Pot",
  description: "A little taste of home. Nigerian recipes from my kitchen, with love.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-GB" className={`${dmSans.variable} ${itim.variable}`}>
      <body>{children}</body>
    </html>
  );
}
