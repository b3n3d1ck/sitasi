import type { Author } from "./types";

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  ndash: "–",
  mdash: "—",
  hellip: "…",
  lsquo: "‘",
  rsquo: "’",
  ldquo: "“",
  rdquo: "”",
};

export function decodeEntities(s: string): string {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, entity: string) => {
    if (entity[0] === "#") {
      const hex = entity[1].toLowerCase() === "x";
      const cp = parseInt(entity.slice(hex ? 2 : 1), hex ? 16 : 10);
      return cp > 0 && cp < 0x110000 ? String.fromCodePoint(cp) : match;
    }
    return NAMED_ENTITIES[entity.toLowerCase()] ?? match;
  });
}

/** Buang tag HTML (Crossref kadang mengirim <i>, <sub>), decode entity, rapikan spasi. */
export function cleanText(s: string): string {
  return decodeEntities(s.replace(/<[^>]+>/g, "")).replace(/\s+/g, " ").trim();
}

/** "BUDI SANTOSO" -> "Budi Santoso". Teks yang sudah ada huruf kecilnya dibiarkan. */
export function fixCase(s: string): string {
  if (/\p{Ll}/u.test(s) || !/\p{Lu}/u.test(s)) return s;
  return s
    .toLowerCase()
    .replace(/(^|[\s\-'’(])(\p{L})/gu, (_, before: string, c: string) => before + c.toUpperCase());
}

export function initials(given: string | undefined, separator: string): string {
  if (!given) return "";
  return given
    .split(/\s+/)
    .filter(Boolean)
    .map((word) =>
      word
        .split("-")
        .filter(Boolean)
        .map((part) => part[0].toUpperCase() + ".")
        .join("-"),
    )
    .join(separator);
}

/** Terima "Santoso, Budi" atau "Budi Santoso". Nama tunggal (mis. "Soekarno") jadi nama keluarga. */
export function parseName(raw: string): Author | null {
  const s = raw.replace(/\s+/g, " ").trim();
  if (!s) return null;
  if (s.includes(",")) {
    const [family, ...rest] = s.split(",");
    const given = rest.join(" ").trim();
    return given ? { family: family.trim(), given } : { family: family.trim() };
  }
  const words = s.split(" ");
  if (words.length === 1) return { family: s };
  const family = words.pop()!;
  return { family, given: words.join(" ") };
}

export function authorsFromText(text: string): Author[] {
  return text
    .split(/\n|;/)
    .map(parseName)
    .filter((a): a is Author => a !== null);
}

export function authorsToText(authors: Author[]): string {
  return authors.map((a) => (a.given ? `${a.family}, ${a.given}` : a.family)).join("\n");
}

const SMALL_WORDS = new Set([
  "a", "an", "and", "as", "at", "but", "by", "for", "from", "in", "into", "of", "on", "or",
  "the", "to", "via", "with",
  "dan", "di", "ke", "dari", "yang", "untuk", "pada", "dengan", "dalam", "atau", "terhadap",
  "sebagai", "oleh", "bagi", "tentang", "antara",
]);

const PROPER_NOUNS = new Set([
  "indonesia", "indonesian", "jakarta", "bandung", "surabaya", "yogyakarta", "semarang", "medan",
  "makassar", "jawa", "bali", "sumatera", "sumatra", "kalimantan", "sulawesi", "papua", "maluku",
  "asia", "eropa", "europe", "amerika", "america", "islam", "islamic", "kristen", "english",
  "inggris", "covid", "pancasila", "nusantara", "asean",
]);

function capitalize(w: string): string {
  return w.charAt(0).toUpperCase() + w.slice(1);
}

function recase(s: string, mode: "title" | "sentence"): string {
  const allCaps = s === s.toUpperCase();
  return s.replace(/[\p{L}\p{N}][\p{L}\p{N}'’]*/gu, (word: string, offset: number) => {
    const startsSentence = offset === 0 || /[:.?!]\s*$/.test(s.slice(0, offset));
    // Akronim (AI, IoT, UMKM) dan kata campuran (iPhone) dipertahankan, kecuali seluruh judul kapital.
    if (!allCaps && /\p{Lu}/u.test(word.slice(1))) return word;
    if (!allCaps && word.length > 1 && word === word.toUpperCase() && /\p{L}/u.test(word)) return word;
    const lower = word.toLowerCase();
    if (PROPER_NOUNS.has(lower)) return capitalize(lower);
    if (mode === "sentence") return startsSentence ? capitalize(lower) : lower;
    return !startsSentence && SMALL_WORDS.has(lower) ? lower : capitalize(lower);
  });
}

export const toTitleCase = (s: string) => recase(s, "title");
export const toSentenceCase = (s: string) => recase(s, "sentence");

export function parseDateParts(s: string | undefined): { year?: string; month?: string; day?: string } {
  if (!s) return {};
  const iso = s.match(/(\d{4})[-/.](\d{1,2})(?:[-/.](\d{1,2}))?/);
  if (iso) {
    const month = Number(iso[2]);
    const day = iso[3] ? Number(iso[3]) : 0;
    return {
      year: iso[1],
      month: month >= 1 && month <= 12 ? String(month) : undefined,
      day: day >= 1 && day <= 31 ? String(day) : undefined,
    };
  }
  const year = s.match(/\b(1[5-9]\d{2}|20\d{2})\b/);
  return year ? { year: year[1] } : {};
}

export function todayIso(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function normalizeDoi(s: string): string {
  return s
    .trim()
    .replace(/^(https?:\/\/)?(dx\.)?doi\.org\//i, "")
    .replace(/^doi:\s*/i, "")
    .replace(/[.,;]+$/, "");
}
