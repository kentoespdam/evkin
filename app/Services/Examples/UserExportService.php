<?php

namespace App\Services;

use App\Data\ExcelConfiguration;
use App\Helpers\ExcelExportHelper;
use App\Models\User;

/**
 * Example implementation showing how to use the BaseExcelExportService
 * for creating new Excel export services
 */
class UserExportService extends BaseExcelExportService
{
    protected function getConfiguration(): ExcelConfiguration
    {
        // Create a simple table configuration using the helper
        return ExcelExportHelper::createTableConfiguration(
            headers: [
                'ID',
                'Name',
                'Email',
                'Email Verified',
                'Created At',
                'Updated At',
            ],
            numberColumns: [1], // ID column
            dateColumns: [5, 6], // Created At, Updated At
            wrappedColumns: [2], // Name column for long names
            title: 'User Export'
        );
    }

    protected function getDataQuery(array $filters)
    {
        $query = User::query();

        // Apply filters
        if (! empty($filters['search'])) {
            $query->where(function ($q) use ($filters) {
                $q->where('name', 'LIKE', "%{$filters['search']}%")
                    ->orWhere('email', 'LIKE', "%{$filters['search']}%");
            });
        }

        if (! empty($filters['verified_only'])) {
            $query->whereNotNull('email_verified_at');
        }

        if (! empty($filters['created_from'])) {
            $query->where('created_at', '>=', $filters['created_from']);
        }

        if (! empty($filters['created_to'])) {
            $query->where('created_at', '<=', $filters['created_to']);
        }

        return $query->orderBy('created_at', 'desc');
    }

    protected function processDataRow($user, int $index): array
    {
        return [
            $user->id,
            $user->name,
            $user->email,
            $user->email_verified_at ? 'Yes' : 'No',
            $user->created_at?->format('Y-m-d H:i:s') ?? '',
            $user->updated_at?->format('Y-m-d H:i:s') ?? '',
        ];
    }

    protected function generateFileName(array $filters): string
    {
        return ExcelExportHelper::generateUniqueFileName(
            'users-export',
            $filters
        );
    }
}
