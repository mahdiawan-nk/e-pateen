<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Kolam;
use App\Models\KolamMonitoring;
use App\Models\Schedule;
use App\Models\KolamSeeding;
use App\Models\KolamFeeding;
use App\Models\KolamSampling;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;
use Database\Factories\KolamSeedingFactory;
use Database\Factories\KolamFeedingFactory;
use Database\Factories\KolamSamplingFactory;
class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();
        // User::factory()->administrator()->create([
        //     'name' => 'Admin Sistem',
        //     'email' => 'admin@ptinddesa.com',
        //     'password' => Hash::make('12345678'),
        //     'role' => 'administrator',
        //     'is_active' => true
        // ]);
        // User::factory(25)->pembudidaya()->create();

        // Kolam::factory(5)->aktif()->create();
        // Kolam::factory(5)->produksi()->create();

        // KolamMonitoring::factory(10)->create();

        // $startDate = Carbon::create(2025, 9, 12);
        // $endDate = Carbon::create(2025, 12, 15);

        // $kolams = Kolam::all();

        // foreach ($kolams as $kolam) {
        //     $date = $startDate->copy();

        //     while ($date->lte($endDate)) {
        //         KolamMonitoring::factory()->create([
        //             'kolam_id' => $kolam->id,
        //             'created_by' => $kolam->owner_id,
        //             'date' => $date->format('Y-m-d'),
        //         ]);

        //         $date->addDay(); // tanggal berurutan
        //     }
        // }

        // $factory = app(KolamSeedingFactory::class);

        // Kolam::all()->each(function ($kolam) use ($factory) {
        //     // Contoh: 1x seeding per kolam
        //     $factory->createWithLedgerByKolam($kolam);
        // });

        // $factory = app(KolamFeedingFactory::class);

        // KolamSeeding::all()->each(function ($seeding) use ($factory) {
        //     for ($i = 0; $i < 10; $i++) {
        //         $factory->createBySeeding($seeding);
        //     }
        // });

        $factory = app(KolamSamplingFactory::class);

        KolamSeeding::all()->each(function ($seeding) use ($factory) {
            // 10 sampling dalam 2 bulan
            $factory->generateForSeeding($seeding, 10);
        });

        // Schedule::factory(10)->create();

        // $factory = new KolamSeeding();

        // for ($i = 0; $i < 20; $i++) {
        //     KolamSeeding::factory()->createWithLedger();
        // }

        // KolamFeeding::factory(10)->create();

        // KolamSampling::factory(10)->create();

    }
}
