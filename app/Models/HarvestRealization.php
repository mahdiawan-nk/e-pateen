<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class HarvestRealization extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'harvest_realizations';

    protected $fillable = [
        'seeding_id',
        'kolam_id',
        'harvest_estimation_id',
        'harvest_date',
        'harvested_population',
        'average_weight_g',
        'total_biomass_kg',
        'notes',
        'created_by',
    ];

    protected $casts = [
        // 'harvest_date' => 'date',
        'average_weight_g' => 'decimal:2',
        'total_biomass_kg' => 'decimal:2',
    ];

    // ================= RELATIONS =================

    /**
     * Seeding yang direalisasikan panennya
     */
    public function seeding()
    {
        return $this->belongsTo(KolamSeeding::class, 'seeding_id');
    }

    /**
     * Kolam tempat panen dilakukan
     */
    public function kolam()
    {
        return $this->belongsTo(Kolam::class, 'kolam_id');
    }

    /**
     * Estimasi harvest terkait
     */
    public function estimation()
    {
        return $this->belongsTo(HarvestEstimation::class, 'harvest_estimation_id');
    }

    /**
     * User yang mencatat panen
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
