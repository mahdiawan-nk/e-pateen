import { Head, useForm, router } from '@inertiajs/react'
import AppLayout from '@/layouts/app-layout'
import { BreadcrumbItem } from '@/types'
import { FormInput } from '@/components/ui/form-input'
import { useMemo } from 'react'

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Kolam', href: '/kolam' },
    { title: 'Siklus Produksi', href: '/kolam-seeding' },
    { title: 'Buat Seeding', href: '/kolam-seeding/create' },
]

interface Props {
    kolam_options: { label: string; value: string, kapasitas: number }[]
    user_role: string
    user_kolam_ids: string[]
}

export default function Create({
    kolam_options,
    user_role,
    user_kolam_ids,
}: Props) {
    const form = useForm({
        kolam_id: '',
        seed_type: '',
        initial_quantity: '',
        seed_size_cm: '',
        average_weight_seed_g: '',
        date_seeded: '',
        source: '',
        notes: '',
    })

    const filteredKolams = useMemo(() => {
        return user_role === 'administrator'
            ? kolam_options
            : kolam_options.filter((k) => user_kolam_ids.includes(k.value))
    }, [kolam_options, user_role, user_kolam_ids])

    const submit = (e: React.FormEvent) => {
        e.preventDefault()
        form.post('/kolam-seeding', {
            preserveScroll: true,
            onSuccess: () => router.get('/kolam-seeding'),
        })
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Buat Siklus Seeding" />

            <div className="max-w-6xl mx-auto px-4 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* ================= FORM ================= */}
                    <div className="lg:col-span-2 bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-6">
                        <h2 className="text-xl font-semibold mb-1">
                            Buat Siklus Produksi Baru
                        </h2>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6">
                            Semua perubahan stok akan dicatat otomatis ke dalam sistem ledger
                            untuk menjaga akurasi dan audit trail.
                        </p>

                        <form onSubmit={submit} className="space-y-5">

                            {/* Kolam */}
                            <FormInput
                                label="Kolam"
                                name="kolam_id"
                                type="select"
                                value={form.data.kolam_id}
                                onChange={(e) => form.setData('kolam_id', e)}
                                options={[
                                    { label: 'Pilih Kolam', value: '' },
                                    ...filteredKolams,
                                ]}
                                error={form.errors.kolam_id}
                                helper="Kolam tempat benih ditebar dan siklus produksi dimulai"
                                required
                            />

                            {/* Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormInput
                                    label="Tanggal Seeding"
                                    name="date_seeded"
                                    type="date"
                                    value={form.data.date_seeded}
                                    onChange={(e) =>
                                        form.setData('date_seeded', e)
                                    }
                                    error={form.errors.date_seeded}
                                    helper="Tanggal ini akan menjadi referensi utama perhitungan pertumbuhan dan panen"
                                    required
                                />

                                <FormInput
                                    label="Jenis Benih"
                                    name="seed_type"
                                    type="text"
                                    value={form.data.seed_type}
                                    onChange={(e) =>
                                        form.setData('seed_type', e)
                                    }
                                    placeholder="Contoh: Patin Jambal Grade A"
                                    error={form.errors.seed_type}
                                    required
                                />
                            </div>

                            {/* Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex flex-col">
                                    <FormInput
                                        label="Jumlah Awal Benih (ekor)"
                                        name="initial_quantity"
                                        type="number"
                                        value={form.data.initial_quantity}
                                        onChange={(e) => form.setData('initial_quantity', e)}
                                        error={form.errors.initial_quantity}
                                        helper="Nilai ini akan dicatat sebagai saldo awal stok kolam"
                                        required
                                    />

                                    {/* ALERT jika melebihi kapasitas kolam */}
                                    {form.data.kolam_id && (
                                        (() => {
                                            const selectedKolam = filteredKolams.find(
                                                (k) => k.value === form.data.kolam_id
                                            )
                                            const kapasitasKolam = selectedKolam?.kapasitas || 0
                                            if (
                                                form.data.initial_quantity &&
                                                parseInt(form.data.initial_quantity) > parseInt(kapasitasKolam)
                                            ) {
                                                return (
                                                    <div className="mt-1 text-xs text-red-600 dark:text-red-400">
                                                        ⚠ Jumlah benih melebihi kapasitas kolam ({kapasitasKolam} ekor)
                                                    </div>
                                                )
                                            }
                                            return null
                                        })()
                                    )}
                                </div>


                                <FormInput
                                    label="Ukuran Rata-rata (cm)"
                                    name="seed_size_cm"
                                    type="number"
                                    value={form.data.seed_size_cm}
                                    onChange={(e) =>
                                        form.setData('seed_size_cm', e)
                                    }
                                    error={form.errors.seed_size_cm}
                                    helper="Opsional"
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
                                    helper="Digunakan untuk estimasi biomassa awal"
                                    required
                                />
                                <FormInput
                                    label="Sumber Benih"
                                    name="source"
                                    type="text"
                                    value={form.data.source}
                                    onChange={(e) => form.setData('source', e)}
                                    placeholder="Contoh: Hatchery ABC"
                                    error={form.errors.source}
                                    helper="opsional"
                                />
                            </div>



                            <FormInput
                                label="Catatan"
                                name="notes"
                                type="textarea"
                                value={form.data.notes}
                                onChange={(e) => form.setData('notes', e)}
                                placeholder="Contoh: Benih sudah disortir dan divaksin"
                                error={form.errors.notes}
                                helper="Opsional"
                            />

                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => router.get('/kolam-seeding')}
                                    className="px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50"
                                    disabled={form.processing}
                                >
                                    Simpan & Mulai Siklus
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* ================= INFO PANEL ================= */}
                    <div className="bg-neutral-50 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6">
                        <h3 className="text-lg font-semibold mb-4">
                            Panduan Seeding & Stok
                        </h3>

                        <ul className="space-y-3 text-sm text-neutral-700 dark:text-neutral-300">
                            <li>
                                <strong>Saldo Awal:</strong> Jumlah benih yang dimasukkan akan
                                menjadi saldo awal stok kolam dan dicatat ke dalam ledger.
                            </li>
                            <li>
                                <strong>Audit Trail:</strong> Setiap kematian, panen, atau
                                koreksi stok akan tersimpan sebagai histori transaksi.
                            </li>
                            <li>
                                <strong>Status Siklus:</strong> Setelah panen selesai, siklus
                                akan ditutup dan kolam siap untuk seeding berikutnya.
                            </li>
                            <li>
                                <strong>Akurasi Data:</strong> Sistem menolak transaksi dengan
                                tanggal lebih lama dari histori terakhir.
                            </li>
                        </ul>

                        <div className="mt-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 text-xs">
                            💡 <strong>Tips:</strong> Pastikan jumlah awal benih sesuai dengan
                            hasil sortir dan kapasitas kolam untuk menghindari selisih stok di
                            akhir siklus.
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    )
}
