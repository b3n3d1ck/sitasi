# Sitasi

Generator daftar pustaka yang aku buat karena capek ngerapikan sitasi skripsi satu-satu. Tempel DOI, ISBN, atau link jurnal, hasilnya keluar dalam format APA 7, IEEE, atau Harvard, terus bisa langsung ditempel ke Word (huruf miring dan hanging indent-nya ikut).

Coba di sini: [sitasi-one.vercel.app](https://sitasi-one.vercel.app)

Repo ini publik dan gratis. Tidak perlu daftar akun.

## Kenapa dibuat

Dosen sering coret daftar pustaka karena koma, tahun, atau "dkk."-nya salah. Tools yang ada kebanyakan bahasa Inggris, banyak iklannya, dan jurnal kampus (OJS / SINTA) sering tidak kebaca. Sitasi coba nutup itu.

## Yang bisa dilakukan

- Tempel DOI (`10.xxxx/...`), ISBN, atau link artikel. Penulis, tahun, jurnal, volume, dan halaman terisi sendiri.
- Link jurnal OJS (yang dipakai sebagian besar jurnal SINTA dan Garuda) kebaca dari metadata halamannya.
- Jenis referensi: artikel jurnal, buku, halaman web, skripsi, tesis, disertasi.
- Keterangan bisa Bahasa Indonesia (`dkk.`, `t.t.`, `Diakses`, `Edisi ke-2`) atau Inggris.
- Kutipan dalam teks ikut dibuat, misalnya `(Saputra dkk., 2023)` atau `[1]`.
- Salin semua, atau unduh sebagai BibTeX dan `.txt`.
- Daftarnya disimpan di browser, bukan di server.

## Contoh

Dari link artikel UGM: `https://journal.ugm.ac.id/v3/JISE/article/view/6378`

APA 7:

> Saputra, Y. M., Alfian, G., & Octava, M. Q. H. (2023). Perancangan Federated Learning Berbasis Homomorphic Encryption untuk Perangkat Internet of Things. *Journal of Internet and Software Engineering*, *4*(1), 1–5. https://doi.org/10.22146/jise.v4i1.6378

Dalam teks: (Saputra dkk., 2023)

## Cara pakai

1. Tempel DOI, ISBN, atau link di kolom pencarian. Contoh:
   - `10.1038/nature14539`
   - `https://doi.org/10.22146/ijccs.86118`
   - `978-0-262-03561-3`
   - `https://journal.ugm.ac.id/v3/JISE/article/view/6378`
2. Cek datanya. Kalau judulnya kapital semua, ada tombol untuk merapikan huruf.
3. Tambahkan ke daftar pustaka, pilih gayanya, lalu salin ke dokumen.

Kalau tidak ada DOI atau link (skripsi cetak, buku lama), pakai **Isi manual**.

Hasil otomatis tidak selalu sempurna. Nama penulis dan huruf judul kadang ikut sumbernya. Tetap cocokkan dengan pedoman kampus, karena banyak kampus memodifikasi APA atau Harvard.

## Jalankan di komputer sendiri

Butuh Node.js 20 ke atas.

```bash
git clone https://github.com/b3n3d1ck/sitasi.git
cd sitasi
npm install
npm run dev
```

Buka http://localhost:3000.

## Isi foldernya

```
src/
├── app/api/lookup/route.ts   pencarian DOI, ISBN, dan link
├── lib/format.ts             aturan APA 7, IEEE, Harvard
├── lib/bibtex.ts             ekspor BibTeX
├── lib/store.ts              simpan daftar di browser
└── lib/lookup/               ambil metadata, plus penolakan link ke alamat lokal
```

## Belum ada, tapi rencananya

- Undang-undang dan peraturan
- Bab buku suntingan, buku terjemahan, prosiding
- Berita, YouTube, wawancara
- Profil pedoman kampus (kalau ada yang kirim PDF pedomannya)
- MLA, Chicago, Vancouver
- Impor BibTeX / RIS

Kalau pedoman kampusmu beda, buka [issue](https://github.com/b3n3d1ck/sitasi/issues/new) dan lampirkan contoh yang benar. Laporan sitasi yang keliru juga boleh, sertakan inputnya dan hasil yang seharusnya.

## English

Sitasi is a small open-source citation generator for Indonesian students. Paste a DOI, ISBN, or article URL (including OJS journals) and get APA 7, IEEE, or Harvard references you can paste into Word. No account, no ads. The bibliography stays in your browser.

Dibuat oleh [b3n3d1ck](https://github.com/b3n3d1ck). Lisensi [MIT](LICENSE).
