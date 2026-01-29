# Hitung Input Tahunan Helper

buat class untuk menghitung hasil input dari TransaksiInputs berdasarkan tahun input.

## Langkah-langkah Implementasi
1. **Buat Helper Class**: Buat class `HitungInputTahunanHelper` di folder `helpers` yang akan menangani logika perhitungan.
2. **Metode Perhitungan**: Tambahkan metode `hitungTotalTahunan` yang menerima parameter `year` (tahun) untuk menghitung total input tahunan.
3. **Query Database Master Inputs**: Gunakan model `MasterInput` untuk mengambil seq, kode, description, satuan, master_source_id dan formula
4. **Query Database Transaksi Inputs**: Gunakan model `TransaksiInput` untuk mengambil data input berdasarkan tahun yang diberikan.
5. **Hitung Total**: Loop melalui setiap `MasterInput`, lalu hitung total dari `TransaksiInput` yang sesuai dengan `kode` dan perhitungan berdasarkan `formula`, gunakan array_reduce atau struktur kontrol kondisional untuk menangani berbagai jenis formula seperti SUM, LAST, MAX, dll. 
```php
  $total=array_reduce($transaksiInputs, function($carry, $item) use ($masterInput) {
    if($item->master_input_id !== $masterInput->id) {
        return $carry;
    }
    switch ($masterInput->formula) {
        case 'SUM':
            return $carry + $item->nilai;
        case 'MAX':
            return max($carry, $item->nilai);
        case 'LAST':
            return $item->nilai; // Asumsikan data sudah diurutkan berdasarkan tanggal
        // Tambahkan formula lain sesuai kebutuhan
        default:
            return $carry;
    }
  }, 0);
```
6. **Kembalikan Hasil**: Kembalikan hasil perhitungan dalam format aarray sesuai dengan model `RekapInputTahunan`.
```php
## Contoh Struktur Hasil
$hasil = [
  'seq' => $masterInput->seq,
  'kode' => $masterInput->kode,
  'description' => $masterInput->description,
  'satuan' => $masterInput->satuan,
  'master_source_id' => $masterInput->master_source_id,
  'year' => $year,
  'nilai' => $total,
];
```
7. **Simpan Hasil**: Simpan hasil perhitungan ke dalam tabel `rekap_input_tahunans` menggunakan model `RekapInputTahunan` dan metode `upsert` untuk menghindari duplikasi data.
8. **Testing**: Buat unit test untuk memastikan metode perhitungan bekerja dengan benar.

# WARNING:
Pastikan tidak pernah mengeksekusi migrasi ini di lingkungan produksi karena akan menghapus kolom penting dari tabel `rekap_input_tahunans` yang dapat menyebabkan kehilangan data. Gunakan migrasi ini hanya di lingkungan pengembangan atau pengujian di mana data dapat dipulihkan atau tidak kritis.