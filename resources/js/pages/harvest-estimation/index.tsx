import { Head, router, useForm } from '@inertiajs/react';
import { useState, useRef, useCallback } from 'react';
import AppLayout from '@/layouts/app-layout';
import { ChevronRight, ChevronLeft, Plus, Pencil, Trash, User } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
import { FormInput } from '@/components/ui/form-input';
const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Data Pemberian Pakan', href: '/kolam-feeding' },
];

export default function Index({ estimations, filters, pagination, kolam_options }: any) {
    const [search, setSearch] = useState(filters.search || '');
    const [kolamId, setKolamId] = useState(filters.kolam_id || '');
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [open, setOpen] = useState(false);
    const [estimatetData, setEstimatetData] = useState<any>(null);

    const tableColumns = [
        { key: 'id', label: 'No' },
        { key: 'kolam', label: 'Detail Kolam' },
        { key: 'seeding', label: 'Detail Seeding' },
        { key: 'estimation', label: 'Detail Estimasi' },
        { key: 'estimated_harvest_date', label: 'Estimasi Jadwal Panen' },
        // { key: 'notes', label: 'Catatan' },
        { key: 'action', label: 'Action' },
    ]
    const form = useForm({
        estimated_harvest_date: '',
        notes: '',
    })
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

    const handleEdit = (data: any) => {
        setEstimatetData(data);
        form.setData('estimated_harvest_date', data.estimated_harvest_date.split('T')[0]);
        form.setData('notes', data.notes);
        setOpen(true);
    }

    const closeModal = () => {
        setEstimatetData(null);
        setOpen(false);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.put(`/harvest/estimation/${estimatetData?.id}`, {
            onSuccess: () => closeModal(),
            onError: () => closeModal(),
        });
    };


    // --------------------
    // RENDER
    // --------------------
    return (
        <AppLayout breadcrumbs={breadcrumbs}>

            <Head title="Data Monitoring Kolam" />

            <div className="rounded-md m-3 border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm overflow-hidden">
                <div className="bg-neutral-50 dark:bg-neutral-900 rounded-lg shadow-md p-6 space-y-4 border border-neutral-200 dark:border-neutral-700">
                    <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-2">
                        <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Aturan Edit Data Estimation
                    </h3>

                    <div className="space-y-3 text-sm text-neutral-700 dark:text-neutral-300">
                        {/* Minor Adjustment */}
                        <div className="flex items-start gap-2">
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200">
                                !
                            </span>
                            <div>
                                <p className="font-medium">Minor Adjustment Diperbolehkan</p>
                                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                    Hanya field catatan dan minor adjustment yang diperbolehkan, misal tanggal panen berubah karena kondisi kolam.
                                </p>
                            </div>
                        </div>

                        {/* Notes */}
                        <div className="flex items-start gap-2">
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                                📝
                            </span>
                            <div>
                                <p className="font-medium">Gunakan Notes untuk Faktor Eksternal</p>
                                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                    Masukkan informasi tambahan untuk memperkirakan faktor eksternal, misal cuaca, kondisi air, atau kejadian khusus.
                                </p>
                            </div>
                        </div>

                        {/* Field Tidak Bisa Diedit */}
                        <div className="flex items-start gap-2">
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200">
                                ✖
                            </span>
                            <div>
                                <p className="font-medium">Field Otomatis Tidak Bisa Diedit</p>
                                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                    Population, Average Weight, Biomass, dan hasil perhitungan otomatis lainnya tidak dapat diedit manual. Mengubahnya akan membuat data tidak akurat.
                                </p>
                            </div>
                        </div>

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
                            Data Estimtasi Panen
                        </h2>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                            Catatan distribusi pakan harian per kolam dan penanggung jawab
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-2">
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
                            {estimations.length > 0 ? estimations.map((m: any, i: number) => (
                                <tr key={m.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/60 transition">
                                    {tableColumns.map((col) => {
                                        switch (col.key) {
                                            case 'id':
                                                return <td key={col.key} className="px-4 py-2">{pagination.from + i}</td>;
                                            case 'seeding':
                                                return (
                                                    <td key={col.key} className="px-4 py-3">
                                                        <div className="space-y-2 text-xs">
                                                            <div className="pb-2 border-b border-neutral-200 dark:border-neutral-700">
                                                                <div className="text-neutral-500 uppercase">Tanggal Tebar</div>
                                                                <div className="font-semibold text-sm">
                                                                    {new Date(m.seeding.date_seeded).toLocaleDateString('id-ID', {
                                                                        day: '2-digit',
                                                                        month: 'short',
                                                                        year: 'numeric',
                                                                    }) ?? '-'}
                                                                </div>
                                                            </div>

                                                            <div className="pb-2 border-b border-neutral-200 dark:border-neutral-700">
                                                                <div className="text-neutral-500 uppercase">Jenis Benih</div>
                                                                <div className="font-semibold text-sm">
                                                                    {m.seeding.seed_type ?? '-'}
                                                                </div>
                                                            </div>

                                                            <div className="flex flex-col">
                                                                <div className="text-neutral-500 uppercase text-xs">Jumlah Tebar</div>
                                                                <div className="font-semibold text-sm">
                                                                    {m.seeding.initial_quantity ?? '-'} ekor
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                )
                                            case 'estimation':
                                                return (
                                                    <td key={col.key} className="px-4 py-3">
                                                        <div className="space-y-2 text-xs">
                                                            <div className="pb-2 border-b border-neutral-200 dark:border-neutral-700">
                                                                <div className="text-neutral-500 uppercase">Jumlah Ikan</div>
                                                                <div className="font-semibold text-sm">
                                                                    {m.estimated_population ?? '-'}
                                                                </div>
                                                            </div>

                                                            <div className="pb-2 border-b border-neutral-200 dark:border-neutral-700">
                                                                <div className="text-neutral-500 uppercase">Rata-rata Berat</div>
                                                                <div className="font-semibold text-sm">
                                                                    {m.estimated_avg_weight_g ?? '-'} g
                                                                </div>
                                                            </div>

                                                            <div className="flex flex-col">
                                                                <div className="text-neutral-500 uppercase text-xs">Biomassa</div>
                                                                <div className="font-semibold text-sm">
                                                                    {m.estimated_biomass_kg ?? '-'} kg
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                )
                                            case 'action':
                                                return (
                                                    <td key={col.key} className="px-4 py-2">
                                                        <div className="flex justify-end gap-1">
                                                            <button
                                                                title="Edit Data"
                                                                className="btn btn-xs btn-outline"
                                                                onClick={() => handleEdit(m)}
                                                            >
                                                                <Pencil className="h-3.5 w-3.5" />
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
                                                                Lokasi: {m.kolam?.capacity_fish ?? '—'}
                                                            </div>
                                                            <div className="text-xs text-neutral-500 dark:text-neutral-400">
                                                                Pemilik: {m.kolam?.pemilik.name ?? '—'}
                                                            </div>
                                                        </div>
                                                    )
                                                }
                                                if (col.key === 'estimated_harvest_date') {
                                                    value = value
                                                        ? new Date(value).toLocaleDateString('id-ID', {
                                                            day: '2-digit',
                                                            month: 'short',
                                                            year: 'numeric',
                                                        })
                                                        : '-'
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

            {open && estimatetData && (
                <dialog open className="modal">
                    <div className="modal-box max-w-md p-6 bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 shadow-lg">
                        <h3 className="font-semibold text-lg mb-4">Edit Data</h3>
                        <form onSubmit={handleSubmit}>
                            <FormInput
                                label="Tanggal Estimasi Panen"
                                name="estimated_harvest_date"
                                type="date"
                                value={form.data.estimated_harvest_date}
                                onChange={(e) => form.setData('estimated_harvest_date', e)}
                                error={form.errors.estimated_harvest_date}
                            />
                            <FormInput
                                label="Catatan"
                                name="notes"
                                type="textarea"
                                value={form.data.notes}
                                onChange={(e) => form.setData('notes', e)}
                                placeholder="Masukkan catatan tambahan"
                                error={form.errors.notes}
                            />
                        </form>
                        <div className="flex justify-end gap-2 mt-5">
                            <button onClick={closeModal} className="btn btn-outline">Batal</button>
                            <button onClick={handleSubmit} className="btn btn-primary">simpan</button>
                        </div>
                    </div>
                    <div className="modal-backdrop" onClick={closeModal}></div>
                </dialog>
            )}

        </AppLayout>
    );
}
