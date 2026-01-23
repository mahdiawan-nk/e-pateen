import { Head, router } from '@inertiajs/react'
import { useState, useRef, useCallback } from 'react'
import AppLayout from '@/layouts/app-layout'
import { ChevronRight, ChevronLeft, Plus, Pencil, User, Activity, Package } from 'lucide-react'
import { type BreadcrumbItem } from '@/types'

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Siklus Produksi Kolam', href: '/kolam-seeding' },
]

const badgeBase =
    'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium capitalize'

const statusBadge = (status: string) => {
    switch (status) {
        case 'growing':
            return `${badgeBase} bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400`
        case 'harvest':
            return `${badgeBase} bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400`
        case 'closed':
            return `${badgeBase} bg-neutral-200 text-neutral-700 dark:bg-neutral-700/40 dark:text-neutral-300`
        default:
            return `${badgeBase} bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400`
    }
}


export default function Index({ seedings, filters, pagination, kolam_options }: any) {
    const [search, setSearch] = useState(filters.search || '')
    const [kolamId, setKolamId] = useState(filters.kolam_id || '')
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    // ============================
    // SEARCH / FILTER
    // ============================
    const triggerSearch = useCallback(
        (newSearch: string, newKolamId: string) => {
            if (debounceRef.current) clearTimeout(debounceRef.current)

            debounceRef.current = setTimeout(() => {
                router.get(
                    '/kolam-seeding',
                    { search: newSearch, kolam_id: newKolamId, page: 1 },
                    { preserveState: true, replace: true }
                )
            }, 300)
        },
        []
    )

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setSearch(value)
        triggerSearch(value, kolamId)
    }

    const handleKolamChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value
        setKolamId(value)
        triggerSearch(search, value)
    }

    // ============================
    // UI
    // ============================
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Siklus Produksi Kolam" />

            <div className="rounded-xl m-3 border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm overflow-hidden">

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
                            Siklus Produksi Kolam
                        </h2>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                            Kelola proses tebar, pertumbuhan, hingga panen setiap kolam
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            onClick={() => router.get('/kolam-seeding/create')}
                            className="btn btn-sm btn-primary gap-1"
                        >
                            <Plus className="h-4 w-4" />
                            Seeding Baru
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
                                placeholder="Cari kolam, jenis, atau pemilik..."
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
                                <th className="px-4 py-3">No</th>
                                <th className="px-4 py-3">Kolam</th>
                                <th className="px-4 py-3">Tanggal Tebar</th>
                                <th className="px-4 py-3">Jenis</th>
                                <th className="px-4 py-3">Stok Awal</th>
                                <th className="px-4 py-3">Ukuran & Berat</th>
                                <th className="px-4 py-3">Status Siklus</th>
                                <th className="px-4 py-3">Pemilik</th>
                                <th className="px-4 py-3 text-right">Aksi</th>
                            </tr>
                        </thead>

                        <tbody>
                            {seedings.length > 0 ? (
                                seedings.map((m: any, i: number) => (
                                    <tr
                                        key={m.id}
                                        className="hover:bg-neutral-50 dark:hover:bg-neutral-800/60 transition"
                                    >
                                        <td className="px-4 py-2">{pagination.from + i}</td>

                                        <td className="px-4 py-2 font-medium">
                                            {m.kolam?.name ?? '-'}
                                        </td>

                                        <td className="px-4 py-2">
                                            <div className="text-sm font-medium">
                                                {m.date_seeded
                                                    ? new Date(m.date_seeded).toLocaleDateString('id-ID')
                                                    : '-'}
                                            </div>
                                            {/* <div className="text-xs text-neutral-500 dark:text-neutral-400">
                                                Hari ke-{m.day_count ?? 0}
                                            </div> */}
                                        </td>

                                        <td className="px-4 py-2 capitalize">
                                            {m.seed_type}
                                        </td>

                                        <td className="px-4 py-2">
                                            <span className="inline-flex items-center gap-1">
                                                <Package className="h-3.5 w-3.5 text-neutral-400" />
                                                {m.initial_quantity?.toLocaleString() ?? '-'} ekor
                                            </span>
                                        </td>

                                        <td className="px-4 py-2 text-xs text-neutral-600 dark:text-neutral-400">
                                            <div>📏 {m.seed_size_cm ?? '-'} cm</div>
                                            <div>⚖️ {m.average_weight_seed_g ?? '-'} g/ekor</div>
                                        </td>

                                        <td className="px-4 py-2">
                                            <span className={statusBadge(m.cycle_status)}>
                                                <Activity className="h-3 w-3" />
                                                {m.cycle_status === 'growing'
                                                    ? 'Bertumbuh'
                                                    : m.cycle_status === 'harvest'
                                                        ? 'Siap Panen'
                                                        : 'Ditutup'}
                                            </span>
                                        </td>

                                        <td className="px-4 py-2">
                                            <span className="inline-flex items-center gap-1 rounded-full
    bg-sky-100 text-sky-700 px-2.5 py-0.5 text-[11px] font-medium
    dark:bg-sky-500/10 dark:text-sky-400"
                                            >
                                                <User className="w-3 h-3" />
                                                {m.kolam?.pemilik?.name ?? '-'}
                                            </span>
                                        </td>

                                        <td className="px-4 py-2">
                                            <div className="flex justify-end gap-1">
                                                <button
                                                    title="Edit Seeding"
                                                    className="btn btn-xs btn-outline"
                                                    onClick={() => router.get(`/kolam-seeding/${m.id}/edit`)}
                                                >
                                                    <Pencil className="h-3.5 w-3.5" />
                                                </button>

                                                <button
                                                    title="Catat Movement Stok"
                                                    className="btn btn-xs btn-outline btn-info"
                                                    onClick={() => router.get(`/kolam-seeding/${m.id}/movement`)}
                                                >
                                                    📊
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={9} className="px-4 py-16 text-center">
                                        <div className="flex flex-col items-center gap-2 text-neutral-400">
                                            <Package className="h-8 w-8" />
                                            <p className="text-sm">Belum ada siklus produksi</p>
                                            <p className="text-xs">
                                                Klik <span className="font-medium">Seeding Baru</span> untuk memulai produksi kolam
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
                    <div className="text-xs text-neutral-500">
                        Menampilkan {pagination.from}–{pagination.to} dari {pagination.total}
                    </div>

                    <div className="flex gap-2">
                        <button
                            className="btn btn-sm btn-outline"
                            disabled={!pagination.has_prev}
                            onClick={() =>
                                router.get('/kolam-seeding', {
                                    page: pagination.prev_page,
                                    search,
                                    kolam_id: kolamId,
                                })
                            }
                        >
                            <ChevronLeft className="h-4 w-4" /> Prev
                        </button>
                        <button
                            className="btn btn-sm btn-outline"
                            disabled={!pagination.has_next}
                            onClick={() =>
                                router.get('/kolam-seeding', {
                                    page: pagination.next_page,
                                    search,
                                    kolam_id: kolamId,
                                })
                            }
                        >
                            Next <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>
        </AppLayout>
    )
}
