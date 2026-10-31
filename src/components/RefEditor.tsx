"use client";

import { useState, type ReactNode } from "react";
import type { Draft, Lang, RefType, Style, ThesisKind } from "@/lib/types";
import { formatReference, inTextCitation, MONTHS } from "@/lib/format";
import { authorsFromText, authorsToText, toSentenceCase, toTitleCase, todayIso } from "@/lib/text";
import { CitationText } from "./CitationText";

const TYPES: { id: RefType; label: string }[] = [
  { id: "journal", label: "Artikel jurnal" },
  { id: "book", label: "Buku" },
  { id: "web", label: "Halaman web" },
  { id: "thesis", label: "Skripsi / Tesis" },
];

const inputClass =
  "w-full border border-[#241c14] bg-[#fffdf8] px-3 py-2 text-sm outline-none transition focus:bg-white";

function Field({ label, hint, className, children }: { label: string; hint?: string; className?: string; children: ReactNode }) {
  return (
    <label className={`flex flex-col gap-1 ${className ?? ""}`}>
      <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#5c4d3c]">{label}</span>
      {children}
      {hint && <span className="text-xs text-[#8a7560]">{hint}</span>}
    </label>
  );
}

type Props = {
  initial: Draft;
  style: Style;
  lang: Lang;
  isEdit: boolean;
  duplicate: boolean;
  onSave: (d: Draft) => void;
  onCancel: () => void;
};

export function RefEditor({ initial, style, lang, isEdit, duplicate, onSave, onCancel }: Props) {
  const [d, setD] = useState<Draft>(initial);
  const [authorsText, setAuthorsText] = useState(() => authorsToText(initial.authors));

  function set<K extends keyof Draft>(key: K, value: Draft[K]) {
    setD((prev) => ({ ...prev, [key]: value }));
  }

  const text = (key: "year" | "month" | "day" | "container" | "volume" | "issue" | "pages" | "publisher" | "place" | "edition" | "isbn" | "doi" | "url" | "accessed" | "institution") => ({
    value: d[key] ?? "",
    onChange: (e: { target: { value: string } }) => set(key, e.target.value.trim() ? e.target.value : undefined),
  });

  function setType(type: RefType) {
    setD((prev) => ({
      ...prev,
      type,
      accessed: type === "web" && !prev.accessed ? todayIso() : prev.accessed,
      thesisKind: type === "thesis" && !prev.thesisKind ? "skripsi" : prev.thesisKind,
    }));
  }

  const preview = { ...d, id: "preview", title: d.title || "Judul" };
  const canSave = d.title.trim().length > 0;
  const containerLabel = d.type === "journal" ? "Nama jurnal" : d.type === "web" ? "Nama situs" : "Repositori (opsional)";

  return (
    <section className="border border-[#e7e2d9] bg-white p-5 shadow-[0_12px_40px_rgba(28,25,23,0.06)] sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-serif text-2xl leading-none font-light tracking-[-0.03em]">{isEdit ? "Edit referensi" : "Periksa & lengkapi data"}</h2>
        <div className="flex flex-wrap border border-[#241c14]">
          {TYPES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setType(t.id)}
              className={`px-3 py-1.5 text-xs font-medium transition ${d.type === t.id ? "bg-[#241c14] text-[#fff8ee]" : "text-[#5c4d3c] hover:bg-[#f3e6d0]"}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {duplicate && (
        <p className="mt-4 border border-[#c4a574] bg-[#f8efd4] px-3 py-2 text-sm text-[#6b4e16]">
          Referensi ini sepertinya sudah ada di daftar pustaka Anda.
        </p>
      )}

      <div className="mt-5 grid gap-4 sm:grid-cols-6">
        <Field
          label="Penulis (satu per baris)"
          hint="Format: Nama Belakang, Nama Depan. Nama tunggal cukup ditulis apa adanya."
          className="sm:col-span-6"
        >
          <textarea
            rows={Math.min(Math.max(authorsText.split("\n").length, 2), 6)}
            className={inputClass}
            placeholder={"Santoso, Budi\nWijaya, Siti Rahma"}
            value={authorsText}
            onChange={(e) => {
              setAuthorsText(e.target.value);
              set("authors", authorsFromText(e.target.value));
            }}
          />
        </Field>

        <Field label="Judul" className="sm:col-span-6">
          <div className="flex gap-2">
            <input className={inputClass} value={d.title} onChange={(e) => set("title", e.target.value)} placeholder="Judul artikel, buku, atau halaman" />
            <button type="button" title="Huruf kapital hanya di awal kalimat (dianjurkan APA)" onClick={() => set("title", toSentenceCase(d.title))} className="shrink-0 border border-[#241c14] px-2 text-xs text-[#241c14] hover:bg-[#f3e6d0]">
              Aa.
            </button>
            <button type="button" title="Setiap Kata Diawali Huruf Kapital" onClick={() => set("title", toTitleCase(d.title))} className="shrink-0 border border-[#241c14] px-2 text-xs text-[#241c14] hover:bg-[#f3e6d0]">
              Aa Aa
            </button>
          </div>
        </Field>

        <Field label="Tahun" className="sm:col-span-2">
          <input className={inputClass} inputMode="numeric" placeholder="2024" {...text("year")} />
        </Field>
        <Field label="Bulan" className="sm:col-span-2">
          <select className={inputClass} {...text("month")}>
            <option value="">—</option>
            {MONTHS.id.map((m, i) => (
              <option key={m} value={String(i + 1)}>{m}</option>
            ))}
          </select>
        </Field>
        <Field label="Tanggal" className="sm:col-span-2">
          <input className={inputClass} inputMode="numeric" placeholder="—" {...text("day")} />
        </Field>

        {d.type !== "book" && (
          <Field label={containerLabel} className="sm:col-span-6">
            <input className={inputClass} {...text("container")} />
          </Field>
        )}

        {d.type === "journal" && (
          <>
            <Field label="Volume" className="sm:col-span-2">
              <input className={inputClass} {...text("volume")} />
            </Field>
            <Field label="Nomor (issue)" className="sm:col-span-2">
              <input className={inputClass} {...text("issue")} />
            </Field>
            <Field label="Halaman" className="sm:col-span-2">
              <input className={inputClass} placeholder="12–25" {...text("pages")} />
            </Field>
          </>
        )}

        {d.type === "book" && (
          <>
            <Field label="Penerbit" className="sm:col-span-3">
              <input className={inputClass} placeholder="Gramedia Pustaka Utama" {...text("publisher")} />
            </Field>
            <Field label="Kota terbit" className="sm:col-span-3">
              <input className={inputClass} placeholder="Jakarta" {...text("place")} />
            </Field>
            <Field label="Edisi" hint="Isi angka, mis. 2" className="sm:col-span-3">
              <input className={inputClass} {...text("edition")} />
            </Field>
            <Field label="ISBN" className="sm:col-span-3">
              <input className={inputClass} {...text("isbn")} />
            </Field>
          </>
        )}

        {d.type === "thesis" && (
          <>
            <Field label="Jenis" className="sm:col-span-2">
              <select className={inputClass} value={d.thesisKind ?? "skripsi"} onChange={(e) => set("thesisKind", e.target.value as ThesisKind)}>
                <option value="skripsi">Skripsi</option>
                <option value="tesis">Tesis</option>
                <option value="disertasi">Disertasi</option>
              </select>
            </Field>
            <Field label="Universitas" className="sm:col-span-2">
              <input className={inputClass} placeholder="Universitas Indonesia" {...text("institution")} />
            </Field>
            <Field label="Kota" className="sm:col-span-2">
              <input className={inputClass} {...text("place")} />
            </Field>
          </>
        )}

        <Field label="DOI" className="sm:col-span-3">
          <input className={inputClass} placeholder="10.xxxx/xxxxx" {...text("doi")} />
        </Field>
        <Field label="URL" className="sm:col-span-3">
          <input className={inputClass} placeholder="https://" {...text("url")} />
        </Field>

        {(d.type === "web" || d.type === "thesis") && (
          <Field label="Tanggal diakses" className="sm:col-span-3">
            <input type="date" className={inputClass} {...text("accessed")} />
          </Field>
        )}
      </div>

      <div className="mt-6 border border-dashed border-[#9b2c2c] bg-[#fffdf8] p-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#9b2c2c]">Pratinjau</p>
        <p className="mt-2 pl-8 -indent-8 text-[15.5px] leading-[1.7] font-light text-[#241c14] font-serif">
          {style === "ieee" && "[1] "}
          <CitationText parts={formatReference(preview, style, lang)} />
        </p>
        <p className="mt-2 text-sm text-[#5c4d3c]">
          Kutipan dalam teks: <span className="font-medium text-[#241c14]">{inTextCitation(preview, style, lang, 1)}</span>
        </p>
      </div>

      <div className="mt-5 flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-medium text-[#5c4d3c] hover:bg-[#f3e6d0]">
          Batal
        </button>
        <button
          type="button"
          disabled={!canSave}
          onClick={() => onSave({ ...d, title: d.title.trim() })}
          className="border border-[#241c14] bg-[#241c14] px-4 py-2 text-sm font-medium text-[#fff8ee] transition hover:bg-[#9b2c2c] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isEdit ? "Simpan perubahan" : "Tambahkan ke daftar pustaka"}
        </button>
      </div>
    </section>
  );
}
