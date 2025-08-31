import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import "@/styles/flags.css";
import "flag-icons/css/flag-icons.min.css";
import { Providers } from "./providers";
import { LoggerInitializer } from "@/components/LoggerInitializer";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Panel de Administración - Website Builder",
  description: "Sistema de gestión empresarial con website builder integrado",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script src="https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js" async />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <Providers>
          <LoggerInitializer />
          {children}
        </Providers>
      </body>
    </html>
  );
}
