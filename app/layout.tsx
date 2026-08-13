import type { Metadata } from "next";
import { Instrument_Serif, Schibsted_Grotesk } from "next/font/google";
import "./globals.css";

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

const schibstedGrotesk = Schibsted_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "La Pebeta — De la tierra a la mesa",
  description:
    "Restaurant, granja agroecológica y proveeduría a 70 minutos de Buenos Aires. Todo lo que servimos, antes fue sembrado por nosotros.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // The font variables have to live on <html>, not on <body>: globals.css
    // (and Tailwind's @theme block) alias them from :root, and a var() is
    // substituted on the element where it is declared. Declared on <body> the
    // aliases resolve against an <html> that has no --font-* yet, so every
    // --ff-* would collapse to its bare `serif` / `sans-serif` fallback and
    // inherit that down the whole tree.
    <html
      lang="es"
      className={`${instrumentSerif.variable} ${schibstedGrotesk.variable}`}
      suppressHydrationWarning
    >
      <body>{children}</body>
    </html>
  );
}
