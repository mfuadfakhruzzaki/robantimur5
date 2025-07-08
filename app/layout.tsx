import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/auth/auth-provider";
import SimpleDebugInfo from "@/components/simple-debug-info";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SehatKeluarga - Platform Edukasi Kesehatan",
  description:
    "Platform edukasi kesehatan untuk ibu-ibu muda dengan AI chatbot dan komunitas",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
        <link rel="shortcut icon" href="/favicon.ico" />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          {children}
          <SimpleDebugInfo />
        </AuthProvider>
      </body>
    </html>
  );
}
