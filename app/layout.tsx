import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Você pode ter TDAH? | Auto-avaliação ASRS-v1.1",
  description:
    "Ferramenta de auto-avaliação baseada na escala ASRS-v1.1 da OMS. Responda 18 perguntas e receba um relatório personalizado sobre seu perfil atencional.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} h-full`}>
      <body className="min-h-full antialiased">{children}</body>
    </html>
  );
}
