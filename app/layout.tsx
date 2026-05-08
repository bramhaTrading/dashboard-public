import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "bramhaTrading — Paper Portfolio",
  description: "Live paper-trading transparency dashboard. Every trade and AI verdict, including the wrong ones.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
