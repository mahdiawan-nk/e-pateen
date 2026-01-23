<?php

namespace Database\Factories;

use App\Models\Kolam;
use App\Models\KolamSeeding;
use App\Models\KolamStockMovement;
use App\Services\KolamStockLedgerService;
use App\Services\HarvestEstimationService;
use App\Services\KolamHistorisService;
use Illuminate\Database\Eloquent\Factories\Factory;
use Carbon\Carbon;

class KolamSeedingFactory extends Factory
{
    protected $model = KolamSeeding::class;

    public function definition(): array
    {
        return [];
    }

    /**
     * Create seeding via Ledger Service
     * + Generate Harvest Estimation
     * + Update Kolam Historis
     * + Update Kolam production_status = growing
     */
    public function createWithLedgerByKolam(Kolam $kolam): KolamSeeding
    {
        $ledgerService = app(KolamStockLedgerService::class);
        $harvestService = app(HarvestEstimationService::class);
        $historisService = app(KolamHistorisService::class);

        // Ambil last movement kolam ini
        $lastDate = KolamStockMovement::where('kolam_id', $kolam->id)
            ->orderBy('event_date', 'desc')
            ->orderBy('created_at', 'desc')
            ->value('event_date');

        // Tentukan tanggal valid (min +21 hari)
        if ($lastDate) {
            $eventDate = Carbon::parse($lastDate)
                ->addWeeks(3)
                ->toDateString();
        } else {
            $eventDate = Carbon::now()
                ->subWeeks(fake()->numberBetween(4, 12))
                ->toDateString();
        }

        // === CREATE SEEDING VIA LEDGER ===
        $seeding = $ledgerService->createSeedingWithInitialStock([
            'kolam_id' => $kolam->id,
            'seed_type' => 'patin',
            'initial_quantity' => $kolam->capacity_fish,
            'seed_size_cm' => fake()->randomFloat(2, 8, 12),
            'average_weight_seed_g' => fake()->randomFloat(2, 5, 12),
            'date_seeded' => $eventDate,
            'source' => fake()->randomElement([
                'Kolam Pembenihan Desa',
                'Supplier Ikan Nusantara',
                'Balai Benih Perikanan Daerah',
                'Unit Pembenihan Rakyat (UPR)',
            ]),
            'notes' => fake()->randomElement([
                'Benih dalam kondisi sehat dan aktif saat diterima.',
                'Proses aklimatisasi berjalan lancar tanpa kendala.',
                'Kualitas air kolam sesuai standar sebelum penebaran.',
                'Tidak ditemukan benih mati saat proses penebaran.',
                'Benih disesuaikan terlebih dahulu dengan suhu kolam.',
            ]),
            'created_by' => $kolam->owner_id,
        ]);

        // === GENERATE HARVEST ESTIMATION ===
        $harvestService->generateForSeeding($seeding);

        // === UPDATE KOLAM STATUS ===
        $oldStatus = $kolam->production_status;



        // === CREATE HISTORI ===
        $changes = [
            [
                'field' => 'production_status',
                'old' => $oldStatus,
                'new' => 'growing',
            ]
        ];

        $historisService->createHistori(
            $seeding->kolam_id,
            $kolam->owner_id,
            'updated',
            $changes,
            'Kolam di set menjadi growing melalui seeding ' . $seeding->id
        );

        $seeding->kolam()->update([
            'production_status' => 'growing',
        ]);

        return $seeding;
    }
}
