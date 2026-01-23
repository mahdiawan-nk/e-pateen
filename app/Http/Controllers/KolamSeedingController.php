<?php

namespace App\Http\Controllers;

use App\Models\KolamSeeding;
use App\Models\KolamStockMovement;
use App\Models\Kolam;
use App\Services\KolamStockLedgerService;
use App\Services\HarvestEstimationService;
use App\Services\KolamHistorisService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class KolamSeedingController extends Controller
{
    protected $user;
    protected KolamStockLedgerService $stockService;
    protected HarvestEstimationService $harvestService;
    protected KolamHistorisService $historisService;

    public function __construct(KolamStockLedgerService $stockService, HarvestEstimationService $harvestService, KolamHistorisService $historisService)
    {
        // $this->middleware('auth');
        $this->harvestService = $harvestService;
        $this->stockService = $stockService;
        $this->historisService = $historisService;
        $this->user = Auth::user();
    }

    protected function dataKolam(string $for = 'index')
    {
        if (in_array($for, ['create', 'update'])) {
            return Kolam::select('id', 'name', 'capacity_fish')
                ->byRole($this->user)
                ->produksi(['idle'])
                ->kondisi('active')
                ->active()
                ->get()
                ->map(fn($k) => [
                    'label' => $k->name . ' (Kapasitas: ' . $k->capacity_fish . ' ekor)',
                    'value' => $k->id,
                    'kapasitas' => $k->capacity_fish
                ]);
        }
        return Kolam::select('id', 'name', 'capacity_fish')
            ->byRole($this->user)
            ->produksi(['idle', 'growing'])
            ->kondisi('active')
            ->active()
            ->get()
            ->map(fn($k) => [
                'label' => $k->name . ' (Kapasitas: ' . $k->capacity_fish . ' ekor)',
                'value' => $k->id,
                'kapasitas' => $k->capacity_fish
            ]);

    }

    // ============================
    // INDEX
    // ============================
    public function index(Request $request)
    {
        $user = Auth::user();

        $search = $request->input('search');
        $kolamFilter = $request->input('kolam_id');

        $query = KolamSeeding::query()
            ->with(['kolam.pemilik'])
            ->whereHas('kolam', fn($q) => $q->byRole($user))
            ->when($search, fn($q) => $q->where('notes', 'like', "%{$search}%"))
            ->when($kolamFilter, fn($q) => $q->where('kolam_id', $kolamFilter))
            ->orderBy('date_seeded', 'desc');

        return $this->inertia('kolam-seeding/index', $query, [
            'dataKey' => 'seedings',
            'perPage' => 10,
            'filters' => ['search', 'kolam_id'],
            'with' => [
                'kolam_options' => $this->dataKolam(),
            ],
        ]);
    }

    // ============================
    // CREATE
    // ============================
    public function create()
    {
        $user = Auth::user();
        $kolams = $this->dataKolam();

        $user_kolam_ids = $user->role !== 'administrator'
            ? $kolams->pluck('value')->toArray()
            : [];

        return $this->inertia('kolam-seeding/create', null, [
            'with' => [
                'kolam_options' => $kolams,
                'user_role' => $user->role,
                'user_kolam_ids' => $user_kolam_ids,
            ]
        ]);
    }

    // ============================
    // STORE (CREATE + LEDGER)
    // ============================
    public function store(Request $request, KolamStockLedgerService $ledger)
    {
        $user = Auth::user();

        $data = $request->validate([
            'kolam_id' => 'required|uuid|exists:kolams,id',
            'seed_type' => 'required|string|max:50',
            'initial_quantity' => 'required|integer|min:1',
            'seed_size_cm' => 'nullable|numeric|min:0',
            'average_weight_seed_g' => 'nullable|numeric|min:0',
            'date_seeded' => 'required|date',
            'source' => 'nullable|string|max:100',
            'notes' => 'nullable|string',
        ]);

        return DB::transaction(function () use ($data, $ledger, $user) {

            // 🔐 Rule: hanya 1 growing per kolam
            $exists = KolamSeeding::where('kolam_id', $data['kolam_id'])
                ->where('cycle_status', 'growing')
                ->lockForUpdate()
                ->exists();

            if ($exists) {
                throw ValidationException::withMessages([
                    'kolam_id' => 'Kolam masih memiliki siklus aktif (growing). Tutup dulu sebelum seeding baru.'
                ]);
            }

            $seeding = $this->stockService->createSeedingWithInitialStock([
                'kolam_id' => $data['kolam_id'],
                'seed_type' => $data['seed_type'],
                'initial_quantity' => $data['initial_quantity'],
                'seed_size_cm' => $data['seed_size_cm'] ?? null,
                'average_weight_seed_g' => $data['average_weight_seed_g'] ?? null,
                'date_seeded' => $data['date_seeded'],
                'source' => $data['source'] ?? null,
                'notes' => $data['notes'] ?? null,
                'created_by' => $user->id,
            ]);

            // 2️⃣ Buat estimasi panen berdasarkan seeding
            $this->harvestService->generateForSeeding($seeding);


            $changes[] = [
                'field' => 'production_status',
                'old' => $seeding->kolam->production_status,
                'new' => 'growing',
            ];
            $this->historisService->createHistori(
                $seeding->kolam_id,
                $user->id,
                'updated',
                $changes,
                'kolam di set menjadi growing melalui buat seeding dengan kolam seeding ' . $seeding->id
            );
            $seeding->kolam()->update([
                'production_status' => 'growing'
            ]);
            return to_route('kolam-seeding.index')
                ->with('success', 'Seeding berhasil dibuat & stok tercatat.');
        });
    }

    // ============================
    // EDIT
    // ============================
    public function edit(KolamSeeding $kolamSeeding)
    {
        $kolamSeeding['current_balance'] = $kolamSeeding->currentBalance();
        $user = Auth::user();
        $kolams = $this->dataKolam();

        $user_kolam_ids = $user->role !== 'administrator'
            ? $kolams->pluck('value')->toArray()
            : [];

        return $this->inertia('kolam-seeding/update', null, [
            'with' => [
                'seeding' => $kolamSeeding->load('kolam'),
                'kolam_options' => $kolams,
                'user_role' => $user->role,
                'user_kolam_ids' => $user_kolam_ids,
            ]
        ]);
    }

    // ============================
    // UPDATE (ADJUSTMENT LEDGER)
    // ============================
    public function update(Request $request, KolamSeeding $kolamSeeding, KolamStockLedgerService $ledger)
    {
        $data = $request->validate([
            'seed_type' => 'required|string|max:50',
            // 'initial_quantity' => 'required|integer|min:1',
            'seed_size_cm' => 'nullable|numeric|min:0',
            'average_weight_seed_g' => 'nullable|numeric|min:0',
            'source' => 'nullable|string|max:100',
            'notes' => 'nullable|string',
        ]);

        return DB::transaction(function () use ($kolamSeeding, $data, $ledger) {

            $kolamSeeding->update($data);

            return to_route('kolam-seeding.index')
                ->with('success', 'Seeding diperbarui & ledger disesuaikan.');
        });
    }

    public function movementView(string $id)
    {
        // Ambil seeding + kolam
        $seeding = KolamSeeding::with('kolam')
            ->where('id', $id)
            ->firstOrFail();

        // Ambil semua movement (ledger) untuk seeding ini
        $movements = KolamStockMovement::where('seeding_id', $seeding->id)
            ->orderBy('event_date', 'desc')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($m) {
                return [
                    'id' => $m->id,
                    'type' => $m->event_type,
                    'quantity' => (int) $m->quantity_change,
                    'balance_after' => (int) $m->balance_after,
                    'notes' => $m->notes,
                    'created_at' => $m->event_date
                        ? $m->event_date->toDateTimeString()
                        : $m->created_at->toDateTimeString(),
                    'created_by' => optional($m->creator)->name ?? 'System',
                ];
            });

        // Saldo terakhir (single source of truth)
        $currentStock = $movements->first()['balance_after'] ?? 0;

        return $this->inertia('kolam-seeding/movement', null, [
            'with' => [
                'seeding' => [
                    'id' => $seeding->id,
                    'kolam_name' => $seeding->kolam->name ?? '-',
                    'seed_type' => $seeding->seed_type,
                    'current_stock' => $currentStock,
                ],
                'movements' => $movements->values(),
            ]
        ]);

    }

    public function movementStock(Request $request, string $seedingId)
    {
        $validated = $request->validate([
            'type' => 'required|in:transfer_in,transfer_out,adjustment',
            'quantity' => 'required|integer|min:1',
            'notes' => 'nullable|string|max:255',
        ]);

        DB::transaction(function () use ($seedingId, $validated) {
            $this->stockService->handleMovement(
                seedingId: $seedingId,
                type: $validated['type'],
                quantity: $validated['quantity'],
                notes: $validated['notes'] ?? null,
                userId: '019bc406-1590-7359-9c80-0637ef11e184'
            );
        });

        return redirect()
            ->back()
            ->with('success', 'Movement stok berhasil dicatat');
    }

    // ============================
    // DESTROY (BLOCKED)
    // ============================
    public function destroy(KolamSeeding $kolamSeeding)
    {
        throw ValidationException::withMessages([
            'delete' => 'Seeding tidak boleh dihapus karena terkait dengan ledger stok. Gunakan adjustment atau tutup siklus.'
        ]);
    }

    // ============================
    // CLOSE CYCLE (OPTIONAL ROUTE)
    // ============================
    public function close(Request $request, KolamSeeding $kolamSeeding, KolamStockLedgerService $ledger)
    {
        $request->validate([
            'harvest_quantity' => 'required|integer|min:1'
        ]);

        return DB::transaction(function () use ($request, $kolamSeeding, $ledger) {

            $ledger->recordHarvest(
                kolamId: $kolamSeeding->kolam_id,
                seedingId: $kolamSeeding->id,
                quantity: $request->harvest_quantity,
                notes: 'Final harvest'
            );

            $kolamSeeding->update([
                'cycle_status' => 'closed',
                'closed_at' => now(),
                'closed_by' => $this->user->id,
            ]);

            return to_route('kolam-seeding.index')
                ->with('success', 'Siklus berhasil ditutup.');
        });
    }
}
