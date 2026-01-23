import { Head } from '@inertiajs/react';
import { useState, useEffect, useRef, useCallback } from 'react';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { router, useForm, Link } from '@inertiajs/react';
import { ChevronRight, ChevronLeft, Plus, Pencil, Trash } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { FormInput } from '@/components/ui/form-input';
const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Data User',
        href: 'users',
    },
];


export default function Index({ users, filters, pagination }: { users: any, filters: any, pagination: any }) {
    type User = {
        id: number;
        name: string;
        email: string;
        role?: string;
        no_hp?: string;
    };

    type Paginate = {
        total: number;
        per_page: number;
        current_page: number;
        last_page: number;
        from: number;
        to: number;
        has_prev: boolean;
        has_next: boolean;
        prev_page?: number | null;
        next_page?: number | null;
    };
    // --------------------
    // STATE
    // --------------------
    const [search, setSearch] = useState(filters.search || "");
    const [role, setRole] = useState(filters.role || "");

    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [deletingUser, setDeletingUser] = useState<User | null>(null);

    const [showFormModal, setShowFormModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const [editPassword, setEditPassword] = useState(false);

    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // --------------------
    // FORM
    // --------------------
    const form = useForm({
        name: "",
        email: "",
        password: "",
        no_hp: "",
        role: "",
    });

    // --------------------
    // HELPERS
    // --------------------
    const getDialog = (id: string) =>
        document.getElementById(id) as HTMLDialogElement | null;

    const openDialog = (id: string) => getDialog(id)?.showModal();
    const closeDialog = (id: string) => getDialog(id)?.close();

    // --------------------
    // SEARCH / FILTER
    // --------------------
    const triggerSearch = useCallback(
        (newSearch: string, newRole: string) => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }

            debounceRef.current = setTimeout(() => {
                router.get(
                    "/users",
                    {
                        search: newSearch,
                        role: newRole,
                        page: 1,
                    },
                    {
                        preserveState: true,
                        replace: true,
                    }
                );
            }, 800);
        },
        []
    );

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearch(value);
        triggerSearch(value, role);
    };

    const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setRole(value);
        triggerSearch(search, value);
    };

    // --------------------
    // MODAL HANDLERS
    // --------------------
    const openCreateModal = () => {
        form.reset();
        setEditingUser(null);
        setEditPassword(false);
        setShowFormModal(true);
        openDialog("formModal");
    };

    const openEditModal = (user: User) => {
        form.setData({
            name: user.name,
            email: user.email,
            password: "",
            no_hp: user.no_hp || "",
            role: user.role || "",
        });

        setEditingUser(user);
        setEditPassword(false);
        setShowFormModal(true);
        openDialog("formModal");
    };

    const closeFormModal = () => {
        setShowFormModal(false);
        setEditingUser(null);
        setEditPassword(false);
        closeDialog("formModal");
    };

    // --------------------
    // SUBMIT
    // --------------------
    const submitForm = (e: React.FormEvent) => {
        e.preventDefault();

        const options = {
            onSuccess: () => closeFormModal(),
        };

        if (editingUser) {
            form.put(`/users/${editingUser.id}`, options);
        } else {
            form.post("/users", options);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Data User" />
            {/* <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4"> */}


            <div className="rounded-md m-3 border border-neutral-200 dark:border-neutral-800 
                bg-white dark:bg-neutral-900 shadow-sm overflow-hidden">

                {/* Header / Toolbar */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between 
                  gap-3 px-4 py-3 
                  bg-neutral-50 dark:bg-neutral-800/60 border-b 
                  border-neutral-200 dark:border-neutral-800">

                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            className="btn btn-sm btn-primary"
                            onClick={openCreateModal}
                        >
                            <Plus className="h-4 w-4" />
                            Tambah
                        </button>

                        <select
                            value={role}
                            onChange={handleRoleChange}
                            className="h-9 rounded-lg border border-neutral-300 dark:border-neutral-700
                   bg-white dark:bg-neutral-900 px-3 text-sm 
                   text-neutral-800 dark:text-neutral-200
                   focus:outline-none focus:ring-2 focus:ring-primary/40"
                        >
                            <option value="">Semua Role</option>
                            <option value="administrator">Administrator</option>
                            <option value="pembudidaya">Pembudidaya</option>
                        </select>
                    </div>

                    {/* Search */}
                    <label className="flex items-center gap-2 w-full md:w-72 
                      rounded-lg border border-neutral-300 dark:border-neutral-700 
                      bg-white dark:bg-neutral-900 px-3 py-2
                      focus-within:ring-2 focus-within:ring-primary/40">
                        <svg
                            className="h-4 w-4 text-neutral-400"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <circle cx="11" cy="11" r="8" />
                            <path d="m21 21-4.3-4.3" />
                        </svg>

                        <input
                            type="search"
                            placeholder="Cari user..."
                            value={search}
                            onChange={handleSearchChange}
                            className="w-full bg-transparent text-sm 
                   text-neutral-800 dark:text-neutral-200 
                   placeholder-neutral-400 focus:outline-none"
                        />
                    </label>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-neutral-100 dark:bg-neutral-800">
                            <tr>
                                {["No", "Nama Lengkap", "Email", "No. Telepon", "Role", "Aksi"].map(
                                    (head) => (
                                        <th
                                            key={head}
                                            className="px-4 py-3 text-left font-semibold 
                           text-neutral-700 dark:text-neutral-300 uppercase tracking-wide"
                                        >
                                            {head}
                                        </th>
                                    )
                                )}
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                            {users.length > 0 ? (
                                users.map((user: any, index: number) => (
                                    <tr
                                        key={user.id}
                                        className="hover:bg-neutral-50 dark:hover:bg-neutral-800/60 transition"
                                    >
                                        <td className="px-4 py-3 text-neutral-500 dark:text-neutral-400">
                                            {index + 1}
                                        </td>
                                        <td className="px-4 py-3 font-medium text-neutral-800 dark:text-neutral-200">
                                            {user.name}
                                        </td>
                                        <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400">
                                            {user.email}
                                        </td>
                                        <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400">
                                            {user.no_hp || "-"}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="inline-flex items-center rounded-full 
                                 bg-primary/10 text-primary 
                                 dark:bg-primary/20 px-2 py-0.5 text-xs">
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex gap-2">
                                                <button
                                                    className="btn btn-xs btn-outline btn-accent"
                                                    onClick={() => openEditModal(user)}
                                                >
                                                    <Pencil className="h-3.5 w-3.5" />
                                                    Edit
                                                </button>
                                                <button className="btn btn-xs btn-outline btn-error">
                                                    <Trash className="h-3.5 w-3.5" />
                                                    Hapus
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center gap-3 text-neutral-400">
                                            <svg
                                                className="h-12 w-12 opacity-50"
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <circle cx="12" cy="12" r="9" strokeWidth="1.5" />
                                                <path d="M9 12h6" strokeWidth="1.5" />
                                            </svg>

                                            <p className="text-sm font-medium">
                                                Tidak ada data user ditemukan
                                            </p>
                                            <p className="text-xs opacity-70">
                                                Coba ubah filter atau kata kunci pencarian
                                            </p>

                                            <button
                                                className="btn btn-xs btn-outline mt-2"
                                                onClick={() => {
                                                    setSearch("");
                                                    setRole("");
                                                    router.get("/users", {}, { replace: true });
                                                }}
                                            >
                                                Reset Filter
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer / Pagination */}
                <div
                    className="flex items-center justify-between px-4 py-3 
               bg-neutral-50 dark:bg-neutral-800/60 border-t 
               border-neutral-200 dark:border-neutral-800"
                >
                    <div className="text-xs text-neutral-500 dark:text-neutral-400">
                        Menampilkan {pagination.from}–{pagination.to} dari {pagination.total}
                    </div>

                    <div className="flex gap-2">
                        <button
                            className="btn btn-sm btn-outline"
                            disabled={!pagination.has_prev}
                            onClick={() =>
                                router.get("/users", {
                                    page: pagination.prev_page,
                                    search,
                                    role,
                                })
                            }
                        >
                            <ChevronLeft className="h-4 w-4" />
                            Previous
                        </button>

                        <button
                            className="btn btn-sm btn-outline"
                            disabled={!pagination.has_next}
                            onClick={() =>
                                router.get("/users", {
                                    page: pagination.next_page,
                                    search,
                                    role,
                                })
                            }
                        >
                            Next
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* </div> */}
            <dialog id="formModal" className="modal">
                <div className="modal-box max-w-2xl p-0 bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 shadow-xl">

                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-700">
                        <h3 className="font-semibold text-lg">
                            {editingUser ? "Edit User" : "Tambah User"}
                        </h3>
                        <button
                            type="button"
                            onClick={closeFormModal}
                            className="btn btn-sm btn-ghost"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Body */}
                    <form onSubmit={submitForm} className="px-6 py-5 space-y-4">

                        {/* Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                            <FormInput
                                label="Nama"
                                name="name"
                                type="text"
                                value={form.data.name}
                                onChange={(e) => form.setData("name", e)}
                                placeholder="Masukkan nama"
                            />

                            <FormInput
                                label="Email"
                                name="email"
                                type="email"
                                value={form.data.email}
                                onChange={(e) => form.setData("email", e)}
                                placeholder="Masukkan email"
                            />

                            <FormInput
                                label="No. HP"
                                name="no_hp"
                                type="text"
                                value={form.data.no_hp}
                                onChange={(e) => form.setData("no_hp", e)}
                                placeholder="Masukkan nomor HP"
                            />

                            <FormInput
                                label="Role"
                                name="role"
                                type="select"
                                value={form.data.role}
                                onChange={(e) => form.setData("role", e)}
                                options={[
                                    { label: "Pilih Role", value: "" },
                                    { label: "Administrator", value: "administrator" },
                                    { label: "Pembudidaya", value: "pembudidaya" },
                                ]}
                            />
                        </div>

                        {/* Password Section */}
                        <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 space-y-3">

                            {/* Checkbox hanya muncul saat EDIT */}
                            {editingUser && (
                                <FormInput
                                    label="Edit Password"
                                    name="edit_password"
                                    type="checkbox"
                                    value={editPassword}
                                    onChange={(e) => setEditPassword(e)}
                                />
                            )}

                            {/* Field password:
                            - Tambah user → selalu tampil
                            - Edit user → tampil hanya jika checkbox dicentang 
                            */}
                            {(!editingUser || editPassword) && (
                                <FormInput
                                    label={editingUser ? "Password Baru" : "Password"}
                                    name="password"
                                    type="password"
                                    value={form.data.password}
                                    onChange={(e) => form.setData("password", e)}
                                    placeholder={
                                        editingUser
                                            ? "Masukkan password baru (opsional)"
                                            : "Masukkan password"
                                    }
                                />
                            )}

                        </div>


                        {/* Footer */}
                        <div className="flex justify-end gap-2 pt-4 border-t border-neutral-200 dark:border-neutral-700">
                            <button
                                type="button"
                                onClick={closeFormModal}
                                className="btn btn-outline"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                className="btn btn-info"
                            >
                                Simpan
                            </button>
                        </div>

                    </form>
                </div>
            </dialog>

        </AppLayout>
    );
}

