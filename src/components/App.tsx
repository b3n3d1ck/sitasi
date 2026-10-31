"use client";

import { useState, type FormEvent } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { Draft, Reference } from "@/lib/types";
import { emptyDraft, newId, updateLibrary, useLibrary, withDefaults } from "@/lib/store";
import { Bibliography } from "./Bibliography";
import { Mark } from "./Mark";
import { RefEditor } from "./RefEditor";

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
  const reduce = useReducedMotion();
  const rise = {
    hidden: { y: reduce ? 0 : 22 },
    show: {
      y: 0,
      transition: { type: "spring" as const, stiffness: 260, damping: 22 },
    },
  };

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
    <motion.div
      className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-8 sm:py-12"
      initial="hidden"
      animate="show"
      variants={reduce ? undefined : { show: { transition: { staggerChildren: 0.08 } } }}
    >
      <motion.header className="flex items-end justify-between gap-4 text-[#1c1917]" variants={rise}>
        <div className="flex items-center gap-3">
          <Mark />
          <div>
            <p className="font-serif text-2xl leading-none font-light tracking-[-0.03em]">Sitasi</p>
            <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.22em] text-[#78716c]">Lembar pustaka</p>
          </div>
        </div>
        <p className="hidden text-right text-xs leading-relaxed text-[#78716c] sm:block">
          APA 7 · IEEE · Harvard
          <br />
          tanpa akun
        </p>
      </motion.header>

      <motion.section className="border border-[#e7e2d9] bg-white shadow-[0_12px_40px_rgba(28,25,23,0.06)]" variants={rise}>
        <div className="border-b border-[#e4d3b4] px-6 py-6 sm:px-8">
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[#9b2c2c]">Untuk skripsi & makalah</p>
          <h1 className="mt-2 max-w-xl font-serif text-4xl leading-[1.12] font-light tracking-[-0.03em] text-[#241c14] sm:text-5xl">
            Daftar pustaka yang tidak dicoret dosen.
          </h1>
          <p className="mt-3 max-w-lg text-[15px] leading-7 font-light text-[#5c4d3c]">
            Tempel DOI, ISBN, atau link jurnal SINTA. Hasilnya memakai dkk., t.t., dan huruf miring yang ikut saat
            ditempel ke Word.
          </p>
        </div>
        <form onSubmit={onSubmit} className="flex flex-col gap-2 border-b border-[#e4d3b4] px-6 py-5 sm:flex-row sm:px-8">
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tempel DOI, ISBN, atau link artikel…"
            className="w-full border border-[#241c14] bg-[#fffdf8] px-4 py-3 text-base outline-none transition focus:bg-white"
          />
          <motion.button
            type="submit"
            disabled={loading || !query.trim()}
            whileHover={reduce || loading || !query.trim() ? undefined : { y: -2, backgroundColor: "#9b2c2c" }}
            whileTap={reduce ? undefined : { scale: 0.97 }}
            animate={loading && !reduce ? { opacity: [1, 0.55, 1] } : { opacity: 1 }}
            transition={loading ? { duration: 0.8, repeat: Infinity } : { type: "spring", stiffness: 400, damping: 20 }}
            className="shrink-0 border border-[#241c14] bg-[#241c14] px-6 py-3 font-medium text-[#fff8ee] disabled:opacity-40"
          >
            {loading ? "Mencari…" : "Buat sitasi"}
          </motion.button>
        </form>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-6 py-3 text-sm text-[#5c4d3c] sm:px-8">
          <span>Coba:</span>
          {EXAMPLES.map((ex) => (
            <button
              key={ex.value}
              type="button"
              onClick={() => {
                setQuery(ex.value);
                void lookup(ex.value);
              }}
              className="underline decoration-[#c4a574] underline-offset-4 hover:text-[#9b2c2c]"
            >
              {ex.label} {ex.value}
            </button>
          ))}
          <button type="button" onClick={() => open(emptyDraft(), null)} className="font-medium text-[#241c14] underline decoration-[#9b2c2c] underline-offset-4">
            Isi manual
          </button>
        </div>
        {error && <p className="mx-6 mb-4 border border-[#9b2c2c] bg-[#fde8e4] px-3 py-2 text-sm text-[#7a221c] sm:mx-8">{error}</p>}
      </motion.section>

      {editing && (
        <motion.div initial={reduce ? false : { y: 18 }} animate={{ y: 0 }} transition={{ type: "spring", stiffness: 260, damping: 24 }}>
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
        </motion.div>
      )}

      <motion.div variants={rise}>
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
      </motion.div>

      <motion.footer className="text-xs leading-relaxed text-[#78716c]" variants={rise}>
        Selalu cek ulang dengan pedoman kampus Anda. Daftar pustaka hanya tersimpan di browser ini.
      </motion.footer>
    </motion.div>
  );
}
