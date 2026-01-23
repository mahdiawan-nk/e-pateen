<?php

namespace Database\Factories;

use App\Models\Schedule;
use App\Models\Kolam;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Schedule>
 */
class ScheduleFactory extends Factory
{
    protected $model = Schedule::class;

    public function definition(): array
    {
        // Ambil random kolam dan user
        $kolam = Kolam::inRandomOrder()->first();
        $user = User::inRandomOrder()->first();

        return [
            'id' => (string) Str::uuid(),
            'kolam_id' => $kolam?->id ?? Kolam::factory(),
            'activity_type' => $this->faker->randomElement(['seeding', 'feeding', 'sampling', 'other']),
            'scheduled_date' => $this->faker->dateTimeBetween('-1 month', '+1 month')->format('Y-m-d'),
            'scheduled_time' => $this->faker->optional()->time('H:i:s'),
            'details' => $this->faker->sentence(),
            'status' => $this->faker->randomElement(['pending', 'done', 'cancelled']),
            // 'assigned_to' => $user?->id,
            'created_by' => $user?->id ?? User::factory(),
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }
}
