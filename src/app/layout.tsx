import type { Metadata } from "next";
import { AppProviders } from "@/components/providers/AppProviders";
import { BRAND } from "@/lib/branding";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vodacom Privilege Golf 2026",
  description:
    "Plateforme événementielle — invitation, expériences et activités enfants.",
  icons: {
    icon: [{ url: BRAND.favicon, type: "image/png" }],
    apple: [{ url: BRAND.icon, type: "image/png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="font-sans">
      <body className="font-sans antialiased">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
