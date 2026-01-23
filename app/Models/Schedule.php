<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Str;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
class Schedule extends Model
{
    use HasFactory, HasUuids;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'kolam_id',
        'activity_type',
        'scheduled_date',
        'scheduled_time',
        'details',
        'status',
        'assigned_to',
        'created_by',
    ];

    // Generate UUID automatically
    protected static function booted()
    {
        static::creating(function ($model) {
            if (!$model->id) {
                $model->id = (string) Str::uuid();
            }
        });
    }

    // Relasi ke Kolam
    public function kolam(): BelongsTo
    {
        return $this->belongsTo(Kolam::class);
    }


    // Relasi ke User yang membuat jadwal
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
