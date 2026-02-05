## Plan: Excel export Perhitungan Reports

TL;DR: Tambahkan endpoint export untuk report/perhitungan-reports yang meniru struktur data dari detail, gunakan layanan export yang sudah ada, lalu sesuaikan query, format, dan styling Excel agar konsisten dengan contoh detail.

### Steps 4 steps, 5–20 words each
1. Tinjau route dan controller di [routes/report.php](routes/report.php) dan [app/Http/Controllers](app/Http/Controllers) untuk entry report/perhitungan-reports.
2. Petakan data detail di view terkait dari [resources/js/Pages](resources/js/Pages) agar export mengikuti contoh report/perhitungan-reports/detail.
3. Perluas layanan export di [app/Services/PerhitunganReportExportService.php](app/Services/PerhitunganReportExportService.php) dan helper di [app/Helpers/ExcelExportHelper.php](app/Helpers/ExcelExportHelper.php) untuk format/detail.
4. Hubungkan endpoint export ke job/service di [app/Jobs/ProcessExportJob.php](app/Jobs/ProcessExportJob.php) bila pola asinkron dipakai.

### Further Considerations 2 items, 5–25 words each
1. Export ini ingin sinkron (langsung download) atau async lewat job? Opsi A: sync, Opsi B: async.
2. Kolom/format apa yang wajib sama persis dengan detail? Sertakan contoh file Excel jika ada.

Draft rencana ini sudah cukup?