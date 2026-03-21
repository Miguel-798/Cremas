import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Header } from "@/components/ui/Header";

export const metadata: Metadata = {
  title: "Cremas | Inventario",
  description: "Gestión de inventario de cremas artesanales",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="min-h-screen">
        <Providers>
          <Header />
          {children}
        </Providers>
      </body>
    </html>
  );
}