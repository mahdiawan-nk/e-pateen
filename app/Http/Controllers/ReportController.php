<?php

namespace App\Http\Controllers;

use App\Models\Kolam;
use App\Models\KolamSeeding as Seeding;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\Relation;
use App\Services\ReportService;
class ReportController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request, ReportService $service)
    {
        $user = Auth::user();
        $debug = $request->boolean('debug', false);

        // ======================
        // FILTER INPUT
        // ======================
        $filters = $request->only([
            'kolam_id',
            'seeding_id',
            'start_date',
            'end_date',
        ]);

        // ======================
        // SELECT OPTIONS
        // ======================
        $kolamOptions = Kolam::query()
            ->active()
            ->byRole($user)
            ->select('id', 'name')
            ->orderBy('name')
            ->get();

        // ======================
        // BUILD REPORT
        // ======================
        $report = $service->buildReport($filters, $user);

        // ======================
        // RESPONSE
        // ======================
        return $this->inertia('reports/index', null, [
            'with' => [
                'kolam_options' => $kolamOptions,
                'seeding_options' => $report['seeding_options'],

                'kolam' => $report['kolam'],
                'summary' => $report['summary'],
                'detail' => $report['detail'],

                'filters' => $filters,
            ],
        ], $debug);
    }


    private function applyDateRange($query, string $column, $startDate, $endDate)
    {
        return $query
            ->when(
                $startDate,
                fn($q) =>
                $q->whereDate($column, '>=', $startDate)
            )
            ->when(
                $endDate,
                fn($q) =>
                $q->whereDate($column, '<=', $endDate)
            );
    }

    protected function applySeedingAndDateRange(
        Builder|Relation $query,
        string $dateColumn,
        ?string $seedingId = null,
        ?string $startDate = null,
        ?string $endDate = null
    ) {
        return $query
            // Filter seeding
            ->when($seedingId, function ($q) use ($seedingId) {
                $q->where('seeding_id', $seedingId);
            })

            // Filter tanggal range
            ->when($startDate && $endDate, function ($q) use ($dateColumn, $startDate, $endDate) {
                $q->whereBetween($dateColumn, [
                    $startDate . ' 00:00:00',
                    $endDate . ' 23:59:59',
                ]);
            })

            // Start only
            ->when($startDate && !$endDate, function ($q) use ($dateColumn, $startDate) {
                $q->whereDate($dateColumn, '>=', $startDate);
            })

            // End only
            ->when(!$startDate && $endDate, function ($q) use ($dateColumn, $endDate) {
                $q->whereDate($dateColumn, '<=', $endDate);
            });
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
