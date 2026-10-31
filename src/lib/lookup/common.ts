export class LookupError extends Error {}

export const USER_AGENT =
  "Mozilla/5.0 (compatible; SitasiBot/1.0; +https://github.com/b3n3d1ck/sitasi)";

export const TIMEOUT_MS = 12_000;

export type Query =
  | { kind: "doi"; doi: string }
  | { kind: "isbn"; isbn: string }
  | { kind: "url"; url: string }
  | { kind: "unknown" };

const DOI_RE = /(10\.\d{4,9}\/[^\s"<>]+)/i;

function validIsbn(digits: string): boolean {
  if (/^\d{9}[\dX]$/.test(digits)) {
    const sum = [...digits].reduce((acc, c, i) => acc + (c === "X" ? 10 : Number(c)) * (10 - i), 0);
    return sum % 11 === 0;
  }
  if (/^97[89]\d{10}$/.test(digits)) {
    const sum = [...digits].reduce((acc, c, i) => acc + Number(c) * (i % 2 ? 3 : 1), 0);
    return sum % 10 === 0;
  }
  return false;
}

export function detectQuery(input: string): Query {
  const s = input.trim();

  if (/^https?:\/\//i.test(s)) {
    try {
      const u = new URL(s);
      if (/^(dx\.)?doi\.org$/i.test(u.hostname)) {
        const doi = decodeURIComponent(u.pathname.slice(1));
        if (DOI_RE.test(doi)) return { kind: "doi", doi };
      }
      return { kind: "url", url: u.toString() };
    } catch {
      return { kind: "unknown" };
    }
  }

  const doi = s.replace(/^doi:\s*/i, "").match(DOI_RE);
  if (doi && /^(doi:\s*)?10\./i.test(s)) return { kind: "doi", doi: doi[1].replace(/[.,;]+$/, "") };

  const isbn = s.replace(/^isbn(-1[03])?:?\s*/i, "").replace(/[\s-]/g, "").toUpperCase();
  if (validIsbn(isbn)) return { kind: "isbn", isbn };

  if (/^[\w-]+(\.[\w-]+)+(\/\S*)?$/.test(s)) return { kind: "url", url: `https://${s}` };

  return { kind: "unknown" };
}
