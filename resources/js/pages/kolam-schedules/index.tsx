import { Head, router } from '@inertiajs/react';
import { useState, useRef, useCallback } from 'react';
import AppLayout from '@/layouts/app-layout';
import { ChevronRight, ChevronLeft, Plus, Pencil, Trash, User } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Data Jadwal Kolam', href: '/kolam-schedules' },
];

const badgeBase =
    'inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium capitalize';

const statusStyle = (status: string) => {
    switch (status) {
        case 'done':
            return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400';
        case 'pending':
            return 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400';
        case 'cancelled':
            return 'bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400';
        default:
            return 'bg-neutral-200 text-neutral-700 dark:bg-neutral-700/40 dark:text-neutral-300';
    }
};


export default function Index({ schedules, filters, pagination, kolam_options }: any) {
    const [search, setSearch] = useState(filters.search || '');
    const [kolamId, setKolamId] = useState(filters.kolam_id || '');
    const [status, setStatus] = useState(filters.status || '');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [scheduleToDelete, setScheduleToDelete] = useState<any>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // --------------------
    // SEARCH / FILTER
    // --------------------
    const triggerSearch = useCallback(
        (newSearch: string, newKolamId: string, newStatus: string) => {
            if (debounceRef.current) clearTimeout(debounceRef.current);

            debounceRef.current = setTimeout(() => {
                router.get(
                    '/schedules',
                    { search: newSearch, kolam_id: newKolamId, status: newStatus, page: 1 },
                    { preserveState: true, replace: true }
                );
            }, 300);
        },
        []
    );

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearch(value);
        triggerSearch(value, kolamId, status);
    };

    const handleKolamChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setKolamId(value);
        triggerSearch(search, value, status);
    };

    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setStatus(value);
        triggerSearch(search, kolamId, value);
    };

    // --------------------
    // DELETE MODAL
    // --------------------
    const openDeleteModal = (schedule: any) => {
        setScheduleToDelete(schedule);
        setShowDeleteModal(true);
    };

    const closeDeleteModal = () => {
        setScheduleToDelete(null);
        setShowDeleteModal(false);
    };

    const handleDelete = () => {
        if (!scheduleToDelete) return;
        router.delete(`/schedules/${scheduleToDelete.id}`, {
            onSuccess: () => closeDeleteModal(),
            onError: () => closeDeleteModal(),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Data Jadwal Kolam" />

            <div className="rounded-md m-3 border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm overflow-hidden">

                {/* Toolbar */}
                {/* Toolbar */}
                <div
                    className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 px-5 py-4
  bg-neutral-50 dark:bg-neutral-800/60
  border-b border-neutral-200 dark:border-neutral-800"
                >
                    {/* Title */}
                    <div>
                        <h2 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100">
                            Data Jadwal Kolam
                        </h2>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                            Kelola jadwal aktivitas, status pelaksanaan, dan penanggung jawab kolam
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            onClick={() => router.get('/schedules/create')}
                            className="btn btn-sm btn-primary"
                        >
                            <Plus className="h-4 w-4" />
                            Tambah Jadwal
                        </button>

                        {/* Filter Kolam */}
                        <select
                            value={kolamId}
                            onChange={handleKolamChange}
                            className="h-9 rounded-lg border border-neutral-300 dark:border-neutral-700
      bg-white dark:bg-neutral-900 px-3 text-sm
      text-neutral-800 dark:text-neutral-200
      focus:outline-none focus:ring-2 focus:ring-primary/40"
                        >
                            <option value="">Semua Kolam</option>
                            {kolam_options.map((k: any) => (
                                <option key={k.value} value={k.value}>
                                    {k.label}
                                </option>
                            ))}
                        </select>

                        {/* Filter Status */}
                        <select
                            value={status}
                            onChange={handleStatusChange}
                            className="h-9 rounded-lg border border-neutral-300 dark:border-neutral-700
      bg-white dark:bg-neutral-900 px-3 text-sm
      text-neutral-800 dark:text-neutral-200
      focus:outline-none focus:ring-2 focus:ring-primary/40"
                        >
                            <option value="">Semua Status</option>
                            <option value="pending">Pending</option>
                            <option value="done">Selesai</option>
                            <option value="cancelled">Dibatalkan</option>
                        </select>

                        {/* Search */}
                        <div
                            className="flex items-center gap-2 h-9 w-full md:w-60
      rounded-lg border border-neutral-300 dark:border-neutral-700
      bg-white dark:bg-neutral-900 px-3
      focus-within:ring-2 focus-within:ring-primary/40"
                        >
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
                                placeholder="Cari aktivitas atau catatan..."
                                value={search}
                                onChange={handleSearchChange}
                                className="w-full bg-transparent text-sm
        text-neutral-800 dark:text-neutral-200
        placeholder-neutral-400 focus:outline-none"
                            />
                        </div>
                    </div>
                </div>


                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-neutral-100 dark:bg-neutral-800">
                            <tr className="text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                                <th className="px-4 py-3">#</th>
                                <th className="px-4 py-3">Kolam</th>
                                <th className="px-4 py-3">Aktivitas</th>
                                <th className="px-4 py-3">Tanggal & Waktu</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">Catatan</th>
                                <th className="px-4 py-3">Penanggung Jawab</th>
                                <th className="px-4 py-3 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                            {schedules.length > 0 ? schedules.map((s: any, i: number) => (
                                <tr key={s.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/60 transition">
                                    <td className="px-4 py-2">{pagination.from + i}</td>
                                    <td className="px-4 py-2">{s.kolam?.name || '-'}</td>
                                    <td className="px-4 py-2">{s.activity_type}</td>
                                    <td className="px-4 py-2">
                                        <div className="text-sm font-medium">
                                            {new Date(s.scheduled_date).toLocaleDateString()}
                                        </div>
                                        <div className="text-xs text-neutral-500 dark:text-neutral-400">
                                            {s.scheduled_time || '00:00'}
                                        </div>
                                    </td>
                                    <td className="px-4 py-2">
                                        <span className={`${badgeBase} ${statusStyle(s.status)}`}>
                                            {s.status === 'done'
                                                ? 'Selesai'
                                                : s.status === 'pending'
                                                    ? 'Pending'
                                                    : 'Dibatalkan'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2">{s.details || '-'}</td>
                                    <td className="px-5 py-4">
                                        {s.creator?.name ? (
                                            <span
                                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
        bg-neutral-100 text-neutral-700 ring-1 ring-inset ring-neutral-300
        dark:bg-neutral-800 dark:text-neutral-200 dark:ring-neutral-700"
                                            >
                                                <User className="h-3.5 w-3.5" />
                                                {s.creator?.name}
                                            </span>
                                        ) : (
                                            <span className="text-xs text-neutral-400">-</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-2">
                                        <div className="flex justify-end gap-1">
                                            <button
                                                title="Edit Jadwal"
                                                className="btn btn-xs btn-outline"
                                                onClick={() => router.get(`/schedules/${s.id}/edit`)}
                                            >
                                                <Pencil className="h-3.5 w-3.5" />
                                            </button>
                                            <button
                                                title="Hapus Jadwal"
                                                className="btn btn-xs btn-outline btn-error"
                                                onClick={() => openDeleteModal(s)}
                                            >
                                                <Trash className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={8} className="px-4 py-16 text-center">
                                        <div className="flex flex-col items-center gap-2 text-neutral-400">
                                            <Plus className="h-8 w-8" />
                                            <p className="text-sm">Belum ada jadwal kolam</p>
                                            <p className="text-xs">Klik "Tambah Jadwal" untuk membuat jadwal pertama</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between px-4 py-3 bg-neutral-50 dark:bg-neutral-800/60 border-t border-neutral-200 dark:border-neutral-800">
                    <div className="text-xs text-neutral-500 dark:text-neutral-400">
                        Menampilkan {pagination.from}–{pagination.to} dari {pagination.total}
                    </div>

                    <div className="flex gap-2">
                        <button
                            className="btn btn-sm btn-outline"
                            disabled={!pagination.has_prev}
                            onClick={() => router.get('/kolam-schedules', { page: pagination.prev_page, search, kolam_id: kolamId, status })}
                        >
                            <ChevronLeft className="h-4 w-4" /> Prev
                        </button>
                        <button
                            className="btn btn-sm btn-outline"
                            disabled={!pagination.has_next}
                            onClick={() => router.get('/kolam-schedules', { page: pagination.next_page, search, kolam_id: kolamId, status })}
                        >
                            Next <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Delete Modal */}
            {showDeleteModal && scheduleToDelete && (
                <dialog open className="modal">
                    <div className="modal-box max-w-sm p-6 bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 shadow-lg">
                        <h3 className="font-semibold text-lg mb-4">Konfirmasi Hapus</h3>
                        <p className="mb-6">
                            Apakah Anda yakin ingin menghapus jadwal <span className="font-medium">{scheduleToDelete.kolam?.name}</span>? Tindakan ini tidak dapat dibatalkan.
                        </p>
                        <div className="flex justify-end gap-2">
                            <button onClick={closeDeleteModal} className="btn btn-outline">Batal</button>
                            <button onClick={handleDelete} className="btn btn-error">Hapus</button>
                        </div>
                    </div>
                    <div className="modal-backdrop" onClick={closeDeleteModal}></div>
                </dialog>
            )}
        </AppLayout>
    );
}
