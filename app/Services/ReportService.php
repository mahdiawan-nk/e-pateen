<?php

namespace App\Services;

use App\Models\Kolam;
use App\Models\KolamSeeding as Seeding;
use Illuminate\Support\Facades\Auth;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\Relation;

class ReportService
{
    // ==========================
    // PUBLIC ENTRY POINT
    // ==========================
    public function buildReport(array $filters, $user): array
    {
        $kolamId = $filters['kolam_id'] ?? null;
        $seedingId = $filters['seeding_id'] ?? null;
        $startDate = $filters['start_date'] ?? null;
        $endDate = $filters['end_date'] ?? null;

        $result = [
            'kolam' => null,
            'summary' => null,
            'detail' => null,
            'seeding_options' => [],
        ];

        if (!$kolamId) {
            return $result;
        }

        // ======================
        // LOAD SEEDING OPTIONS
        // ======================
        $result['seeding_options'] = $this->getSeedingOptions($kolamId);

        // ======================
        // LOAD MAIN MODEL
        // ======================
        $kolamModel = $this->loadKolamModel(
            $kolamId,
            $user,
            $seedingId,
            $startDate,
            $endDate
        );

        if (!$kolamModel) {
            return $result;
        }

        // ======================
        // BUILD OUTPUT
        // ======================
        $result['kolam'] = $this->mapKolam($kolamModel);
        $result['summary'] = $this->buildSummary($kolamModel);
        $result['detail'] = $this->buildGroupedDetail($kolamModel);

        return $result;
    }

    // ==========================
    // DATA LOADER
    // ==========================
    protected function loadKolamModel(
        string $kolamId,
        $user,
        ?string $seedingId,
        ?string $startDate,
        ?string $endDate
    ) {
        return Kolam::query()
            ->active()
            ->byRole($user)
            ->where('id', $kolamId)
            ->with([
                'pemilik:id,name',

                'seeding' => fn($q) =>
                    $seedingId
                    ? $q->where('id', $seedingId)
                    : $q->orderByDesc('date_seeded'),

                'feeding' => fn($q) =>
                    $this->applySeedingAndDateRange(
                        $q,
                        'feeding_date',
                        $seedingId,
                        $startDate,
                        $endDate
                    ),

                'sampling' => fn($q) =>
                    $this->applySeedingAndDateRange(
                        $q,
                        'sampling_date',
                        $seedingId,
                        $startDate,
                        $endDate
                    ),

                'monitoring' => fn($q) =>
                    $this->applyDateRange(
                        $q,
                        'date',
                        $startDate,
                        $endDate
                    )->latest()->limit(1),

                'harvestEstimations' => fn($q) =>
                    $this->applySeedingAndDateRange(
                        $q,
                        'estimated_harvest_date',
                        $seedingId,
                        $startDate,
                        $endDate
                    ),

                'harvestRealizations' => fn($q) =>
                    $this->applySeedingAndDateRange(
                        $q,
                        'harvest_date',
                        $seedingId,
                        $startDate,
                        $endDate
                    )->with('estimation'),
            ])
            ->first();
    }

    // ==========================
    // MAPPERS
    // ==========================
    protected function mapKolam($model): array
    {
        return [
            'id' => $model->id,
            'name' => $model->name,
            'location' => $model->location,
            'owner' => optional($model->pemilik)->name,
            'type' => $model->type,
            'capacity_fish' => $model->capacity_fish,
            'water_volume_l' => $model->water_volume_l,
            'condition_status' => $model->condition_status,
            'production_status' => $model->production_status,
        ];
    }

    protected function buildSummary($model): array
    {
        $latestSampling = $model->sampling
            ->sortByDesc('sampling_date')
            ->first();

        return [
            'total_pakan_kg' => round($model->feeding->sum('quantity_kg'), 2),
            'total_panen_kg' => round($model->harvestRealizations->sum('total_biomass_kg'), 2),
            'last_sampling' => $latestSampling
                ? [
                    'avg_weight_g' => $latestSampling->avg_weight_end_g,
                    'avg_length_cm' => $latestSampling->avg_length_end_cm,
                    'sample_date' => $latestSampling->sampling_date,
                ]
                : null,
        ];
    }

    // ==========================
    // GROUPING ENGINE
    // ==========================
    protected function buildGroupedDetail($model): array
    {
        $groups = $model->seeding->map(function ($seed) use ($model) {

            $feeding = $model->feeding->where('seeding_id', $seed->id)->values();
            $sampling = $model->sampling->where('seeding_id', $seed->id)->values();
            $harvest = $model->harvestRealizations->where('seeding_id', $seed->id)->values();
            $estimation = $model->harvestEstimations->where('seeding_id', $seed->id)->values();

            $comparison = $harvest->map(function ($real) {
                $est = $real->estimation;
                if (!$est)
                    return null;

                $estimated = (float) $est->estimated_biomass_kg;
                $realized = (float) $real->total_biomass_kg;
                $diff = $realized - $estimated;

                return [
                    'harvest_date' => $real->harvest_date,

                    'estimated_population' => (int) $est->estimated_population,
                    'realized_population' => (int) $real->harvested_population,
                    'population_diff' =>
                        (int) $real->harvested_population -
                        (int) $est->estimated_population,

                    'estimated_biomass_kg' => round($estimated, 2),
                    'realized_biomass_kg' => round($realized, 2),
                    'biomass_diff_kg' => round($diff, 2),
                    'biomass_diff_percent' => $estimated > 0
                        ? round(($diff / $estimated) * 100, 2)
                        : 0,
                ];
            })->filter()->values();

            return [
                'seeds'=>$seed,
                'seeding' => [
                    'id' => $seed->id,
                    'seed_type' => $seed->seed_type,
                    'date_seeded' => $seed->date_seeded,
                    'initial_quantity' => $seed->initial_quantity,
                    'cycle_status' => $seed->cycle_status,
                ],
                'feeding' => $feeding,
                'sampling' => $sampling,
                'harvest' => $harvest,
                'estimation' => $estimation,
                'comparison' => $comparison,
            ];
        })->values();

        return [
            'monitoring' => $model->monitoring,
            'groups' => $groups,
        ];
    }

    // ==========================
    // OPTIONS
    // ==========================
    protected function getSeedingOptions(string $kolamId)
    {
        return Seeding::query()
            ->where('kolam_id', $kolamId)
            ->orderByDesc('date_seeded')
            ->get([
                'id',
                'seed_type',
                'date_seeded',
                'initial_quantity',
                'cycle_status',
            ]);
    }

    // ==========================
    // FILTER HELPERS
    // ==========================
    protected function applySeedingAndDateRange(
        Builder|Relation $query,
        string $dateColumn,
        ?string $seedingId,
        ?string $startDate,
        ?string $endDate
    ) {
        return $query
            ->when($seedingId, fn($q) =>
                $q->where('seeding_id', $seedingId))

            ->when($startDate && $endDate, fn($q) =>
                $q->whereBetween($dateColumn, [
                    $startDate . ' 00:00:00',
                    $endDate . ' 23:59:59',
                ]))

            ->when($startDate && !$endDate, fn($q) =>
                $q->whereDate($dateColumn, '>=', $startDate))

            ->when(!$startDate && $endDate, fn($q) =>
                $q->whereDate($dateColumn, '<=', $endDate));
    }

    protected function applyDateRange(
        Builder|Relation $query,
        string $dateColumn,
        ?string $startDate,
        ?string $endDate
    ) {
        return $query
            ->when($startDate && $endDate, fn($q) =>
                $q->whereBetween($dateColumn, [
                    $startDate . ' 00:00:00',
                    $endDate . ' 23:59:59',
                ]))
            ->when($startDate && !$endDate, fn($q) =>
                $q->whereDate($dateColumn, '>=', $startDate))
            ->when(!$startDate && $endDate, fn($q) =>
                $q->whereDate($dateColumn, '<=', $endDate));
    }
}
