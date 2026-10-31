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
    <section className="border border-[#e7e2d9] bg-white shadow-[0_12px_40px_rgba(28,25,23,0.06)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e4d3b4] p-5 sm:px-6">
        <div>
          <h2 className="font-serif text-2xl leading-none font-light tracking-[-0.03em]">Daftar pustaka</h2>
          <p className="mt-1 text-sm text-[#5c4d3c]">{items.length} referensi · tersimpan di browser ini</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex border border-[#241c14]">
            {STYLES.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => updateLibrary((st) => ({ ...st, style: s.id }))}
                className={`px-3 py-1.5 text-xs font-medium transition ${style === s.id ? "bg-[#241c14] text-[#fff8ee]" : "text-[#5c4d3c] hover:bg-[#f3e6d0]"}`}
              >
                {s.label}
              </button>
            ))}
          </div>
          <select
            aria-label="Bahasa keterangan"
            value={lang}
            onChange={(e) => updateLibrary((st) => ({ ...st, lang: e.target.value as Lang }))}
            className="border border-[#241c14] bg-[#fffdf8] px-2 py-1.5 text-xs"
          >
            <option value="id">Bahasa Indonesia (dkk., t.t.)</option>
            <option value="en">English (et al., n.d.)</option>
          </select>
        </div>
      </div>

      {sorted.length === 0 ? (
        <p className="p-10 text-center font-serif text-lg font-light italic text-[#5c4d3c]">
          Lembar ini masih kosong. Tempel DOI, ISBN, atau link di atas.
        </p>
      ) : (
        <>
          <ol className="divide-y divide-[#e4d3b4]">
            {sorted.map((r, i) => (
              <li key={r.id} className="group flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-start sm:gap-4 sm:px-6">
                <div className="min-w-0 flex-1">
                  <p className="break-words pl-8 -indent-8 text-[15.5px] leading-[1.7] font-serif font-light">
                    {style === "ieee" && `[${i + 1}] `}
                    <CitationText parts={formatReference(r, style, lang)} />
                  </p>
                  <p className="mt-1 text-xs text-[#5c4d3c]">
                    Dalam teks: <span className="font-medium text-[#241c14]">{inTextCitation(r, style, lang, i + 1)}</span>
                  </p>
                </div>
                <div className="flex shrink-0 gap-1 text-xs sm:opacity-70 sm:transition sm:group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={async () => {
                      const e = entry(r, i);
                      await copyRich(e.html, e.text);
                      flash(r.id);
                    }}
                    className="px-2 py-1 font-medium text-[#9b2c2c] underline decoration-[#c4a574] underline-offset-4"
                  >
                    {copied === r.id ? "Tersalin ✓" : "Salin"}
                  </button>
                  <button type="button" onClick={() => onEdit(r)} className="px-2 py-1 font-medium text-[#241c14] hover:bg-[#f3e6d0]">
                    Edit
                  </button>
                  <button type="button" onClick={() => remove(r.id)} className="px-2 py-1 font-medium text-[#9b2c2c] hover:bg-[#fde8e4]">
                    Hapus
                  </button>
                </div>
              </li>
            ))}
          </ol>
          <div className="flex flex-wrap items-center gap-2 border-t border-[#e4d3b4] p-5 sm:px-6">
            <button type="button" onClick={copyAll} className="border border-[#241c14] bg-[#241c14] px-4 py-2 text-sm font-medium text-[#fff8ee] hover:bg-[#9b2c2c]">
              {copied === "all" ? "Tersalin ✓" : "Salin semua (siap tempel ke Word)"}
            </button>
            <button type="button" onClick={() => download("daftar-pustaka.bib", toBibtex(sorted))} className="border border-[#241c14] px-4 py-2 text-sm font-medium text-[#241c14] hover:bg-[#f3e6d0]">
              Unduh BibTeX
            </button>
            <button type="button" onClick={() => download("daftar-pustaka.txt", sorted.map((r, i) => entry(r, i).text).join("\n\n"))} className="border border-[#241c14] px-4 py-2 text-sm font-medium text-[#241c14] hover:bg-[#f3e6d0]">
              Unduh .txt
            </button>
            <button type="button" onClick={clearAll} className="ml-auto px-3 py-2 text-sm font-medium text-[#9b2c2c] hover:bg-[#fde8e4]">
              Hapus semua
            </button>
          </div>
        </>
      )}
    </section>
  );
}
