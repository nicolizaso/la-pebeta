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
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${instrumentSerif.variable} ${schibstedGrotesk.variable}`}
      >
        {children}
      </body>
    </html>
  );
}
