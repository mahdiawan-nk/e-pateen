<?php

namespace App\Http\Controllers;

use App\Models\Schedule;
use Illuminate\Http\Request;
use App\Models\KolamSchedule;
use App\Models\Kolam;
use Inertia\Inertia;
class ScheduleController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $user = auth()->user();

        $search = $request->input('search');
        $kolamId = $request->input('kolam_id');
        $status = $request->input('status');

        $perPage = 10;
        $page = max((int) $request->input('page', 1), 1);
        $offset = ($page - 1) * $perPage;

        // Query schedules
        $query = Schedule::with(['kolam:id,name', 'creator:id,name'])
            ->when($kolamId, fn($q) => $q->where('kolam_id', $kolamId))
            ->when($status, fn($q) => $q->where('status', $status))
            ->when($search, fn($q) => $q->where('details', 'like', "%{$search}%"));

        // Role-based: pembudidaya hanya jadwal kolam miliknya
        if ($user->role !== 'administrator') {
            $query->whereHas('kolam', fn($q) => $q->where('owner_id', $user->id));
        }

        $total = $query->count();

        $schedules = $query
            ->orderBy('scheduled_date', 'desc')
            ->skip($offset)
            ->take($perPage)
            ->get();

        $lastPage = (int) ceil($total / $perPage);

        $kolam = Kolam::query()
            ->byRole($user)
            ->orderBy('name')->get(['id', 'name'])
            ->map(fn($k) => ['label' => $k->name, 'value' => $k->id]);

        return Inertia::render('kolam-schedules/index', [
            'schedules' => $schedules,
            'pagination' => [
                'total' => $total,
                'per_page' => $perPage,
                'current_page' => $page,
                'last_page' => $lastPage,
                'from' => $total > 0 ? $offset + 1 : 0,
                'to' => min($offset + $perPage, $total),
                'has_prev' => $page > 1,
                'has_next' => $page < $lastPage,
                'prev_page' => $page > 1 ? $page - 1 : null,
                'next_page' => $page < $lastPage ? $page + 1 : null,
            ],
            'filters' => [
                'search' => $search,
                'kolam_id' => $kolamId,
                'status' => $status,
            ],
            'kolam_options' => $kolam,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $user = auth()->user();

        // Ambil kolam sesuai role
        $kolams = Kolam::byRole($user)
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('kolam-schedules/create', [
            'kolam_options' => $kolams->map(fn($k) => [
                'label' => $k->name,
                'value' => $k->id,
            ]),

            'activity_options' => [
                ['label' => 'Seeding', 'value' => 'seeding'],
                ['label' => 'Feeding', 'value' => 'feeding'],
                ['label' => 'Sampling', 'value' => 'sampling'],
                ['label' => 'Other', 'value' => 'other'],
            ],

            // Untuk filter kolam di UI
            'user_role' => $user->role,

            // Digunakan di frontend untuk batasi pilihan kolam pembudidaya
            'user_kolam_ids' => $kolams->pluck('id')->values(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'kolam_id' => 'required|uuid|exists:kolams,id',
            'activity_type' => 'required|in:seeding,feeding,sampling,other',
            'scheduled_date' => 'required|date',
            'scheduled_time' => 'nullable|date_format:H:i',
            'details' => 'nullable|string',
        ]);

        Schedule::create(array_merge(
            $request->only(['kolam_id', 'activity_type', 'scheduled_date', 'scheduled_time', 'details', 'status']),
            ['created_by' => auth()->id()]
        ));
        
        return to_route('schedules.index');

    }

    /**
     * Display the specified resource.
     */
    public function show(Schedule $schedule)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Schedule $schedule)
    {
        $user = auth()->user();

        // Authorization: pembudidaya hanya boleh edit kolam miliknya
        if ($user->role !== 'administrator') {
            abort_unless(
                $schedule->kolam->owner_id === $user->id,
                403,
                'Anda tidak memiliki akses ke jadwal ini.'
            );
        }

        // Ambil kolam sesuai role
        $kolams = Kolam::byRole($user)
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('kolam-schedules/update', [
            'schedule' => [
                'id' => $schedule->id,
                'kolam_id' => $schedule->kolam_id,
                'activity_type' => $schedule->activity_type,
                'scheduled_date' => $schedule->scheduled_date,
                'scheduled_time' => date('H:i', strtotime($schedule->scheduled_date)),
                'details' => $schedule->details,
                'status' => $schedule->status,
                'created_by' => $schedule->created_by,
            ],

            'kolam_options' => $kolams->map(fn($k) => [
                'label' => $k->name,
                'value' => $k->id,
            ]),

            'activity_options' => [
                ['label' => 'Seeding', 'value' => 'seeding'],
                ['label' => 'Feeding', 'value' => 'feeding'],
                ['label' => 'Sampling', 'value' => 'sampling'],
                ['label' => 'Other', 'value' => 'other'],
            ],

            'status_options' => [
                ['label' => 'Pending', 'value' => 'pending'],
                ['label' => 'Done', 'value' => 'done'],
                ['label' => 'Cancelled', 'value' => 'cancelled'],
            ],

            'user_role' => $user->role,
            'user_kolam_ids' => $kolams->pluck('id')->values(),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Schedule $schedule)
    {
        $request->validate([
            'kolam_id' => 'required|uuid|exists:kolams,id',
            'activity_type' => 'required|in:seeding,feeding,sampling,other',
            'scheduled_date' => 'required|date',
            'scheduled_time' => 'nullable|date_format:H:i',
            'details' => 'nullable|string',
            'status' => 'required|in:pending,done,cancelled',
        ]);

        $schedule->update($request->only(['kolam_id', 'activity_type', 'scheduled_date', 'scheduled_time', 'details', 'status']));

        return to_route('schedules.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Schedule $schedule)
    {
        $schedule->delete();

        return to_route('schedules.index');
    }
}
