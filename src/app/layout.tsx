import type { Metadata, Viewport } from "next";
import { AppProviders } from "@/components/providers/AppProviders";
import { BRAND, brandIconSrc } from "@/lib/branding";
import { EVENT } from "@/lib/event";
import "./globals.css";

export const metadata: Metadata = {
  title: EVENT.title,
  description:
    "Plateforme événementielle — invitation, expériences et activités enfants.",
  icons: {
    icon: [{ url: brandIconSrc(), type: "image/png" }],
    apple: [{ url: brandIconSrc(), type: "image/png" }],
  },
};

export const viewport: Viewport = {
  themeColor: BRAND.themeColor,
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
