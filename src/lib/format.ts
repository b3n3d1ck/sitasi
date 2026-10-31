import type { Author, Lang, Reference, Style, ThesisKind } from "./types";
import { initials } from "./text";

/** Potongan teks; `{ i }` berarti dicetak miring. */
export type Part = string | { i: string };

export const STYLES: { id: Style; label: string }[] = [
  { id: "apa", label: "APA 7" },
  { id: "ieee", label: "IEEE" },
  { id: "harvard", label: "Harvard" },
];

export const MONTHS: Record<Lang, string[]> = {
  id: ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"],
  en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
};

const MONTHS_SHORT: Record<Lang, string[]> = {
  id: ["Jan.", "Feb.", "Mar.", "Apr.", "Mei", "Jun.", "Jul.", "Agu.", "Sep.", "Okt.", "Nov.", "Des."],
  en: ["Jan.", "Feb.", "Mar.", "Apr.", "May", "Jun.", "Jul.", "Aug.", "Sep.", "Oct.", "Nov.", "Dec."],
};

const WORDS = {
  id: { and: "dan", etal: "dkk.", nd: "t.t.", harvardNd: "t.t.", available: "Tersedia di", accessed: "Diakses", online: "[Daring]. Tersedia" },
  en: { and: "and", etal: "et al.", nd: "n.d.", harvardNd: "no date", available: "Available at", accessed: "Accessed", online: "[Online]. Available" },
};

const THESIS: Record<Style, Record<Lang, Record<ThesisKind, string>>> = {
  apa: {
    id: { skripsi: "Skripsi", tesis: "Tesis", disertasi: "Disertasi" },
    en: { skripsi: "Bachelor's thesis", tesis: "Master's thesis", disertasi: "Doctoral dissertation" },
  },
  ieee: {
    id: { skripsi: "Skripsi", tesis: "Tesis", disertasi: "Disertasi" },
    en: { skripsi: "B.S. thesis", tesis: "M.S. thesis", disertasi: "Ph.D. dissertation" },
  },
  harvard: {
    id: { skripsi: "Skripsi", tesis: "Tesis", disertasi: "Disertasi" },
    en: { skripsi: "Bachelor's thesis", tesis: "Master's thesis", disertasi: "PhD thesis" },
  },
};

const dash = (pages: string) => pages.trim().replace(/\s*[-–—]+\s*/g, "–");
const stripEnd = (s: string) => s.trim().replace(/[.,;:]+$/, "");
const endsWithPunct = (s: string) => /[.?!]$/.test(s.trim());
const withPeriod = (s: string) => (endsWithPunct(s) ? s.trim() : `${s.trim()}.`);
const doiUrl = (doi: string) => `https://doi.org/${doi}`;

function monthIndex(m: string | undefined): number {
  const n = Number(m);
  return Number.isInteger(n) && n >= 1 && n <= 12 ? n - 1 : -1;
}

function ordinal(n: number): string {
  const tens = n % 100;
  if (tens >= 11 && tens <= 13) return `${n}th`;
  return `${n}${["th", "st", "nd", "rd"][n % 10] ?? "th"}`;
}

function edition(r: Reference, style: Style, lang: Lang): string {
  const ed = r.edition?.trim();
  if (!ed) return "";
  if (!/^\d+$/.test(ed)) return ed;
  const n = Number(ed);
  if (n <= 1) return "";
  if (lang === "id") return style === "ieee" ? `Ed. ke-${n}` : `Edisi ke-${n}`;
  return style === "harvard" ? `${ordinal(n)} edn.` : `${ordinal(n)} ed.`;
}

function accessedDate(iso: string, style: Style, lang: Lang): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  const day = String(d);
  if (style === "ieee") {
    const mon = MONTHS_SHORT[lang][m - 1];
    return lang === "id" ? `${day} ${mon} ${y}` : `${mon} ${day}, ${y}`;
  }
  const mon = MONTHS[lang][m - 1];
  return lang === "en" && style === "apa" ? `${mon} ${day}, ${y}` : `${day} ${mon} ${y}`;
}

function listNames(names: string[], and: string, serialComma: boolean): string {
  if (names.length <= 1) return names[0] ?? "";
  if (names.length === 2) return `${names[0]} ${and} ${names[1]}`;
  return `${names.slice(0, -1).join(", ")}${serialComma ? "," : ""} ${and} ${names[names.length - 1]}`;
}

function joinParts(items: Part[], sep: string): Part[] {
  return items.flatMap((p, i) => (i === 0 ? [p] : [sep, p]));
}

function shortTitle(title: string): string {
  const words = stripEnd(title).split(/\s+/);
  return words.length > 4 ? `${words.slice(0, 4).join(" ")}…` : words.join(" ");
}

/* ---------------------------------- APA 7 --------------------------------- */

function apaName(a: Author): string {
  const ini = initials(a.given, " ");
  return ini ? `${a.family}, ${ini}` : a.family;
}

function apaAuthors(authors: Author[]): string {
  const names = authors.map(apaName);
  if (names.length === 1) return names[0];
  if (names.length > 20) return `${names.slice(0, 19).join(", ")}, . . . ${names[names.length - 1]}`;
  return `${names.slice(0, -1).join(", ")}, & ${names[names.length - 1]}`;
}

function apa(r: Reference, lang: Lang): Part[] {
  const w = WORDS[lang];
  const title = r.title.trim();
  const m = monthIndex(r.month);

  let date = r.year?.trim() || w.nd;
  if (r.year && r.type === "web" && m >= 0) {
    const mon = MONTHS[lang][m];
    date += lang === "id" ? `, ${r.day ? `${r.day} ` : ""}${mon}` : `, ${mon}${r.day ? ` ${r.day}` : ""}`;
  }

  let titleBlock: Part[];
  if (r.type === "journal") {
    titleBlock = [withPeriod(title)];
  } else {
    const ed = edition(r, "apa", lang);
    const bracket =
      r.type === "thesis" && r.thesisKind
        ? ` [${THESIS.apa[lang][r.thesisKind]}${r.institution ? `, ${r.institution}` : ""}]`
        : "";
    const suffix = (ed ? ` (${ed})` : "") + bracket;
    titleBlock = [{ i: title }, suffix + (suffix || !endsWithPunct(title) ? "." : "")];
  }

  const out: Part[] = r.authors.length
    ? [`${withPeriod(apaAuthors(r.authors))} (${date}). `, ...titleBlock]
    : [...titleBlock, ` (${date}).`];

  if (r.type === "journal" && r.container) {
    out.push(" ", { i: r.container });
    if (r.volume) out.push(", ", { i: r.volume });
    if (r.issue) out.push(`(${r.issue})`);
    if (r.pages) out.push(`, ${dash(r.pages)}`);
    out.push(".");
  } else if (r.type === "book" && r.publisher) {
    out.push(` ${withPeriod(r.publisher)}`);
  } else if ((r.type === "web" || r.type === "thesis") && r.container) {
    out.push(` ${withPeriod(r.container)}`);
  }

  if (r.doi) {
    out.push(` ${doiUrl(r.doi)}`);
  } else if (r.url) {
    if (r.type === "web" && r.accessed) {
      const d = accessedDate(r.accessed, "apa", lang);
      out.push(lang === "id" ? ` Diakses ${d}, dari ${r.url}` : ` Retrieved ${d}, from ${r.url}`);
    } else {
      out.push(` ${r.url}`);
    }
  }
  return out;
}

/* ---------------------------------- IEEE ---------------------------------- */

function ieeeName(a: Author): string {
  const ini = initials(a.given, " ");
  return ini ? `${ini} ${a.family}` : a.family;
}

function ieeeAuthors(authors: Author[], lang: Lang): string {
  const names = authors.map(ieeeName);
  if (names.length > 6) return `${names[0]} ${WORDS[lang].etal}`;
  return listNames(names, WORDS[lang].and, true);
}

function ieee(r: Reference, lang: Lang): Part[] {
  const w = WORDS[lang];
  const title = stripEnd(r.title);
  const out: Part[] = r.authors.length ? [`${ieeeAuthors(r.authors, lang)}, `] : [];
  const m = monthIndex(r.month);
  const date = r.year ? (m >= 0 ? `${MONTHS_SHORT[lang][m]} ${r.year}` : r.year) : "";

  const quoted = (rest: Part[]) => {
    if (rest.length) out.push(`“${title},” `, ...joinParts(rest, ", "), ".");
    else out.push(`“${title}.”`);
  };

  if (r.type === "book") {
    out.push({ i: title });
    const ed = edition(r, "ieee", lang);
    if (ed) out.push(`, ${ed}`);
    const pub = r.place && r.publisher ? `${r.place}: ${r.publisher}` : r.publisher || r.place || "";
    const tail = [pub, r.year].filter(Boolean).join(", ");
    out.push(tail ? `. ${tail}.` : ".");
  } else if (r.type === "journal") {
    const rest: Part[] = [];
    if (r.container) rest.push({ i: r.container });
    if (r.volume) rest.push(`vol. ${r.volume}`);
    if (r.issue) rest.push(`no. ${r.issue}`);
    if (r.pages) rest.push(/[-–—]/.test(r.pages) ? `pp. ${dash(r.pages)}` : `p. ${r.pages.trim()}`);
    if (date) rest.push(date);
    if (r.doi) rest.push(`doi: ${r.doi}`);
    quoted(rest);
  } else if (r.type === "thesis") {
    const kind = r.thesisKind ? THESIS.ieee[lang][r.thesisKind] : "";
    quoted([kind, r.institution, r.place, r.year].filter((x): x is string => !!x));
  } else {
    quoted([r.container, r.year].filter((x): x is string => !!x));
    if (r.accessed) out.push(` ${w.accessed}: ${accessedDate(r.accessed, "ieee", lang)}.`);
  }

  if (r.url && !(r.type === "journal" && r.doi)) out.push(` ${w.online}: ${r.url}`);
  return out;
}

/* --------------------------------- Harvard -------------------------------- */

function harvardName(a: Author): string {
  const ini = initials(a.given, "");
  return ini ? `${a.family}, ${ini}` : a.family;
}

function harvardAuthors(authors: Author[], lang: Lang): string {
  const names = authors.map(harvardName);
  if (names.length >= 4) return `${names[0]} ${WORDS[lang].etal}`;
  return listNames(names, WORDS[lang].and, false);
}

function harvard(r: Reference, lang: Lang): Part[] {
  const w = WORDS[lang];
  const year = r.year?.trim() || w.harvardNd;
  const title = stripEnd(r.title);
  const titlePart: Part = r.type === "journal" ? `‘${title}’` : { i: title };

  const out: Part[] = r.authors.length
    ? [`${harvardAuthors(r.authors, lang)} (${year}) `, titlePart]
    : [titlePart, ` (${year})`];

  if (r.type === "journal") {
    const rest: Part[] = [];
    if (r.container) rest.push({ i: r.container });
    if (r.volume) rest.push(r.volume + (r.issue ? `(${r.issue})` : ""));
    else if (r.issue) rest.push(`(${r.issue})`);
    if (r.pages) rest.push(`pp. ${dash(r.pages)}`);
    if (rest.length) out.push(", ", ...joinParts(rest, ", "));
    out.push(".");
  } else {
    out.push(".");
    if (r.type === "book") {
      const ed = edition(r, "harvard", lang);
      if (ed) out.push(` ${withPeriod(ed)}`);
      const pub = r.place && r.publisher ? `${r.place}: ${r.publisher}` : r.publisher || r.place;
      if (pub) out.push(` ${withPeriod(pub)}`);
    } else if (r.type === "thesis") {
      if (r.thesisKind) out.push(` ${THESIS.harvard[lang][r.thesisKind]}.`);
      if (r.institution) out.push(` ${withPeriod(r.institution)}`);
    } else if (r.container) {
      out.push(` ${withPeriod(r.container)}`);
    }
  }

  const link = r.doi ? doiUrl(r.doi) : r.url;
  if (link) {
    const accessed = r.accessed ? ` (${w.accessed}: ${accessedDate(r.accessed, "harvard", lang)})` : "";
    out.push(` ${w.available}: ${link}${accessed}.`);
  }
  return out;
}

/* --------------------------------- Publik --------------------------------- */

/** Rapikan titik ganda di perbatasan potongan, mis. nama jurnal "J. Sci." diikuti ".". */
function normalize(parts: Part[]): Part[] {
  const out: Part[] = [];
  for (const p of parts) {
    if (p === "" || (typeof p !== "string" && !p.i)) continue;
    const prev = out[out.length - 1];
    const prevText = prev === undefined ? "" : typeof prev === "string" ? prev : prev.i;
    if (typeof p === "string" && p.startsWith(".") && /[.?!]$/.test(prevText)) {
      const rest = p.slice(1);
      if (rest) out.push(rest);
      continue;
    }
    out.push(p);
  }
  return out;
}

export function formatReference(r: Reference, style: Style, lang: Lang): Part[] {
  const parts = style === "apa" ? apa(r, lang) : style === "ieee" ? ieee(r, lang) : harvard(r, lang);
  return normalize(parts);
}

export function inTextCitation(r: Reference, style: Style, lang: Lang, n: number): string {
  if (style === "ieee") return `[${n}]`;
  const w = WORDS[lang];
  const families = r.authors.map((a) => a.family);
  const year = r.year?.trim() || (style === "apa" ? w.nd : w.harvardNd);

  if (families.length === 0) {
    const t = shortTitle(r.title);
    return style === "apa" && r.type === "journal" ? `(“${t},” ${year})` : `(${t}, ${year})`;
  }

  let who: string;
  if (style === "apa") {
    who = families.length === 1 ? families[0] : families.length === 2 ? `${families[0]} & ${families[1]}` : `${families[0]} ${w.etal}`;
  } else {
    who = families.length >= 4 ? `${families[0]} ${w.etal}` : listNames(families, w.and, false);
  }
  return `(${who}, ${year})`;
}

/** APA & Harvard diurutkan alfabetis; IEEE mengikuti urutan dikutip (urutan ditambahkan). */
export function sortForStyle(items: Reference[], style: Style): Reference[] {
  if (style === "ieee") return items;
  const key = (r: Reference) => (r.authors[0]?.family ?? r.title).toLocaleLowerCase("id");
  return [...items].sort(
    (a, b) => key(a).localeCompare(key(b), "id") || (a.year ?? "").localeCompare(b.year ?? ""),
  );
}

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export function partsToHtml(parts: Part[]): string {
  return parts.map((p) => (typeof p === "string" ? escapeHtml(p) : `<i>${escapeHtml(p.i)}</i>`)).join("");
}

export function partsToText(parts: Part[]): string {
  return parts.map((p) => (typeof p === "string" ? p : p.i)).join("");
}
