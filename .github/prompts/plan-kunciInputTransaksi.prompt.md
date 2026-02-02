# Plan: Kunci Input Transaksi per Periode

Rancang mekanisme penguncian input transaksi berbasis periode (tahun/bulan) agar input/ubah data pada periode yang sudah lewat atau dikunci tidak bisa dilakukan. Pendekatan mencakup aturan penguncian, validasi backend sebagai sumber kebenaran, endpoint toggle lock, serta UI tombol kunci di input transaksi atau rekap bulanan. Tambahkan plumbing data lock ke frontend agar status terkunci terlihat dan tombol/form ter-disable.

## Latar Belakang

- Data input transaksi yang sudah melewati bulan tidak boleh diubah karena dapat menyebabkan error perhitungan
- Diperlukan mekanisme penguncian berbasis periode (tahun, bulan)
- Implementasi batch untuk mengunci banyak data sekaligus
- Tombol/aksi kunci ditempatkan di view input transaksi atau rekap bulanan

## Infrastruktur yang Sudah Ada

### Backend
- **Model Lock**: `LockTransaksiInputs` di [app/Models/Master/LockTransaksiInputs.php](app/Models/Master/LockTransaksiInputs.php)
- **Migration Lock**: [database/migrations/2025_01_14_042312_create_table_lock_transaksi_inputs.php](database/migrations/2025_01_14_042312_create_table_lock_transaksi_inputs.php)
- **Kolom `is_locked`**: Sudah ada di tabel `transaksi_inputs`
- **Request Validator**: `LockTransaksiInputsRequest` di [app/Http/Requests/Master/LockTransaksiInputsRequest.php](app/Http/Requests/Master/LockTransaksiInputsRequest.php)
- **API Resources**: `TransaksiInputsResource` dan `LockTransaksiInputsResource` sudah expose status lock

### Frontend
- **Rekap Bulanan**: Controller `RekapTransaksiInputsController` sudah load data lock dan kirim ke Inertia
- **UI Component**: `RekapBulananTable.tsx` punya logika ikon lock (masih di-comment)
- **Type Definitions**: Lock flag sudah didefinisikan di types

### Routes & Controllers
- Transaksi input endpoints: [routes/transaksi.php](routes/transaksi.php)
- Rekap/report endpoints: [routes/report.php](routes/report.php)
- Controller input: `TransaksiInputsController`
- Controller rekap: `RekapTransaksiInputsController`

## Requirements

### 1. Aturan Penguncian (Business Logic)

**Pilihan A: Manual Lock Only**
- Admin secara manual mengkunci periode tertentu via tombol UI
- Tidak ada auto-lock
- Fleksibel untuk kasus khusus

**Pilihan B: Auto-Lock Harian**
- Scheduled job otomatis mengunci bulan sebelumnya
- Job berjalan setiap hari
- Konsisten, tidak lupa

**Pilihan C: Kombinasi**
- Auto-lock untuk bulan lewat
- Manual override untuk unlock jika diperlukan (dengan permission khusus)

**Keputusan**: _[Pilih A, B, atau C]_

### 2. Lokasi UI Tombol Kunci

**Pilihan A: Rekap Bulanan Saja**
- Tombol lock per bulan di halaman rekap
- Admin melihat summary semua bulan dan toggle lock
- Cocok untuk view "bird's eye"

**Pilihan B: Input Transaksi Saja**
- Tombol lock di halaman input transaksi
- Langsung di konteks entry data
- User aware saat input

**Pilihan C: Keduanya**
- Tombol di rekap untuk batch lock
- Indicator/status di input transaksi
- Redundan tapi comprehensive

**Keputusan**: _[Pilih A, B, atau C]_

### 3. Role & Permission

- Siapa yang bisa lock/unlock? Admin saja atau role tertentu?
- Apakah perlu audit log untuk tracking siapa yang lock/unlock?

**Keputusan**: _[Tentukan role yang bisa lock/unlock]_

## Implementation Steps

### Step 1: Server-Side Enforcement (Backend Validation)

**Goal**: Reject upsert/update pada periode terkunci

**Files to Modify**:
- [app/Http/Controllers/Transaksi/TransaksiInputsController.php](app/Http/Controllers/Transaksi/TransaksiInputsController.php)

**Tasks**:
1. Di method `store`/`upsert`, tambahkan validasi:
   - Check `LockTransaksiInputs` untuk `year` dan `month` dari request
   - Jika locked, return error 403/422 dengan message "Periode sudah dikunci"
2. Pastikan validasi terjadi sebelum query database
3. Gunakan transaksi DB jika perlu update batch `is_locked` di `transaksi_inputs`

**Validation Logic**:
```php
$lock = LockTransaksiInputs::where('year', $year)
    ->where('month', $month)
    ->where('is_locked', true)
    ->first();

if ($lock) {
    return response()->json([
        'message' => 'Periode sudah dikunci, tidak dapat mengubah data'
    ], 403);
}
```

### Step 2: Lock Management Endpoint

**Goal**: Endpoint untuk toggle lock status per periode

**New Route** (di [routes/transaksi.php](routes/transaksi.php) atau [routes/report.php](routes/report.php)):
```php
Route::post('/transaksi/lock', [LockController::class, 'store'])
    ->name('transaksi.lock.store');
Route::patch('/transaksi/lock/{year}/{month}', [LockController::class, 'update'])
    ->name('transaksi.lock.update');
```

**New Controller** atau tambah di controller existing:
- Method `store`: Create lock record untuk periode
- Method `update`: Toggle `is_locked` status
- Validation: Gunakan `LockTransaksiInputsRequest`
- Authorization: Check user role (admin only?)

**Tasks**:
1. Create controller method untuk lock/unlock
2. Validate year/month parameter
3. Update `LockTransaksiInputs` table
4. Batch update `transaksi_inputs.is_locked` untuk semua record di periode tersebut
5. Return updated lock status

**Example Controller Logic**:
```php
public function update(int $year, int $month)
{
    $this->authorize('lock-transaksi'); // jika pakai policy
    
    $lock = LockTransaksiInputs::firstOrCreate(
        ['year' => $year, 'month' => $month],
        ['is_locked' => false]
    );
    
    $lock->is_locked = !$lock->is_locked;
    $lock->save();
    
    // Batch update transaksi_inputs
    TransaksiInputs::where('year', $year)
        ->where('month', $month)
        ->update(['is_locked' => $lock->is_locked]);
    
    return back();
}
```

### Step 3: Frontend - Rekap Bulanan Integration

**Goal**: Tampilkan status lock dan tombol toggle di rekap bulanan

**Files to Modify**:
- [app/Http/Controllers/Report/RekapTransaksiInputsController.php](app/Http/Controllers/Report/RekapTransaksiInputsController.php)
- [resources/js/Pages/Transaksi/RekapBulanan/RekapBulananPage.tsx](resources/js/Pages/Transaksi/RekapBulanan/RekapBulananPage.tsx)
- [resources/js/Pages/Transaksi/RekapBulanan/RekapBulananTable.tsx](resources/js/Pages/Transaksi/RekapBulanan/RekapBulananTable.tsx)

**Tasks**:

**3.1 Controller**: Ensure `locks` prop passed to Inertia
```php
return Inertia::render('Transaksi/RekapBulanan/RekapBulananPage', [
    'rekapData' => $rekapData,
    'locks' => $locks, // Sudah ada, pastikan include
    'year' => $year,
]);
```

**3.2 Page Component**: Pass locks down to table
```tsx
<RekapBulananTable 
    data={rekapData}
    locks={locks}
    year={year}
/>
```

**3.3 Table Component**: Uncomment dan implement lock icon logic
- Show lock icon di header bulan jika locked
- Add toggle button (Lock/Unlock) per bulan
- Gunakan `router.post` atau `router.patch` untuk hit lock endpoint
- Disable button saat processing

**Example Lock Button**:
```tsx
const handleToggleLock = (month: number) => {
    router.patch(route('transaksi.lock.update', { year, month }), {}, {
        preserveScroll: true,
        onSuccess: () => toast.success('Status lock berhasil diubah'),
    });
};

// In render:
<button onClick={() => handleToggleLock(month)}>
    {isLocked ? <LockIcon /> : <UnlockIcon />}
</button>
```

### Step 4: Frontend - Input Transaksi Enforcement

**Goal**: Disable input/form saat periode terkunci

**Files to Modify**:
- [resources/js/Pages/Transaksi/Inputs/TransaksiInputsPage.tsx](resources/js/Pages/Transaksi/Inputs/TransaksiInputsPage.tsx)
- [resources/js/Pages/Transaksi/Inputs/TransaksiInputsTable.tsx](resources/js/Pages/Transaksi/Inputs/TransaksiInputsTable.tsx)

**Tasks**:

**4.1 Compute Lock Status**:
```tsx
const isCurrentPeriodLocked = useMemo(() => {
    return locks?.some(lock => 
        lock.year === selectedYear && 
        lock.month === selectedMonth && 
        lock.is_locked
    );
}, [locks, selectedYear, selectedMonth]);
```

**4.2 Disable UI Elements**:
- Disable tombol "Simpan" jika locked
- Disable input fields di table jika locked
- Show warning banner: "Periode ini sudah dikunci"

**Example**:
```tsx
{isCurrentPeriodLocked && (
    <Alert variant="warning">
        Periode {selectedMonth}/{selectedYear} sudah dikunci. 
        Data tidak dapat diubah.
    </Alert>
)}

<button disabled={isCurrentPeriodLocked || form.processing}>
    Simpan
</button>
```

### Step 5: Optional - Auto-Lock Job

**Goal**: Scheduled job untuk auto-lock bulan sebelumnya

**Only if choosing Pilihan B or C for aturan penguncian**

**Tasks**:
1. Create Artisan command: `vendor/bin/sail artisan make:command AutoLockPreviousMonth`
2. Logic: Lock semua bulan < current month yang belum locked
3. Schedule di `routes/console.php`:
```php
Schedule::command('transaksi:auto-lock')->daily();
```

**Example Command Logic**:
```php
public function handle()
{
    $currentDate = now();
    $previousMonth = $currentDate->copy()->subMonth();
    
    LockTransaksiInputs::updateOrCreate(
        [
            'year' => $previousMonth->year,
            'month' => $previousMonth->month,
        ],
        ['is_locked' => true]
    );
    
    TransaksiInputs::where('year', $previousMonth->year)
        ->where('month', $previousMonth->month)
        ->update(['is_locked' => true]);
    
    $this->info('Previous month locked successfully.');
}
```

## Testing Requirements

### Unit Tests
- Test `LockTransaksiInputs` model methods
- Test lock validation logic

### Feature Tests
1. **Lock Endpoint**: POST/PATCH ke lock endpoint
2. **Upsert Rejection**: Attempt upsert pada locked period, expect 403
3. **Batch Lock**: Lock sebuah periode, verify semua transaksi_inputs updated
4. **Authorization**: Non-admin tidak bisa lock/unlock

### Manual Testing Checklist
- [ ] Lock periode via rekap bulanan
- [ ] Coba input data pada periode locked, should fail
- [ ] Unlock periode, input should work again
- [ ] Lock icon tampil di UI
- [ ] Form/button ter-disable saat locked
- [ ] Toast notification muncul saat toggle lock

## Security & Authorization

### Policy/Gate
- Create `LockTransaksiInputsPolicy` atau tambahkan gate di `AuthServiceProvider`
- Only admin or specific roles can lock/unlock

**Example Gate**:
```php
Gate::define('lock-transaksi', function (User $user) {
    return $user->isAdmin(); // atau check role
});
```

### Middleware
- Apply auth middleware pada lock routes
- Apply role/permission middleware jika pakai package seperti Spatie Permission

## Migration (If Needed)

Jika ada kolom tambahan yang diperlukan:

```php
// Tambahan di migration jika perlu
Schema::table('table_lock_transaksi_inputs', function (Blueprint $table) {
    $table->foreignId('locked_by')->nullable()->constrained('users');
    $table->timestamp('locked_at')->nullable();
});
```

## UI/UX Considerations

### Visual Indicators
- Lock icon jelas di rekap bulanan (per bulan)
- Warning banner di input page saat periode locked
- Tooltip hover: "Periode sudah dikunci oleh [nama admin] pada [tanggal]"

### User Feedback
- Toast notification saat lock/unlock success
- Error message jelas saat attempt edit locked period
- Confirmation modal sebelum lock? "Yakin ingin mengunci periode ini?"

## Rollout Plan

1. **Phase 1**: Backend validation + lock endpoint (no UI)
2. **Phase 2**: UI integration di rekap bulanan (admin toggle)
3. **Phase 3**: UI enforcement di input transaksi (user sees locked)
4. **Phase 4**: (Optional) Auto-lock job
5. **Phase 5**: Audit logging & permissions refinement

## Questions to Resolve Before Implementation

1. **Aturan Penguncian**: Manual, auto, atau kombinasi?
2. **Lokasi Tombol**: Rekap saja, input saja, atau keduanya?
3. **Role Permission**: Admin only atau role khusus?
4. **Confirmation Modal**: Perlu konfirmasi sebelum lock?
5. **Unlock Permission**: Siapa yang bisa unlock? Atau lock irreversible?
6. **Audit Log**: Perlu tracking siapa lock/unlock kapan?
7. **Batch Lock UI**: Lock multiple bulan sekaligus? (e.g. lock Q1 2025)

## Next Steps

1. Review plan ini dan jawab questions di atas
2. Finalize decisions untuk requirements
3. Start implementation dengan Step 1 (backend validation)
4. Test setiap step sebelum lanjut ke step berikutnya
