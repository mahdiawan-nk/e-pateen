<?php

namespace Database\Factories;

use App\Models\Kolam;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Kolam>
 */
class KolamFactory extends Factory
{
    protected $model = Kolam::class;

    public function definition(): array
    {
        // Ambil random user sebagai pemilik
        $owner = User::inRandomOrder()->first();

        return [
            'id' => (string) Str::uuid(),

            'name' => 'Kolam ' . fake()->word() . ' ' . fake()->numberBetween(1, 100),
            'location' => fake()->address(),

            // Dimensi (meter)
            'length_m' => fake()->randomFloat(2, 5, 50),
            'width_m' => fake()->randomFloat(2, 5, 30),
            'depth_m' => fake()->randomFloat(2, 1, 5),

            // Ini akan otomatis dihitung ulang oleh Model Event,
            // tapi tetap kita isi agar tidak null saat insert
            'water_volume_l' => 0,

            'capacity_fish' => fake()->numberBetween(100, 5000),

            'type' => fake()->randomElement([
                'tanah',
                'terpal',
                'beton',
                'bioflok',
            ]),

            'condition_status' => fake()->randomElement([
                'active',
                'maintenance',
                'damaged',
            ]),

            'production_status' => fake()->randomElement([
                'idle',
                'stocking',
                'nursery',
                'growing',
                'harvest',
            ]),

            'owner_id' => $owner?->id,
        ];
    }

    /* ==============================
     | STATES
     ============================== */

    /**
     * Kolam aktif & siap produksi
     */
    public function aktif(): static
    {
        return $this->state(fn() => [
            'condition_status' => 'active',
            'production_status' => 'idle',
        ]);
    }

    /**
     * Kolam dalam masa budidaya
     */
    public function produksi(): static
    {
        return $this->state(fn() => [
            'condition_status' => 'active',
            'production_status' => 'growing',
        ]);
    }

    public function harvest(): static
    {
        return $this->state(fn() => [
            'condition_status' => 'active',
            'production_status' => 'harvest',
        ]);
    }

    /**
     * Kolam rusak / maintenance
     */
    public function maintenance(): static
    {
        return $this->state(fn() => [
            'condition_status' => 'maintenance',
            'production_status' => 'idle',
        ]);
    }
}
