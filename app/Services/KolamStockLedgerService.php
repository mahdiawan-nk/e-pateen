<?php

namespace App\Services;

use App\Models\KolamStockMovement;
use App\Models\KolamSeeding;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Carbon\CarbonInterface;
use Illuminate\Support\Str;
class KolamStockLedgerService
{
    // =============================
    // INTERNAL HELPERS
    // =============================

    protected function getLastKolamMovement(string $kolamId)
    {
        return KolamStockMovement::where('kolam_id', $kolamId)
            ->orderBy('event_date', 'desc')
            ->orderBy('created_at', 'desc')
            ->lockForUpdate()
            ->first();
    }

    protected function getLastSeedingMovement(string $seedingId)
    {
        return KolamStockMovement::where('seeding_id', $seedingId)
            ->orderBy('event_date', 'desc')
            ->orderBy('created_at', 'desc')
            ->lockForUpdate()
            ->first();
    }

    protected function getLastKolamSeedingMovement(string $seedingId, string $kolamId)
    {
        return KolamStockMovement::where('seeding_id', $seedingId)
            ->where('kolam_id', $kolamId)
            ->orderBy('event_date', 'desc')
            ->orderBy('created_at', 'desc')
            ->lockForUpdate()
            ->first();
    }

    protected function getKolamBalance(string $kolamId): int
    {
        return $this->getLastKolamMovement($kolamId)?->balance_after ?? 0;
    }

    public function getSeedingBalance(string $seedingId): int
    {
        return $this->getLastSeedingMovement($seedingId)?->balance_after ?? 0;
    }

    protected function assertEventDateValid(?CarbonInterface $lastDate, string $newDate)
    {
        if ($lastDate && Carbon::parse($newDate)->lt($lastDate)) {
            throw ValidationException::withMessages([
                'event_date' => 'Tanggal event tidak boleh lebih lama dari transaksi terakhir.' . $lastDate . ' New Date' . $newDate
            ]);
        }
    }

    // =============================
    // CORE LEDGER ENGINE
    // =============================

    protected function recordMovement(array $payload): KolamStockMovement
    {
        return DB::transaction(function () use ($payload) {

            $kolamId = $payload['kolam_id'];
            $seedingId = $payload['seeding_id'] ?? null;

            $lastKolamSeeding = $this->getLastKolamSeedingMovement($seedingId, $kolamId);

            // $lastKolam = $this->getLastKolamMovement($kolamId);
            // $lastSeeding = $seedingId
            //     ? $this->getLastSeedingMovement($seedingId)
            //     : null;

            $lastKolamBalance = $lastKolamSeeding?->balance_after ?? 0;
            $lastSeedingBalance = $lastKolamSeeding?->balance_after ?? 0;

            $this->assertEventDateValid($lastKolamSeeding?->event_date, $payload['event_date']);

            // =============================
            // HITUNG BALANCE BARU
            // =============================
            $newKolamBalance = $lastKolamBalance + $payload['quantity_change'];

            if ($newKolamBalance < 0) {
                throw ValidationException::withMessages([
                    'quantity_change' => 'Saldo kolam tidak mencukupi.' . $lastKolamBalance
                ]);
            }

            $newSeedingBalance = null;
            if ($seedingId) {
                $newSeedingBalance = $lastSeedingBalance + $payload['quantity_change'];

                if ($newSeedingBalance < 0) {
                    throw ValidationException::withMessages([
                        'quantity_change' => 'Saldo seeding tidak mencukupi.'
                    ]);
                }
            }

            return KolamStockMovement::create([
                'kolam_id' => $kolamId,
                'seeding_id' => $seedingId,
                'event_type' => $payload['event_type'],
                'quantity_change' => $payload['quantity_change'],
                'balance_after' => $newKolamBalance,
                'balance_after_seeding' => $newSeedingBalance,
                'event_date' => $payload['event_date'],
                'ref_table' => $payload['ref_table'] ?? null,
                'ref_id' => $payload['ref_id'] ?? null,
                'notes' => $payload['notes'] ?? null,
                'created_by' => $payload['created_by'] ?? null,
            ]);
        });
    }

    // =============================
    // PUBLIC API
    // =============================

    public function createSeedingWithInitialStock(array $data)
    {
        return DB::transaction(function () use ($data) {

            $seeding = KolamSeeding::create([
                'kolam_id' => $data['kolam_id'],
                'seed_type' => $data['seed_type'],
                'initial_quantity' => $data['initial_quantity'],
                'seed_size_cm' => $data['seed_size_cm'] ?? null,
                'average_weight_seed_g' => $data['average_weight_seed_g'] ?? null,
                'date_seeded' => $data['date_seeded'],
                'source' => $data['source'] ?? null,
                'notes' => $data['notes'] ?? null,
                'created_by' => $data['created_by'] ?? null,
            ]);

            $movement = $this->recordMovement([
                'kolam_id' => $seeding->kolam_id,
                'seeding_id' => $seeding->id,
                'event_type' => 'seeding',
                'quantity_change' => abs($data['initial_quantity']),
                'event_date' => $data['date_seeded'],
                'ref_table' => 'kolam_seedings',
                'ref_id' => $seeding->id,
                'notes' => 'Initial seeding'
            ]);

            $seeding->update([
                'initial_movement_id' => $movement->id
            ]);

            return $seeding->refresh();
        });
    }

    public function handleMovement(
        string $seedingId,
        string $type,
        int $quantity,
        ?string $notes = null,
        ?string $userId = null,
    ) {
        $seeding = KolamSeeding::findOrFail($seedingId);
        $eventDate = now()->toDateString();
        $refId = (string) Str::uuid();
        $targetKolamId = $seeding->kolam_id;
        $targetSeedingId = $seeding->id;

        return DB::transaction(function () use ($seeding, $type, $quantity, $notes, $eventDate, $refId, $targetKolamId, $targetSeedingId) {

            return match ($type) {

                // =========================
                // BASIC EVENTS
                // =========================
                'seeding' => $this->recordSeeding(
                    kolamId: $seeding->kolam_id,
                    seedingId: $seeding->id,
                    quantity: $quantity,
                    eventDate: $eventDate,
                    notes: $notes
                ),

                'mortality' => $this->recordMortality(
                    kolamId: $seeding->kolam_id,
                    seedingId: $seeding->id,
                    samplingId: $seeding->id,
                    quantity: $quantity,
                    eventDate: $eventDate,
                    notes: $notes
                ),

                'harvest' => $this->recordHarvest(
                    kolamId: $seeding->kolam_id,
                    seedingId: $seeding->id,
                    quantity: $quantity,
                    eventDate: $eventDate,
                    notes: $notes
                ),

                'adjustment' => $this->recordAdjustment(
                    kolamId: $seeding->kolam_id,
                    seedingId: $seeding->id,
                    quantityDelta: $quantity,
                    notes: $notes
                ),

                // =========================
                // TRANSFER EVENTS
                // =========================
                'transfer_out' => $this->handleTransferOut(
                    sourceSeeding: $seeding,
                    targetKolamId: $targetKolamId,
                    targetSeedingId: $targetSeedingId,
                    quantity: $quantity,
                    eventDate: $eventDate,
                    refId: $refId,
                    notes: $notes
                ),

                'transfer_in' => $this->handleTransferIn(
                    targetKolamId: $targetKolamId,
                    targetSeedingId: $targetSeedingId,
                    sourceSeeding: $seeding,
                    quantity: $quantity,
                    eventDate: $eventDate,
                    refId: $refId,
                    notes: $notes
                ),

                default => throw ValidationException::withMessages([
                    'type' => 'Event type tidak valid'
                ])
            };
        });
    }

    protected function handleTransferOut(
        KolamSeeding $sourceSeeding,
        ?string $targetKolamId,
        ?string $targetSeedingId,
        int $quantity,
        string $eventDate,
        string $refId,
        ?string $notes
    ) {
        if (!$targetKolamId) {
            throw ValidationException::withMessages([
                'target_kolam_id' => 'Kolam tujuan wajib diisi untuk transfer'
            ]);
        }

        // OUT dari sumber
        return $this->recordMovement([
            'kolam_id' => $sourceSeeding->kolam_id,
            'seeding_id' => $sourceSeeding->id,
            'event_type' => 'transfer_out',
            'quantity_change' => -abs($quantity),
            'event_date' => $eventDate,
            'ref_table' => 'kolam_transfer',
            'ref_id' => $refId,
            'notes' => $notes ?? 'Transfer keluar'
        ]);
    }

    protected function handleTransferIn(
        ?string $targetKolamId,
        ?string $targetSeedingId,
        KolamSeeding $sourceSeeding,
        int $quantity,
        string $eventDate,
        string $refId,
        ?string $notes
    ) {
        if (!$targetKolamId) {
            throw ValidationException::withMessages([
                'target_kolam_id' => 'Kolam tujuan wajib diisi untuk transfer'
            ]);
        }

        return $this->recordMovement([
            'kolam_id' => $targetKolamId,
            'seeding_id' => $targetSeedingId,
            'event_type' => 'transfer_in',
            'quantity_change' => abs($quantity),
            'event_date' => $eventDate,
            'ref_table' => 'kolam_transfer',
            'ref_id' => $refId,
            'notes' => $notes ?? 'Transfer masuk'
        ]);
    }


    public function recordSeeding(
        string $kolamId,
        string $seedingId,
        int $quantity,
        string $eventDate,
        ?string $notes = null
    ): KolamStockMovement {
        return $this->recordMovement([
            'kolam_id' => $kolamId,
            'seeding_id' => $seedingId,
            'event_type' => 'seeding',
            'quantity_change' => abs($quantity),
            'event_date' => $eventDate,
            'ref_table' => 'kolam_seedings',
            'ref_id' => $seedingId,
            'notes' => $notes ?? 'Initial seeding'
        ]);
    }

    public function recordMortality(
        string $kolamId,
        string $seedingId,
        string $samplingId,
        int $quantity,
        string $eventDate,
        ?string $notes = null
    ): KolamStockMovement {
        return $this->recordMovement([
            'kolam_id' => $kolamId,
            'seeding_id' => $seedingId,
            'event_type' => 'mortality',
            'quantity_change' => -abs($quantity),
            'event_date' => $eventDate,
            'ref_table' => 'kolam_samplings',
            'ref_id' => $samplingId,
            'notes' => $notes ?? 'Mortality from sampling'
        ]);
    }

    public function recordHarvest(
        string $kolamId,
        string $seedingId,
        int $quantity,
        ?string $eventDate = null,
        ?string $notes = null
    ): KolamStockMovement {
        return $this->recordMovement([
            'kolam_id' => $kolamId,
            'seeding_id' => $seedingId,
            'event_type' => 'harvest',
            'quantity_change' => -abs($quantity),
            'event_date' => $eventDate ?? now()->toDateString(),
            'ref_table' => 'kolam_seedings',
            'ref_id' => $seedingId,
            'notes' => $notes ?? 'Harvest'
        ]);
    }

    public function recordAdjustment(
        string $kolamId,
        string $seedingId,
        int $quantityDelta,
        ?string $notes = null
    ): KolamStockMovement {
        if ($quantityDelta === 0) {
            throw ValidationException::withMessages([
                'quantity_delta' => 'Delta stok tidak boleh 0'
            ]);
        }

        return $this->recordMovement([
            'kolam_id' => $kolamId,
            'seeding_id' => $seedingId,
            'event_type' => 'adjustment',
            'quantity_change' => $quantityDelta,
            'event_date' => now()->toDateString(),
            'ref_table' => 'kolam_seedings',
            'ref_id' => $seedingId,
            'notes' => $notes ?? 'Manual adjustment'
        ]);
    }

    // =============================
    // QUERY HELPERS
    // =============================

    public function getKolamBalanced(string $kolamId): int
    {
        return KolamStockMovement::where('kolam_id', $kolamId)
            ->orderBy('event_date', 'desc')
            ->orderBy('created_at', 'desc')
            ->value('balance_after') ?? 0;
    }

    public function getSeedingBalanced(string $seedingId): int
    {
        return KolamStockMovement::where('seeding_id', $seedingId)
            ->orderBy('event_date', 'desc')
            ->orderBy('created_at', 'desc')
            ->value('balance_after_seeding') ?? 0;
    }
}
