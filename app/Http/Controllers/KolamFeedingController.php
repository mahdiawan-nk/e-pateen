<?php

namespace App\Http\Controllers;

use App\Models\KolamFeeding;
use App\Models\Kolam;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class KolamFeedingController extends Controller
{
    protected $user;
    public function __construct()
    {
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

        $query = KolamFeeding::query()
            ->with(['kolam.pemilik'])
            ->whereHas('kolam', fn($q) => $q->byRole($user))
            ->when($search, fn($q) => $q->where('notes', 'like', "%{$search}%"))
            ->when($kolamFilter, fn($q) => $q->where('kolam_id', $kolamFilter));

        $seeds = $query
            ->orderBy('feeding_date', 'desc');

        // return response()->json($seeds->get());
        return $this->inertia('kolam-feeding/index', $seeds, [
            'dataKey' => 'feedings',
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

        return $this->inertia('kolam-feeding/create', null, [
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
    public function store(Request $request)
    {
        $data = $request->validate([
            'kolam_id' => 'required|exists:kolams,id',
            'seeding_id' => 'required|uuid',
            'feeding_date' => 'required|date',
            'feed_type' => 'required|string',
            'quantity_kg' => 'required|numeric',
            'feeding_method' => 'nullable|string',
            'feed_source' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $data['created_by'] = $this->user->id;

        KolamFeeding::create($data);

        return to_route('kolam-feeding.index');
    }

    /**
     * Display the specified resource.
     */
    public function show(KolamFeeding $kolamFeeding)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(KolamFeeding $kolamFeeding)
    {
        $user = Auth::user();

        // Ambil kolam yang bisa dipilih user
        $kolams = $this->dataKolam('update');

        // Ambil array kolam_id untuk pembudidaya (dipakai di frontend filter)
        $user_kolam_ids = $user->role !== 'administrator' ? $kolams->pluck('value')->toArray() : [];

        return $this->inertia('kolam-feeding/update', null, [
            'with' => [
                'feeding' => $kolamFeeding,
                'kolam_options' => $kolams,
                'user_role' => $user->role,
                'user_kolam_ids' => $user_kolam_ids,
            ]
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, KolamFeeding $kolamFeeding)
    {
        $data = $request->validate([
            'kolam_id' => 'required|exists:kolams,id',
            'feeding_date' => 'required|date',
            'feed_type' => 'required|string',
            'quantity_kg' => 'required|numeric',
            'feeding_method' => 'nullable|string',
            'feed_source' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $kolamFeeding->update($data);
        return to_route('kolam-feeding.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(KolamFeeding $kolamFeeding)
    {
        $kolamFeeding->delete();
        return to_route('kolam-feeding.index');
    }
}
