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
    <html lang="id" className={`${geistSans.variable} ${serif.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
