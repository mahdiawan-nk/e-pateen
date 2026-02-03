<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
class UserController extends Controller
{
    /**
     * Display a listing of the users.
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        $search = $request->input('search');
        $roleFilter = $request->input('role');

        $perPage = 10;
        $page = max((int) $request->input('page', 1), 1);
        $offset = ($page - 1) * $perPage;

        $query = User::query()
            // ❌ Jangan tampilkan user yang sedang login
            ->where('id', '!=', $user->id)

            // Role-based visibility
            ->when(
                $user->role !== 'administrator',
                fn($q) => $q->where('role', 'pembudidaya')
            )

            // Search
            ->when($search, function ($q) use ($search) {
                $q->where(function ($sub) use ($search) {
                    $sub->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            })

            // Filter role
            ->when($roleFilter, fn($q) => $q->where('role', $roleFilter));


        // Total data
        $total = $query->count();

        // Data halaman sekarang
        $users = $query
            ->orderBy('created_at', 'desc')
            ->skip($offset)
            ->take($perPage)
            ->get();

        // Total halaman
        $lastPage = (int) ceil($total / $perPage);

        return Inertia::render('user/index', [
            'users' => $users,
            'pagination' => [
                'total' => $total,
                'per_page' => $perPage,
                'current_page' => $page,
                'last_page' => $lastPage,
                'from' => $offset + 1,
                'to' => min($offset + $perPage, $total),
                'has_prev' => $page > 1,
                'has_next' => $page < $lastPage,
                'prev_page' => $page > 1 ? $page - 1 : null,
                'next_page' => $page < $lastPage ? $page + 1 : null,
            ],
            'filters' => [
                'search' => $search,
                'role' => $roleFilter,
            ],
        ]);
    }


    /**
     * Store a newly created user.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'role' => 'nullable|string|max:50',
            'no_hp' => 'nullable|numeric',
        ]);

        $data['password'] = bcrypt($data['password']);
        User::create($data);

        return redirect()->back()->with('success', 'User berhasil ditambahkan.');
    }

    /**
     * Update the specified user.
     */
    public function update(Request $request, User $user)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $user->id,
            'password' => 'nullable|string|min:6',
            'role' => 'nullable|string|max:50',
            'no_hp' => 'nullable|numeric',
        ]);

        if ($data['password']) {
            $data['password'] = bcrypt($data['password']);
        } else {
            unset($data['password']);
        }

        $user->update($data);

        return redirect()->back()->with('success', 'User berhasil diupdate.');
    }

    /**
     * Remove the specified user.
     */
    public function destroy(User $user)
    {
        $user->delete();

        return redirect()->back()->with('success', 'User berhasil dihapus.');
    }
}
