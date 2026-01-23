<?php

namespace App\Services;

use App\Models\KolamSampling;
use Carbon\Carbon;
class KolamGrowthCalculator
{
    public function calculate(array $data): array
    {
        $w0 = (float) ($data['avg_weight_start_g'] ?? 0);
        $wt = (float) ($data['avg_weight_end_g'] ?? 0);
        $l0 = (float) ($data['avg_length_start_cm'] ?? 0);
        $lt = (float) ($data['avg_length_end_cm'] ?? 0);

        $T = max((int) ($data['day_since_last'] ?? 0), 1);
        $population = (int) ($data['estimated_population'] ?? 0);
        $mortality = (int) ($data['mortality_count'] ?? 0);

        // ================= PERTUMBUHAN =================
        $absWeight = $wt && $w0 ? round($wt - $w0, 2) : null;
        $absLength = $lt && $l0 ? round($lt - $l0, 2) : null;

        $dailyGrowth = ($absWeight !== null)
            ? round($absWeight / $T, 3)
            : null;

        // ================= SGR =================
        $sgr = null;
        if ($w0 > 0 && $wt > 0 && $T > 0) {
            $sgr = round(100 * ((log($wt) - log($w0)) / $T), 2);
        }

        // ================= SURVIVAL RATE =================
        $alive = max($population - $mortality, 0);
        $sr = $population > 0
            ? round(($alive / $population) * 100, 2)
            : null;

        // ================= BIOMASS =================
        $biomass = ($wt > 0 && $alive > 0)
            ? round(($wt * $alive) / 1000, 2) // gram → kg
            : null;

        return array_merge($data, [
            'abs_weight_growth_g' => $absWeight,
            'abs_length_growth_cm' => $absLength,
            'daily_growth_g' => $dailyGrowth,
            'sgr_percent' => $sgr,
            'survival_rate' => $sr,
            'biomass_kg' => $biomass,
        ]);
    }

    public function calculateDayDifference($kolamId, string $currentDate): int
    {
        $last = KolamSampling::where('kolam_id', $kolamId)
            ->orderBy('sampling_date', 'desc')
            ->first();

        if (!$last)
            return 1;

        return max(
            Carbon::parse($last->sampling_date)
                ->diffInDays(Carbon::parse($currentDate)),
            1
        );
    }
}
