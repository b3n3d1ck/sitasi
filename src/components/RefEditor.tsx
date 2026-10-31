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
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20";

function Field({ label, hint, className, children }: { label: string; hint?: string; className?: string; children: ReactNode }) {
  return (
    <label className={`flex flex-col gap-1 ${className ?? ""}`}>
      <span className="text-xs font-medium text-zinc-600">{label}</span>
      {children}
      {hint && <span className="text-xs text-zinc-400">{hint}</span>}
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
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-semibold">{isEdit ? "Edit referensi" : "Periksa & lengkapi data"}</h2>
        <div className="flex flex-wrap gap-1 rounded-lg bg-zinc-100 p-1">
          {TYPES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setType(t.id)}
              className={`rounded-md px-3 py-1 text-xs font-medium transition ${d.type === t.id ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-800"}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {duplicate && (
        <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
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
            <button type="button" title="Huruf kapital hanya di awal kalimat (dianjurkan APA)" onClick={() => set("title", toSentenceCase(d.title))} className="shrink-0 rounded-lg border border-zinc-300 px-2 text-xs text-zinc-600 hover:bg-zinc-50">
              Aa.
            </button>
            <button type="button" title="Setiap Kata Diawali Huruf Kapital" onClick={() => set("title", toTitleCase(d.title))} className="shrink-0 rounded-lg border border-zinc-300 px-2 text-xs text-zinc-600 hover:bg-zinc-50">
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

      <div className="mt-6 rounded-xl bg-zinc-50 p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Pratinjau</p>
        <p className="mt-2 pl-8 -indent-8 text-[15px] leading-relaxed text-zinc-900 [font-family:var(--font-serif)]">
          {style === "ieee" && "[1] "}
          <CitationText parts={formatReference(preview, style, lang)} />
        </p>
        <p className="mt-2 text-sm text-zinc-500">
          Kutipan dalam teks: <span className="font-medium text-zinc-800">{inTextCitation(preview, style, lang, 1)}</span>
        </p>
      </div>

      <div className="mt-5 flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100">
          Batal
        </button>
        <button
          type="button"
          disabled={!canSave}
          onClick={() => onSave({ ...d, title: d.title.trim() })}
          className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isEdit ? "Simpan perubahan" : "Tambahkan ke daftar pustaka"}
        </button>
      </div>
    </section>
  );
}
