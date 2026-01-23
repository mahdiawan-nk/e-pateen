<?php

namespace App\Http\Controllers;

use App\Models\KolamSampling;
use App\Models\Kolam;
use App\Models\KolamSeeding;
use App\Models\KolamStockMovement;
use Illuminate\Http\Request;
use App\Http\Requests\SamplingRequest;
use Illuminate\Support\Facades\Auth;
use App\Services\KolamGrowthCalculator;
use App\Services\KolamStockLedgerService;
use App\Services\HarvestEstimationService;
use Illuminate\Support\Facades\DB;
class KolamSamplingController extends Controller
{
    protected $user;

    protected KolamStockLedgerService $stockService;

    protected HarvestEstimationService $harvestService;

    public function __construct(KolamStockLedgerService $stockService, HarvestEstimationService $harvestService)
    {
        // $this->middleware('auth');
        $this->harvestService = $harvestService;
        $this->stockService = $stockService;
        $this->user = Auth::user();
    }
    protected function dataKolam($for = 'index')
    {
        if (in_array($for, ['create', 'update'])) {
            // Ambil kolam dengan seeding yang statusnya 'growing'
            return Kolam::with([
                'seeding' => function ($query) {
                    $query->where('cycle_status', 'growing');
                }
            ])
                ->select('id', 'name')
                ->byRole($this->user)
                ->bySeedingProduksi(['growing'])
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
                        'balance' => $this->stockService->getSeedingBalance($s->id)
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

        $query = KolamSampling::query()
            ->with(['kolam.pemilik'])
            ->whereHas('kolam', fn($q) => $q->byRole($user))
            ->when($search, fn($q) => $q->where('notes', 'like', "%{$search}%"))
            ->when($kolamFilter, fn($q) => $q->where('kolam_id', $kolamFilter));

        $seeds = $query
            ->orderBy('sampling_date', 'desc');

        // return response()->json($seeds->get());
        return $this->inertia('kolam-sampling/index', $seeds, [
            'dataKey' => 'samplings',
            'perPage' => 10,
            'filters' => ['search', 'kolam_id'],
            'with' => [
                'kolam_options' => $this->dataKolam(),
            ],
        ]);
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

        return $this->inertia('kolam-sampling/create', null, [
            'with' => [
                'kolam_options' => $kolams,
                'user_role' => $user->role,
                'user_kolam_ids' => $user_kolam_ids,
            ]
        ], false);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(SamplingRequest $request, KolamGrowthCalculator $calculator)
    {
        $data = $request->validated();

        $data['day_since_last'] = $calculator
            ->calculateDayDifference($data['kolam_id'], $data['sampling_date']);

        $data['created_by'] = auth()->id();

        $calculated = $calculator->calculate($data);

        DB::transaction(function () use ($calculated, $data) {
            $sampling = KolamSampling::create($calculated);
            if ($data['mortality_count'] > 0) {
                $this->stockService->recordMortality(
                    $data['kolam_id'],
                    $data['seeding_id'],
                    $sampling->id,
                    $data['mortality_count'],
                    date('Y-m-d')
                );
            }
            $this->harvestService->updateFromSampling($sampling);
        });

        return to_route('kolam-sampling.index');
    }

    /**
     * Display the specified resource.
     */
    public function show(KolamSampling $kolamSampling)
    {

    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(KolamSampling $kolamSampling)
    {
        $user = Auth::user();

        // Ambil kolam yang bisa dipilih user
        $kolams = $this->dataKolam();

        // Ambil array kolam_id untuk pembudidaya (dipakai di frontend filter)
        $user_kolam_ids = $user->role !== 'administrator' ? $kolams->pluck('value')->toArray() : [];

        return $this->inertia('kolam-sampling/update', null, [
            'with' => [
                'sampling' => $kolamSampling,
                'kolam_options' => $kolams,
                'user_role' => $user->role,
                'user_kolam_ids' => $user_kolam_ids,
            ]
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, KolamSampling $kolamSampling)
    {
        $data = $request->validate([
            'kolam_id' => 'required|exists:kolams,id',
            'sampling_date' => 'required|date',
            'sample_size' => 'required|numeeric',
            'average_length_cm' => 'required|numeric',
            'average_weight_g' => 'required|numeric',
            'mortality_count' => 'required|numeric',
            'notes' => 'nullable|string',
        ]);

        $kolamSampling->update($data);

        return to_route('kolam-sampling.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(KolamSampling $kolamSampling)
    {
        $kolamSampling->delete();
        return to_route('kolam-sampling.index');
    }

    public function checkIsSamplingExist($kolamId, $seedingId)
    {

        $sampling = KolamSampling::where('kolam_id', $kolamId)
            ->where('seeding_id', $seedingId)
            ->orderBy('sampling_date', 'desc')
            ->first();
        $lastMovement = KolamStockMovement::where('kolam_id', $kolamId)
            ->where('seeding_id', $seedingId)
            ->orderBy('event_date', 'desc')
            ->orderBy('created_at', 'desc')
            ->first();

        $lastBalance = $lastMovement?->balance_after ?? 0;

        if ($sampling) {
            return response()->json([
                'balance' => $lastBalance - $sampling->mortality_count,
                'sampling' => [
                    'avg_weight_start_g' => $sampling->avg_weight_end_g,
                    'avg_weight_end_g' => 0,
                    'avg_length_start_cm' => $sampling->avg_length_end_cm,
                    'avg_length_end_cm' => 0,
                ],
            ]);
        }


        return response()->json([
            'balance' => $lastBalance,
            'sampling' => [
                'avg_weight_start_g' => 0,
                'avg_weight_end_g' => 0,
                'avg_length_start_cm' => 0,
                'avg_length_end_cm' => 0,
            ]
        ]);
    }
}
