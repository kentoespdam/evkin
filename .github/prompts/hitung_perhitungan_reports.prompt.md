# Hitung Perhitungan Reports Helper

buat class untuk menghitung hasil laporan perhitungan berdasarkan data dari TransaksiInputs sesuai tahun dan bulan.

# Langkah-langkah Implementasi 
1. **Buat Helper Class**: Buat class `HitungPerhitunganReportsHelper` di folder `helpers` yang akan menangani logika perhitungan laporan.
2. **Metode Perhitungan**: Tambahkan metode `hitungLaporanPerhitungan` yang menerima parameter `year` (tahun) dan `month` (bulan) untuk menghitung laporan perhitungan.
3. **Create Variables**: 
    - `currentPeriode` yang menggabungkan `year` dan `month` dalam format `YYYY-MM-01`.
    - `previousPeriode` yang merupakan bulan sebelumnya dari `currentPeriode`.
4. **Query Database Master Reports**: Gunakan model `MasterReports` untuk mengambil data master laporan.
5. **Query Database Transaksi Inputs**: Gunakan model `TransaksiInput` untuk mengambil data input berdasarkan `currentPeriode` dan `previousPeriode` lalu pisahkan hasilnya ke dalam dua array: `currentInputs` dan `previousInputs`, setiap array berisi pasangan `kode` dan `nilai` yang akan digunakan untuk perhitungan `nilai` dan `nilai_indicator`.
6. **Query Database Rekap Input Tahunan**: Gunakan model `RekapInputTahunans` untuk mengambil data rekap input tahunan berdasarkan `year`, setiap array berisi pasangan `kode` dan `nilai` yang akan digunakan untuk perhitungan `nilai_archivement` dan `nilai_archivement_indicator`.
7. **Query Database Transaksi Inputs Bulan Desember Tahun Sebelumnya**: Gunakan model `TransaksiInput` untuk mengambil data input berdasarkan bulan desember dari tahun sebelumnya, setiap array berisi pasangan `kode` dan `nilai` yang akan digunakan untuk perhitungan `nilai_archivement` dan `nilai_archivement_indicator`.
8. **Hitung Laporan**: Loop melalui setiap `MasterReport`, lalu hitung nilai laporan berdasarkan formula dari field `formula` menggunakan data dari `currentInputs` dan `previousInputs`.
    ## Hitung Nilai Berdasarkan Formula
    - `formula` berupa string yang bersumber dari `kode` di `TransaksiInputs`, misalnya: "( INPUT_A - INPUT_B )" atau "( INPUT_C / INPUT_D ) * 100". tampung formula ini kedalam variabel `formulaValue`.
    - sebelum melakukan perhitungan, ganti setiap `kode` dalam `formulaValue` dengan nilai yang sesuai dari `currentInputs` atau `previousInputs` dengan melakukan explode `formula` berdasarkan spasi.
    - jika kode dengan akhiran `_PREV` menandakan bahwa nilai tersebut diambil dari `previousInputs`, selain itu ambil dari `currentInputs`, sedangkan operator matematika (+, -, *, /, (, )) dibiarkan apa adanya.
    - kembalikan string formula yang sudah diganti nilai-nilainya dengan implode kembali menggunakan spasi.
    - gunakan `FormulaHelper::evaluateFormula($formulaValue)` untuk menghitung hasil dari formula yang sudah diubah. dan cek serta optimasi `FormulaHelper` jika diperlukan.
    - hasil perhitungan disimpan dalam variabel `nilai`.

    ## Hitung Nilai Indikator Berdasarkan Formula Indikator
    - `formula_indicator` berupa string yang bersumber dari `kode` di `TransaksiInputs` dan jika null berikan empty string, contoh formula indikator: 
      ```
        GT 10 = 5;
        GT 7 AND LTE 10 = 4;
        GT 3 AND LTE 7 = 3;
        GT 0 AND LTE 3 = 2;
        LTE 0 = 1;
      ``` 
      tampung formula ini kedalam variabel `nilaiIndicator` kemudian hitung nilai menggunakan fungsi.
      ```php
        FormulaIndicatorHelper::evaluateFormula(
          $formulaIndicator, 
          $nilai
        );
      ```

    ## Hitung Nilai Archivement dan Nilai Indikator Archivement
    - gunakan data dari `RekapInputTahunans` untuk menghitung `nilai_archivement` dan `nilai_archivement_indicator` dengan cara yang sama seperti di atas, namun dengan menggunakan data dari `RekapInputTahunans` sebagai sumber nilai `currentInputs` sedangkan untuk `previousInputs` gunakan data dari `TransaksiInputs` bulan desember tahun sebelumnya.
    - simpan hasil perhitungan `nilai_archivement` dan `nilai_archivement_indicator` ke dalam variabel masing-masing.

8. **Kembalikan Hasil**: Kembalikan hasil perhitungan dalam format array sesuai dengan model `LaporanPerhitungan`.
    ```php
    ## Contoh Struktur Hasil
    $hasil = [
      'master_report_id' => $masterReport->id,
      'year' => $year,
      'month' => $month,
      'desc_indicator' => $masterReport->desc_indicator,
      'formula' => $masterReport->formula,
      'formula_value' => $formulaValue,
      'nilai' => $nilai,
      'nilai_indicator' => $nilaiIndicator,
      'nilai_archivement' => $nilaiArchivement,
      'nilai_archivement_indicator' => $nilaiArchivementIndicator,
    ];
    ```

9. **Simpan Hasil**: Simpan hasil perhitungan ke dalam tabel `perhitungan_reports` menggunakan model `PerhitunganReports` dan metode `upsert` untuk menghindari duplikasi data.

# WARNING:
Pastikan tidak pernah mengeksekusi migrasi ini di lingkungan produksi karena akan menghapus kolom penting dari tabel `rekap_input_tahunans` yang dapat menyebabkan kehilangan data. Gunakan migrasi ini hanya di lingkungan pengembangan atau pengujian di mana data dapat dipulihkan atau tidak kritis.