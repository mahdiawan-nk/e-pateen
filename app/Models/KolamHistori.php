<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
class KolamHistori extends Model
{
    use HasFactory, HasUuids;
    protected $table = 'kolam_historis';
    public $incrementing = false;
    protected $keyType = 'string';
    protected $fillable = [
        'kolam_id',
        'user_id',
        'action',
        'changes',
        'description',
    ];

    protected $casts = [
        'changes' => 'array',
    ];

    public function kolam()
    {
        return $this->belongsTo(Kolam::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
