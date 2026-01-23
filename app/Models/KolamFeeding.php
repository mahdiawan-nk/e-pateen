<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
class KolamFeeding extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'kolam_feedings';
    public $incrementing = false;
    protected $keyType = 'string'; // UUID

    protected $fillable = [
        'kolam_id',
        'seeding_id',
        'feeding_date',
        'feed_type',
        'quantity_kg',
        'feeding_method',
        'feed_source',
        'notes',
        'created_by',
    ];

    // Boot method untuk auto-generate UUID
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
