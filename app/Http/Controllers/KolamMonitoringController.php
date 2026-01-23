<?php

namespace App\Http\Controllers;

use App\Models\Kolam;
use App\Models\KolamMonitoring;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Auth;
class KolamMonitoringController extends Controller
{
    /**
     * Tampilkan daftar monitoring.
     */
    public function index(Request $request)
    {
        $user = auth()->user();
        $search = $request->input('search');
        $kolamFilter = $request->input('kolam_id');

        $perPage = 10;
        $page = max((int) $request->input('page', 1), 1);
        $offset = ($page - 1) * $perPage;

        $query = KolamMonitoring::query()
            ->with(['kolam.pemilik', 'creator:id,name'])
            // Role-based: admin lihat semua, pembudidaya hanya miliknya
            ->when($user->role !== 'administrator', fn($q) => $q->whereHas('kolam', fn($q2) => $q2->where('owner_id', $user->id)))
            ->when($search, fn($q) => $q->where('remarks', 'like', "%{$search}%"))
            ->when($kolamFilter, fn($q) => $q->where('kolam_id', $kolamFilter));

        $total = $query->count();

        $monitorings = $query
            ->orderBy('date', 'desc')
            ->skip($offset)
            ->take($perPage)
            ->get();

        $lastPage = (int) ceil($total / $perPage);

        $kolam_options = Kolam::select('id', 'name')
            ->when($user->role !== 'administrator', fn($q) => $q->where('owner_id', $user->id))
            ->get()
            ->map(fn($k) => ['label' => $k->name, 'value' => $k->id]);
        return Inertia::render('kolam-monitoring/index', [
            'monitorings' => $monitorings,
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
                'kolam_id' => $kolamFilter,
            ],
            'kolam_options' => $kolam_options,
        ]);
    }

    /**
     * Form tambah monitoring baru.
     */
    public function create()
    {
        $user = Auth::user();

        // Ambil kolam yang bisa dipilih user
        $kolams = Kolam::select('id', 'name')
            ->when($user->role !== 'administrator', fn($q) => $q->where('owner_id', $user->id))
            ->active()
            ->kondisi('active')
            ->produksi(['idle', 'growing'])
            ->get();

        // Format options untuk select
        $kolam_options = $kolams->map(fn($k) => ['label' => $k->name, 'value' => $k->id]);

        // Ambil array kolam_id untuk pembudidaya (dipakai di frontend filter)
        $user_kolam_ids = $user->role !== 'administrator' ? $kolams->pluck('id')->toArray() : [];

        return Inertia::render('kolam-monitoring/create', [
            'kolam_options' => $kolam_options,
            'user_role' => $user->role,
            'user_kolam_ids' => $user_kolam_ids,
        ]);
    }

    /**
     * Simpan monitoring baru.
     */
    public function store(Request $request)
    {
        $user = auth()->user();

        $data = $request->validate([
            'kolam_id' => 'required|exists:kolams,id',
            'date' => 'required|date',
            'water_temp_c' => 'nullable|numeric',
            'ph' => 'nullable|numeric',
            'oxygen_mg_l' => 'nullable|numeric',
            'ammonia_mg_l' => 'nullable|numeric',
            'turbidity_ntu' => 'nullable|numeric',
            'remarks' => 'nullable|string',
        ]);

        $data['id'] = (string) Str::uuid();
        $data['created_by'] = $user->id;

        KolamMonitoring::create($data);

        return to_route('kolam-monitoring.index');
    }

    /**
     * Form edit monitoring.
     */
    public function edit(KolamMonitoring $kolam_monitoring)
    {
        // Pastikan user bisa melihat data ini
        $this->authorize($kolam_monitoring, 'view');
        $user = auth()->user();

        // Ambil daftar kolam sesuai role
        $kolam_options = Kolam::select('id', 'name')
            ->when($user->role !== 'administrator', fn($q) => $q->where('owner_id', $user->id))
            ->get()
            ->map(fn($k) => ['label' => $k->name, 'value' => $k->id]);

        // Untuk pembudidaya, ambil daftar kolam yang dimilikinya
        $user_kolam_ids = $user->role === 'administrator'
            ? $kolam_options->pluck('value')->toArray()
            : Kolam::where('owner_id', $user->id)->pluck('id')->toArray();


        return Inertia::render('kolam-monitoring/update', [
            'monitoring' => $kolam_monitoring,
            'kolam_options' => $kolam_options,
            'user_role' => $user->role,
            'user_kolam_ids' => $user_kolam_ids,
        ]);
    }

    /**
     * Update monitoring.
     */
    public function update(Request $request, KolamMonitoring $kolam_monitoring)
    {
        $this->authorize($kolam_monitoring, 'update');

        $data = $request->validate([
            'kolam_id' => 'required|exists:kolams,id',
            'date' => 'required|date',
            'water_temp_c' => 'nullable|numeric',
            'ph' => 'nullable|numeric',
            'oxygen_mg_l' => 'nullable|numeric',
            'ammonia_mg_l' => 'nullable|numeric',
            'turbidity_ntu' => 'nullable|numeric',
            'remarks' => 'nullable|string',
        ]);

        $kolam_monitoring->update($data);
        Inertia::flash('toast',[
            'type' => 'success',
            'message' => 'User created!',
        ]);
        return to_route('kolam-monitoring.index');
    }

    /**
     * Hapus monitoring.
     */
    public function destroy(KolamMonitoring $kolam_monitoring)
    {
        $this->authorize($kolam_monitoring, 'delete');

        $kolam_monitoring->delete();

        return to_route('kolam-monitoring.index');
    }

    /**
     * Periksa apakah user memiliki akses terhadap monitoring tertentu.
     * @param KolamMonitoring $monitoring
     * @param string $action ('view', 'update', 'delete')
     */
    protected function authorize(KolamMonitoring $monitoring, string $action = 'view')
    {
        $user = auth()->user();

        // Admin bisa akses semua
        if ($user->role === 'administrator') {
            return true;
        }

        // Pembudidaya hanya bisa akses monitoring kolam miliknya
        if ($monitoring->kolam->owner_id !== $user->id) {
            abort(403, "Anda tidak memiliki izin untuk {$action} data monitoring ini.");
        }

        return true;
    }
}
