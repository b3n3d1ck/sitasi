import type { Reference } from "./types";

const escape = (s: string) => s.replace(/([&%$#_])/g, "\\$1");

function citeKey(r: Reference, used: Set<string>): string {
  const word = r.authors[0]?.family ?? r.title.split(/\s+/)[0] ?? "ref";
  const ascii = word
    .normalize("NFD")
    .replace(/[^a-zA-Z0-9]/g, "")
    .toLowerCase();
  const base = (ascii || "ref") + (r.year ?? "");
  let key = base;
  for (let i = 0; used.has(key); i++) key = base + String.fromCharCode(97 + i);
  used.add(key);
  return key;
}

function entryType(r: Reference): string {
  switch (r.type) {
    case "journal":
      return "article";
    case "book":
      return "book";
    case "thesis":
      return r.thesisKind === "disertasi" ? "phdthesis" : "mastersthesis";
    default:
      return "misc";
  }
}

export function toBibtex(items: Reference[]): string {
  const used = new Set<string>();
  return items
    .map((r) => {
      const author = r.authors
        .map((a) => (a.given ? `${escape(a.family)}, ${escape(a.given)}` : `{${escape(a.family)}}`))
        .join(" and ");
      const fields: [string, string | undefined][] = [
        ["author", author || undefined],
        ["title", `{${escape(r.title)}}`],
        [r.type === "journal" ? "journal" : "howpublished", r.container && escape(r.container)],
        ["year", r.year],
        ["month", r.month],
        ["volume", r.volume],
        ["number", r.issue],
        ["pages", r.pages?.replace(/\s*[-–—]+\s*/g, "--")],
        ["edition", r.edition],
        ["publisher", r.publisher && escape(r.publisher)],
        ["address", r.place && escape(r.place)],
        ["school", r.institution && escape(r.institution)],
        ["type", r.type === "thesis" && r.thesisKind !== "disertasi" ? (r.thesisKind === "tesis" ? "Tesis" : "Skripsi") : undefined],
        ["isbn", r.isbn],
        ["doi", r.doi],
        ["url", r.url],
        ["urldate", r.accessed],
      ];
      const body = fields
        .filter(([, v]) => v)
        .map(([k, v]) => `  ${k} = {${v}}`)
        .join(",\n");
      return `@${entryType(r)}{${citeKey(r, used)},\n${body}\n}`;
    })
    .join("\n\n");
}
