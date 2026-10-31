import { lookup as dnsLookup } from "node:dns/promises";
import { isIP } from "node:net";
import type { Draft, RefType } from "../types";
import { cleanText, decodeEntities, fixCase, normalizeDoi, parseDateParts, parseName } from "../text";
import { lookupDoi, titleFix } from "./doi";
import { LookupError, TIMEOUT_MS } from "./common";

const MAX_BYTES = 2_000_000;
const MAX_REDIRECTS = 5;
const BROWSER_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36";

function isPublicIp(ip: string): boolean {
  if (isIP(ip) === 4) {
    const [a, b] = ip.split(".").map(Number);
    if (a === 0 || a === 10 || a === 127 || a >= 224) return false;
    if (a === 100 && b >= 64 && b <= 127) return false;
    if (a === 169 && b === 254) return false;
    if (a === 172 && b >= 16 && b <= 31) return false;
    if (a === 192 && (b === 168 || b === 0)) return false;
    if (a === 198 && (b === 18 || b === 19)) return false;
    return true;
  }
  const v = ip.toLowerCase();
  if (v === "::" || v === "::1") return false;
  const dotted = v.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  if (dotted) return isPublicIp(dotted[1]);
  const hex = v.match(/^::ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/);
  if (hex) {
    const hi = parseInt(hex[1], 16);
    const lo = parseInt(hex[2], 16);
    return isPublicIp(`${hi >> 8}.${hi & 255}.${lo >> 8}.${lo & 255}`);
  }
  return !/^(f[cd]|fe[89ab]|ff)/.test(v);
}

async function assertPublicUrl(url: URL) {
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new LookupError("Hanya link http/https yang didukung.");
  }
  if (url.username || url.password || (url.port && url.port !== "80" && url.port !== "443")) {
    throw new LookupError("Link ini tidak didukung.");
  }
  const host = url.hostname.replace(/^\[|\]$/g, "");
  let addresses: string[];
  try {
    addresses = isIP(host) ? [host] : (await dnsLookup(host, { all: true })).map((a) => a.address);
  } catch {
    throw new LookupError(`Domain "${host}" tidak ditemukan.`);
  }
  if (!addresses.length || !addresses.every(isPublicIp)) {
    throw new LookupError("Link ini mengarah ke alamat yang tidak boleh diakses.");
  }
}

async function readLimited(res: Response): Promise<string> {
  if (!res.body) return "";
  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (size < MAX_BYTES) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    size += value.byteLength;
  }
  await reader.cancel().catch(() => {});
  const buf = new Uint8Array(size);
  let offset = 0;
  for (const c of chunks) {
    buf.set(c.subarray(0, Math.min(c.byteLength, size - offset)), offset);
    offset += c.byteLength;
  }
  return new TextDecoder("utf-8").decode(buf);
}

async function fetchHtml(input: string): Promise<{ html: string; finalUrl: URL }> {
  let url = new URL(input);
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    await assertPublicUrl(url);
    let res: Response;
    try {
      res = await fetch(url, {
        redirect: "manual",
        headers: { "User-Agent": BROWSER_UA, Accept: "text/html,application/xhtml+xml" },
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
    } catch {
      throw new LookupError("Halaman tidak merespons. Coba lagi atau gunakan DOI-nya.");
    }
    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get("location");
      if (!location) break;
      url = new URL(location, url);
      continue;
    }
    if (!res.ok) throw new LookupError(`Halaman membalas dengan status ${res.status}.`);
    const contentType = res.headers.get("content-type") ?? "";
    if (contentType.includes("pdf")) {
      throw new LookupError("Link ini file PDF. Tempel link halaman artikelnya (bukan PDF-nya) atau DOI-nya.");
    }
    if (!contentType.includes("html")) throw new LookupError("Link ini bukan halaman web.");
    return { html: await readLimited(res), finalUrl: url };
  }
  throw new LookupError("Link terlalu banyak dialihkan (redirect).");
}

function parseMeta(html: string): Map<string, string[]> {
  const meta = new Map<string, string[]>();
  for (const [tag] of html.matchAll(/<meta\b[^>]*>/gi)) {
    const attrs: Record<string, string> = {};
    for (const m of tag.matchAll(/([a-zA-Z_:.-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g)) {
      attrs[m[1].toLowerCase()] = m[2] ?? m[3] ?? m[4] ?? "";
    }
    const key = (attrs.name ?? attrs.property ?? attrs.itemprop)?.toLowerCase();
    const content = attrs.content ? cleanText(attrs.content) : "";
    if (!key || !content) continue;
    meta.set(key, [...(meta.get(key) ?? []), content]);
  }
  return meta;
}

export async function lookupUrl(input: string): Promise<Draft> {
  const { html, finalUrl } = await fetchHtml(input);
  const meta = parseMeta(html);
  const first = (...keys: string[]) => keys.map((k) => meta.get(k)?.[0]).find(Boolean);
  const all = (...keys: string[]) => keys.map((k) => meta.get(k) ?? []).find((v) => v.length) ?? [];

  const doi = first("citation_doi", "dc.identifier.doi", "prism.doi", "bepress_citation_doi");
  const htmlTitle = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1];
  const title = first("citation_title", "dc.title", "og:title", "twitter:title") ?? (htmlTitle && cleanText(decodeEntities(htmlTitle)));

  let names = all("citation_author", "dc.creator", "author", "article:author").filter((n) => !/^https?:/i.test(n));
  if (names.length === 1 && names[0].includes(";")) names = names[0].split(";");
  const authors = names.flatMap((n) => {
    const a = parseName(fixCase(n));
    return a ? [a] : [];
  });

  // Halaman yang punya DOI tapi metadata-nya minim: ambil data lengkap dari DOI.
  if (doi && (!title || !authors.length)) {
    try {
      return { ...(await lookupDoi(doi)), url: finalUrl.toString() };
    } catch {
      // Lanjut pakai metadata halaman.
    }
  }
  if (!title) throw new LookupError("Tidak menemukan judul di halaman ini. Coba DOI-nya atau isi manual.");

  const journal = first("citation_journal_title", "citation_conference_title", "prism.publicationname");
  const institution = first("citation_dissertation_institution");
  const isbn = first("citation_isbn");
  const type: RefType = institution ? "thesis" : journal ? "journal" : isbn ? "book" : "web";

  const date = parseDateParts(
    first("citation_publication_date", "citation_date", "citation_online_date", "dc.date", "article:published_time", "date"),
  );
  const firstPage = first("citation_firstpage");
  const lastPage = first("citation_lastpage");
  const siteName = first("og:site_name") ?? finalUrl.hostname.replace(/^www\./, "");

  return {
    type,
    authors,
    title: titleFix(title),
    ...date,
    container: type === "journal" ? journal : type === "web" ? siteName : undefined,
    volume: first("citation_volume", "prism.volume"),
    issue: first("citation_issue", "prism.number"),
    pages: firstPage ? (lastPage && lastPage !== firstPage ? `${firstPage}–${lastPage}` : firstPage) : undefined,
    publisher: type === "book" ? first("citation_publisher", "dc.publisher") : undefined,
    isbn,
    institution,
    thesisKind: type === "thesis" ? "skripsi" : undefined,
    doi: doi ? normalizeDoi(doi) : undefined,
    url: finalUrl.toString(),
  };
}
