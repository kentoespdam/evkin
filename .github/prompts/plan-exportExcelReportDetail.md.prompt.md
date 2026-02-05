# Excel Export untuk Perhitungan Reports

Menambahkan fitur export Excel untuk detail perhitungan reports menggunakan phpspreadsheet yang sudah terinstall. Data akan dimuat berdasarkan filter yang sama dengan view detail, kemudian diformat ke spreadsheet dengan styling dan multiple sheets untuk readability.

## Steps

1. **Buat controller method `exportDetail()`** di `app/Http/Controllers/PerhitunganReportController.php` yang menggunakan phpspreadsheet untuk generate Excel file
   
2. **Tambahkan route POST** `/reports/detail/export` di `routes/report.php` yang menangani export request

3. **Buat service class** `app/Services/PerhitunganReportExportService.php` untuk handle spreadsheet formatting dan styling

4. **Tambahkan button "Export Excel"** di React component `resources/js/components/reports/table/perhitungan_reports_detail.tsx`

5. **Buat request class** untuk validasi export parameters

6. **Buat unit test** untuk export service dan controller

## Architecture Decisions

### Sheet Structure
- **Selected**: Single "Details" sheet yang comprehensive
- **Rationale**: Simplicity dan ease of use, data structure sudah clear di satu sheet

### Data Size
- **Selected**: All matching data without pagination limits
- **Rationale**: Export harus complete, user bisa filter di application sebelum export

### Styling
- **Selected**: Professional styling dengan header styling dan column width auto-adjustment
- **Features**:
  - Header row dengan background color dan bold font
  - Frozen header row (freeze panes)
  - Auto-adjust column width based on content
  - Number formatting untuk nilai (2-3 decimal places)
  - Borders dan alignment untuk readability

### Filter Parameters
- **Selected**: Export dengan filter yang sama seperti view
- **Parameters**: `year`, `month`, `report_type_id`, `aspect_id`, `search`
- **Rationale**: User experience yang consistent, filtered data saja yang di-export

## Data Mapping (13 Columns)

| # | Column | Cell Value | Format |
|---|--------|-----------|--------|
| 1 | # | Row number | Integer |
| 2 | Periode | `{year}-{month}` | Text |
| 3 | Indikator | `descIndicator` | Text |
| 4 | Rumus | `formula` | Text (monospace) |
| 5 | Rumus Value | `formulaValue` | Text (monospace) |
| 6 | Satuan | `masterReport.unit` | Text |
| 7 | Nilai | `nilai` | Number (2 decimals) |
| 8 | Nilai Indikator | `nilaiIndicator` | Number (2 decimals) |
| 9 | Rumus Bobot | `formulaNilaiBobot` | Text (monospace) |
| 10 | Nilai Bobot | `nilaiBobot` | Number (3 decimals if > 0, else 0) |
| 11 | Rumus Pencapaian | `formulaArchivement` | Text |
| 12 | Rumus Pencapaian Value | `formulaArchivementValue` | Text (monospace) |
| 13 | Nilai Pencapaian | `nilaiArchivement` | Number (2 decimals if > 0, else 0) |

## Implementation Details

### PerhitunganReportExportService

```php
class PerhitunganReportExportService
{
    public function exportDetail(array $filters): StreamedResponse
    {
        // Query data dengan filter
        $query = PerhitunganReportDetail::with(['masterReport'])
            ->when($filters['year'], fn($q) => $q->where('year', $filters['year']))
            ->when($filters['month'], fn($q) => $q->where('month', $filters['month']))
            // ... filter lainnya
            ->orderBy('year', 'desc')
            ->orderBy('month', 'desc');
        
        // Create spreadsheet dengan phpspreadsheet
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        
        // Style header
        // Add data rows
        // Auto-adjust columns
        
        // Return as download
    }
}
```

### Controller Method

```php
public function exportDetail(ExportDetailRequest $request)
{
    return (new PerhitunganReportExportService())->exportDetail(
        $request->validated()
    );
}
```

### Frontend Integration

```typescript
// Button di PerhitunganReportsDetailTable
const handleExport = async () => {
    const response = await fetch('/reports/detail/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filters),
    });
    
    // Download file
};
```

## Testing Strategy

- Unit test untuk PerhitunganReportExportService
  - Test spreadsheet generation
  - Test styling aplikasi
  - Test number formatting
  
- Feature test untuk exportDetail endpoint
  - Test with various filters
  - Test file download response
  - Test data accuracy

## File Names & Locations

| File | Location | Type |
|------|----------|------|
| Controller Method | `app/Http/Controllers/PerhitunganReportController.php` | Existing file |
| Service Class | `app/Services/PerhitunganReportExportService.php` | New |
| Request Class | `app/Http/Requests/ExportDetailRequest.php` | New |
| Route | `routes/report.php` | Existing file |
| Component Update | `resources/js/components/reports/table/perhitungan_reports_detail.tsx` | Existing file |
| Service Test | `tests/Unit/Services/PerhitunganReportExportServiceTest.php` | New |
| Feature Test | `tests/Feature/ExportPerhitunganReportDetailTest.php` | New |
