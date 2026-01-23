<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class KolamStockMovement extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'kolam_stock_movements';
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'kolam_id',
        'seeding_id',
        'event_type',
        'quantity_change',
        'balance_after',
        'event_date',
        'ref_table',
        'ref_id',
        'notes',
        'created_by',
    ];

    protected $casts = [
        'quantity_change' => 'integer',
        'balance_after' => 'integer',
        'event_date' => 'immutable_date',
    ];

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
