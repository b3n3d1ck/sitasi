import type { Draft } from "../types";
import { fixCase, parseDateParts, parseName } from "../text";
import { titleFix } from "./doi";
import { LookupError, TIMEOUT_MS, USER_AGENT } from "./common";

type GoogleBooks = {
  items?: {
    volumeInfo?: {
      title?: string;
      subtitle?: string;
      authors?: string[];
      publisher?: string;
      publishedDate?: string;
    };
  }[];
};

type OpenLibraryBook = {
  title?: string;
  subtitle?: string;
  authors?: { name?: string }[];
  publishers?: { name?: string }[];
  publish_places?: { name?: string }[];
  publish_date?: string;
};

async function getJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    return res.ok ? ((await res.json()) as T) : null;
  } catch {
    return null;
  }
}

function joinTitle(title: string, subtitle?: string): string {
  return titleFix(subtitle ? `${title}: ${subtitle}` : title);
}

function toAuthors(names: (string | undefined)[]) {
  return names.flatMap((n) => {
    const a = n ? parseName(fixCase(n)) : null;
    return a ? [a] : [];
  });
}

export async function lookupIsbn(isbn: string): Promise<Draft> {
  const [google, openLibrary] = await Promise.all([
    getJson<GoogleBooks>(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`),
    getJson<Record<string, OpenLibraryBook>>(
      `https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`,
    ),
  ]);

  const g = google?.items?.[0]?.volumeInfo;
  const o = openLibrary?.[`ISBN:${isbn}`];
  const title = g?.title ? joinTitle(g.title, g.subtitle) : o?.title ? joinTitle(o.title, o.subtitle) : "";
  if (!title) throw new LookupError(`Buku dengan ISBN ${isbn} tidak ditemukan. Coba isi manual.`);

  const authors = g?.authors?.length ? toAuthors(g.authors) : toAuthors((o?.authors ?? []).map((a) => a.name));

  return {
    type: "book",
    authors,
    title,
    year: parseDateParts(g?.publishedDate ?? o?.publish_date).year,
    publisher: g?.publisher ?? o?.publishers?.[0]?.name,
    place: o?.publish_places?.[0]?.name,
    isbn,
  };
}
