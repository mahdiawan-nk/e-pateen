import { Head, router } from '@inertiajs/react';
import { useState, useRef, useCallback } from 'react';
import AppLayout from '@/layouts/app-layout';
import { ChevronRight, ChevronLeft, Plus, Pencil, Trash, User } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Data Pemberian Pakan', href: '/kolam-feeding' },
];

export default function Index({ feedings, filters, pagination, kolam_options }: any) {
    const [search, setSearch] = useState(filters.search || '');
    const [kolamId, setKolamId] = useState(filters.kolam_id || '');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [monitoringToDelete, setMonitoringToDelete] = useState<any>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const tableColumns = [
        { key: 'id', label: 'No' },
        { key: 'kolam', label: 'Kolam' },
        { key: 'feeding_date', label: 'Tanggal Pemberian' },
        { key: 'feed_type', label: 'Jenis Pakan' },
        { key: 'quantity_kg', label: 'Jumlah (Kg)' },
        { key: 'feeding_method', label: 'Metode Pemberian' },
        { key: 'feed_source', label: 'Sumber Pakan' },
        { key: 'notes', label: 'Catatan' },
        { key: 'pemilik', label: 'Pemilik' },
        { key: 'action', label: 'Action' },
    ]
    // --------------------
    // SEARCH / FILTER
    // --------------------
    const triggerSearch = useCallback(
        (newSearch: string, newKolamId: string) => {
            if (debounceRef.current) clearTimeout(debounceRef.current);

            debounceRef.current = setTimeout(() => {
                router.get(
                    '/kolam-feeding',
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

        router.delete(`/kolam-feeding/${monitoringToDelete.id}`, {
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
                <div
                    className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 px-5 py-4
  bg-neutral-50 dark:bg-neutral-800/60
  border-b border-neutral-200 dark:border-neutral-800"
                >
                    {/* Title */}
                    <div>
                        <h2 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100">
                            Data Pemberian Pakan
                        </h2>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                            Catatan distribusi pakan harian per kolam dan penanggung jawab
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            onClick={() => router.get('/kolam-feeding/create')}
                            className="btn btn-sm btn-primary gap-1"
                        >
                            <Plus className="h-4 w-4" />
                            Tambah Data
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
                            className="flex items-center gap-2 h-9 w-full md:w-64
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
                                placeholder="Cari kolam, jenis pakan, atau pemilik..."
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
                                {tableColumns.map((col) => (
                                    <th key={col.key} className="px-4 py-3 text-left">
                                        {col.label}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {feedings.length > 0 ? feedings.map((m: any, i: number) => (
                                <tr key={m.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/60 transition">
                                    {tableColumns.map((col) => {
                                        switch (col.key) {
                                            case 'id':
                                                return <td key={col.key} className="px-4 py-2">{pagination.from + i}</td>;
                                            case 'action':
                                                return (
                                                    <td key={col.key} className="px-4 py-2">
                                                        <div className="flex justify-end gap-1">
                                                            <button
                                                                title="Edit Data"
                                                                className="btn btn-xs btn-outline"
                                                                onClick={() => router.get(`/kolam-feeding/${m.id}/edit`)}
                                                            >
                                                                <Pencil className="h-3.5 w-3.5" />
                                                            </button>
                                                            <button
                                                                title="Hapus Data"
                                                                className="btn btn-xs btn-outline btn-error"
                                                                onClick={() => openDeleteModal(m)}
                                                            >
                                                                <Trash className="h-3.5 w-3.5" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                )

                                            default:
                                                // untuk key kolam atau nested object
                                                let value: any = m[col.key];

                                                // nested kolam.name atau kolam.pemilik.name
                                                if (col.key === 'kolam') {
                                                    value = (
                                                        <div>
                                                            <div className="font-medium text-neutral-800 dark:text-neutral-100">
                                                                {m.kolam?.name ?? '-'}
                                                            </div>
                                                            <div className="text-xs text-neutral-500 dark:text-neutral-400">
                                                                Lokasi: {m.kolam?.location ?? '—'}
                                                            </div>
                                                        </div>
                                                    )
                                                }
                                                if (col.key === 'pemilik') {
                                                    const pemilikName = m.kolam?.pemilik?.name ?? '-'
                                                    value = (
                                                        <span
                                                            className="inline-flex items-center gap-1 rounded-full
      bg-sky-100 text-sky-700 px-2.5 py-0.5 text-[11px] font-medium
      dark:bg-sky-500/10 dark:text-sky-400"
                                                        >
                                                            <User className="w-3 h-3" />
                                                            {pemilikName}
                                                        </span>
                                                    )
                                                }
                                                if (col.key === 'feeding_date') {
                                                    value = value
                                                        ? new Date(value).toLocaleDateString('id-ID', {
                                                            day: '2-digit',
                                                            month: 'short',
                                                            year: 'numeric',
                                                        })
                                                        : '-'
                                                }
                                                if (col.key === 'quantity_kg') {
                                                    value = (
                                                        <span className="inline-flex items-center gap-1 font-medium">
                                                            🧺 {m.quantity_kg?.toLocaleString() ?? '-'} kg
                                                        </span>
                                                    )
                                                }
                                                const tdClass =
                                                    col.key === 'notes'
                                                        ? 'px-4 py-2 text-sm text-neutral-600 dark:text-neutral-400 max-w-xs break-words'
                                                        : 'px-4 py-2 text-sm'
                                                return (
                                                    <td key={col.key} className={tdClass}>{value ?? '-'}</td>
                                                );
                                        }
                                    })}
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={tableColumns.length} className="px-4 py-16 text-center">
                                        <div className="flex flex-col items-center gap-2 text-neutral-400">
                                            🧺
                                            <p className="text-sm">Belum ada data pemberian pakan</p>
                                            <p className="text-xs">
                                                Klik <span className="font-medium">Tambah Data</span> untuk mencatat distribusi pakan pertama
                                            </p>
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
                            onClick={() => router.get('/kolam-feeding', { page: pagination.prev_page, search, kolam_id: kolamId })}
                        >
                            <ChevronLeft className="h-4 w-4" /> Prev
                        </button>
                        <button
                            className="btn btn-sm btn-outline"
                            disabled={!pagination.has_next}
                            onClick={() => router.get('/kolam-feeding', { page: pagination.next_page, search, kolam_id: kolamId })}
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
                            Apakah Anda yakin ingin menghapus sebaran benih <span className="font-medium">{monitoringToDelete.kolam?.name}</span>? Tindakan ini tidak dapat dibatalkan.
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
