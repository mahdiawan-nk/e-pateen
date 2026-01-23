<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\KolamSampling;
use App\Models\KolamSeeding;
use App\Services\KolamGrowthCalculator;
use App\Services\KolamStockLedgerService;
use App\Services\HarvestEstimationService;
use Carbon\Carbon;

class KolamSamplingFactory extends Factory
{
    protected $model = KolamSampling::class;

    public function definition(): array
    {
        return [];
    }

    /**
     * Generate 10x sampling / 2 bulan sejak seeding
     * + Auto mortality ledger
     * + Update harvest estimation
     */
    public function generateForSeeding(KolamSeeding $seeding, int $totalSampling = 10): void
    {
        $calculator = app(KolamGrowthCalculator::class);
        $stockService = app(KolamStockLedgerService::class);
        $harvestService = app(HarvestEstimationService::class);

        $startDate = Carbon::parse($seeding->date_seeded);
        $endDate = $startDate->copy()->addMonths(2);

        // interval hari antar sampling
        $intervalDays = max(1, (int) floor($startDate->diffInDays($endDate) / $totalSampling));

        // === BASE LINE dari SEEDING ===
        $currentPopulation = $seeding->initial_quantity;
        $currentWeight = $seeding->average_weight_seed_g;
        $currentLength = $seeding->seed_size_cm;

        $lastDate = $startDate->copy();

        for ($i = 1; $i <= $totalSampling; $i++) {
            $samplingDate = $lastDate->copy()->addDays($intervalDays);

            // ==== Growth realistis ====
            $weightIncrease = fake()->randomFloat(2, 1.5, 6); // gram / sampling
            $lengthIncrease = fake()->randomFloat(2, 0.5, 2); // cm / sampling

            $newWeight = round($currentWeight + $weightIncrease, 2);
            $newLength = round($currentLength + $lengthIncrease, 2);

            // ==== Mortality ====
            $mortality = fake()->numberBetween(0, 25);
            $currentPopulation = max($currentPopulation - $mortality, 0);

            // ==== RAW INPUT ====
            $data = [
                'kolam_id' => $seeding->kolam_id,
                'seeding_id' => $seeding->id,
                'sampling_date' => $samplingDate->format('Y-m-d'),
                'day_since_last' => $calculator->calculateDayDifference(
                    $seeding->kolam_id,
                    $samplingDate->format('Y-m-d')
                ),

                'estimated_population' => $currentPopulation,

                // 5–10% dari populasi
                'sample_size' => (int) round(
                    $currentPopulation * fake()->randomFloat(2, 0.05, 0.10)
                ),

                'sampling_method' => 'manual',

                // Berat & panjang progresif
                'avg_weight_start_g' => $currentWeight,
                'avg_weight_end_g' => $newWeight,

                'avg_length_start_cm' => $currentLength,
                'avg_length_end_cm' => $newLength,

                'mortality_count' => $mortality,

                'notes' => fake()->randomElement([
                    'Ikan terlihat aktif dan pertumbuhan cukup merata.',
                    'Sampling dilakukan pagi hari dengan kondisi air stabil.',
                    'Beberapa ikan kecil terlihat tertinggal dalam pertumbuhan.',
                    'Kualitas air baik dan tidak ditemukan gejala penyakit.',
                    'Pertumbuhan ikan sesuai dengan target budidaya.',
                ]),

                'created_by' => $seeding->created_by,
            ];

            // === AUTO CALCULATE (SGR, ADG, dll) ===
            $finalData = $calculator->calculate($data);

            // === CREATE SAMPLING ===
            $sampling = KolamSampling::create($finalData);

            // === RECORD MORTALITY KE LEDGER ===
            if ($mortality > 0) {
                $stockService->recordMortality(
                    $data['kolam_id'],
                    $data['seeding_id'],
                    $sampling->id,
                    $mortality,
                    $samplingDate->format('Y-m-d'),
                    'Mortality tercatat saat sampling ke-' . $i
                );
            }

            // === UPDATE HARVEST ESTIMATION ===
            $harvestService->updateFromSampling($sampling);

            // === UPDATE BASE LINE UNTUK ITERASI SELANJUTNYA ===
            $currentWeight = $newWeight;
            $currentLength = $newLength;
            $lastDate = $samplingDate;
        }
    }
}
