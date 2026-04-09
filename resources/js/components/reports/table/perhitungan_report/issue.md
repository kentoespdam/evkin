# Issue & Optimization Plan — `perhitungan_report`

Dokumen ini berisi temuan **bug** dan **peluang optimasi** pada direktori
`resources/js/components/reports/table/perhitungan_report/` beserta hook
`use-perhitungan-report.ts`. Ditujukan sebagai panduan pengerjaan bagi junior
developer atau AI model kecil.

---

## Bagian 1 — Bug yang Ditemukan

### BUG-01 · Struktur HTML Tabel Tidak Valid (`index.tsx`)

**Tingkat keparahan: Tinggi**

**Apa yang terjadi?**
Komponen `PerhitunganSections` (yang merender header dan body aspek) diletakkan
sebagai *sibling* langsung di dalam elemen `<Table>`, tanpa dibungkus oleh
`<TableBody>` atau `<TableHeader>`. Ini melanggar spesifikasi HTML tabel yang
valid: anak langsung dari `<table>` hanya boleh berupa elemen semantik tabel
(`<thead>`, `<tbody>`, `<tfoot>`, `<caption>`, atau `<colgroup>`).

Browser akan berusaha memperbaiki struktur ini secara otomatis, tetapi
hasilnya tidak dapat diprediksi — baris bisa muncul di tempat yang salah atau
kalkulasi `colSpan`/`rowSpan` menjadi kacau.

**Di mana?**
- `index.tsx`, baris 36–46: `groupedData.map(...)` langsung merender
  `<PerhitunganSections>` sebagai anak `<Table>`.

**Langkah perbaikan:**
1. Bungkus keseluruhan blok `groupedData.map(...)` dan baris pemisah di dalam
   sebuah `<React.Fragment>` **atau** pertahankan posisinya, tetapi pastikan
   bahwa setiap `PerhitunganSections` mengeluarkan elemen HTML tabel yang
   *valid* secara semantik (misalnya `<TableHeader>`, `<TableBody>`).
2. Pastikan `<TableFooter>` dari `TotalSection` benar-benar menjadi elemen
   terakhir di dalam `<Table>`, karena secara semantik `<tfoot>` harus
   berada setelah semua `<tbody>`.

---

### BUG-02 · Kalkulasi `performanceByMonthAndYear` Ditimpa Setiap Aspek (`use-perhitungan-report.ts`)

**Tingkat keparahan: Sedang**

**Apa yang terjadi?**
Pada bagian agregasi akhir (baris ~169), untuk setiap pasangan `(tahun-bulan)`,
nilai predikat kinerja (`penilaian`) dihitung dari `nilaiKinerja` *satu aspek*
saja, lalu langsung di-`set` ke dalam `performanceByMonthAndYear`. Akibatnya,
predikat pada iterasi aspek terakhir **menimpa** predikat aspek sebelumnya.

Yang benar adalah predikat kinerja (Sangat Baik, Baik, dll.) dihitung dari
**total kumulatif** seluruh aspek, bukan dari nilai aspek tunggal.

**Di mana?**
- `use-perhitungan-report.ts`, baris ~168–170 (di dalam `groupedMasterReportsByAspect.forEach`).

**Langkah perbaikan:**
1. Hapus penghitungan predikat dari dalam loop aspek.
2. Setelah loop aspek selesai dan `nilaiKinerjaTotalByMonthAndYear` sudah final,
   lakukan iterasi terhadap map tersebut untuk menghitung predikat dari total
   kumulatif masing-masing bulan.
3. Hapus juga baris yang menulis ulang `performanceByMonthAndYear` untuk bulan
   terakhir secara terpisah (baris ~179), karena langkah di atas sudah
   menangani seluruh bulan termasuk bulan terakhir.

---

### BUG-03 · Risiko Crash pada `aspectName` (`total_nilai_section.tsx`)

**Tingkat keparahan: Sedang**

**Apa yang terjadi?**
Nama aspek diproses dengan `.split(".")[1].trim().toUpperCase()`. Jika nama
aspek tidak mengandung karakter titik (`.`), maka `split(".")[1]` akan
mengembalikan `undefined`, dan memanggil `.trim()` pada `undefined` akan
menyebabkan error runtime yang menghentikan rendering.

**Di mana?**
- `total_nilai_section.tsx`, baris 26.

**Langkah perbaikan:**
1. Tambahkan pengecekan keamanan: gunakan *optional chaining* (`?.`) saat
   mengakses index `[1]`, lalu sediakan nilai *fallback* (misalnya nama aspek
   asli) jika hasilnya `undefined`.

---

### BUG-04 · Key Map Tidak Konsisten untuk Aspek dengan UUID Panjang (`use-perhitungan-report.ts`)

**Tingkat keparahan: Rendah–Sedang**

**Apa yang terjadi?**
Key yang digunakan untuk `totalNilaiByMonthAndYear` dan
`totalKinerjaByMonthAndYear` adalah `${aspectId}-${year}-${month}`. Ketika
key ini diparsing dengan `.split("-")`, akan terjadi ambiguitas jika `aspectId`
sudah mengandung karakter `-` (misalnya UUID seperti `a1b2-c3d4`). Hasilnya,
pengambilan `year` dan `month` dari `splitKey[1]` dan `splitKey[2]` akan
menghasilkan nilai yang salah.

**Di mana?**
- `use-perhitungan-report.ts`, baris ~96 dan ~161.

**Langkah perbaikan:**
1. Gunakan separator yang tidak mungkin ada dalam ID, misalnya `|` (pipe):
   `${aspectId}|${year}|${month}`.
2. Perbarui semua tempat yang membaca atau membangun key yang sama agar
   menggunakan separator baru secara konsisten.
3. Periksa juga format key di komponen `total_nilai_section.tsx` dan
   `total_nilai_cells.tsx` yang mengkonsumsi map yang sama.

---

### BUG-05 · `NilaiTahunLalu` Mencari Key dengan Bulan 12 Tanpa Jaminan Data Ada

**Tingkat keparahan: Rendah**

**Apa yang terjadi?**
Komponen `NilaiTahunLalu` dan `TotalSection` mencari data tahun lalu dengan
key bulan `12` (`${id}-${year-1}-12`). Jika data laporan tahun lalu tidak
diinput sampai bulan Desember, data tidak akan ditemukan dan tampilan akan
menunjukkan "-" tanpa penjelasan. Ini bukan crash, tetapi dapat menyesatkan
pengguna.

**Di mana?**
- `nilai_tahun_lalu_cells.tsx`, baris 12.
- `total_nilai_section.tsx`, baris 27–28.
- `total_section.tsx`, baris 23–24.

**Catatan:** Pengambilan bulan 12 tahun lalu adalah *by design* dan rule ini sudah benar. Yang perlu dipastikan adalah kode tidak crash ketika data bulan 12 tersebut belum tersedia.

**Langkah perbaikan:**
1. Pastikan semua akses ke Map menggunakan nilai *default* yang aman. Jika
   `Map.get(key)` mengembalikan `undefined`, komponen harus menampilkan
   fallback visual (misalnya tanda `-`) tanpa melempar error.
2. Hindari melakukan operasi aritmetika atau string operation langsung pada
   nilai yang mungkin `undefined`. Gunakan *nullish coalescing* (`?? 0` atau
   `?? "-"`) sebelum diproses lebih lanjut.
3. Tambahkan tooltip kecil di sel yang kosong untuk memberi tahu pengguna
   bahwa data Desember tahun lalu belum tersedia, agar tampilan tidak
   terasa ambigu.

---

## Bagian 2 — Optimasi Kode

### OPT-01 · Kompleksitas Loop O(n×m) pada Hook Utama

**Prioritas: Tinggi**

**Apa masalahnya?**
Di dalam hook `usePerhitunganData`, terdapat loop berlapis: untuk setiap
master report dalam sebuah aspek, dilakukan iterasi terhadap *seluruh* daftar
`reports`. Jika data besar, ini menjadi operasi O(n×m) yang mahal.

**Langkah optimasi:**
1. Sebelum loop aspek dimulai, bangun sebuah Map dengan key `masterReportId`
   yang mengelompokkan semua report detail ke dalamnya.
2. Gunakan Map tersebut di dalam loop untuk langsung mengakses report yang
   relevan, sehingga kompleksitas turun menjadi O(n+m).

---

### OPT-02 · `monthsList()` Dipanggil Setiap Render di Root Component

**Prioritas: Sedang**

**Apa masalahnya?**
Di `index.tsx`, `monthsList()` dipanggil di dalam `useMemo`. Ini sudah benar,
tetapi karena daftar bulan bersifat **konstan** (tidak bergantung props atau
state apapun), ia bisa diekstrak menjadi konstanta modul-level yang hanya
dihitung sekali saat file di-load, bukan setiap kali komponen di-mount.

**Langkah optimasi:**
1. Deklarasikan `const MONTHS = monthsList()` di luar komponen (di level modul).
2. Hapus `useMemo` yang membungkusnya di dalam komponen.

---

### OPT-03 · `TotalSection` dan `PerhitunganReportTotalNilai` Tidak Dibungkus `memo`

**Prioritas: Sedang**

**Apa masalahnya?**
Komponen `TotalSection` dan `PerhitunganReportTotalNilai` tidak menggunakan
`React.memo`, meskipun komponen sibling mereka (`PerhitunganSections`,
`BasicInfoCells`, dll.) sudah menggunakannya. Akibatnya, kedua komponen ini
akan selalu dirender ulang setiap kali parent merender, meskipun datanya tidak
berubah. Padahal kedua komponen ini bisa menerima Map berukuran besar.

**Langkah optimasi:**
1. Bungkus `TotalSection` dan `PerhitunganReportTotalNilai` dengan
   `React.memo`.
2. Pastikan props yang diterimanya (terutama Map) merupakan referensi yang
   stabil. Jika tidak, `memo` tidak akan efektif karena Map selalu dianggap
   "berubah" oleh perbandingan referensial. Ini terkait erat dengan OPT-04.

---

### OPT-04 · Map Dibuat Ulang Setiap Render Tanpa Kontrol Referensi di Hook

**Prioritas: Sedang**

**Apa masalahnya?**
Meskipun hook sudah menggunakan `useMemo`, jika salah satu dependensinya
(seperti array `reports` atau `aspects`) berubah referensi tanpa berubah isi,
seluruh komputasi berat akan dijalankan ulang. Ini sering terjadi ketika
komponen parent merender ulang dan membuat array baru setiap saat.

**Langkah optimasi:**
1. Pastikan di komponen yang memanggil `usePerhitunganData`, props `reports`,
   `aspects`, dan `masterReports` dibungkus dengan `useMemo` atau berasal dari
   state yang stabil (misalnya hasil dari React Query yang sudah terstabilkan).
2. Pertimbangkan penggunaan hook tambahan atau `useRef` untuk memoize
   referensi array jika sumbernya tidak bisa dikontrol.

---

### OPT-05 · Inkonsistensi Tipe Props (Inline vs Named Type)

**Prioritas: Rendah**

**Apa masalahnya?**
Beberapa komponen mendefinisikan tipe props secara inline untuk `months`:
`{ value: number; label: string }[]`, sementara file lain sudah menggunakan
tipe terpusat `MonthOption` dari `@/lib/utils`. Ini menyebabkan duplikasi
definisi tipe dan tidak konsisten.

**Di mana?**
- `sections.tsx` dan `table_body.tsx` menggunakan tipe inline.
- `total_nilai_section.tsx` dan `total_section.tsx` menggunakan `MonthOption`.

**Langkah optimasi:**
1. Ganti semua definisi inline `{ value: number; label: string }[]` dengan
   `MonthOption[]` dari `@/lib/utils`.
2. Pastikan semua file yang mendefinisikannya mengimpor `MonthOption` secara
   konsisten.

---

### OPT-06 · `PerhitunganReportTableHeader` Dirender Ulang untuk Setiap Aspek

**Prioritas: Rendah**

**Apa masalahnya?**
`PerhitunganReportTableHeader` dipanggil sekali per aspek di dalam
`PerhitunganSections`. Jika aspek ada 5, maka header yang secara visual identik
(sama karena `year`, `months`, dan `templateName` tidak berubah) dirender 5
kali, menghasilkan HTML tabel yang tidak valid (multiple `<thead>` di dalam
satu `<table>`).

**Di mana?**
- `sections.tsx`, baris 25.

**Langkah perbaikan:**
1. Pindahkan `PerhitunganReportTableHeader` ke `index.tsx`, di luar loop
   `groupedData.map(...)`, sehingga hanya dirender sekali.
2. Strukturnya menjadi: satu `<TableHeader>` di atas, diikuti loop aspek yang
   hanya merender body dan total masing-masing aspek.

---

## Urutan Pengerjaan yang Disarankan

| Prioritas | ID | Judul |
|---|---|---|
| 1 | BUG-01 | Perbaiki struktur HTML tabel yang tidak valid |
| 2 | BUG-02 | Perbaiki kalkulasi `performanceByMonthAndYear` |
| 3 | BUG-03 | Tambahkan guard pada parsing nama aspek |
| 4 | BUG-04 | Ganti separator key Map dengan karakter yang aman |
| 5 | OPT-01 | Optimasi loop O(n×m) di hook menjadi O(n+m) |
| 6 | OPT-06 | Pindahkan header tabel ke luar loop aspek |
| 7 | OPT-03 | Tambahkan `React.memo` pada komponen yang belum |
| 8 | OPT-02 | Ekstrak `monthsList` menjadi konstanta modul |
| 9 | OPT-05 | Standarisasi tipe `MonthOption` di seluruh file |
| 10 | BUG-05 | Tambahkan fallback & keterangan untuk data tahun lalu |
| 11 | OPT-04 | Stabilisasi referensi props array di komponen parent |
