<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class KolamSeeding extends Model
{
    use HasFactory, HasUuids;

    /**
     * =============================
     * TABLE CONFIG
     * =============================
     */
    protected $table = 'kolam_seedings';
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';

    /**
     * =============================
     * MASS ASSIGNMENT
     * =============================
     */
    protected $fillable = [
        'kolam_id',
        'initial_movement_id',
        'seed_type',
        'initial_quantity',
        'seed_size_cm',
        'average_weight_seed_g',
        'date_seeded',
        'source',
        'cycle_status',
        'notes',
        'created_by',
        'closed_by',
        'closed_at',
    ];

    /**
     * =============================
     * CASTING
     * =============================
     */
    protected $casts = [
        'initial_quantity' => 'integer',
        'seed_size_cm' => 'decimal:2',
        'average_weight_seed_g' => 'decimal:2',
        'date_seeded' => 'date',
        'closed_at' => 'datetime',
    ];

    /**
     * =============================
     * RELATIONSHIPS
     * =============================
     */

    public function kolam()
    {
        return $this->belongsTo(Kolam::class, 'kolam_id');
    }

    public function initialMovement()
    {
        return $this->belongsTo(KolamStockMovement::class, 'initial_movement_id');
    }

    public function stockMovements()
    {
        return $this->hasMany(KolamStockMovement::class, 'seeding_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function closedBy()
    {
        return $this->belongsTo(User::class, 'closed_by');
    }

    /**
     * =============================
     * SCOPES
     * =============================
     */

    public function scopeGrowing($query)
    {
        return $query->where('cycle_status', 'growing');
    }

    public function scopeClosed($query)
    {
        return $query->where('cycle_status', 'closed');
    }

    public function scopeForKolam($query, string $kolamId)
    {
        return $query->where('kolam_id', $kolamId);
    }

    /**
     * =============================
     * BUSINESS HELPERS
     * =============================
     */

    public function isActive(): bool
    {
        return $this->cycle_status === 'growing';
    }

    public function currentBalance(): int
    {
        return $this->stockMovements()
            ->orderBy('event_date', 'desc')
            ->orderBy('created_at', 'desc')
            ->value('balance_after') ?? 0;
    }

    public function totalMortality(): int
    {
        return (int) $this->stockMovements()
            ->where('event_type', 'mortality')
            ->sum('quantity_change') * -1;
    }

    public function totalHarvest(): int
    {
        return (int) $this->stockMovements()
            ->where('event_type', 'harvest')
            ->sum('quantity_change') * -1;
    }
}
