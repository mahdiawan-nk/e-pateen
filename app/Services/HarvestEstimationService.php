<?php

namespace App\Services;

use App\Models\KolamSeeding;
use App\Models\KolamSampling;
use App\Models\HarvestEstimation;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class HarvestEstimationService
{
    /**
     * Generate estimasi panen baru saat seeding dibuat
     */
    public function generateForSeeding(KolamSeeding $seeding): HarvestEstimation
    {
        return DB::transaction(function () use ($seeding) {
            $estimatedPopulation = $seeding->initial_quantity;

            // Estimasi awal berat per ekor bisa diambil dari average_weight_seed_g
            $estimatedWeight = $seeding->average_weight_seed_g ?? 1;

            // Estimasi biomassa
            $estimatedBiomass = ($estimatedPopulation * $estimatedWeight) / 1000; // kg

            // Estimasi panen: contoh sederhana 3 bulan dari tanggal seeding
            $estimatedHarvestDate = Carbon::parse($seeding->date_seeded)->addMonths(3);

            $harvest = HarvestEstimation::create([
                'seeding_id' => $seeding->id,
                'kolam_id' => $seeding->kolam_id,
                'estimated_harvest_date' => $estimatedHarvestDate,
                'estimated_population' => $estimatedPopulation,
                'estimated_avg_weight_g' => $estimatedWeight,
                'estimated_biomass_kg' => $estimatedBiomass,
                'notes' => 'Estimasi awal panen berdasarkan seeding',
            ]);

            return $harvest;
        });
    }

    /**
     * Update estimasi panen berdasarkan sampling terbaru
     */
    public function updateFromSampling(KolamSampling $sampling): HarvestEstimation|null
    {
        return DB::transaction(function () use ($sampling) {
            $harvest = HarvestEstimation::where('seeding_id', $sampling->kolam->seeding()->latest()->first()->id)
                ->first();

            if (!$harvest) {
                return null;
            }

            // Update estimated population: kurangi mortality terbaru
            $previousPopulation = $harvest->estimated_population;
            $newPopulation = max($previousPopulation - $sampling->mortality_count, 0);

            // Update rata-rata berat per ekor
            $estimatedWeight = $sampling->avg_weight_end_g ?? $harvest->estimated_avg_weight_g ?? 1;

            // Update biomassa
            $estimatedBiomass = ($newPopulation * $estimatedWeight) / 1000; // kg

            // Update catatan
            $notes = trim(($harvest->notes ?? '') . "\nUpdate via sampling {$sampling->sampling_date}");

            $harvest->update([
                'estimated_population' => $newPopulation,
                'estimated_avg_weight_g' => $estimatedWeight,
                'estimated_biomass_kg' => $estimatedBiomass,
                'notes' => $notes,
            ]);

            return $harvest;
        });
    }

    /**
     * Optional: hitung estimasi panen dengan logika custom
     */
    public function recalcHarvest(KolamSeeding $seeding): HarvestEstimation|null
    {
        $latestSampling = $seeding->samplings()->latest('sampling_date')->first();
        $harvest = HarvestEstimation::where('seeding_id', $seeding->id)->first();

        if (!$harvest)
            return null;

        // Estimated population berdasarkan sampling terakhir
        $newPopulation = $latestSampling
            ? $harvest->estimated_population - $latestSampling->mortality_count
            : $harvest->estimated_population;

        $estimatedWeight = $latestSampling->avg_weight_end_g ?? $harvest->estimated_avg_weight_g ?? 1;
        $estimatedBiomass = ($newPopulation * $estimatedWeight) / 1000;

        $harvest->update([
            'estimated_population' => $newPopulation,
            'estimated_avg_weight_g' => $estimatedWeight,
            'estimated_biomass_kg' => $estimatedBiomass,
        ]);

        return $harvest;
    }
}
