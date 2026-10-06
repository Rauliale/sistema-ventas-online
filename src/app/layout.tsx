import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "../components/layout/Navbar";
import { CartDrawer } from "../components/layout/CartDrawer";
import { WhatsAppWidget } from "../components/ui/WhatsAppWidget";

export const metadata: Metadata = {
  title: "Ferretería Online",
  description: "Catálogo y Venta Web de Herramientas e Insumos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
        <CartDrawer />
        <WhatsAppWidget />
      </body>
    </html>
  );
}
