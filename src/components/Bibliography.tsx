"use client";

import { useState } from "react";
import type { Lang, Reference, Style } from "@/lib/types";
import { formatReference, inTextCitation, partsToHtml, partsToText, sortForStyle, STYLES } from "@/lib/format";
import { toBibtex } from "@/lib/bibtex";
import { updateLibrary } from "@/lib/store";
import { CitationText } from "./CitationText";

const HANGING = "margin:0 0 8pt 0.5in;text-indent:-0.5in;line-height:1.5";

async function copyRich(html: string, text: string) {
  try {
    await navigator.clipboard.write([
      new ClipboardItem({
        "text/html": new Blob([html], { type: "text/html" }),
        "text/plain": new Blob([text], { type: "text/plain" }),
      }),
    ]);
  } catch {
    await navigator.clipboard.writeText(text);
  }
}

function download(filename: string, content: string) {
  const url = URL.createObjectURL(new Blob([content], { type: "text/plain;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

type Props = { items: Reference[]; style: Style; lang: Lang; onEdit: (r: Reference) => void };

export function Bibliography({ items, style, lang, onEdit }: Props) {
  const [copied, setCopied] = useState<string | null>(null);
  const sorted = sortForStyle(items, style);

  function flash(id: string) {
    setCopied(id);
    window.setTimeout(() => setCopied((c) => (c === id ? null : c)), 1500);
  }

  const entry = (r: Reference, i: number) => {
    const parts = formatReference(r, style, lang);
    const prefix = style === "ieee" ? `[${i + 1}] ` : "";
    return {
      html: `<p style="${HANGING}">${prefix}${partsToHtml(parts)}</p>`,
      text: prefix + partsToText(parts),
    };
  };

  async function copyAll() {
    const entries = sorted.map(entry);
    await copyRich(entries.map((e) => e.html).join(""), entries.map((e) => e.text).join("\n"));
    flash("all");
  }

  function remove(id: string) {
    updateLibrary((s) => ({ ...s, items: s.items.filter((it) => it.id !== id) }));
  }

  function clearAll() {
    if (confirm("Hapus semua referensi dari daftar pustaka?")) updateLibrary((s) => ({ ...s, items: [] }));
  }

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 p-5 sm:px-6">
        <div>
          <h2 className="text-base font-semibold">Daftar pustaka</h2>
          <p className="text-sm text-zinc-500">{items.length} referensi · tersimpan di browser ini</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-lg bg-zinc-100 p-1">
            {STYLES.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => updateLibrary((st) => ({ ...st, style: s.id }))}
                className={`rounded-md px-3 py-1 text-xs font-medium transition ${style === s.id ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-800"}`}
              >
                {s.label}
              </button>
            ))}
          </div>
          <select
            aria-label="Bahasa keterangan"
            value={lang}
            onChange={(e) => updateLibrary((st) => ({ ...st, lang: e.target.value as Lang }))}
            className="rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-xs"
          >
            <option value="id">Bahasa Indonesia (dkk., t.t.)</option>
            <option value="en">English (et al., n.d.)</option>
          </select>
        </div>
      </div>

      {sorted.length === 0 ? (
        <p className="p-10 text-center text-sm text-zinc-500">
          Belum ada referensi. Tempel DOI, ISBN, atau link di atas untuk mulai.
        </p>
      ) : (
        <>
          <ol className="divide-y divide-zinc-100">
            {sorted.map((r, i) => (
              <li key={r.id} className="group flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-start sm:gap-4 sm:px-6">
                <div className="min-w-0 flex-1">
                  <p className="break-words pl-8 -indent-8 text-[15px] leading-relaxed [font-family:var(--font-serif)]">
                    {style === "ieee" && `[${i + 1}] `}
                    <CitationText parts={formatReference(r, style, lang)} />
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">
                    Dalam teks: <span className="font-medium text-zinc-700">{inTextCitation(r, style, lang, i + 1)}</span>
                  </p>
                </div>
                <div className="flex shrink-0 gap-1 text-xs sm:opacity-60 sm:transition sm:group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={async () => {
                      const e = entry(r, i);
                      await copyRich(e.html, e.text);
                      flash(r.id);
                    }}
                    className="rounded-md px-2 py-1 font-medium text-emerald-700 hover:bg-emerald-50"
                  >
                    {copied === r.id ? "Tersalin ✓" : "Salin"}
                  </button>
                  <button type="button" onClick={() => onEdit(r)} className="rounded-md px-2 py-1 font-medium text-zinc-600 hover:bg-zinc-100">
                    Edit
                  </button>
                  <button type="button" onClick={() => remove(r.id)} className="rounded-md px-2 py-1 font-medium text-red-600 hover:bg-red-50">
                    Hapus
                  </button>
                </div>
              </li>
            ))}
          </ol>
          <div className="flex flex-wrap items-center gap-2 border-t border-zinc-200 p-5 sm:px-6">
            <button type="button" onClick={copyAll} className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800">
              {copied === "all" ? "Tersalin ✓" : "Salin semua (siap tempel ke Word)"}
            </button>
            <button type="button" onClick={() => download("daftar-pustaka.bib", toBibtex(sorted))} className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50">
              Unduh BibTeX
            </button>
            <button type="button" onClick={() => download("daftar-pustaka.txt", sorted.map((r, i) => entry(r, i).text).join("\n\n"))} className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50">
              Unduh .txt
            </button>
            <button type="button" onClick={clearAll} className="ml-auto rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50">
              Hapus semua
            </button>
          </div>
        </>
      )}
    </section>
  );
}
