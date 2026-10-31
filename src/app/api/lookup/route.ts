import type { NextRequest } from "next/server";
import { detectQuery, LookupError } from "@/lib/lookup/common";
import { lookupDoi } from "@/lib/lookup/doi";
import { lookupIsbn } from "@/lib/lookup/isbn";
import { lookupUrl } from "@/lib/lookup/url";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (!q || q.length > 2000) {
    return Response.json({ error: "Masukkan DOI, ISBN, atau link artikel." }, { status: 400 });
  }

  const query = detectQuery(q);
  try {
    switch (query.kind) {
      case "doi":
        return Response.json({ draft: await lookupDoi(query.doi) });
      case "isbn":
        return Response.json({ draft: await lookupIsbn(query.isbn) });
      case "url":
        return Response.json({ draft: await lookupUrl(query.url) });
      default:
        return Response.json(
          { error: "Format tidak dikenali. Gunakan DOI (10.xxxx/...), ISBN, atau link lengkap (https://...)." },
          { status: 400 },
        );
    }
  } catch (err) {
    if (err instanceof LookupError) return Response.json({ error: err.message }, { status: 422 });
    console.error("lookup failed", query, err);
    return Response.json({ error: "Terjadi kesalahan saat mengambil data. Coba lagi." }, { status: 500 });
  }
}
