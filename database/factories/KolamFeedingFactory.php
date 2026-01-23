<?php

namespace Database\Factories;

use App\Models\KolamFeeding;
use App\Models\KolamSeeding;
use Illuminate\Database\Eloquent\Factories\Factory;
use Carbon\Carbon;

class KolamFeedingFactory extends Factory
{
    protected $model = KolamFeeding::class;

    public function definition()
    {
        return [];
    }

    /**
     * Create feeding berdasarkan data seeding
     * Rule:
     * - kolam_id & seeding_id dari KolamSeeding
     * - feeding_date masuk akal (setelah date_seeded, sebelum estimasi panen / max +3 bulan)
     * - feed_type masuk akal
     * - quantity_kg proporsional dengan populasi ikan
     * - feeding_method = manual
     * - feed_source realistis
     * - notes Bahasa Indonesia valid
     * - created_by = created_by seeding
     */
    public function createBySeeding(KolamSeeding $seeding): KolamFeeding
    {
        // Tentukan range tanggal feeding
        $startDate = Carbon::parse($seeding->date_seeded)->addDays(1);
        $endDate = Carbon::parse($seeding->date_seeded)->addMonths(3);

        $feedingDate = fake()
            ->dateTimeBetween($startDate, $endDate)
            ->format('Y-m-d');

        // Perkiraan jumlah pakan harian (0.5% - 3% dari estimasi biomassa)
        $estimatedBiomassKg = (
            $seeding->initial_quantity *
            ($seeding->average_weight_seed_g ?? 5)
        ) / 1000;

        $dailyFeedKg = round(
            $estimatedBiomassKg * fake()->randomFloat(2, 0.005, 0.03),
            2
        );

        return KolamFeeding::create([
            'kolam_id' => $seeding->kolam_id,
            'seeding_id' => $seeding->id,

            'feeding_date' => $feedingDate,

            'feed_type' => fake()->randomElement([
                'Pelet Apung',
                'Pelet Tenggelam',
                'Pakan Alami (Cacing/Ampas Tahu)',
            ]),

            'quantity_kg' => max($dailyFeedKg, 0.5), // minimal 0.5 kg

            'feeding_method' => 'Manual',

            'feed_source' => fake()->randomElement([
                'Supplier Pakan Lokal',
                'Toko Pakan Perikanan',
                'Buatan Sendiri',
            ]),

            'notes' => fake()->randomElement([
                'Pemberian pakan dilakukan merata di seluruh area kolam.',
                'Ikan terlihat aktif dan responsif terhadap pakan.',
                'Sebagian pakan tersisa, akan disesuaikan pada pemberian berikutnya.',
                'Pemberian pakan dilakukan pagi hari dalam kondisi cuaca cerah.',
                'Tidak ditemukan ikan mati setelah proses pemberian pakan.',
            ]),

            'created_by' => $seeding->created_by,
        ]);
    }
}
