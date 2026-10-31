<div align="center">

# 📚 Sitasi

### Generator daftar pustaka gratis untuk mahasiswa Indonesia

**Tempel DOI, ISBN, atau link jurnal → dapatkan sitasi APA 7, IEEE, atau Harvard dalam hitungan detik.**
Siap tempel ke Word, lengkap dengan huruf miring dan hanging indent.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/b3n3d1ck/sitasi?style=social)](https://github.com/b3n3d1ck/sitasi/stargazers)

[Fitur](#-fitur) · [Contoh hasil](#-contoh-hasil) · [Cara pakai](#-cara-pakai) · [Jalankan sendiri](#-jalankan-sendiri) · [Roadmap](#-roadmap) · [English](#-english)

</div>

---

## 😩 Masalahnya

Setiap mahasiswa pernah mengalaminya: skripsi sudah selesai, tapi **daftar pustaka dicoret dosen** karena format salah. Koma kurang, tahun salah posisi, judul jurnal tidak miring, "dkk." ditulis "et al."…

Generator sitasi yang ada kebanyakan berbahasa Inggris, penuh iklan, wajib daftar akun, dan **tidak mengenali jurnal Indonesia**.

## ✨ Solusinya

**Sitasi** dibuat khusus untuk mahasiswa Indonesia:

| | |
|---|---|
| 🔎 **Cari otomatis** | Tempel DOI, ISBN, atau link artikel. Penulis, tahun, jurnal, volume, nomor, dan halaman terisi sendiri. |
| 🇮🇩 **Paham jurnal Indonesia** | Membaca metadata jurnal **OJS** yang dipakai hampir semua jurnal **SINTA** dan **Garuda**. |
| 🎓 **Skripsi, tesis, disertasi** | Didukung sebagai jenis referensi tersendiri, bukan diakali sebagai "buku". |
| 🗣️ **Bahasa Indonesia** | `dkk.`, `t.t.`, `Diakses ... dari`, `Edisi ke-2`. Bisa diganti ke bahasa Inggris dengan satu klik. |
| 📋 **Siap tempel ke Word** | Huruf miring dan hanging indent ikut tersalin ke Word dan Google Docs. |
| ✍️ **Kutipan dalam teks** | `(Saputra dkk., 2023)` atau `[1]` dibuat otomatis untuk setiap referensi. |
| 🔒 **Tanpa akun, tanpa iklan** | Daftar pustaka disimpan di browser Anda sendiri. |
| 📤 **Ekspor BibTeX** | Untuk pengguna LaTeX, Overleaf, Mendeley, dan Zotero. |

## 🚀 Fitur

- **3 gaya sitasi paling populer:** APA 7th Edition, IEEE, dan Harvard (*Cite Them Right*).
- **4 jenis referensi:** artikel jurnal, buku, halaman web, skripsi/tesis/disertasi.
- **Sumber data:**
  - DOI → [doi.org](https://doi.org) (Crossref, DataCite, dan lainnya)
  - ISBN → [Google Books](https://books.google.com) + [Open Library](https://openlibrary.org)
  - Link artikel → tag `citation_*` (OJS, Highwire) dan `og:*` untuk website biasa
- **Perapih judul:** ubah ke *Huruf kalimat* (dianjurkan APA) atau *Huruf Judul*. Akronim seperti `UMKM` dan `IndoBERT` tetap utuh.
- **Pengurutan otomatis:** alfabetis untuk APA/Harvard, urutan kutipan untuk IEEE.
- **Deteksi duplikat** saat menambahkan referensi yang sama dua kali.
- **Aman:** pengambil link dilindungi dari SSRF (alamat lokal/privat diblokir, redirect divalidasi ulang, ukuran dibatasi).

## 👀 Contoh hasil

Input: `https://journal.ugm.ac.id/v3/JISE/article/view/6378`

**APA 7**
> Saputra, Y. M., Alfian, G., & Octava, M. Q. H. (2023). Perancangan Federated Learning Berbasis Homomorphic Encryption untuk Perangkat Internet of Things. *Journal of Internet and Software Engineering*, *4*(1), 1–5. https://doi.org/10.22146/jise.v4i1.6378
>
> Dalam teks: (Saputra dkk., 2023)

**IEEE**
> [1] Y. M. Saputra, G. Alfian, dan M. Q. H. Octava, “Perancangan Federated Learning Berbasis Homomorphic Encryption untuk Perangkat Internet of Things,” *Journal of Internet and Software Engineering*, vol. 4, no. 1, pp. 1–5, Mei 2023, doi: 10.22146/jise.v4i1.6378.

**Harvard**
> Saputra, Y.M., Alfian, G. dan Octava, M.Q.H. (2023) ‘Perancangan Federated Learning Berbasis Homomorphic Encryption untuk Perangkat Internet of Things’, *Journal of Internet and Software Engineering*, 4(1), pp. 1–5. Tersedia di: https://doi.org/10.22146/jise.v4i1.6378.

Contoh skripsi (APA 7):
> Wijaya, S. R. (2024). *Analisis sentimen ulasan aplikasi menggunakan IndoBERT* [Skripsi, Universitas Telkom]. https://repository.telkomuniversity.ac.id/...

## 📝 Cara pakai

1. Tempel salah satu dari ini ke kolom pencarian:

   | Jenis | Contoh |
   |---|---|
   | DOI | `10.1038/nature14539` |
   | Link DOI | `https://doi.org/10.22146/ijccs.86118` |
   | ISBN | `978-0-262-03561-3` |
   | Link jurnal OJS | `https://journal.ugm.ac.id/v3/JISE/article/view/6378` |
   | Website / berita | `https://www.kompas.com/edu/read/...` |

2. Periksa dan lengkapi data di editor. Pratinjau sitasi berubah langsung saat Anda mengetik.
3. Klik **Tambahkan ke daftar pustaka**.
4. Pilih gaya (APA 7 / IEEE / Harvard), lalu klik **Salin semua** dan tempel ke dokumen Anda.

> [!TIP]
> Tidak punya DOI atau link? Gunakan **Isi manual**, misalnya untuk skripsi cetak atau buku lama.

## 💻 Jalankan sendiri

Butuh [Node.js](https://nodejs.org) 20 atau lebih baru.

```bash
git clone https://github.com/b3n3d1ck/sitasi.git
cd sitasi
npm install
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

Deploy gratis ke Vercel:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fb3n3d1ck%2Fsitasi)

### Struktur proyek

```
src/
├── app/
│   ├── api/lookup/route.ts   # API: deteksi input lalu ambil metadata
│   └── page.tsx
├── components/               # UI: pencarian, editor, daftar pustaka
└── lib/
    ├── format.ts             # Aturan format APA 7, IEEE, Harvard
    ├── bibtex.ts             # Ekspor BibTeX
    ├── store.ts              # Penyimpanan di browser (localStorage)
    └── lookup/               # DOI, ISBN, dan pembaca link (dengan proteksi SSRF)
```

## 🗺️ Roadmap

- [ ] Undang-undang & peraturan (UU, PP, Permendikbud)
- [ ] Bab dalam buku suntingan, buku terjemahan, prosiding
- [ ] Berita online, video YouTube, wawancara
- [ ] **Profil pedoman kampus** (UI, UGM, ITB, Telkom, dll.)
- [ ] Gaya tambahan: MLA, Chicago, Vancouver
- [ ] Impor dari BibTeX / RIS

Kampus Anda punya pedoman penulisan sendiri? [Buka issue](https://github.com/b3n3d1ck/sitasi/issues/new) dan lampirkan pedomannya, nanti dibuatkan profilnya.

## 🤝 Kontribusi

Kontribusi sangat diterima, terutama:

- Laporan sitasi yang hasilnya keliru (sertakan input dan hasil yang benar)
- Pedoman penulisan kampus
- Jenis referensi dan gaya sitasi baru

1. Fork repo ini
2. Buat branch: `git checkout -b fitur-keren`
3. Commit dan push, lalu buka Pull Request

## ⚠️ Catatan

Data otomatis bisa saja kurang tepat, misalnya nama penulis atau huruf kapital judul. Banyak kampus juga memodifikasi gaya APA/Harvard. **Selalu cek ulang dengan pedoman kampus Anda.**

## ⭐ Dukung proyek ini

Kalau Sitasi menyelamatkan skripsi Anda dari coretan dosen, **beri bintang ⭐** dan bagikan ke teman satu angkatan. Gratis, dan sangat membantu proyek ini ditemukan mahasiswa lain.

---

## 🌏 English

**Sitasi** is a free, open-source **citation and bibliography generator** built for Indonesian students. Paste a **DOI, ISBN, or article URL** (including Indonesian OJS/SINTA journals) and get **APA 7, IEEE, or Harvard** references with in-text citations, ready to paste into Word with italics and hanging indents preserved. Supports theses, Indonesian or English labels (`dkk.`/`et al.`), BibTeX export, and stores everything locally in your browser. No sign-up, no ads.

---

<div align="center">

Dibuat dengan ☕ oleh [Abraham Benedick](https://github.com/b3n3d1ck) · Lisensi [MIT](LICENSE)

<sub>Kata kunci: generator daftar pustaka, cara membuat daftar pustaka otomatis, sitasi APA 7, sitasi IEEE, Harvard referencing, citation generator Indonesia, alternatif Mendeley, daftar pustaka skripsi, kutipan jurnal SINTA</sub>

</div>
