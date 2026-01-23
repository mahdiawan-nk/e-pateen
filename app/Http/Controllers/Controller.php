<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Database\Eloquent\Builder;

abstract class Controller
{
    protected $user;

    public function __construct()
    {
        $this->user = Auth::user();
    }

    // ================= CORE PAGINATION =================
    protected function paginate(Builder $query, int $perPage = 10): array
    {
        $page = request()->integer('page', 1);
        $total = (clone $query)->count();
        $lastPage = (int) ceil($total / $perPage);
        $offset = ($page - 1) * $perPage;

        $data = $query->skip($offset)->take($perPage)->get();

        return [
            'data' => $data,
            'meta' => [
                'total' => $total,
                'per_page' => $perPage,
                'current_page' => $page,
                'last_page' => $lastPage,
                'from' => $total ? $offset + 1 : 0,
                'to' => min($offset + $perPage, $total),
                'has_prev' => $page > 1,
                'has_next' => $page < $lastPage,
                'prev_page' => $page > 1 ? $page - 1 : null,
                'next_page' => $page < $lastPage ? $page + 1 : null,
            ],
        ];
    }

    // ================= FILTERS =================
    protected function filters(array $keys = []): array
    {
        return collect($keys)->mapWithKeys(fn($k) => [$k => request($k)])->toArray();
    }

    // ================= RESOLVE WITH =================
    protected function resolveWith(array $with = []): array
    {
        $resolved = [];
        foreach ($with as $key => $value) {
            $resolved[$key] = is_callable($value) ? $value() : $value;
        }
        return $resolved;
    }

    // ================= INERTIA RENDER =================
    /**
     * Render Inertia page dengan props standar
     *
     * @param string $view       Nama page
     * @param Builder|null $query Query optional untuk paginate
     * @param array $options     ['dataKey'=>'monitorings', 'perPage'=>10, 'filters'=>[], 'with'=>[]]
     * @param bool $debug        Jika true return json
     */
    protected function inertia(
        string $view,
        ?Builder $query = null,
        array $options = [],
        bool $debug = false
    ) {
        $dataKey = $options['dataKey'] ?? 'data';
        $perPage = $options['perPage'] ?? 10;
        $filterKeys = $options['filters'] ?? [];
        $withData = $options['with'] ?? [];

        $props = [];

        // Jika query ada → otomatis paginasi
        if ($query) {
            $result = $this->paginate($query, $perPage);
            $props[$dataKey] = $result['data'];
            $props['pagination'] = $result['meta'];
        }

        // filters
        if ($filterKeys) {
            $props['filters'] = $this->filters($filterKeys);

        }

        // with additional props
        if (!empty($withData)) {
            $props = array_merge($props, $this->resolveWith($withData));
        }

        // debug json
        if ($debug == false) {
            return Inertia::render($view, $props);
        }

        return response()->json($props);
    }
}
