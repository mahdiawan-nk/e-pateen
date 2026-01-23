<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
class KolamMonitoring extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'kolam_monitorings';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'kolam_id',
        'date',
        'water_temp_c',
        'ph',
        'oxygen_mg_l',
        'ammonia_mg_l',
        'turbidity_ntu',
        'remarks',
        'created_by',
    ];

    // Relasi ke Kolam
    public function kolam(): BelongsTo
    {
        return $this->belongsTo(Kolam::class);
    }

    // Relasi ke User
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
