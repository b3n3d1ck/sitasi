export type RefType = "journal" | "book" | "web" | "thesis";
export type ThesisKind = "skripsi" | "tesis" | "disertasi";
export type Style = "apa" | "ieee" | "harvard";
export type Lang = "id" | "en";

export type Author = { family: string; given?: string };

export type Reference = {
  id: string;
  type: RefType;
  authors: Author[];
  title: string;
  year?: string;
  month?: string;
  day?: string;
  /** Nama jurnal, nama situs, atau repositori. */
  container?: string;
  volume?: string;
  issue?: string;
  pages?: string;
  publisher?: string;
  place?: string;
  edition?: string;
  isbn?: string;
  doi?: string;
  url?: string;
  /** Tanggal akses, format YYYY-MM-DD. */
  accessed?: string;
  thesisKind?: ThesisKind;
  institution?: string;
};

export type Draft = Omit<Reference, "id">;
