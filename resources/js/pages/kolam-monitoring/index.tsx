import { Head, router } from '@inertiajs/react';
import { useState, useRef, useCallback } from 'react';
import AppLayout from '@/layouts/app-layout';
import {
    ChevronRight,
    ChevronLeft,
    Plus,
    Pencil,
    Trash,
    Thermometer,
    Droplets,
    Wind,
    AlertTriangle,
    User,
    Calendar,
} from 'lucide-react'
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Data Monitoring Kolam', href: '/kolam-monitoring' },
];

export default function Index({ monitorings, filters, pagination, kolam_options }: any) {
    const [search, setSearch] = useState(filters.search || '');
    const [kolamId, setKolamId] = useState(filters.kolam_id || '');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [monitoringToDelete, setMonitoringToDelete] = useState<any>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // --------------------
    // SEARCH / FILTER
    // --------------------
    const triggerSearch = useCallback(
        (newSearch: string, newKolamId: string) => {
            if (debounceRef.current) clearTimeout(debounceRef.current);

            debounceRef.current = setTimeout(() => {
                router.get(
                    '/kolam-monitoring',
                    { search: newSearch, kolam_id: newKolamId, page: 1 },
                    { preserveState: true, replace: true }
                );
            }, 300);
        },
        []
    );

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearch(value);
        triggerSearch(value, kolamId);
    };

    const handleKolamChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setKolamId(value);
        triggerSearch(search, value);
    };

    // --------------------
    // DELETE MODAL
    // --------------------
    const openDeleteModal = (monitoring: any) => {
        setMonitoringToDelete(monitoring);
        setShowDeleteModal(true);
    };

    const closeDeleteModal = () => {
        setMonitoringToDelete(null);
        setShowDeleteModal(false);
    };

    const handleDelete = () => {
        if (!monitoringToDelete) return;

        router.delete(`/kolam-monitoring/${monitoringToDelete.id}`, {
            onSuccess: () => closeDeleteModal(),
            onError: () => closeDeleteModal(),
        });
    };

    // --------------------
    // RENDER
    // --------------------
    return (
        <AppLayout breadcrumbs={breadcrumbs}>

            <Head title="Data Monitoring Kolam" />

            <div className="rounded-md m-3 border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm overflow-hidden">

                {/* Toolbar */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 px-5 py-4
  bg-neutral-50 dark:bg-neutral-800/60
  border-b border-neutral-200 dark:border-neutral-800"
                >
                    {/* Title */}
                    <div>
                        <h2 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100">
                            Monitoring Kualitas Air
                        </h2>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                            Pantau parameter air dan histori monitoring kolam
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            onClick={() => router.get('/kolam-monitoring/create')}
                            className="btn btn-sm btn-primary"
                        >
                            <Plus className="h-4 w-4" />
                            Tambah Monitoring
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
                                placeholder="Cari kolam..."
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
                        <thead className="bg-neutral-100 dark:bg-neutral-800 text-xs uppercase tracking-wide">
                            <tr>
                                <th className="px-5 py-3 text-left text-neutral-600 dark:text-neutral-300">#</th>
                                <th className="px-5 py-3 text-left text-neutral-600 dark:text-neutral-300">Kolam</th>
                                <th className="px-5 py-3 text-left text-neutral-600 dark:text-neutral-300">Kualitas Air</th>
                                <th className="px-5 py-3 text-left text-neutral-600 dark:text-neutral-300">Catatan</th>
                                <th className="px-5 py-3 text-left text-neutral-600 dark:text-neutral-300">Pemilik</th>
                                <th className="px-5 py-3 text-left text-neutral-600 dark:text-neutral-300">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                            {monitorings.length > 0 ? monitorings.map((m: any, i: number) => (
                                <tr
                                    key={m.id}
                                    className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition"
                                >
                                    <td className="px-5 py-4 text-neutral-500">
                                        {pagination.from + i}
                                    </td>

                                    {/* Kolam + Tanggal */}
                                    <td className="px-5 py-4">
                                        <div className="font-medium text-neutral-800 dark:text-neutral-100">
                                            {m.kolam?.name || '-'}
                                        </div>
                                        <div className="flex items-center gap-1 text-xs text-neutral-500 mt-1">
                                            <Calendar className="h-3 w-3" />
                                            {new Date(m.date).toLocaleDateString()}
                                        </div>
                                    </td>

                                    {/* Kualitas Air */}
                                    <td className="px-5 py-4">
                                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-neutral-600 dark:text-neutral-400">
                                            <span className="flex items-center gap-1">
                                                <Thermometer className="h-3 w-3" />
                                                {m.water_temp_c ?? '-'}°C
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Droplets className="h-3 w-3" />
                                                pH {m.ph ?? '-'}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Wind className="h-3 w-3" />
                                                {m.oxygen_mg_l ?? '-'} mg/L
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <AlertTriangle className="h-3 w-3" />
                                                NH₃ {m.ammonia_mg_l ?? '-'} mg/L
                                            </span>
                                            <span className="flex items-center gap-1 col-span-2">
                                                <Droplets className="h-3 w-3" />
                                                NTU {m.turbidity_ntu ?? '-'}
                                            </span>
                                        </div>
                                    </td>

                                    {/* Catatan */}
                                    <td className="px-5 py-4 max-w-[200px]">
                                        <p className="text-xs text-neutral-600 dark:text-neutral-400 truncate">
                                            {m.remarks || 'Tidak ada catatan'}
                                        </p>
                                    </td>

                                    {/* Pemilik */}
                                    <td className="px-5 py-4">
                                        {m.kolam?.pemilik?.name ? (
                                            <span
                                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
        bg-neutral-100 text-neutral-700 ring-1 ring-inset ring-neutral-300
        dark:bg-neutral-800 dark:text-neutral-200 dark:ring-neutral-700"
                                            >
                                                <User className="h-3.5 w-3.5" />
                                                {m.kolam.pemilik.name}
                                            </span>
                                        ) : (
                                            <span className="text-xs text-neutral-400">-</span>
                                        )}
                                    </td>

                                    {/* Actions */}
                                    <td className="px-5 py-4">
                                        <div className="flex gap-2">
                                            <button
                                                className="btn btn-xs btn-outline"
                                                onClick={() =>
                                                    router.get(`/kolam-monitoring/${m.id}/edit`)
                                                }
                                            >
                                                <Pencil className="h-3.5 w-3.5" />
                                            </button>
                                            <button
                                                className="btn btn-xs btn-outline btn-error"
                                                onClick={() => openDeleteModal(m)}
                                            >
                                                <Trash className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>

                            )) : (
                                <tr>
                                    <td colSpan={11} className="px-4 py-12 text-center text-neutral-400">Tidak ada data monitoring ditemukan</td>
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
                            onClick={() => router.get('/kolam-monitoring', { page: pagination.prev_page, search, kolam_id: kolamId })}
                        >
                            <ChevronLeft className="h-4 w-4" /> Prev
                        </button>
                        <button
                            className="btn btn-sm btn-outline"
                            disabled={!pagination.has_next}
                            onClick={() => router.get('/kolam-monitoring', { page: pagination.next_page, search, kolam_id: kolamId })}
                        >
                            Next <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Delete Modal */}
            {showDeleteModal && monitoringToDelete && (
                <dialog open className="modal">
                    <div className="modal-box max-w-sm p-6 bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 shadow-lg">
                        <h3 className="font-semibold text-lg mb-4">Konfirmasi Hapus</h3>
                        <p className="mb-6">
                            Apakah Anda yakin ingin menghapus monitoring kolam <span className="font-medium">{monitoringToDelete.kolam?.name}</span>? Tindakan ini tidak dapat dibatalkan.
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
