<?php

namespace App\Http\Controllers;

use App\Helpers\RoleHelper;
use App\Http\Resources\DashboardResource;
use App\Models\Master\Aspects;
use App\Models\Master\RoleInputs;
use App\Models\Transaksi\LockTransaksiInputs;
use App\Models\Transaksi\PerhitunganReports;
use App\Models\Transaksi\TransaksiInputs;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $user = Auth::user();
        $isAdmin = RoleHelper::isAdmin();
        $currentYear = now()->year;
        $currentMonth = now()->month;

        // Get statistic counts
        $stats = $this->getStats($isAdmin, $user->role_id, $currentYear, $currentMonth);

        // Get performance trends (last 12 months)
        $trends = $this->getPerformanceTrends($isAdmin, $user->role_id);

        // Get recent activities
        $recentActivities = $this->getRecentActivities($isAdmin, $user->role_id);

        // Get aspect breakdown for current period
        $aspectBreakdown = $this->getAspectBreakdown($isAdmin, $user->role_id, $currentYear, $currentMonth);

        // Get pending/locked periods
        $pendingPeriods = $this->getPendingPeriods();

        // Get input completion rate for current month
        $inputCompletion = $this->getInputCompletion($isAdmin, $user->role_id, $currentYear, $currentMonth);

        $dashboardData = [
            'stats' => $stats,
            'trends' => $trends,
            'recentActivities' => $recentActivities,
            'aspectBreakdown' => $aspectBreakdown,
            'pendingPeriods' => $pendingPeriods,
            'inputCompletion' => $inputCompletion,
        ];

        return Inertia::render('dashboard', [
            'data' => DashboardResource::make($dashboardData),
        ]);
    }

    private function getStats(bool $isAdmin, int $roleId, int $currentYear, int $currentMonth): array
    {
        $stats = [];

        // Total users (admin only)
        if ($isAdmin) {
            $stats['totalUsers'] = User::count();
            $stats['usersByRole'] = User::select('role_id', DB::raw('count(*) as count'))
                ->with('role:id,name')
                ->groupBy('role_id')
                ->get()
                ->map(fn ($item) => [
                    'role' => $item->role->name,
                    'count' => $item->count,
                ]);
        }

        // Total inputs this month
        $inputsQuery = TransaksiInputs::where('year', $currentYear)
            ->where('month', $currentMonth);

        if (! $isAdmin) {
            $allowedInputIds = RoleInputs::where('role_id', $roleId)
                ->pluck('master_input_id');
            $inputsQuery->whereIn('master_input_id', $allowedInputIds);
        }

        $stats['inputsThisMonth'] = $inputsQuery->count();
        $stats['inputsValueSum'] = $inputsQuery->sum('nilai');

        // Total reports calculated
        $reportsQuery = PerhitunganReports::where('year', $currentYear)
            ->where('month', $currentMonth);

        $stats['reportsThisMonth'] = $reportsQuery->count();
        $stats['averagePerformance'] = round($reportsQuery->avg('nilai_archivement'), 2);

        // Pending inputs (unlocked periods)
        $unlockedPeriods = LockTransaksiInputs::where('is_locked', false)->count();
        $stats['pendingPeriods'] = $unlockedPeriods;

        return $stats;
    }

    private function getPerformanceTrends(bool $isAdmin, int $roleId): array
    {
        $startDate = now()->subMonths(11)->startOfMonth();
        $trends = [];

        for ($i = 0; $i < 12; $i++) {
            $date = $startDate->copy()->addMonths($i);
            $year = $date->year;
            $month = $date->month;

            $query = PerhitunganReports::where('year', $year)
                ->where('month', $month);

            $avgPerformance = $query->avg('nilai_archivement');

            $trends[] = [
                'month' => $date->format('M Y'),
                'year' => $year,
                'monthNum' => $month,
                'performance' => $avgPerformance ? round($avgPerformance, 2) : 0,
            ];
        }

        return $trends;
    }

    private function getRecentActivities(bool $isAdmin, int $roleId): array
    {
        $query = TransaksiInputs::with(['masterInput:id,kode,description,satuan'])
            ->orderBy('updated_at', 'desc')
            ->limit(10);

        if (! $isAdmin) {
            $allowedInputIds = RoleInputs::where('role_id', $roleId)
                ->pluck('master_input_id');
            $query->whereIn('master_input_id', $allowedInputIds);
        }

        return $query->get()->map(fn ($item) => [
            'id' => $item->id,
            'periode' => $item->periode,
            'year' => $item->year,
            'month' => $item->month,
            'nilai' => $item->nilai,
            'masterInput' => [
                'kode' => $item->masterInput->kode,
                'description' => $item->masterInput->description,
                'satuan' => $item->masterInput->satuan,
            ],
            'updatedAt' => $item->updated_at->diffForHumans(),
        ])->toArray();
    }

    private function getAspectBreakdown(bool $isAdmin, int $roleId, int $currentYear, int $currentMonth): array
    {
        $query = PerhitunganReports::select('master_reports.aspect_id', DB::raw('SUM(perhitungan_reports.nilai_bobot) as total_score'))
            ->join('master_reports', 'perhitungan_reports.master_report_id', '=', 'master_reports.id')
            ->where('perhitungan_reports.year', $currentYear)
            ->where('perhitungan_reports.month', $currentMonth)
            ->groupBy('master_reports.aspect_id');

        $aspectScores = $query->get();

        $aspects = Aspects::whereIn('id', $aspectScores->pluck('aspect_id'))
            ->get()
            ->keyBy('id');

        return $aspectScores->map(fn ($item) => [
            'aspect' => $aspects[$item->aspect_id]->name ?? 'Unknown',
            'score' => round($item->total_score, 2),
        ])->toArray();
    }

    private function getPendingPeriods(): array
    {
        return LockTransaksiInputs::where('is_locked', false)
            ->orderBy('year', 'desc')
            ->orderBy('month', 'desc')
            ->limit(5)
            ->get()
            ->map(fn ($item) => [
                'year' => $item->year,
                'month' => $item->month,
                'periode' => date('F Y', mktime(0, 0, 0, $item->month, 1, $item->year)),
            ])
            ->toArray();
    }

    private function getInputCompletion(bool $isAdmin, int $roleId, int $currentYear, int $currentMonth): array
    {
        if ($isAdmin) {
            $totalExpectedInputs = RoleInputs::distinct('master_input_id')->count('master_input_id');
        } else {
            $totalExpectedInputs = RoleInputs::where('role_id', $roleId)
                ->distinct('master_input_id')
                ->count('master_input_id');
        }

        $inputsQuery = TransaksiInputs::where('year', $currentYear)
            ->where('month', $currentMonth);

        if (! $isAdmin) {
            $allowedInputIds = RoleInputs::where('role_id', $roleId)
                ->pluck('master_input_id');
            $inputsQuery->whereIn('master_input_id', $allowedInputIds);
        }

        $completedInputs = $inputsQuery->distinct('master_input_id')->count('master_input_id');

        $percentage = $totalExpectedInputs > 0
            ? round(($completedInputs / $totalExpectedInputs) * 100, 2)
            : 0;

        return [
            'total' => $totalExpectedInputs,
            'completed' => $completedInputs,
            'percentage' => $percentage,
        ];
    }
}
