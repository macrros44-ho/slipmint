import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SlipMint — Free Instant Invoice & PDF Generator for Freelancers",
  description:
    "Create and download clean, client-ready PDF invoices instantly in your browser. No sign-up required.",
  openGraph: {
    title: "SlipMint — Free Instant Invoice & PDF Generator for Freelancers",
    description:
      "Create and download clean, client-ready PDF invoices instantly in your browser. No sign-up required.",
    url: "https://slipmint.vercel.app",
    siteName: "SlipMint",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
