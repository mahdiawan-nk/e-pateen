<?php

namespace App\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Builder;
use DomainException;
use Illuminate\Database\Eloquent\Factories\HasFactory;
class Kolam extends Model
{
    use HasUuids, HasFactory;

    protected $table = 'kolams';
    public $incrementing = false;
    protected $keyType = 'string';

    /**
     * Mass assignment
     */
    protected $fillable = [
        'name',
        'location',
        'length_m',
        'width_m',
        'depth_m',
        'water_volume_l',
        'capacity_fish',
        'type',
        'condition_status',
        'production_status',
        'owner_id',
        'is_deleted',
    ];

    /**
     * Casting tipe data
     */
    protected $casts = [
        'length_m' => 'float',
        'width_m' => 'float',
        'depth_m' => 'float',
        'water_volume_l' => 'integer',
        'capacity_fish' => 'integer',
        'is_deleted' => 'boolean',
    ];

    /* ==============================
     | RELATIONS
     ============================== */

    /**
     * Relasi ke user pemilik kolam
     */
    public function pemilik()
    {
        return $this->belongsTo(User::class, 'owner_id', 'id');
    }

    public function histories()
    {
        return $this->hasMany(KolamHistori::class);
    }
    /* ==============================
     | QUERY SCOPES
     ============================== */

    /**
     * Filter berdasarkan kepemilikan berbasis role
     * - Administrator: lihat semua
     * - Pembudidaya: hanya miliknya
     */
    public function scopeByRole(Builder $query, User $user): Builder
    {
        if ($user->role === 'administrator') {
            return $query;
        }

        return $query->where('owner_id', $user->id);
    }

    /**
     * Filter berdasarkan pemilik spesifik
     */
    public function scopeMilik(Builder $query, string $userId): Builder
    {
        return $query->where('owner_id', $userId);
    }

    public function scopeOwnedBy($query, $user)
    {
        if ($user->role === 'pembudidaya') {
            return $query->where('owner_id', $user->id);
        }

        return $query; // admin lihat semua
    }

    /**
     * Filter berdasarkan kondisi kolam
     */
    public function scopeKondisi(Builder $query, string $status): Builder
    {
        return $query->where('condition_status', $status);
    }

    /**
     * Filter berdasarkan status produksi
     */
    public function scopeProduksi(Builder $query, array $status): Builder
    {
        return $query->whereIn('production_status', $status);
    }

    public function scopeBySeedingProduksi(Builder $query, array $statuses = ['growing']): Builder
    {
        return $query->whereHas('seeding', function ($q) use ($statuses) {
            $q->whereIn('cycle_status', $statuses);
        });
    }

    public function scopeActive($query)
    {
        return $query->where('is_deleted', false);
    }

    // Scope untuk kolam yang dihapus
    public function scopeDeleted($query)
    {
        return $query->where('is_deleted', true);
    }
    /* ==============================
     | MODEL EVENTS
     ============================== */

    /**
     * Auto hitung volume air sebelum simpan
     */
    protected static function booted()
    {
        static::saving(function (Kolam $kolam) {
            $kolam->water_volume_l = $kolam->hitungVolumeAir();
        });
    }

    /* ==============================
     | BUSINESS LOGIC
     ============================== */

    /**
     * Cek apakah kolam bisa digunakan untuk produksi
     */
    public function bisaProduksi(): bool
    {
        return $this->condition_status === 'active';
    }

    /**
     * Hitung volume air otomatis (liter)
     */
    public function hitungVolumeAir(): int
    {
        return (int) round(
            $this->length_m *
            $this->width_m *
            $this->depth_m *
            1000
        );
    }

    /**
     * Mulai siklus budidaya
     */
    public function mulaiSiklus(): void
    {
        if (!$this->bisaProduksi()) {
            throw new DomainException(
                'Kolam tidak aktif, tidak bisa memulai siklus budidaya.'
            );
        }

        $this->update([
            'production_status' => 'stocking',
        ]);
    }

    /**
     * Selesaikan panen
     */
    public function selesaiPanen(): void
    {
        $this->update([
            'production_status' => 'idle',
        ]);
    }

    public function seeding()
    {
        return $this->hasMany(KolamSeeding::class);
    }

    public function monitoring()
    {
        return $this->hasMany(KolamMonitoring::class);
    }

    public function feeding()
    {
        return $this->hasMany(KolamFeeding::class);
    }

    public function sampling()
    {
        return $this->hasMany(KolamSampling::class);
    }

    public function stockMovements()
    {
        return $this->hasMany(KolamStockMovement::class);
    }

    public function harvestEstimations()
    {
        return $this->hasMany(HarvestEstimation::class);
    }

    public function harvestRealizations()
    {
        return $this->hasMany(HarvestRealization::class);
    }
}
