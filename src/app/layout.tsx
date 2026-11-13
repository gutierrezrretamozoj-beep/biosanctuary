import type { Metadata } from "next";
import "./globals.css";
import { NatureThemeProvider } from "@/context/NatureThemeContext";

export const metadata: Metadata = {
  title: "BioSanctuary OS - Naturaleza Viva y Gestión de Fauna Silvestre",
  description:
    "SaaS Multitenant para Reservas y Santuarios de Fauna Silvestre con arquitectura aislada por schema e inmersión 3D viva.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="h-full antialiased scroll-smooth">
      <body className="min-h-full flex flex-col font-sans">
        <NatureThemeProvider>{children}</NatureThemeProvider>
      </body>
    </html>
  );
}
