# Logic Proses Data Rekap Bulanan
---
agent: agent
description: Proses data rekap bulanan dari database dan menghasilkan laporan rekap bulanan excel menggunakan phpspreadsheet pada laravel.
model: auto
tools: [execute, read, edit, search, web, agent, todo]
---
Buatkan logika proses data rekap bulanan dari database dan menghasilkan laporan rekap bulanan excel menggunakan phpspreadsheet pada laravel. Berikut adalah langkah-langkah yang perlu diikuti:
1. **Prepare Data**:
  - ambil data master inputs dengan model MasterInputs masukan kedalam variabel $masterInputs
    ```php
    orderBy('aspect_id', 'asc')->orderBy('seq', 'asc')->get();
    ```
  - ambil unique id dari master inputs masukan kedalam variabel $masterInputIds
    ```php
    $masterInputIds = pluck('id')->unique()->toArray();
    ```
  - ambil data rekap bulanan dengan model TransaskiInputs masukan kedalam variabel $rekapDataBulanan
    ```php
    where('year', $year)
      ->whereIn('master_input_id', $masterInputIds)
      ->get()
      ->keyBy(fn($item) => 
        sprintf('%d-%d-%d', $item->master_input_id, $item->year, $item->month))
      ->map(fn($item) => $item->nilai)
      ->toArray();
    ```
  - ambil data rekap tahunan dengan model RekapInputTahunans masukan kedalam variabel $rekapDataTahunan
    ```php
      where('year', $year-1)
        ->whereIn('master_input_id', $masterInputIds)
        ->get()
        ->keyBy(fn($item) => 
        sprintf('%d-%d', $item->master_input_id, $item->year))
        ->map(fn($item) => $item->nilai)
        ->toArray();
    ```
  - join data rekap bulanan dan tahunan kedalam variabel $rekapData
    ```php
    $rekapData = array_merge($rekapDataBulanan, $rekapDataTahunan);
    ```

2. **Process Data**:
  - ambil unique reportTypes dari master inputs, masukan kedalam variabel $reportTypesGrouped
    ```php
    $reportTypesGrouped = $masterInputs->groupBy('aspect.report_type_id')->map(function($items) {
      $firstItem = $items->first();
      return [
        'report_type_id' => $firstItem->aspect->report_type_id,
        'report_type_name' => $firstItem->aspect->reportType->name,
      ];
    })->values()->keyBy('report_type_id');
    ```
  - ambil unique aspek dari master inputs, ambil hanya aspect_id dan name, masukan kedalam variabel $aspectsGrouped dengan map with key report_type_id yang diambil dari relasi aspek
    ```php
    $aspectsGrouped = $masterInputs->groupBy('aspect_id')->map(function($items) {
      $firstItem = $items->first();
      return [
        'aspect_id' => $firstItem->aspect_id,
        'aspect_name' => $firstItem->aspect->name,
        'report_type_id' => $firstItem->aspect->report_type_id,
      ];
    })->values()->keyBy('report_type_id');
    ```
  - map $rekapData dengan key format '{master_input_id}-{year}-{month}' untuk data bulanan dan '{master_input_id}-{year}' untuk data tahunan
    ```php
    $rekapData = TransaksiInputs::with(self::REKAP_RELATIONS)
      ->where('year', $year)
      ->whereIn('master_input_id', $masterIds)
      ->get()
      ->keyBy(fn($item) => 
        sprintf('%d-%d-%d', $item->master_input_id, $item->year, $item->month))
      ->map(fn($item) => $item->nilai)
      ->toArray();
    ```