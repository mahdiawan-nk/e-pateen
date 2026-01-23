import { Head, useForm, router } from '@inertiajs/react'
import AppLayout from '@/layouts/app-layout'
import { BreadcrumbItem } from '@/types'
import { FormInput } from '@/components/ui/form-input'
import { useMemo } from 'react'

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Penebaran Benih', href: '/kolam-seeding' },
    { title: 'Movement Stok', href: '#' },
]

interface Movement {
    id: string
    type: 'transfer_in' | 'transfer_out' | 'adjustment'
    quantity: number
    balance_after: number
    notes?: string
    created_at: string
    created_by: string
}

interface Props {
    seeding: {
        id: string
        kolam_name: string
        seed_type: string
        current_stock: number
    }
    movements: Movement[]
}

export default function MovementStock({ seeding, movements }: Props) {
    const form = useForm({
        type: 'transfer_in',
        quantity: '',
        notes: '',
    })

    const submit = (e: React.FormEvent) => {
        e.preventDefault()
        form.post(`/kolam-seeding/${seeding.id}/movement-store`, {
            onSuccess: () => {
                form.reset()
                router.reload()
            },
        })
    }

    const typeDescription = useMemo(() => {
        switch (form.data.type) {
            case 'transfer_in':
                return 'Menambah stok benih ke dalam kolam (tebar susulan / koreksi naik)'
            case 'transfer_out':
                return 'Mengurangi stok benih (mati, panen parsial, atau sampling)'
            case 'adjustment':
                return 'Menyesuaikan stok menjadi angka final hasil stock opname'
            default:
                return ''
        }
    }, [form.data.type])

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Movement Stok Kolam" />

            <div className="max-w-7xl mx-auto p-4 space-y-6">

                {/* ================= HEADER INFO ================= */}
                <div className="bg-white dark:bg-neutral-900 rounded-lg shadow p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-semibold">
                            Movement Stok — {seeding.kolam_name}
                        </h2>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            Jenis Benih: {seeding.seed_type}
                        </p>
                    </div>

                    <div className="text-right">
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            Stok Aktif
                        </p>
                        <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                            {seeding.current_stock.toLocaleString()} ekor
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* ================= FORM ================= */}
                    <div className="lg:col-span-1 bg-white dark:bg-neutral-900 rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold mb-4">
                            Input Movement Stok
                        </h3>

                        <form onSubmit={submit} className="space-y-4">

                            <FormInput
                                label="Tipe Movement"
                                name="type"
                                type="select"
                                value={form.data.type}
                                onChange={(e) => form.setData('type', e)}
                                options={[
                                    { label: 'Tambah Stok (IN)', value: 'transfer_in' },
                                    { label: 'Kurangi Stok (OUT)', value: 'transfer_out' },
                                    { label: 'Penyesuaian (ADJUST)', value: 'adjustment' },
                                ]}
                                error={form.errors.type}
                            />

                            <div className="text-xs text-neutral-500 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-800 p-2 rounded">
                                {typeDescription}
                            </div>

                            <FormInput
                                label={form.data.type === 'adjustment'
                                    ? 'Stok Final (ekor)'
                                    : 'Jumlah (ekor)'}
                                name="quantity"
                                type="number"
                                value={form.data.quantity}
                                onChange={(e) => form.setData('quantity', e)}
                                error={form.errors.quantity}
                            />

                            {form.data.type === 'OUT' && (
                                <div className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 p-2 rounded">
                                    ⚠ Pastikan stok cukup. Sistem akan menolak jika stok menjadi minus.
                                </div>
                            )}

                            <FormInput
                                label="Catatan"
                                name="notes"
                                type="textarea"
                                value={form.data.notes}
                                onChange={(e) => form.setData('notes', e)}
                                placeholder="Contoh: Sampling mingguan, mati karena cuaca, koreksi opname"
                                error={form.errors.notes}
                            />

                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => router.get('/kolam-seeding')}
                                    className="btn btn-outline"
                                >
                                    Kembali
                                </button>
                                <button
                                    type="submit"
                                    disabled={form.processing}
                                    className="btn btn-info"
                                >
                                    Simpan Movement
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* ================= LEDGER ================= */}
                    <div className="lg:col-span-2 bg-white dark:bg-neutral-900 rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold mb-4">
                            Riwayat Movement Stok
                        </h3>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm border border-neutral-200 dark:border-neutral-700 rounded overflow-hidden">
                                <thead className="bg-neutral-100 dark:bg-neutral-800">
                                    <tr>
                                        <th className="px-3 py-2 text-left">Tanggal</th>
                                        <th className="px-3 py-2 text-left">Tipe</th>
                                        <th className="px-3 py-2 text-right">Jumlah</th>
                                        <th className="px-3 py-2 text-right">Saldo</th>
                                        <th className="px-3 py-2">User</th>
                                        <th className="px-3 py-2">Catatan</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {movements.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={6}
                                                className="text-center py-6 text-neutral-500"
                                            >
                                                Belum ada movement stok
                                            </td>
                                        </tr>
                                    )}

                                    {movements.map((m) => (
                                        <tr
                                            key={m.id}
                                            className="border-t border-neutral-200 dark:border-neutral-700"
                                        >
                                            <td className="px-3 py-2">
                                                {new Date(m.created_at).toLocaleString()}
                                            </td>
                                            <td className="px-3 py-2 font-medium">
                                                <span
                                                    className={`px-2 py-1 rounded text-xs ${m.type === 'transfer_in'
                                                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                                                            : m.type === 'transfer_out'
                                                                ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
                                                                : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                                                        }`}
                                                >
                                                    {m.type}
                                                </span>
                                            </td>
                                            <td className="px-3 py-2 text-right">
                                                {m.quantity.toLocaleString()}
                                            </td>
                                            <td className="px-3 py-2 text-right font-semibold">
                                                {m.balance_after.toLocaleString()}
                                            </td>
                                            <td className="px-3 py-2 text-center">
                                                {m.created_by}
                                            </td>
                                            <td className="px-3 py-2 text-neutral-600 dark:text-neutral-300">
                                                {m.notes || '-'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            </div>
        </AppLayout>
    )
}
