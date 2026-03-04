import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SEPIN – Sistema de Gestão de Informações de Saúde",
  description: "SEPIN - Sistema de Gestão de Informações de Saúde",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">{children}</body>
    </html>
  );
}
