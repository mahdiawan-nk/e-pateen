<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Kolam;
use App\Models\KolamSeeding;
use App\Models\KolamFeeding;
use App\Models\KolamSampling;
use App\Models\KolamStockMovement;
use App\Models\HarvestRealization;
use App\Models\KolamMonitoring;
use App\Models\HarvestEstimation;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;

class DashboardDataController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();

        /**
         * =============================
         * DATE RANGE NORMALIZATION
         * =============================
         */
        $startDate = $request->filled('start_date')
            ? Carbon::parse($request->start_date)->startOfDay()
            : Carbon::now()->subDays(30)->startOfDay();

        $endDate = $request->filled('end_date')
            ? Carbon::parse($request->end_date)->endOfDay()
            : Carbon::now()->endOfDay();

        /**
         * =============================
         * BASE QUERY KOLAM BY ROLE
         * =============================
         */
        $kolamBaseQuery = Kolam::query();

        if ($user->role === 'pembudidaya') {
            $kolamBaseQuery->where('owner_id', $user->id);
        }

        $kolamIds = $kolamBaseQuery->pluck('id')->toArray();

        /**
         * =============================
         * 1. JUMLAH KOLAM AKTIF / TOTAL
         * =============================
         */
        $totalKolam = $kolamBaseQuery->count();

        $activeKolam = (clone $kolamBaseQuery)
            ->where('condition_status', 'active')
            ->count();

        /**
         * =============================
         * 2. TOTAL POPULASI IKAN
         * =============================
         */
        $populationPerKolam = KolamStockMovement::select(
            'kolam_id',
            DB::raw('SUM(quantity_change) as population')
        )
            ->whereIn('kolam_id', $kolamIds)
            ->whereBetween('event_date', [$startDate, $endDate])
            ->whereIn('event_type', ['seeding', 'mortality', 'harvest'])
            ->groupBy('kolam_id')
            ->get()
            ->mapWithKeys(fn($row) => [
                $row->kolam_id => max((int) $row->population, 0)
            ]);

        $totalPopulationAllKolam = $populationPerKolam->sum();

        /**
         * =============================
         * 3. RATA-RATA SGR
         * =============================
         */
        $avgSgr = KolamSampling::whereIn('kolam_id', $kolamIds)
            ->whereBetween('sampling_date', [$startDate, $endDate])
            ->avg('sgr_percent');

        /**
         * =============================
         * 4. TOTAL KONSUMSI PAKAN
         * =============================
         */
        $totalFeedKg = KolamFeeding::whereIn('kolam_id', $kolamIds)
            ->whereBetween('feeding_date', [$startDate, $endDate])
            ->sum('quantity_kg');

        /**
         * =============================
         * 5. TOTAL BIOMASSA PANEN
         * =============================
         */
        $totalHarvestBiomass = HarvestRealization::whereIn('kolam_id', $kolamIds)
            ->whereBetween('harvest_date', [$startDate, $endDate])
            ->sum('total_biomass_kg');

        /**
         * =============================
         * 6. RATA-RATA SURVIVAL RATE
         * =============================
         */
        $avgSurvivalRate = KolamSampling::whereIn('kolam_id', $kolamIds)
            ->whereBetween('sampling_date', [$startDate, $endDate])
            ->avg('survival_rate');

        /**
         * =============================
         * 7. KOLAM BERMASALAH
         * =============================
         */
        $problematicKolams = KolamMonitoring::select(
            'kolams.id as kolam_id',
            'kolams.name',
            'kolam_monitorings.date',
            'kolam_monitorings.ph',
            'kolam_monitorings.oxygen_mg_l',
            'kolam_monitorings.ammonia_mg_l',
            'kolam_monitorings.remarks'
        )
            ->join('kolams', 'kolams.id', '=', 'kolam_monitorings.kolam_id')
            ->whereIn('kolam_monitorings.kolam_id', $kolamIds)
            ->whereBetween('kolam_monitorings.date', [$startDate, $endDate])
            ->where(function ($q) {
                $q->where('ph', '<', 6.5)
                    ->orWhere('ph', '>', 8.5)
                    ->orWhere('oxygen_mg_l', '<', 4)
                    ->orWhere('ammonia_mg_l', '>', 0.5);
            })
            ->orderByDesc('kolam_monitorings.date')
            ->limit(20)
            ->get();

        /**
         * =============================
         * RESPONSE
         * =============================
         */
        return response()->json([
            'kpi' => [
                'kolam' => [
                    'active' => $activeKolam,
                    'total' => $totalKolam,
                ],
                'total_population' => (int) $totalPopulationAllKolam,
                'avg_sgr' => round((float) $avgSgr, 2),
                'total_feed_kg' => round((float) $totalFeedKg, 2),
                'total_harvest_biomass_kg' => round((float) $totalHarvestBiomass, 2),
                'avg_survival_rate' => round((float) $avgSurvivalRate, 2),
            ],
            'tables' => [
                'problematic_kolams' => $problematicKolams
            ],
            'filters' => [
                'startDate' => $startDate->toDateString(),
                'endDate' => $endDate->toDateString(),
                'range_days' => $startDate->diffInDays($endDate),
            ]
        ]);
    }


    public function analytics(Request $request)
    {
        $user = Auth::user();

        $kolamId = $request->get('kolam_id');
        $seedingId = $request->get('seeding_id');
        $range = (int) $request->get('range', 60);

        $startDate = now()->subDays($range)->toDateString();

        // ============================
        // ROLE-BASED KOLAM FILTER
        // ============================
        if ($user->role === 'pembudidaya') {
            $allowedKolams = Kolam::where('owner_id', $user->id)
                ->pluck('id');

            // Kalau kolam_id tidak termasuk miliknya → blok
            if ($kolamId && !$allowedKolams->contains($kolamId)) {
                abort(403, 'Unauthorized kolam access');
            }
        }

        return response()->json([
            'filters' => [
                'kolam_id' => $kolamId,
                'seeding_id' => $seedingId,
                'range_days' => $range,
            ],
            'analytics' => [
                'growth_trend' => $this->growthTrend($kolamId, $seedingId, $startDate, $user),
                'water_quality_trend' => $this->waterQualityTrend($kolamId, $startDate, $user),
                'feed_consumption' => $this->feedConsumptionTrend($kolamId, $seedingId, $startDate, $user),
                'biomass_vs_feed' => $this->biomassVsFeed($kolamId, $seedingId, $startDate, $user),
                'mortality_survival' => $this->mortalityAndSurvivalTrend($kolamId, $seedingId, $startDate, $user),
                'harvest_comparison' => $this->harvestEstimationVsRealization($kolamId, $seedingId, $user),
            ],
        ]);
    }

    public function highlights(Request $request)
    {
        $user = Auth::user();

        $rangeDays = (int) $request->get('range', 30);
        $fromDate = Carbon::now()->subDays($rangeDays);

        /**
         * ==============================
         * ROLE-BASED KOLAM FILTER
         * ==============================
         */
        $applyKolamOwnership = function ($q, $alias = 'k') use ($user) {
            if ($user->role === 'pembudidaya') {
                $q->where("{$alias}.owner_id", $user->id);
            }
        };

        /**
         * ==============================
         * THRESHOLD CONFIG
         * ==============================
         */
        $thresholds = [
            'temp_min' => 25,
            'temp_max' => 32,
            'ph_min' => 6.5,
            'ph_max' => 8.5,
            'oxygen_min' => 4,
            'ammonia_max' => 0.5,
            'fcr_bad' => 2.0,
            'mortality_high' => 20,
            'harvest_warning_days' => 7,
        ];

        /**
         * =====================================================
         * 1. Kolam dengan kualitas air di luar batas aman
         * =====================================================
         */
        $waterAlerts = DB::table('kolam_monitorings as km')
            ->join('kolams as k', 'k.id', '=', 'km.kolam_id')
            ->select(
                'k.id',
                'k.name',
                'km.date',
                'km.water_temp_c',
                'km.ph',
                'km.oxygen_mg_l',
                'km.ammonia_mg_l',
                'km.turbidity_ntu',
                DB::raw("
                CASE
                    WHEN km.water_temp_c < {$thresholds['temp_min']} OR km.water_temp_c > {$thresholds['temp_max']}
                      OR km.ph < {$thresholds['ph_min']} OR km.ph > {$thresholds['ph_max']}
                      OR km.oxygen_mg_l < {$thresholds['oxygen_min']}
                      OR km.ammonia_mg_l > {$thresholds['ammonia_max']}
                    THEN 'danger'
                    ELSE 'normal'
                END as status
            ")
            )
            ->where('km.date', '>=', $fromDate)
            ->when(true, fn($q) => $applyKolamOwnership($q, 'k'))
            ->having('status', '=', 'danger')
            ->orderByDesc('km.date')
            ->limit(5)
            ->get();

        /**
         * ======================================
         * 2. Kolam dengan mortalitas tinggi
         * ======================================
         */
        $highMortality = DB::table('kolam_samplings as ks')
            ->join('kolams as k', 'k.id', '=', 'ks.kolam_id')
            ->select(
                'k.id',
                'k.name',
                DB::raw('SUM(ks.mortality_count) as total_mortality'),
                DB::raw('AVG(ks.survival_rate) as avg_survival_rate')
            )
            ->where('ks.sampling_date', '>=', $fromDate)
            ->when(true, fn($q) => $applyKolamOwnership($q, 'k'))
            ->groupBy('k.id', 'k.name')
            ->having('total_mortality', '>=', $thresholds['mortality_high'])
            ->orderByDesc('total_mortality')
            ->limit(5)
            ->get();

        /**
         * ======================================
         * 3. Seeding mendekati panen
         * ======================================
         */
        $harvestCountdown = DB::table('harvest_estimations as he')
            ->join('kolams as k', 'k.id', '=', 'he.kolam_id')
            ->select(
                'he.seeding_id',
                'k.name as kolam_name',
                'he.estimated_harvest_date',
                DB::raw('DATEDIFF(he.estimated_harvest_date, CURDATE()) as days_remaining'),
                'he.estimated_biomass_kg'
            )
            ->whereNotNull('he.estimated_harvest_date')
            ->whereRaw('DATEDIFF(he.estimated_harvest_date, CURDATE()) <= ?', [
                $thresholds['harvest_warning_days']
            ])
            ->when(true, fn($q) => $applyKolamOwnership($q, 'k'))
            ->orderBy('days_remaining')
            ->limit(5)
            ->get();

        /**
         * ======================================
         * 4. Efisiensi pakan rendah (FCR tinggi)
         * ======================================
         */
        $fcrAlerts = DB::table('kolam_feedings as kf')
            ->join('harvest_realizations as hr', 'kf.seeding_id', '=', 'hr.seeding_id')
            ->join('kolams as k', 'k.id', '=', 'kf.kolam_id')
            ->select(
                'k.id',
                'k.name',
                DB::raw('SUM(kf.quantity_kg) as total_feed_kg'),
                DB::raw('SUM(hr.total_biomass_kg) as total_biomass_kg'),
                DB::raw('
                CASE
                    WHEN SUM(hr.total_biomass_kg) = 0 THEN NULL
                    ELSE ROUND(SUM(kf.quantity_kg) / SUM(hr.total_biomass_kg), 2)
                END as fcr
            ')
            )
            ->where('kf.feeding_date', '>=', $fromDate)
            ->when(true, fn($q) => $applyKolamOwnership($q, 'k'))
            ->groupBy('k.id', 'k.name')
            ->having('fcr', '>=', $thresholds['fcr_bad'])
            ->orderByDesc('fcr')
            ->limit(5)
            ->get();

        /**
         * ======================================
         * 5. Panen melebihi estimasi
         * ======================================
         */
        $harvestOverachieved = DB::table('harvest_realizations as hr')
            ->join('harvest_estimations as he', 'hr.seeding_id', '=', 'he.seeding_id')
            ->join('kolams as k', 'k.id', '=', 'hr.kolam_id')
            ->select(
                'k.id',
                'k.name',
                'hr.harvest_date',
                'hr.total_biomass_kg as real_biomass',
                'he.estimated_biomass_kg as estimated_biomass',
                DB::raw('(hr.total_biomass_kg - he.estimated_biomass_kg) as delta')
            )
            ->whereRaw('hr.total_biomass_kg > he.estimated_biomass_kg')
            ->when(true, fn($q) => $applyKolamOwnership($q, 'k'))
            ->orderByDesc('delta')
            ->limit(5)
            ->get();

        /**
         * ======================================
         * 6. Kolam idle / tidak produktif
         * ======================================
         */
        $idleKolams = DB::table('kolams as k')
            ->leftJoin('kolam_seedings as ks', function ($join) {
                $join->on('k.id', '=', 'ks.kolam_id')
                    ->whereNull('ks.closed_at');
            })
            ->select(
                'k.id',
                'k.name',
                'k.production_status',
                DB::raw('
                CASE
                    WHEN ks.id IS NULL THEN "idle"
                    ELSE "active"
                END as status
            ')
            )
            ->where('k.condition_status', 'active')
            ->when(true, fn($q) => $applyKolamOwnership($q, 'k'))
            ->having('status', '=', 'idle')
            ->limit(5)
            ->get();

        /**
         * ======================================
         * RESPONSE
         * ======================================
         */
        return response()->json([
            'range_days' => $rangeDays,
            'thresholds' => $thresholds,

            'highlights' => [
                'water_quality_alerts' => $waterAlerts,
                'high_mortality_kolams' => $highMortality,
                'harvest_countdown' => $harvestCountdown,
                'fcr_alerts' => $fcrAlerts,
                'harvest_overachieved' => $harvestOverachieved,
                'idle_kolams' => $idleKolams,
            ]
        ]);
    }

    public function summary(Request $request)
    {
        $user = Auth::user();

        $range = $request->get('range', 'monthly');
        [$startDate, $endDate] = $this->resolveRange($range);

        // ============================
        // BASE KOLAM FILTER (ROLE)
        // ============================
        $kolamFilter = function ($q) use ($user) {
            if ($user->role === 'pembudidaya') {
                $q->where('owner_id', $user->id);
            }
        };

        $kolamIds = Kolam::query()
            ->where($kolamFilter)
            ->pluck('id');

        // ============================
        // 1. Kolam Aktif / Idle / Rusak
        // ============================
        $kolamStats = [
            'active' => Kolam::where($kolamFilter)
                ->where('condition_status', 'active')
                ->count(),

            'idle' => Kolam::where($kolamFilter)
                ->where('condition_status', 'idle')
                ->count(),

            'broken' => Kolam::where($kolamFilter)
                ->where('condition_status', 'broken')
                ->count(),

            'total' => Kolam::where($kolamFilter)->count(),
        ];

        // ============================
        // 2. Total Bibit Ditebar
        // ============================
        $totalSeeded = KolamSeeding::query()
            ->whereIn('kolam_id', $kolamIds)
            ->whereBetween('date_seeded', [$startDate, $endDate])
            ->sum('initial_quantity');

        // ============================
        // 3. Total Pakan Dikonsumsi
        // ============================
        $totalFeedKg = KolamFeeding::query()
            ->whereIn('kolam_id', $kolamIds)
            ->whereBetween('feeding_date', [$startDate, $endDate])
            ->sum('quantity_kg');

        // ============================
        // 4. Total Panen
        // ============================
        $harvest = HarvestRealization::query()
            ->whereIn('kolam_id', $kolamIds)
            ->whereBetween('harvest_date', [$startDate, $endDate])
            ->select(
                DB::raw('SUM(harvested_population) as total_population'),
                DB::raw('SUM(total_biomass_kg) as total_biomass_kg')
            )
            ->first();

        // ============================
        // 5. Rata-rata Pertumbuhan
        // ============================
        $avgGrowth = KolamSampling::query()
            ->whereIn('kolam_id', $kolamIds)
            ->whereBetween('sampling_date', [$startDate, $endDate])
            ->select(
                DB::raw('AVG(abs_weight_growth_g) as avg_weight_growth'),
                DB::raw('AVG(abs_length_growth_cm) as avg_length_growth')
            )
            ->first();

        // ============================
        // 6. Survival Rate Rata-rata
        // ============================
        $avgSurvivalRate = KolamSampling::query()
            ->whereIn('kolam_id', $kolamIds)
            ->whereBetween('sampling_date', [$startDate, $endDate])
            ->avg('survival_rate');

        // ============================
        // 7. Kolam Mortalitas Tertinggi
        // ============================
        $highestMortality = KolamStockMovement::query()
            ->whereIn('kolam_id', $kolamIds)
            ->where('event_type', 'mortality')
            ->whereBetween('event_date', [$startDate, $endDate])
            ->select(
                'kolam_id',
                DB::raw('SUM(ABS(quantity_change)) as total_mortality')
            )
            ->groupBy('kolam_id')
            ->orderByDesc('total_mortality')
            ->with('kolam:id,name')
            ->first();

        // ============================
        // RESPONSE
        // ============================
        return response()->json([
            'range' => $range,
            'period' => [
                'start' => $startDate->toDateString(),
                'end' => $endDate->toDateString(),
            ],
            'summary' => [
                'kolam' => $kolamStats,

                'seeded' => [
                    'total_bibit' => (int) $totalSeeded,
                ],

                'feed' => [
                    'total_feed_kg' => round($totalFeedKg, 2),
                ],

                'harvest' => [
                    'total_population' => (int) ($harvest->total_population ?? 0),
                    'total_biomass_kg' => round($harvest->total_biomass_kg ?? 0, 2),
                ],

                'growth' => [
                    'avg_weight_growth_g' => round($avgGrowth->avg_weight_growth ?? 0, 2),
                    'avg_length_growth_cm' => round($avgGrowth->avg_length_growth ?? 0, 2),
                ],

                'survival_rate_avg' => round($avgSurvivalRate ?? 0, 2),

                'highest_mortality' => $highestMortality ? [
                    'kolam_id' => $highestMortality->kolam_id,
                    'kolam_name' => $highestMortality->kolam->name ?? null,
                    'total_mortality' => (int) $highestMortality->total_mortality,
                ] : null,
            ]
        ]);
    }

    public function kolamOptions(Request $request)
    {
        $user = Auth::user();
        $query = Kolam::query();

        // Role-based guard
        if ($user->role === 'pembudidaya') {
            $query->where('owner_id', $user->id);
        }

        return response()->json(
            $query
                ->orderBy('name')
                ->get(['id', 'name', 'type', 'production_status'])
                ->map(fn($k) => [
                    'id' => $k->id,
                    'label' => "{$k->name} • {$k->type} • Status : {$k->production_status}",
                ])
        );
    }
    public function seedingOptions(Request $request)
    {
        $user = Auth::user();
        $kolamId = $request->get('kolam_id');

        if (!$kolamId) {
            return response()->json([]);
        }

        $query = KolamSeeding::where('kolam_id', $kolamId);

        // Role-based guard
        if ($user->role === 'pembudidaya') {
            $query->whereHas('kolam', function ($q) use ($user) {
                $q->where('owner_id', $user->id);
            });
        }


        return response()->json(
            $query
                ->orderByDesc('date_seeded')
                ->get([
                    'id',
                    'seed_type',
                    'date_seeded',
                    'initial_quantity',
                    'cycle_status',
                ])
                ->map(fn($s) => [
                    'id' => $s->id,
                    'label' => sprintf(
                        '%s • %s • %s bibit • Status: %s',
                        $s->seed_type,
                        Carbon::parse($s->date_seeded)->translatedFormat('d M Y'),
                        number_format($s->initial_quantity),
                        ucfirst($s->cycle_status)
                    ),
                ])
        );
    }

    /**
     * Resolve date range
     */
    protected function resolveRange(string $range): array
    {
        $now = Carbon::now();

        return match ($range) {
            'daily' => [
                $now->copy()->startOfDay(),
                $now->copy()->endOfDay(),
            ],
            'weekly' => [
                $now->copy()->startOfWeek(),
                $now->copy()->endOfWeek(),
            ],
            default => [
                $now->copy()->startOfMonth(),
                $now->copy()->endOfMonth(),
            ],
        };
    }

    /**
     * ==============================
     * 1. Tren Pertumbuhan Ikan
     * ==============================
     */
    protected function growthTrend($kolamId, $seedingId, $startDate, $user)
    {
        return KolamSampling::query()
            ->when($user->role === 'pembudidaya', function ($q) use ($user) {
                $q->whereIn('kolam_id', function ($sub) use ($user) {
                    $sub->select('id')
                        ->from('kolams')
                        ->where('owner_id', $user->id);
                });
            })
            ->when($kolamId, fn($q) => $q->where('kolam_id', $kolamId))
            ->when($seedingId, fn($q) => $q->where('seeding_id', $seedingId))
            ->whereDate('sampling_date', '>=', $startDate)
            ->orderBy('sampling_date')
            ->get([
                'sampling_date',
                'avg_weight_end_g',
                'avg_length_end_cm',
                'sgr_percent',
                'biomass_kg',
            ])
            ->map(fn($row) => [
                'date' => $row->sampling_date,
                'avg_weight_g' => round($row->avg_weight_end_g, 2),
                'avg_length_cm' => round($row->avg_length_end_cm, 2),
                'sgr_percent' => round($row->sgr_percent, 2),
                'biomass_kg' => round($row->biomass_kg, 2),
            ]);
    }


    /**
     * ==============================
     * 2. Tren Kualitas Air
     * ==============================
     */
    protected function waterQualityTrend($kolamId, $startDate, $user)
    {
        return KolamMonitoring::query()
            ->when($user->role === 'pembudidaya', function ($q) use ($user) {
                $q->whereIn('kolam_id', function ($sub) use ($user) {
                    $sub->select('id')
                        ->from('kolams')
                        ->where('owner_id', $user->id);
                });
            })
            ->when($kolamId, fn($q) => $q->where('kolam_id', $kolamId))
            ->whereDate('date', '>=', $startDate)
            ->orderBy('date')
            ->get([
                'date',
                'water_temp_c',
                'ph',
                'oxygen_mg_l',
                'ammonia_mg_l',
                'turbidity_ntu',
            ])
            ->map(fn($row) => [
                'date' => $row->date,
                'temp_c' => round($row->water_temp_c, 2),
                'ph' => round($row->ph, 2),
                'oxygen' => round($row->oxygen_mg_l, 2),
                'ammonia' => round($row->ammonia_mg_l, 3),
                'turbidity' => round($row->turbidity_ntu, 2),
            ]);
    }


    /**
     * ==============================
     * 3. Konsumsi Pakan
     * ==============================
     * Group by day
     */
    protected function feedConsumptionTrend($kolamId, $seedingId, $startDate, $user)
    {
        return KolamFeeding::query()
            ->select([
                DB::raw('DATE(feeding_date) as date'),
                DB::raw('SUM(quantity_kg) as total_kg'),
            ])
            ->when($user->role === 'pembudidaya', function ($q) use ($user) {
                $q->whereIn('kolam_id', function ($sub) use ($user) {
                    $sub->select('id')
                        ->from('kolams')
                        ->where('owner_id', $user->id);
                });
            })
            ->when($kolamId, fn($q) => $q->where('kolam_id', $kolamId))
            ->when($seedingId, fn($q) => $q->where('seeding_id', $seedingId))
            ->whereDate('feeding_date', '>=', $startDate)
            ->groupBy(DB::raw('DATE(feeding_date)'))
            ->orderBy('date')
            ->get()
            ->map(fn($row) => [
                'date' => $row->date,
                'feed_kg' => round($row->total_kg, 2),
            ]);
    }


    /**
     * ==============================
     * 4. Biomassa vs Pakan (FCR View)
     * ==============================
     */
    protected function biomassVsFeed($kolamId, $seedingId, $startDate, $user)
    {
        $feed = KolamFeeding::query()
            ->when($user->role === 'pembudidaya', function ($q) use ($user) {
                $q->whereIn('kolam_id', function ($sub) use ($user) {
                    $sub->select('id')
                        ->from('kolams')
                        ->where('owner_id', $user->id);
                });
            })
            ->when($kolamId, fn($q) => $q->where('kolam_id', $kolamId))
            ->when($seedingId, fn($q) => $q->where('seeding_id', $seedingId))
            ->whereDate('feeding_date', '>=', $startDate)
            ->sum('quantity_kg');

        $biomass = HarvestRealization::query()
            ->when($user->role === 'pembudidaya', function ($q) use ($user) {
                $q->whereIn('kolam_id', function ($sub) use ($user) {
                    $sub->select('id')
                        ->from('kolams')
                        ->where('owner_id', $user->id);
                });
            })
            ->when($kolamId, fn($q) => $q->where('kolam_id', $kolamId))
            ->when($seedingId, fn($q) => $q->where('seeding_id', $seedingId))
            ->whereDate('harvest_date', '>=', $startDate)
            ->sum('total_biomass_kg');

        $fcr = $biomass > 0 ? round($feed / $biomass, 2) : null;

        return [
            'total_feed_kg' => round($feed, 2),
            'total_biomass_kg' => round($biomass, 2),
            'fcr' => $fcr,
        ];
    }


    /**
     * ==============================
     * 5. Mortalitas & Survival Rate
     * ==============================
     */
    protected function mortalityAndSurvivalTrend($kolamId, $seedingId, $startDate, $user)
    {
        return KolamSampling::query()
            ->when($user->role === 'pembudidaya', function ($q) use ($user) {
                $q->whereIn('kolam_id', function ($sub) use ($user) {
                    $sub->select('id')
                        ->from('kolams')
                        ->where('owner_id', $user->id);
                });
            })
            ->when($kolamId, fn($q) => $q->where('kolam_id', $kolamId))
            ->when($seedingId, fn($q) => $q->where('seeding_id', $seedingId))
            ->whereDate('sampling_date', '>=', $startDate)
            ->orderBy('sampling_date')
            ->get([
                'sampling_date',
                'mortality_count',
                'survival_rate',
                'estimated_population',
            ])
            ->map(fn($row) => [
                'date' => $row->sampling_date,
                'mortality' => (int) $row->mortality_count,
                'survival_rate' => round($row->survival_rate, 2),
                'population' => (int) $row->estimated_population,
            ]);
    }


    /**
     * ==============================
     * 6. Estimasi vs Realisasi Panen
     * ==============================
     */
    protected function harvestEstimationVsRealization($kolamId, $seedingId, $user)
    {
        $estimations = HarvestEstimation::query()
            ->when($user->role === 'pembudidaya', function ($q) use ($user) {
                $q->whereIn('kolam_id', function ($sub) use ($user) {
                    $sub->select('id')
                        ->from('kolams')
                        ->where('owner_id', $user->id);
                });
            })
            ->when($kolamId, fn($q) => $q->where('kolam_id', $kolamId))
            ->when($seedingId, fn($q) => $q->where('seeding_id', $seedingId))
            ->get()
            ->keyBy('seeding_id');

        return HarvestRealization::query()
            ->when($user->role === 'pembudidaya', function ($q) use ($user) {
                $q->whereIn('kolam_id', function ($sub) use ($user) {
                    $sub->select('id')
                        ->from('kolams')
                        ->where('owner_id', $user->id);
                });
            })
            ->when($kolamId, fn($q) => $q->where('kolam_id', $kolamId))
            ->when($seedingId, fn($q) => $q->where('seeding_id', $seedingId))
            ->get()
            ->map(function ($real) use ($estimations) {
                $est = $estimations[$real->seeding_id] ?? null;

                return [
                    'seeding_id' => $real->seeding_id,
                    'harvest_date' => $real->harvest_date,

                    'estimated_population' => $est?->estimated_population,
                    'real_population' => $real->harvested_population,

                    'estimated_biomass_kg' => $est?->estimated_biomass_kg,
                    'real_biomass_kg' => $real->total_biomass_kg,
                ];
            });
    }

}
