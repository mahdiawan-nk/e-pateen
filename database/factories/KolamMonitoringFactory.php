<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\KolamMonitoring;
use App\Models\Kolam;
use App\Models\User;

/**
 * @extends Factory<KolamMonitoring>
 */
class KolamMonitoringFactory extends Factory
{
    protected $model = KolamMonitoring::class;

    public function definition(): array
    {
        // Ambil kolam random
        return [
            'id' => $this->faker->uuid(),

            // akan di-override saat create() di seeder
            'kolam_id' => null,

            'date' => $this->faker->dateTimeBetween(
                '2025-09-12',
                '2025-12-15'
            )->format('Y-m-d'),

            'water_temp_c' => $this->faker->randomFloat(2, 20, 35),
            'ph' => $this->faker->randomFloat(2, 6, 9),
            'oxygen_mg_l' => $this->faker->randomFloat(2, 4, 10),
            'ammonia_mg_l' => $this->faker->randomFloat(2, 0, 1),
            'turbidity_ntu' => $this->faker->randomFloat(2, 0, 50),

            'remarks' => $this->faker->randomElement([
                'Kondisi air kolam dalam keadaan baik dan stabil.',
                'Suhu air sedikit meningkat namun masih dalam batas normal.',
                'Kadar oksigen terlarut cukup untuk pertumbuhan ikan.',
                'Air terlihat agak keruh, disarankan dilakukan penyaringan.',
                'pH air normal dan tidak membahayakan ikan.',
                'Terdapat peningkatan amonia, perlu penggantian sebagian air.',
                'Kondisi kolam bersih dan tidak ditemukan ikan sakit.',
                'Sirkulasi air berjalan dengan baik.',
                'Perlu pemantauan lanjutan pada kualitas air besok.',
            ]),

            // akan di-override dari kolam->owner_id
            'created_by' => null,

            'created_at' => now(),
            'updated_at' => now(),
        ];
    }
}
