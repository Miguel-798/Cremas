import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Header } from "@/components/ui/Header";

export const metadata: Metadata = {
  title: "Cremas | Inventario",
  description: "Gestión de inventario de cremas artesanales",
};

// Dark mode init script - prevents flash of wrong theme on first paint
const darkModeInitScript = `
  (function() {
    const saved = localStorage.getItem('darkMode');
    if (saved === 'true' || (saved === null && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    }
  })();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: darkModeInitScript }} />
      </head>
      <body className="min-h-screen">
        <Providers>
          <Header />
          {children}
        </Providers>
      </body>
    </html>
  );
}
