import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BioSanctuary OS",
  description: "Plataforma de gestión para refugios y santuarios de fauna silvestre",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
