<?php

namespace App\Http\Controllers;

use App\Models\HarvestRealization;
use App\Models\HarvestEstimation;
use Illuminate\Http\Request;
use App\Models\Kolam;
use Illuminate\Support\Facades\Auth;
use App\Http\Requests\HarvestRealizationRequest;
use App\Services\KolamHistorisService;
use Illuminate\Support\Facades\DB;


class HarvestRealizationController extends Controller
{
    protected $user;
    private $kolamHistorisService;

    public function __construct(KolamHistorisService $kolamHistorisService)
    {
        $this->kolamHistorisService = $kolamHistorisService;
        $this->user = Auth::user();
    }

    protected function dataKolam($for = 'index')
    {
        if (in_array($for, ['create', 'update'])) {
            // Ambil kolam dengan seeding yang statusnya 'growing'
            return Kolam::with('seeding')
                ->select('id', 'name')
                ->byRole($this->user)
                ->get()
                ->map(fn($k) => [
                    'label' => $k->name,
                    'value' => $k->id,
                    'seeding' => $k->seeding->map(fn($s) => [
                        'id' => $s->id,
                        'seed_type' => $s->seed_type,
                        'initial_quantity' => $s->initial_quantity,
                        'seed_size_cm' => $s->seed_size_cm,
                        'average_weight_seed_g' => $s->average_weight_seed_g,
                        'date_seeded' => $s->date_seeded,
                        'source' => $s->source,
                        'cycle_status' => $s->cycle_status
                    ])
                ]);
        }

        // Untuk index/list biasa
        return Kolam::select('id', 'name')
            ->byRole($this->user)
            ->produksi(['growing'])
            ->get()
            ->map(fn($k) => ['label' => $k->name, 'value' => $k->id]);
    }
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $user = Auth::user();

        $search = $request->input('search');
        $kolamFilter = $request->input('kolam_id');

        $query = HarvestRealization::query()
            ->with(['kolam.pemilik', 'seeding', 'estimation'])
            ->whereHas('kolam', fn($q) => $q->byRole($user))
            ->when(
                $search,
                fn($q) =>
                $q->where('notes', 'like', "%{$search}%")
            )
            ->when(
                $kolamFilter,
                fn($q) =>
                $q->where('kolam_id', $kolamFilter)
            )->orderBy('created_at', 'desc');

        return $this->inertia('harvest-realization/index', $query, [
            'dataKey' => 'estimations',
            'perPage' => 10,
            'filters' => ['search', 'kolam_id'],
            'with' => [
                'kolam_options' => $this->dataKolam(),
            ],
        ], false);
    }
    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $user = Auth::user();

        // Ambil kolam yang bisa dipilih user
        $kolams = $this->dataKolam('create');

        // Ambil array kolam_id untuk pembudidaya (dipakai di frontend filter)
        $user_kolam_ids = $user->role !== 'administrator' ? $kolams->pluck('value')->toArray() : [];

        return $this->inertia('harvest-realization/create', null, [
            'with' => [
                'kolam_options' => $kolams,
                'user_role' => $user->role,
                'user_kolam_ids' => $user_kolam_ids,
            ]
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(HarvestRealizationRequest $request)
    {
        $data = $request->validated();
        $getEstimation = HarvestEstimation::where('kolam_id', $data['kolam_id'])->where('seeding_id', $data['seeding_id'])->first();
        if ($getEstimation) {
            $data['harvest_estimation_id'] = $getEstimation->id;
        }
        $data['created_by'] = $this->user->id;
        DB::transaction(function () use ($data) {
            $realisation = HarvestRealization::create($data);

            // Ambil status lama
            $oldProductionStatus = $realisation->kolam->production_status;
            $oldConditionStatus = $realisation->kolam->condition_status;

            // Siapkan changes untuk 2 field
            $changes = [
                [
                    'field' => 'production_status',
                    'old' => $oldProductionStatus,
                    'new' => 'harvested',
                ],
                [
                    'field' => 'condition_status',
                    'old' => $oldConditionStatus,
                    'new' => 'idle',
                ],
            ];

            // Simpan histori
            $this->kolamHistorisService->createHistori(
                $realisation->kolam_id,
                $this->user->id,
                'updated',
                $changes,
                'Status kolam diperbarui menjadi harvested dan kondisi kolam diatur ke idle melalui proses Harvest Realization pada siklus seeding ID: ' . $realisation->seeding_id,
            );

            // Update kolam
            $realisation->kolam()->update([
                'production_status' => 'harvest',
                'condition_status' => 'active'
            ]);

            $realisation->seeding()->update([
                'cycle_status' => 'harvest'
            ]);
        });



        return to_route('realization.index');
    }

    /**
     * Display the specified resource.
     */
    public function show(HarvestRealization $harvestRealization)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(HarvestRealization $realization)
    {
        $user = Auth::user();

        // Ambil kolam yang bisa dipilih user
        $kolams = $this->dataKolam('create');

        // Ambil array kolam_id untuk pembudidaya (dipakai di frontend filter)
        $user_kolam_ids = $user->role !== 'administrator' ? $kolams->pluck('value')->toArray() : [];

        return $this->inertia('harvest-realization/update', null, [
            'with' => [
                'realization' => $realization,
                'kolam_options' => $kolams,
                'user_role' => $user->role,
                'user_kolam_ids' => $user_kolam_ids,
            ]
        ], false);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(HarvestRealizationRequest $request, HarvestRealization $realization)
    {
        $data = $request->validated();
        $getEstimation = HarvestEstimation::where('kolam_id', $data['kolam_id'])->where('seeding_id', $data['seeding_id'])->first();
        if ($getEstimation) {
            $data['harvest_estimation_id'] = $getEstimation->id;
        }
        $realization->update($data);

        return to_route('realization.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(HarvestRealization $harvestRealization)
    {
        //
    }
}
