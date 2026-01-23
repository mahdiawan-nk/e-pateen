import { Head, useForm, router } from '@inertiajs/react'
import AppLayout from '@/layouts/app-layout'
import { BreadcrumbItem } from '@/types'
import { FormInput } from '@/components/ui/form-input'

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Siklus Produksi', href: '/kolam-seeding' },
    { title: 'Detail & Edit Seeding', href: '' },
]

interface Props {
    seeding: {
        id: string
        kolam_id: string
        kolam: any
        seed_type: string
        initial_quantity: number
        seed_size_cm: number | null
        average_weight_seed_g: number | null
        date_seeded: string
        source: string | null
        notes: string | null
        cycle_status: 'growing' | 'harvest' | 'closed'
        current_balance: number
    }
}

export default function Update({ seeding }: Props) {
    const form = useForm({
        seed_type: seeding.seed_type,
        seed_size_cm: seeding.seed_size_cm ?? '',
        average_weight_seed_g: seeding.average_weight_seed_g ?? '',
        source: seeding.source ?? '',
        notes: seeding.notes ?? '',
    })

    const submit = (e: React.FormEvent) => {
        e.preventDefault()
        form.put(`/kolam-seeding/${seeding.id}`, {
            preserveScroll: true,
            onSuccess: () => router.get('/kolam-seeding'),
        })
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Detail Seeding" />

            <div className="max-w-6xl mx-auto px-4 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* ================= DETAIL CARD ================= */}
                    <div className="bg-neutral-50 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6">
                        <h3 className="text-lg font-semibold mb-4">
                            Informasi Siklus
                        </h3>

                        <div className="space-y-3 text-sm text-neutral-700 dark:text-neutral-300">
                            <div className="flex justify-between">
                                <span>Kolam</span>
                                <span className="font-medium">{seeding.kolam.name}</span>
                            </div>

                            <div className="flex justify-between">
                                <span>Tanggal Seeding</span>
                                <span className="font-medium">
                                    {new Date(seeding.date_seeded).toLocaleDateString('id-ID')}
                                </span>
                            </div>

                            <div className="flex justify-between">
                                <span>Status Siklus</span>
                                <span className="px-2 py-0.5 rounded-md text-xs font-medium
                  bg-blue-100 text-blue-700
                  dark:bg-blue-950 dark:text-blue-300">
                                    {seeding.cycle_status.toUpperCase()}
                                </span>
                            </div>

                            <div className="flex justify-between">
                                <span>Saldo Awal</span>
                                <span className="font-medium">
                                    {seeding.initial_quantity.toLocaleString()} ekor
                                </span>
                            </div>

                            <div className="flex justify-between">
                                <span>Saldo Saat Ini</span>
                                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                                    {seeding.current_balance} ekor
                                </span>
                            </div>
                        </div>

                        <div className="mt-4 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-xs">
                            ⚠️ Stok tidak bisa diedit langsung. Gunakan menu
                            <strong> Adjustment / Mortality / Harvest</strong>
                            untuk mengubah saldo ikan.
                        </div>
                    </div>

                    {/* ================= FORM ================= */}
                    <div className="lg:col-span-2 bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-6">
                        <h2 className="text-xl font-semibold mb-1">
                            Edit Informasi Seeding
                        </h2>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6">
                            Data ini bersifat deskriptif dan tidak memengaruhi saldo stok.
                        </p>

                        <form onSubmit={submit} className="space-y-5">

                            <FormInput
                                label="Jenis Benih"
                                name="seed_type"
                                type="text"
                                value={form.data.seed_type}
                                onChange={(e) =>
                                    form.setData('seed_type', e)
                                }
                                error={form.errors.seed_type}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormInput
                                    label="Ukuran Rata-rata (cm)"
                                    name="seed_size_cm"
                                    type="number"
                                    value={form.data.seed_size_cm}
                                    onChange={(e) =>
                                        form.setData('seed_size_cm', e)
                                    }
                                    error={form.errors.seed_size_cm}
                                />

                                <FormInput
                                    label="Berat Rata-rata (g/ekor)"
                                    name="average_weight_seed_g"
                                    type="number"
                                    value={form.data.average_weight_seed_g}
                                    onChange={(e) =>
                                        form.setData('average_weight_seed_g', e)
                                    }
                                    error={form.errors.average_weight_seed_g}
                                />
                            </div>

                            <FormInput
                                label="Sumber Benih"
                                name="source"
                                type="text"
                                value={form.data.source}
                                onChange={(e) =>
                                    form.setData('source', e)
                                }
                                error={form.errors.source}
                            />

                            <FormInput
                                label="Catatan"
                                name="notes"
                                type="textarea"
                                value={form.data.notes}
                                onChange={(e) =>
                                    form.setData('notes', e)
                                }
                                error={form.errors.notes}
                            />

                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => router.get('/kolam-seeding')}
                                    className="px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
                                >
                                    Kembali
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50"
                                    disabled={form.processing}
                                >
                                    Simpan Perubahan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AppLayout>
    )
}
