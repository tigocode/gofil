import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/src/components/Navbar"; // <--- 1. Importe aqui

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GO FIIs Dashboard",
  description: "Análise de Fundos Imobiliários",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} bg-[#0b1121] text-slate-50 antialiased min-h-screen pb-16 md:pb-0`}>
        
        {/* 2. Adicione a Navbar AQUI */}
        <Navbar />
        
        {children}
      </body>
    </html>
  );
}