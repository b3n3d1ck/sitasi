import type { Metadata } from "next";
import { Fraunces, Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-sans-app",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["SOFT", "opsz"],
});

const title = "Sitasi — Generator Daftar Pustaka Gratis (APA, IEEE, Harvard)";
const description =
  "Buat daftar pustaka dan kutipan otomatis dari DOI, ISBN, atau link jurnal Indonesia. Format APA 7, IEEE, dan Harvard. Gratis untuk mahasiswa.";

export const metadata: Metadata = {
  metadataBase: new URL("https://sitasi-one.vercel.app"),
  title,
  description,
  keywords: [
    "generator daftar pustaka",
    "daftar pustaka otomatis",
    "sitasi APA 7",
    "sitasi IEEE",
    "Harvard referencing",
    "citation generator Indonesia",
    "daftar pustaka skripsi",
    "alternatif Mendeley",
  ],
  openGraph: { title, description, url: "/", siteName: "Sitasi", locale: "id_ID", type: "website" },
  twitter: { card: "summary_large_image", title, description },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className={`${outfit.variable} ${fraunces.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-[#f3f1ec] text-[#1c1917]">{children}</body>
    </html>
  );
}
