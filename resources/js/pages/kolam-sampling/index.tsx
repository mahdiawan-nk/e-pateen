import { Head, router } from '@inertiajs/react';
import { useState, useRef, useCallback } from 'react';
import AppLayout from '@/layouts/app-layout';
import { ChevronRight, ChevronLeft, Plus, Pencil, Trash, User } from 'lucide-react';
import { Info, Slash, PlusCircle, ShieldCheck } from 'lucide-react';
import { Tooltip } from '@/components/ui/tooltip';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Data Pemberian Pakan', href: '/kolam-feeding' },
];

export default function Index({ samplings, filters, pagination, kolam_options }: any) {
    const [search, setSearch] = useState(filters.search || '');
    const [kolamId, setKolamId] = useState(filters.kolam_id || '');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [monitoringToDelete, setMonitoringToDelete] = useState<any>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const PATH_URL = '/kolam-sampling'

    const tableColumns = [
        { key: 'id', label: 'No' },
        { key: 'kolam', label: 'Kolam' },
        { key: 'sampling_date', label: 'Tanggal Sampling' },
        { key: 'day_since_last', label: 'Hari Sejak Terakhir' },
        { key: 'populasi_sampling', label: 'Populasi & Sampling' },
        { key: 'detail_pertumbuhan', label: 'Detail Pertumbuhan' },
        { key: 'result_absolut', label: 'Hasil Absolut' },
        { key: 'mortalitas', label: 'Mortalitas' },
        // { key: 'notes', label: 'Catatan' },
        { key: 'pemilik', label: 'Pemilik' },
    ]
    // --------------------
    // SEARCH / FILTER
    // --------------------
    const triggerSearch = useCallback(
        (newSearch: string, newKolamId: string) => {
            if (debounceRef.current) clearTimeout(debounceRef.current);

            debounceRef.current = setTimeout(() => {
                router.get(
                    PATH_URL,
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

        router.delete(`${PATH_URL}/${monitoringToDelete.id}`, {
            onSuccess: () => closeDeleteModal(),
            onError: () => closeDeleteModal(),
        });
    };

    // --------------------
    // RENDER
    // --------------------
    return (
        <AppLayout breadcrumbs={breadcrumbs}>

            <Head title="Data Sampling Pertumbuhan Ikan" />

            <div className="rounded-md m-3 border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm overflow-hidden">
                <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg shadow-md p-6 mb-6 border border-neutral-200 dark:border-neutral-700">
                    <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200 mb-4 flex items-center gap-2">
                        <Info className="w-5 h-5 text-blue-600 dark:text-blue-300" />
                        Informasi Penting Data Sampling
                    </h3>

                    <div className="space-y-4 text-sm text-neutral-700 dark:text-neutral-300">

                        {/* Rule 1: Tidak Bisa Edit / Hapus */}
                        <div className="flex items-start gap-2">
                            <Slash className="w-5 h-5 text-red-600 dark:text-red-400 mt-1" />
                            <div>
                                <span className="font-medium text-neutral-900 dark:text-neutral-100">Tidak Bisa Edit / Hapus:</span>
                                <p className="text-neutral-600 dark:text-neutral-300">
                                    Data sampling yang sudah tercatat <span className="font-semibold text-red-600 dark:text-red-400">tidak dapat diedit atau dihapus</span> untuk menjaga akurasi perhitungan pertumbuhan dan estimasi harvest.
                                </p>
                            </div>
                        </div>

                        {/* Rule 2: Tambah Data Baru */}
                        <div className="flex items-start gap-2">
                            <PlusCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-1" />
                            <div>
                                <span className="font-medium text-neutral-900 dark:text-neutral-100">Jika Ada Kesalahan:</span>
                                <p className="text-neutral-600 dark:text-neutral-300">
                                    Untuk kesalahan minor atau major, lakukan <span className="font-semibold text-green-600 dark:text-green-400">tambah data baru</span>. Data lama tetap tercatat untuk histori.
                                </p>
                            </div>
                        </div>

                        {/* Rule 3: Tujuan */}
                        <div className="flex items-start gap-2">
                            <ShieldCheck className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-1" />
                            <div>
                                <span className="font-medium text-neutral-900 dark:text-neutral-100">Tujuan:</span>
                                <p className="text-neutral-600 dark:text-neutral-300">
                                    Menjaga konsistensi dan akurasi pertumbuhan ikan, mortalitas, dan estimasi harvest. Data historis tetap tercatat.
                                </p>
                            </div>
                        </div>

                        {/* Tombol Tambah Data dengan Tooltip */}
                        <div className="mt-2">
                            <div className="tooltip tooltip-right" data-tip="Klik untuk menambah data sampling baru, tidak mengubah data lama">
                                <button
                                    onClick={() => router.get('/kolam-sampling/create')}
                                    className="btn btn-sm btn-primary flex items-center gap-2"
                                >
                                    <PlusCircle className="w-4 h-4" />
                                    Tambah Data Baru
                                </button>
                            </div>
                        </div>

                        {/* Catatan tambahan */}
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
                            Catatan: Pastikan kolam, tanggal, dan jumlah sampel sesuai kondisi aktual sebelum menambah data baru.
                        </p>

                    </div>
                </div>
                {/* Toolbar */}
                <div
                    className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 px-5 py-4
  bg-neutral-50 dark:bg-neutral-800/60
  border-b border-neutral-200 dark:border-neutral-800"
                >
                    {/* Title */}
                    <div>
                        <h2 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100">
                            Data Sampling Pertumbuhan Ikan
                        </h2>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                            
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            onClick={() => router.get('/kolam-sampling/create')}
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
                                placeholder="Cari kolam"
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
                <div className="overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm">
                    <table className="min-w-full text-sm">
                        <thead className="sticky top-0 z-10 bg-neutral-100 dark:bg-neutral-900">
                            <tr className="border-b border-neutral-200 dark:border-neutral-700">
                                {tableColumns.map((label) => (
                                    <th
                                        key={label.key}
                                        className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-300"
                                    >
                                        {label.label}
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                            {samplings.length > 0 ? samplings.map((m: any, i: number) => (
                                <tr
                                    key={m.id}
                                    className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition"
                                >
                                    {tableColumns.map((col) => {
                                        switch (col.key) {
                                            case 'id':
                                                return (
                                                    <td key={col.key} className="px-4 py-3 text-neutral-500 font-medium">
                                                        #{pagination.from + i}
                                                    </td>
                                                );

                                            case 'populasi_sampling':
                                                return (
                                                    <td key={col.key} className="px-4 py-3">
                                                        <div className="space-y-2 text-xs">
                                                            <div className="pb-2 border-b border-neutral-200 dark:border-neutral-700">
                                                                <div className="text-neutral-500 uppercase">Estimasi Populasi Awal</div>
                                                                <div className="font-semibold text-sm">
                                                                    {m.estimated_population ?? '-'} ekor
                                                                </div>
                                                            </div>

                                                            <div className="pb-2 border-b border-neutral-200 dark:border-neutral-700">
                                                                <div className="text-neutral-500 uppercase">Jumlah Sample</div>
                                                                <div className="font-semibold text-sm">
                                                                    {m.sample_size ?? '-'} ekor
                                                                </div>
                                                            </div>

                                                            <div className="flex flex-col">
                                                                <div className="text-neutral-500 uppercase text-xs">Estimasi Populasi (terhitung kematian)</div>
                                                                <div className="font-semibold text-sm">
                                                                    {m.estimated_population != null && m.mortality_count != null
                                                                        ? m.estimated_population - m.mortality_count
                                                                        : '-'}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                );


                                            case 'detail_pertumbuhan':
                                                return (
                                                    <td key={col.key} className="px-4 py-3">
                                                        <div className="space-y-2 text-xs">
                                                            <div className="pb-2 border-b border-neutral-200 dark:border-neutral-700">
                                                                <div className="text-neutral-500 uppercase">Avg Berat Awal</div>
                                                                <div className="font-semibold text-sm">
                                                                    {m.avg_weight_start_g ?? '-'} g
                                                                </div>
                                                            </div>

                                                            <div className="pb-2 border-b border-neutral-200 dark:border-neutral-700">
                                                                <div className="text-neutral-500 uppercase">Avg Berat Akhir</div>
                                                                <div className="font-semibold text-sm">
                                                                    {m.avg_weight_end_g ?? '-'} g
                                                                </div>
                                                            </div>

                                                            <div className="pb-2 border-b border-neutral-200 dark:border-neutral-700">
                                                                <div className="text-neutral-500 uppercase">Avg Panjang Awal</div>
                                                                <div className="font-semibold text-sm">
                                                                    {m.avg_length_start_cm ?? '-'} cm
                                                                </div>
                                                            </div>

                                                            <div>
                                                                <div className="text-neutral-500 uppercase">Avg Panjang Akhir</div>
                                                                <div className="font-semibold text-sm">
                                                                    {m.avg_length_end_cm ?? '-'} cm
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                );


                                            case 'result_absolut':
                                                return (
                                                    <td key={col.key} className="px-4 py-3">
                                                        <div className="space-y-2 text-xs">
                                                            <div className="pb-2 border-b border-neutral-200 dark:border-neutral-700">
                                                                <div className="text-neutral-500 uppercase">Abs Growth Berat</div>
                                                                <div className="font-semibold text-sm">
                                                                    {m.abs_weight_growth_g ?? '-'} g
                                                                </div>
                                                            </div>

                                                            <div className="pb-2 border-b border-neutral-200 dark:border-neutral-700">
                                                                <div className="text-neutral-500 uppercase">Abs Growth Panjang</div>
                                                                <div className="font-semibold text-sm">
                                                                    {m.abs_length_growth_cm ?? '-'} cm
                                                                </div>
                                                            </div>

                                                            <div className="pb-2 border-b border-neutral-200 dark:border-neutral-700">
                                                                <div className="text-neutral-500 uppercase">SGR</div>
                                                                <div className="font-semibold text-sm">
                                                                    {m.sgr_percent ?? '-'} %
                                                                </div>
                                                            </div>

                                                            <div>
                                                                <div className="text-neutral-500 uppercase">Biomass</div>
                                                                <div className="font-semibold text-sm">
                                                                    {m.biomass_kg ?? '-'} kg
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                );


                                            case 'mortalitas':
                                                return (
                                                    <td key={col.key} className="px-4 py-3">
                                                        <div className="space-y-2 text-xs">
                                                            <div className="pb-2 border-b border-neutral-200 dark:border-neutral-700">
                                                                <div className="text-neutral-500 uppercase">Jumlah Mati</div>
                                                                <div className="font-semibold text-sm text-red-500">
                                                                    {m.mortality_count ?? '-'} ekor
                                                                </div>
                                                            </div>

                                                            <div>
                                                                <div className="text-neutral-500 uppercase">Survival Rate</div>
                                                                <div className="font-semibold text-sm">
                                                                    {m.survival_rate ?? '-'} %
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                );

                                            default:
                                                let value: any = m[col.key];

                                                if (col.key === 'kolam') {
                                                    value = m.kolam?.name ?? '-';
                                                }

                                                if (col.key === 'pemilik') {
                                                    const pemilikName = m.kolam?.pemilik?.name ?? '-';
                                                    value = (
                                                        <span className="badge badge-sm badge-outline">
                                                            <User className="w-3 h-3 mr-1" />
                                                            {pemilikName}
                                                        </span>
                                                    );
                                                }

                                                if (col.key === 'sampling_date') {
                                                    value = value
                                                        ? new Date(value).toLocaleDateString('id-ID', {
                                                            day: '2-digit',
                                                            month: 'short',
                                                            year: 'numeric'
                                                        })
                                                        : '-';
                                                }

                                                const tdClass =
                                                    col.key === 'notes'
                                                        ? "px-4 py-3 text-xs whitespace-normal break-words max-w-xs"
                                                        : "px-4 py-3 text-sm";

                                                return (
                                                    <td key={col.key} className={tdClass}>
                                                        {value ?? '-'}
                                                    </td>
                                                );
                                        }
                                    })}
                                </tr>
                            )) : (
                                <tr>
                                    <td
                                        colSpan={tableColumns.length}
                                        className="px-6 py-16 text-center text-neutral-400 text-sm"
                                    >
                                        Tidak ada data sampling ditemukan
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
                            onClick={() => router.get('/kolam-sampling', { page: pagination.prev_page, search, kolam_id: kolamId })}
                        >
                            <ChevronLeft className="h-4 w-4" /> Prev
                        </button>
                        <button
                            className="btn btn-sm btn-outline"
                            disabled={!pagination.has_next}
                            onClick={() => router.get('/kolam-sampling', { page: pagination.next_page, search, kolam_id: kolamId })}
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
