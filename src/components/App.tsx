"use client";

import { useState, type FormEvent } from "react";
import type { Draft, Reference } from "@/lib/types";
import { emptyDraft, newId, updateLibrary, useLibrary, withDefaults } from "@/lib/store";
import { RefEditor } from "./RefEditor";
import { Bibliography } from "./Bibliography";

const EXAMPLES = [
  { label: "DOI", value: "10.1038/nature14539" },
  { label: "ISBN", value: "9780262035613" },
];

type Editing = { draft: Draft; id: string | null; key: number };

export function App() {
  const { items, style, lang } = useLibrary();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Editing | null>(null);

  const open = (draft: Draft, id: string | null) => setEditing({ draft, id, key: Date.now() });

  async function lookup(value: string) {
    const q = value.trim();
    if (!q) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/lookup?q=${encodeURIComponent(q)}`);
      const data = (await res.json()) as { draft?: Draft; error?: string };
      if (!res.ok || !data.draft) throw new Error(data.error ?? "Gagal mengambil data.");
      open(withDefaults(data.draft), null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengambil data.");
    } finally {
      setLoading(false);
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    void lookup(query);
  }

  function save(d: Draft) {
    const id = editing?.id;
    updateLibrary((s) => ({
      ...s,
      items: id ? s.items.map((it) => (it.id === id ? { ...d, id } : it)) : [...s.items, { ...d, id: newId() }],
    }));
    setEditing(null);
    setQuery("");
  }

  const draft = editing?.draft;
  const duplicate =
    !!draft &&
    !editing?.id &&
    items.some(
      (it) =>
        (draft.doi && it.doi?.toLowerCase() === draft.doi.toLowerCase()) ||
        it.title.trim().toLowerCase() === draft.title.trim().toLowerCase(),
    );

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-10 sm:py-16">
      <header className="text-center">
        <p className="text-sm font-semibold tracking-wide text-emerald-700">SITASI</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Daftar pustaka rapi dalam hitungan detik</h1>
        <p className="mx-auto mt-3 max-w-2xl text-zinc-600">
          Tempel DOI, ISBN, atau link jurnal (termasuk jurnal OJS/SINTA). Hasilnya siap dalam format APA 7, IEEE, atau
          Harvard. Gratis, tanpa daftar akun.
        </p>
      </header>

      <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
        <form onSubmit={onSubmit} className="flex flex-col gap-2 sm:flex-row">
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tempel DOI, ISBN, atau link artikel di sini…"
            className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-base outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="shrink-0 rounded-xl bg-emerald-700 px-6 py-3 font-medium text-white transition hover:bg-emerald-800 disabled:opacity-50"
          >
            {loading ? "Mencari…" : "Buat sitasi"}
          </button>
        </form>
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-zinc-500">
          <span>Coba:</span>
          {EXAMPLES.map((ex) => (
            <button
              key={ex.value}
              type="button"
              onClick={() => {
                setQuery(ex.value);
                void lookup(ex.value);
              }}
              className="text-emerald-700 underline-offset-2 hover:underline"
            >
              {ex.label} {ex.value}
            </button>
          ))}
          <span className="hidden sm:inline">·</span>
          <button type="button" onClick={() => open(emptyDraft(), null)} className="font-medium text-zinc-700 underline-offset-2 hover:underline">
            Isi manual
          </button>
        </div>
        {error && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      </section>

      {editing && (
        <RefEditor
          key={editing.key}
          initial={editing.draft}
          style={style}
          lang={lang}
          isEdit={!!editing.id}
          duplicate={duplicate}
          onSave={save}
          onCancel={() => setEditing(null)}
        />
      )}

      <Bibliography
        items={items}
        style={style}
        lang={lang}
        onEdit={(r: Reference) => {
          const { id, ...rest } = r;
          open(rest, id);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      />

      <footer className="pt-4 text-center text-xs text-zinc-400">
        Selalu cek ulang hasilnya dengan pedoman kampus Anda. Data daftar pustaka hanya disimpan di browser ini.
      </footer>
    </div>
  );
}
