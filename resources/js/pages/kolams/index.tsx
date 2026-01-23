import { Head } from '@inertiajs/react'
import { useState, useRef, useCallback } from 'react'
import AppLayout from '@/layouts/app-layout'
import { router } from '@inertiajs/react'
import {
    ChevronRight,
    ChevronLeft,
    Plus,
    Pencil,
    Trash,
    Droplets,
    Fish,
    Ruler,
    MapPin,
    User,
} from 'lucide-react'
import { type BreadcrumbItem } from '@/types'

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Data Kolam', href: 'kolams' },
]

export default function Index({
    kolams,
    filters,
    pagination,
}: {
    kolams: any[]
    filters: any
    pagination: any
}) {
    const [search, setSearch] = useState(filters.search || '')
    const [conditionStatus, setConditionStatus] = useState(
        filters.condition_status || ''
    )
    const [productionStatus, setProductionStatus] = useState(
        filters.production_status || ''
    )
    const [typeFilter, setTypeFilter] = useState(filters.type || '')
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [kolamToDelete, setKolamToDelete] = useState<{
        id: string
        name: string
    } | null>(null)

    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    const triggerSearch = useCallback(
        (
            newSearch: string,
            newCondition: string,
            newProduction: string,
            newType: string
        ) => {
            if (debounceRef.current) clearTimeout(debounceRef.current)

            debounceRef.current = setTimeout(() => {
                router.get(
                    '/kolams',
                    {
                        search: newSearch,
                        condition_status: newCondition,
                        production_status: newProduction,
                        type: newType,
                        page: 1,
                    },
                    { preserveState: true, replace: true }
                )
            }, 400)
        },
        []
    )

    const badgeBase =
        'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ring-1 ring-inset'

    const conditionStyle = (value: string) => {
        switch (value) {
            case 'active':
                return 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-900/30 dark:text-emerald-300'
            case 'maintenance':
                return 'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-900/30 dark:text-amber-300'
            default:
                return 'bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-900/30 dark:text-red-300'
        }
    }

    const productionStyle = (value: string) => {
        switch (value) {
            case 'idle':
                return 'bg-neutral-100 text-neutral-700 ring-neutral-400/20 dark:bg-neutral-800 dark:text-neutral-300'
            case 'stocking':
                return 'bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-900/30 dark:text-blue-300'
            case 'nursery':
                return 'bg-indigo-50 text-indigo-700 ring-indigo-600/20 dark:bg-indigo-900/30 dark:text-indigo-300'
            case 'growing':
                return 'bg-purple-50 text-purple-700 ring-purple-600/20 dark:bg-purple-900/30 dark:text-purple-300'
            default:
                return 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-900/30 dark:text-emerald-300'
        }
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Data Kolam" />

            <div className="m-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm overflow-hidden">

                {/* HEADER */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 px-5 py-4 bg-neutral-50 dark:bg-neutral-800/60 border-b border-neutral-200 dark:border-neutral-800">
                    <div>
                        <h2 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100">
                            Manajemen Kolam
                        </h2>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                            Kelola data, kondisi, dan status produksi kolam
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            onClick={() => router.get('/kolams/create')}
                            className="btn btn-sm btn-primary"
                        >
                            <Plus className="h-4 w-4" />
                            Tambah Kolam
                        </button>

                        {[
                            {
                                value: conditionStatus,
                                onChange: (e: any) => {
                                    setConditionStatus(e.target.value)
                                    triggerSearch(
                                        search,
                                        e.target.value,
                                        productionStatus,
                                        typeFilter
                                    )
                                },
                                options: [
                                    ['', 'Semua Kondisi'],
                                    ['active', 'Aktif'],
                                    ['maintenance', 'Maintenance'],
                                    ['damaged', 'Rusak'],
                                ],
                            },
                            {
                                value: productionStatus,
                                onChange: (e: any) => {
                                    setProductionStatus(e.target.value)
                                    triggerSearch(
                                        search,
                                        conditionStatus,
                                        e.target.value,
                                        typeFilter
                                    )
                                },
                                options: [
                                    ['', 'Semua Produksi'],
                                    ['idle', 'Idle'],
                                    ['stocking', 'Stocking'],
                                    ['nursery', 'Nursery'],
                                    ['growing', 'Growing'],
                                    ['harvest', 'Harvest'],
                                ],
                            },
                            {
                                value: typeFilter,
                                onChange: (e: any) => {
                                    setTypeFilter(e.target.value)
                                    triggerSearch(
                                        search,
                                        conditionStatus,
                                        productionStatus,
                                        e.target.value
                                    )
                                },
                                options: [
                                    ['', 'Semua Tipe'],
                                    ['tanah', 'Tanah'],
                                    ['terpal', 'Terpal'],
                                    ['beton', 'Beton'],
                                    ['bioflok', 'Bioflok'],
                                ],
                            },
                        ].map((select, i) => (
                            <select
                                key={i}
                                value={select.value}
                                onChange={select.onChange}
                                className="h-9 rounded-lg border border-neutral-300 dark:border-neutral-700
                  bg-white dark:bg-neutral-900 px-3 text-sm 
                  text-neutral-800 dark:text-neutral-200
                  focus:outline-none focus:ring-2 focus:ring-primary/40"
                            >
                                {select.options.map(([val, label]) => (
                                    <option key={val} value={val}>{label}</option>
                                ))}
                            </select>
                        ))}

                        <input
                            type="search"
                            placeholder="Cari nama kolam..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value)
                                triggerSearch(
                                    e.target.value,
                                    conditionStatus,
                                    productionStatus,
                                    typeFilter
                                )
                            }}
                            className="h-9 w-60 rounded-lg border border-neutral-300 dark:border-neutral-700
                bg-white dark:bg-neutral-900 px-3 text-sm 
                text-neutral-800 dark:text-neutral-200
                focus:outline-none focus:ring-2 focus:ring-primary/40"
                        />
                    </div>
                </div>

                {/* TABLE */}
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-neutral-100 dark:bg-neutral-800 text-xs uppercase tracking-wide">
                            <tr>
                                {['No', 'Kolam', 'Spesifikasi', 'Status', 'Pemilik', 'Aksi'].map(
                                    (h) => (
                                        <th
                                            key={h}
                                            className="px-5 py-3 text-left text-neutral-600 dark:text-neutral-300"
                                        >
                                            {h}
                                        </th>
                                    )
                                )}
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                            {kolams.length ? (
                                kolams.map((kolam, i) => (
                                    <tr
                                        key={kolam.id}
                                        className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition"
                                    >
                                        <td className="px-5 py-4 text-neutral-500">
                                            {pagination.from + i}
                                        </td>

                                        {/* Kolam */}
                                        <td className="px-5 py-4">
                                            <div className="font-medium text-neutral-800 dark:text-neutral-100">
                                                {kolam.name}
                                            </div>
                                            <div className="flex items-center gap-1 text-xs text-neutral-500 mt-1">
                                                <MapPin className="h-3 w-3" />
                                                {kolam.location || 'Tidak ada lokasi'}
                                            </div>
                                        </td>

                                        {/* Spesifikasi */}
                                        <td className="px-5 py-4">
                                            <div className="grid grid-cols-1 gap-1 text-xs text-neutral-600 dark:text-neutral-400">
                                                <span className="flex items-center gap-1">
                                                    <Ruler className="h-3 w-3" />
                                                    {kolam.length_m} × {kolam.width_m} ×{' '}
                                                    {kolam.depth_m} m
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Droplets className="h-3 w-3" />
                                                    {kolam.water_volume_l.toLocaleString()} L
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Fish className="h-3 w-3" />
                                                    {kolam.capacity_fish.toLocaleString()} ekor
                                                </span>
                                            </div>
                                        </td>

                                        {/* Status */}
                                        <td className="px-5 py-4 w-[220px]">
                                            <div className="space-y-3">

                                                {/* Status Kolam */}
                                                <div className="grid grid-cols-[1fr_auto] items-center gap-2 pb-2 border-b border-neutral-200 dark:border-neutral-700">
                                                    <span className="text-[10px] uppercase tracking-wide text-neutral-400">
                                                        Status Kolam
                                                    </span>
                                                    <span
                                                        className={`${badgeBase} ${conditionStyle(
                                                            kolam.condition_status
                                                        )}`}
                                                    >
                                                        {kolam.condition_status}
                                                    </span>
                                                </div>

                                                {/* Status Produksi */}
                                                <div className="grid grid-cols-[1fr_auto] items-center gap-2">
                                                    <span className="text-[10px] uppercase tracking-wide text-neutral-400">
                                                        Status Produksi
                                                    </span>
                                                    <span
                                                        className={`${badgeBase} ${productionStyle(
                                                            kolam.production_status
                                                        )}`}
                                                    >
                                                        {kolam.production_status}
                                                    </span>
                                                </div>

                                            </div>
                                        </td>

                                        <td className="px-5 py-4">
                                            {kolam.pemilik?.name ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-neutral-100 text-neutral-700 ring-1 ring-inset ring-neutral-300 dark:bg-neutral-800 dark:text-neutral-200 dark:ring-neutral-700"
                                                >
                                                    <User className="h-3.5 w-3.5" />
                                                    {kolam.pemilik.name}
                                                </span>
                                            ) : (
                                                <span className="text-xs text-neutral-400">-</span>
                                            )}
                                        </td>

                                        {/* Actions */}
                                        <td className="px-5 py-4">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() =>
                                                        router.get(`/kolams/${kolam.id}/edit`)
                                                    }
                                                    className="btn btn-xs btn-outline"
                                                >
                                                    <Pencil className="h-3.5 w-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setKolamToDelete(kolam)
                                                        setShowDeleteModal(true)
                                                    }}
                                                    className="btn btn-xs btn-outline btn-error"
                                                >
                                                    <Trash className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="px-6 py-16 text-center text-neutral-400"
                                    >
                                        <div className="text-sm font-medium">
                                            Tidak ada data kolam
                                        </div>
                                        <div className="text-xs mt-1">
                                            Coba ubah filter atau tambahkan kolam baru
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* PAGINATION */}
                <div className="flex items-center justify-between px-5 py-3 bg-neutral-50 dark:bg-neutral-800/60 border-t border-neutral-200 dark:border-neutral-800">
                    <div className="text-xs text-neutral-500">
                        Menampilkan {pagination.from}–{pagination.to} dari{' '}
                        {pagination.total}
                    </div>

                    <div className="flex gap-2">
                        <button
                            className="btn btn-sm btn-outline"
                            disabled={!pagination.has_prev}
                            onClick={() =>
                                router.get('/kolams', {
                                    page: pagination.prev_page,
                                    search,
                                    condition_status: conditionStatus,
                                    production_status: productionStatus,
                                    type: typeFilter,
                                })
                            }
                        >
                            <ChevronLeft className="h-4 w-4" /> Prev
                        </button>

                        <button
                            className="btn btn-sm btn-outline"
                            disabled={!pagination.has_next}
                            onClick={() =>
                                router.get('/kolams', {
                                    page: pagination.next_page,
                                    search,
                                    condition_status: conditionStatus,
                                    production_status: productionStatus,
                                    type: typeFilter,
                                })
                            }
                        >
                            Next <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* DELETE MODAL */}
            {showDeleteModal && kolamToDelete && (
                <dialog open className="modal">
                    <div className="modal-box max-w-sm">
                        <h3 className="font-semibold text-lg mb-3">
                            Konfirmasi Penghapusan
                        </h3>
                        <p className="text-sm text-neutral-500 mb-6">
                            Hapus kolam <b>{kolamToDelete.name}</b>? Data tidak bisa
                            dikembalikan.
                        </p>

                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="btn btn-outline"
                            >
                                Batal
                            </button>
                            <button
                                onClick={() =>
                                    router.delete(`/kolams/${kolamToDelete.id}`, {
                                        onSuccess: () => setShowDeleteModal(false),
                                    })
                                }
                                className="btn btn-error"
                            >
                                Hapus
                            </button>
                        </div>
                    </div>
                    <div
                        className="modal-backdrop"
                        onClick={() => setShowDeleteModal(false)}
                    />
                </dialog>
            )}
        </AppLayout>
    )
}
