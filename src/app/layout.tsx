import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SlipMint — Free Instant Invoice & PDF Generator for Freelancers",
  description: "Create and download clean, client-ready PDF invoices instantly in your browser. No sign-up required.",
  verification: {
    google: "xpk4OFhW2_6GiTjq4qZIM2rYh0Kz4dl2Qu4bANzXDeE",
  },
  openGraph: {
    title: "SlipMint — Free Instant Invoice & PDF Generator for Freelancers",
    description: "Create and download clean, client-ready PDF invoices instantly in your browser. No sign-up required.",
    url: "https://slipmint.vercel.app",
    siteName: "SlipMint",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
