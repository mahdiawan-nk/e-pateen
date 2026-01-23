<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\HarvestEstimation;
use App\Models\Kolam;
use Illuminate\Support\Facades\Auth;
class HarvestEstimationController extends Controller
{
    protected function dataKolam($for = 'index')
    {
        if (in_array($for, ['create', 'update'])) {
            // Ambil kolam dengan seeding yang statusnya 'growing'
            return Kolam::select('id', 'name')
                ->byRole($this->user)
                // ->bySeedingProduksi(['growing'])
                ->get()
                ->map(fn($k) => [
                    'label' => $k->name,
                    'value' => $k->id,
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
        $debug= $request->input('debug') ?? false;
        $search = $request->input('search');
        $kolamFilter = $request->input('kolam_id');

        $query = HarvestEstimation::query()
            ->with(['kolam.pemilik', 'seeding'])
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

        return $this->inertia('harvest-estimation/index', $query, [
            'dataKey' => 'estimations',
            'perPage' => 10,
            'filters' => ['search', 'kolam_id'],
            'with' => [
                'kolam_options' => $this->dataKolam(),
            ],
        ], $debug);
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
    public function update(Request $request, HarvestEstimation $estimation)
    {
        $data = $request->validate([
            'notes' => 'nullable|string',
            'estimated_harvest_date'=> 'required|date',
        ]);

        $estimation->update($data);

        return redirect()->route('estimation.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
