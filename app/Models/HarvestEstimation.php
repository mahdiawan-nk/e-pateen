<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class HarvestEstimation extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'harvest_estimations';

    protected $fillable = [
        'seeding_id',
        'kolam_id',
        'estimated_harvest_date',
        'estimated_population',
        'estimated_avg_weight_g',
        'estimated_biomass_kg',
        'notes',
    ];

    protected $casts = [
        'estimated_harvest_date' => 'date',
        'estimated_avg_weight_g' => 'decimal:2',
        'estimated_biomass_kg' => 'decimal:2',
    ];

    // =============================
    // RELATIONS
    // =============================

    /**
     * Seeding yang terkait dengan estimasi panen
     */
    public function seeding()
    {
        return $this->belongsTo(KolamSeeding::class, 'seeding_id');
    }

    /**
     * Kolam yang terkait dengan estimasi panen
     */
    public function kolam()
    {
        return $this->belongsTo(Kolam::class, 'kolam_id');
    }
}
