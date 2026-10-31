import type { Author, Draft, RefType } from "../types";
import { cleanText, fixCase, normalizeDoi, toTitleCase } from "../text";
import { LookupError, TIMEOUT_MS, USER_AGENT } from "./common";

type CslName = { family?: string; given?: string; literal?: string };
type CslItem = {
  type?: string;
  title?: string | string[];
  subtitle?: string | string[];
  "container-title"?: string | string[];
  author?: CslName[];
  editor?: CslName[];
  issued?: { "date-parts"?: (number | string)[][] };
  published?: { "date-parts"?: (number | string)[][] };
  volume?: string | number;
  issue?: string | number;
  page?: string;
  publisher?: string;
  "publisher-place"?: string;
  edition?: string | number;
  ISBN?: string | string[];
  DOI?: string;
  URL?: string;
};

function str(v: unknown): string | undefined {
  const first = Array.isArray(v) ? v[0] : v;
  if (typeof first === "number") return String(first);
  return typeof first === "string" && first.trim() ? cleanText(first) : undefined;
}

export function titleFix(title: string): string {
  return /\p{Ll}/u.test(title) ? title : toTitleCase(title);
}

function mapType(t: string | undefined, hasContainer: boolean): RefType {
  switch (t) {
    case "book":
    case "monograph":
    case "chapter":
    case "edited-book":
    case "reference-book":
      return "book";
    case "thesis":
    case "dissertation":
      return "thesis";
    case "webpage":
    case "post":
    case "post-weblog":
      return "web";
    default:
      return hasContainer ? "journal" : "web";
  }
}

function mapAuthors(names: CslName[] | undefined): Author[] {
  return (names ?? []).flatMap((n): Author[] => {
    if (n.family) {
      const family = fixCase(cleanText(n.family));
      const given = n.given ? fixCase(cleanText(n.given)) : "";
      return [given ? { family, given } : { family }];
    }
    return n.literal ? [{ family: cleanText(n.literal) }] : [];
  });
}

export async function lookupDoi(rawDoi: string): Promise<Draft> {
  const doi = normalizeDoi(rawDoi);
  let res: Response;
  try {
    res = await fetch(`https://doi.org/${encodeURI(doi)}`, {
      headers: { Accept: "application/vnd.citationstyles.csl+json", "User-Agent": USER_AGENT },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch {
    throw new LookupError("Server DOI tidak merespons. Coba lagi sebentar lagi.");
  }
  if (res.status === 404) throw new LookupError(`DOI "${doi}" tidak ditemukan. Periksa lagi penulisannya.`);
  if (!res.ok) throw new LookupError(`Gagal mengambil data DOI (status ${res.status}).`);

  let csl: CslItem;
  try {
    csl = (await res.json()) as CslItem;
  } catch {
    throw new LookupError("Data DOI ini tidak bisa dibaca. Coba tempel link artikelnya.");
  }

  const container = str(csl["container-title"]);
  const type = mapType(csl.type, !!container);
  const parts = (csl.issued ?? csl.published)?.["date-parts"]?.[0] ?? [];
  const [year, month, day] = parts.map((p) => (p ? String(p) : undefined));

  // Untuk bab buku, yang dikutip sebagai buku adalah judul bukunya.
  const subtitle = str(csl.subtitle);
  const mainTitle = str(csl.title);
  const fullTitle = mainTitle && subtitle && !mainTitle.includes(subtitle) ? `${mainTitle}: ${subtitle}` : mainTitle;
  const rawTitle = csl.type === "chapter" && container ? container : fullTitle;
  if (!rawTitle) throw new LookupError("DOI ditemukan, tapi tidak ada judulnya. Isi data secara manual.");

  return {
    type,
    authors: mapAuthors(csl.author?.length ? csl.author : csl.editor),
    title: titleFix(rawTitle),
    year,
    month: type === "journal" || type === "web" ? month : undefined,
    day: type === "web" ? day : undefined,
    container: type === "journal" || type === "web" ? container : undefined,
    volume: str(csl.volume),
    issue: str(csl.issue),
    pages: str(csl.page),
    publisher: type === "book" ? str(csl.publisher) : undefined,
    place: type === "book" ? str(csl["publisher-place"]) : undefined,
    edition: str(csl.edition),
    isbn: str(csl.ISBN),
    institution: type === "thesis" ? str(csl.publisher) : undefined,
    thesisKind: type === "thesis" ? "skripsi" : undefined,
    doi: csl.DOI ? normalizeDoi(csl.DOI) : doi,
  };
}
