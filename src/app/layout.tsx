import type { Metadata } from "next";
import { Geist, Source_Serif_4 } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const serif = Source_Serif_4({
  variable: "--font-serif",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sitasi — Generator Daftar Pustaka Gratis (APA, IEEE, Harvard)",
  description:
    "Buat daftar pustaka dan kutipan otomatis dari DOI, ISBN, atau link jurnal Indonesia. Format APA 7, IEEE, dan Harvard. Gratis untuk mahasiswa.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className={`${geistSans.variable} ${serif.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
