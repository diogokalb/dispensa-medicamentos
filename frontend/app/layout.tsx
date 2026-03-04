import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DispensaMed – Sistema de Dispensação de Medicamentos",
  description: "Sistema de Dispensação de Medicamentos",
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
