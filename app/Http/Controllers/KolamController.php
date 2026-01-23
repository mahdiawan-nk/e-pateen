<?php

namespace App\Http\Controllers;

use App\Models\Kolam;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use App\Services\KolamHistorisService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
class KolamController extends Controller
{
    protected KolamHistorisService $kolamHistorisService;

    public function __construct(KolamHistorisService $kolamHistorisService)
    {
        $this->kolamHistorisService = $kolamHistorisService;
    }
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $user = Auth::user();

        $search = $request->input('search');
        $conditionStatus = $request->input('condition_status');
        $productionStatus = $request->input('production_status');
        $typeFilter = $request->input('type');

        $perPage = 10;
        $page = max((int) $request->input('page', 1), 1);
        $offset = ($page - 1) * $perPage;

        $query = Kolam::query()
            ->with('pemilik:id,name')
            ->byRole($user)
            ->active()
            ->when($search, fn($q) => $q->where(fn($sub) => $sub->where('name', 'like', "%{$search}%")
                ->orWhere('location', 'like', "%{$search}%")))
            ->when($conditionStatus, fn($q) => $q->kondisi($conditionStatus))
            ->when($productionStatus, fn($q) => $q->produksi([$productionStatus]))
            ->when($typeFilter, fn($q) => $q->where('type', $typeFilter));

        $total = $query->count();

        $kolams = $query
            ->orderBy('created_at', 'desc')
            ->skip($offset)
            ->take($perPage)
            ->get();

        $lastPage = (int) ceil($total / $perPage);

        return Inertia::render('kolams/index', [
            'kolams' => $kolams,
            'pagination' => [
                'total' => $total,
                'per_page' => $perPage,
                'current_page' => $page,
                'last_page' => $lastPage,
                'from' => $total > 0 ? $offset + 1 : 0,
                'to' => min($offset + $perPage, $total),
                'has_prev' => $page > 1,
                'has_next' => $page < $lastPage,
                'prev_page' => $page > 1 ? $page - 1 : null,
                'next_page' => $page < $lastPage ? $page + 1 : null,
            ],
            'filters' => [
                'search' => $search,
                'condition_status' => $conditionStatus,
                'production_status' => $productionStatus,
                'type' => $typeFilter,
            ],
            'meta' => [
                'role' => $user->role,
            ],
        ]);
    }

    public function show($kolam)
    {
        $kolam = Kolam::with('seeding')->findOrFail($kolam);
        $respone = [
            'status' => 200,
            'message' => 'success',
            'data' => $kolam
        ];
        return response()->json($respone, 200);
    }
    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $user = Auth::user();

        // Tipe kolam bisa disesuaikan
        $types = ['Terpal', 'Beton', 'Tanah'];

        // Kondisi & produksi
        $condition_status_options = [
            ['label' => 'Active', 'value' => 'active'],
            ['label' => 'Maintenance', 'value' => 'maintenance'],
            ['label' => 'Damaged', 'value' => 'damaged'],
        ];

        $production_status_options = [
            ['label' => 'Idle', 'value' => 'idle'],
            ['label' => 'Stocking', 'value' => 'stocking'],
            ['label' => 'Nursery', 'value' => 'nursery'],
            ['label' => 'Growing', 'value' => 'growing'],
            ['label' => 'Harvest', 'value' => 'harvest'],
        ];

        // Jika admin, kirim list pemilik untuk select
        $owner_options = $user->role === 'administrator'
            ? User::where('role', 'pembudidaya')->get(['id', 'name'])->map(fn($u) => ['label' => $u->name, 'value' => $u->id])->toArray()
            : [];

        return inertia('kolams/create', [
            'type_options' => array_map(fn($t) => ['label' => $t, 'value' => $t], $types),
            'condition_status_options' => $condition_status_options,
            'production_status_options' => $production_status_options,
            'owner_options' => $owner_options,
            'user_role' => $user->role,
            'user_id' => $user->id, // untuk pembudidaya
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $user = Auth::user();

        $data = $request->validate([
            'name' => 'required|string|max:100',
            'location' => 'nullable|string|max:150',
            'length_m' => 'required|numeric|min:0',
            'width_m' => 'required|numeric|min:0',
            'depth_m' => 'required|numeric|min:0',
            'water_volume_l' => 'required|integer|min:0',
            'capacity_fish' => 'required|integer|min:0',
            'type' => 'required|string|max:50',
            'condition_status' => ['required', Rule::in(['active', 'maintenance', 'damaged'])],
            'production_status' => ['required', Rule::in(['idle', 'stocking', 'nursery', 'growing', 'harvest'])],
            'owner_id' => 'required|exists:users,id',
        ]);

        $data['owner_id'] = $user->role == 'administrator' ? $data['owner_id'] : $user->id; // assign pemilik kolam
        DB::transaction(function () use ($data, $user) {
            $kolam = Kolam::create($data);
            $this->kolamHistorisService->createHistori(
                $kolam->id,
                $user->id,
                'created',
                $kolam->toArray(),
                'kolam baru dibuat'
            );
        });


        return redirect()->route('kolams.index')->with('success', 'Kolam berhasil dibuat.');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Kolam $kolam)
    {
        $this->authorizeKolam($kolam);

        $user = Auth::user();

        // Jika admin, ambil daftar user sebagai pemilik
        $owner_options = [];
        if ($user->role === 'administrator') {
            $owner_options = \App\Models\User::orderBy('name')
                ->get(['id', 'name'])
                ->map(fn($u) => ['label' => $u->name, 'value' => $u->id])
                ->toArray();
        }

        return Inertia::render('kolams/update', [
            'kolam' => $kolam,
            'condition_status_options' => [
                ['label' => 'Aktif', 'value' => 'active'],
                ['label' => 'Maintenance', 'value' => 'maintenance'],
                ['label' => 'Rusak', 'value' => 'damaged'],
            ],
            'production_status_options' => [
                ['label' => 'Idle', 'value' => 'idle'],
                ['label' => 'Stocking', 'value' => 'stocking'],
                ['label' => 'Nursery', 'value' => 'nursery'],
                ['label' => 'Growing', 'value' => 'growing'],
                ['label' => 'Harvest', 'value' => 'harvest'],
            ],
            'type_options' => [
                ['label' => 'Kolam Terpal', 'value' => 'terpal'],
                ['label' => 'Kolam Tanah', 'value' => 'tanah'],
                ['label' => 'Kolam Beton', 'value' => 'beton'],
            ],
            'owner_options' => $owner_options,
            'user_role' => $user->role,
            'user_id' => $user->id,
        ]);
    }


    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Kolam $kolam)
    {
        $this->authorizeKolam($kolam);

        $oldData = $kolam->only(['name', 'location', 'length_m', 'width_m', 'depth_m', 'water_volume_l', 'capacity_fish', 'type', 'condition_status', 'production_status','owner_id']);

        $kolam->update($request->all());

        $newData = $kolam->only(array_keys($oldData));

        $changes = [];
        foreach ($oldData as $key => $old) {
            if ($old != $newData[$key]) {
                $changes[] = [
                    'field' => $key,
                    'old' => $old,
                    'new' => $newData[$key],
                ];
            }
        }

        if (!empty($changes)) {
            $this->kolamHistorisService->createHistori(
                $kolam->id,
                Auth::user()->id,
                'updated',
                $changes,
                'kolam di perbaharui'
            );
        }

        return redirect()->route('kolams.index')->with('success', 'Kolam berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Kolam $kolam)
    {
        $this->authorizeKolam($kolam);
        $this->kolamHistorisService->createHistori(
            $kolam->id,
            Auth::user()->id,
            'deleted',
            $kolam->toArray(),
            'kolam dihapus (flag is_deleted)'
        );


        $kolam->update(['is_deleted' => true]);

        return redirect()->route('kolams.index')->with('success', 'Kolam berhasil dihapus.');
    }

    public function historyAll(Request $request)
    {
        $user = Auth::user();
        $search = $request->input('search');
        $kolamId = $request->input('kolam_id'); // filter by kolam

        // Query histories, join kolam & user
        $query = \App\Models\KolamHistori::query()
            ->with(['kolam:id,name', 'user:id,name'])
            // Role-based: admin lihat semua, pembudidaya hanya miliknya
            ->when(
                $user->role !== 'administrator',
                fn($q) =>
                $q->whereHas('kolam', fn($q2) => $q2->where('owner_id', $user->id))
            )
            // Filter by kolam jika ada
            ->when($kolamId, fn($q) => $q->where('kolam_id', $kolamId))
            // Filter by search
            ->when($search, fn($q) => $q->where('description', 'like', "%{$search}%"));

        $perPage = 10;
        $page = max((int) $request->input('page', 1), 1);
        $offset = ($page - 1) * $perPage;

        $total = $query->count();

        $histories = $query
            ->orderBy('created_at', 'desc')
            ->skip($offset)
            ->take($perPage)
            ->get();

        $lastPage = (int) ceil($total / $perPage);

        // Ambil list kolam untuk dropdown filter
        $kolamOptions = Kolam::query()
            ->select('id', 'name')
            ->orderBy('name')
            ->get()
            ->map(fn($k) => ['label' => $k->name, 'value' => $k->id]);

        return Inertia::render('kolams/history-all', [
            'histories' => $histories,
            'pagination' => [
                'total' => $total,
                'per_page' => $perPage,
                'current_page' => $page,
                'last_page' => $lastPage,
                'from' => $total > 0 ? $offset + 1 : 0,
                'to' => min($offset + $perPage, $total),
                'has_prev' => $page > 1,
                'has_next' => $page < $lastPage,
                'prev_page' => $page > 1 ? $page - 1 : null,
                'next_page' => $page < $lastPage ? $page + 1 : null,
            ],
            'filters' => [
                'search' => $search,
                'kolam_id' => $kolamId,
            ],
            'kolam_options' => $kolamOptions,
        ]);
    }


    /**
     * Pastikan user memiliki hak akses untuk kolam ini
     */
    private function authorizeKolam(Kolam $kolam)
    {
        $user = Auth::user();

        if ($user->role !== 'administrator' && $kolam->owner_id !== $user->id) {
            abort(403, 'Anda tidak memiliki akses ke kolam ini.');
        }
    }
}
