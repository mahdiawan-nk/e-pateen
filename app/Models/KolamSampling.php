<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Support\Str;
class KolamSampling extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'kolam_samplings';
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'kolam_id',
        'seeding_id',
        'sampling_date',
        'day_since_last',
        'estimated_population',
        'sample_size',
        'sampling_method',
        'avg_weight_start_g',
        'avg_weight_end_g',
        'avg_length_start_cm',
        'avg_length_end_cm',
        'abs_weight_growth_g',
        'abs_length_growth_cm',
        'daily_growth_g',
        'sgr_percent',
        'biomass_kg',
        'mortality_count',
        'survival_rate',
        'notes',
        'created_by',
    ];

    // protected $casts = [
    //     'average_length_cm' => 'decimal:2',
    //     'average_weight_g' => 'decimal:2',
    //     'sample_size' => 'integer',
    //     ];
    protected static function booted()
    {
        static::creating(function ($model) {
            if (!$model->id) {
                $model->id = (string) Str::uuid();
            }
        });
    }
    // ================= RELATIONS =================
    public function kolam()
    {
        return $this->belongsTo(Kolam::class, 'kolam_id');
    }

    public function seeding()
    {
        return $this->belongsTo(KolamSeeding::class, 'seeding_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
