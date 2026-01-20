# Plan: Create Perhitungan Reports Index View

Build a React/TypeScript view for displaying calculated reports with filters (year, month, report type, aspect) and pagination, following the project's established patterns from master reports and transaksi inputs views.

## Steps

1. **Create type definitions** in `types/perhitungan-reports.d.ts` for `PerhitunganReport`, `PerhitunganReportFilters`, and the page props interface

2. **Build the main index page** at `resources/js/Pages/report/perhitungan_reports/index.tsx` using `AppLayout`, `Card` structure with `CardHeader` and `CardContent`

3. **Implement filter section** with year/month selects (using `yearsList`/`monthsList` utilities), report type and aspect cascading dropdowns, and `TableTextSearch` with debounced search for indicator descriptions

4. **Create table display** using card-based `Item` components showing indicator description as `ItemTitle`, badges for year/month/formula, `ItemContent` for formula_value and nilai (formatted with `formatNumber`), and master report/aspect info in `ItemHeader`

5. **Add pagination** using `PaginationNav` component connected to `usePaginationHandler` hook with per_page selector

6. **Register route** in `routes/report.php` as `perhitungan-reports.index` and verify Wayfinder generates route helpers

## Further Considerations

1. **Filter Reset Button** — Include a reset/clear all filters button like in master reports view?
2. **Export Functionality** — Add PDF/Excel export buttons in CardHeader actions area?
3. **Loading States** — Use `Skeleton` components during filter changes or implement Inertia's `WhenVisible` for deferred loading?

## Technology Context

- **Frontend**: React 19 with TypeScript (TSX)
- **Backend**: Laravel 12 with Inertia.js v2
- **Routing**: Laravel Wayfinder for type-safe route generation
- **Styling**: Tailwind CSS v4
- **UI Components**: Custom components based on shadcn/ui patterns

## Controller Data Structure

```php
[
    'data' => $page->items(),           // Array of PerhitunganReport items
    'reportTypes' => $reportTypes,      // All report types collection
    'aspects' => $aspects,              // All aspects collection
    'filters' => [...],                 // Current filter values
    'pagination' => [...]               // Manual pagination meta
]
```

## Reusable Components Available

### Commons (`components/commons/`)
- `PaginationNav` - Full pagination with page size selector
- `TableTextSearch` - Debounced search input with clear button
- `TableShowTotalText` - Shows "X - Y of Z items"
- `EmptyState` - Empty state display
- `DeleteDialog` - Confirmation dialog for deletes

### UI (`components/ui/`)
- `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`
- `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableCell`
- `Item`, `ItemHeader`, `ItemMedia`, `ItemContent`, `ItemTitle`, `ItemActions`
- `Button`, `Badge`, `Separator`
- `Select`, `SelectTrigger`, `SelectValue`, `SelectContent`, `SelectItem`
- `Skeleton` - For loading states

### Hooks (`hooks/`)
- `usePaginationHandler` - Handles pagination logic
- `useDeleteHandler` - Manages delete dialog state
- `useErrorMessage` - Displays error messages from Inertia

## Utilities Available (`lib/utils.ts`)

```typescript
yearsList(startYear, endYear)     // Generate year options
monthsList()                      // Get month options array
formatNumber(value, decimals)     // Format numbers (Indonesian locale)
formatCurrency(amount)            // Format currency (Rupiah)
cn(...classes)                    // Merge Tailwind classes
```

## Display Pattern Recommendation

Use **card-based list** with `Item` components (like Reports pattern):

```tsx
<TableRow>
  <TableCell>
    <Item variant="outline">
      <ItemHeader>
        <ItemMedia><Badge>{number}</Badge></ItemMedia>
        <div className="flex gap-2">
          <Badge>{reportType}</Badge>
          <Badge variant="secondary">{aspect}</Badge>
        </div>
      </ItemHeader>
      <Separator />
      <ItemContent>
        <ItemTitle>{descIndicator}</ItemTitle>
        <div className="space-y-1 text-sm">
          <div><span className="font-medium">Formula:</span> {formula}</div>
          <div><span className="font-medium">Value:</span> {formulaValue}</div>
          <div><span className="font-medium">Nilai:</span> {formatNumber(nilai)}</div>
        </div>
        <div className="mt-2 flex gap-2">
          <Badge variant="outline">{year}</Badge>
          <Badge variant="outline">{month}</Badge>
        </div>
      </ItemContent>
    </Item>
  </TableCell>
</TableRow>
```

## Filter Implementation Strategy

Combine patterns from both Transaksi (year/month) and Reports (cascading selects):

1. **Year Select** - Using `yearsList()` helper, default to current year
2. **Month Select** - Using `monthsList()` helper, default to current month
3. **Report Type Select** - Dropdown of all report types, triggers aspect filter update
4. **Aspect Select** - Filtered by selected report type (cascading)
5. **Search Input** - `TableTextSearch` with 300ms debounce on indicator description
6. **Reset Button** - Clear all filters and return to defaults

## Type Definitions Structure

```typescript
// types/perhitungan-reports.d.ts

export interface PerhitunganReport {
  id: string;
  masterReport: Report;
  year: number;
  month: number;
  descIndicator: string;
  formula: string;
  formulaValue: string;
  nilai: number;
}

export interface PerhitunganReportFilters {
  report_type_id?: string;
  aspect_id?: string;
  year?: string;
  month?: string;
  search?: string;
  per_page?: string;
}

export interface PerhitunganReportsIndexProps {
  data: PerhitunganReport[];
  reportTypes: ReportType[];
  aspects: Aspect[];
  filters: PerhitunganReportFilters;
  pagination: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
    from: number | null;
    to: number | null;
  };
}
```

## Route Registration

Add to `routes/report.php`:

```php
Route::get('/perhitungan-reports', [PerhitunganReportsController::class, 'index'])
    ->name('perhitungan-reports.index');
```

After adding route, run: `vendor/bin/sail artisan wayfinder:generate`
