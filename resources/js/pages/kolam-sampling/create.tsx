import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { FormInput } from '@/components/ui/form-input';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Sampling Pertumbuhan', href: '/kolam-sampling' },
    { title: 'Tambah Sampling', href: '/kolam-sampling/create' },
];

interface Props {
    kolam_options: { label: string; value: string; seeding: any }[];
    user_role: string;
    user_kolam_ids: string[];
}

export default function Create({ kolam_options, user_role, user_kolam_ids }: Props) {
    const [selectedKolam, setSelectedKolam] = useState<{ label: string, value: string, seeding: any[] } | null>(null);
    const form = useForm({
        kolam_id: '',
        seeding_id: '',
        sampling_date: '',
        estimated_population: '',
        sample_size: '',
        avg_weight_start_g: '',
        avg_weight_end_g: '',
        avg_length_start_cm: '',
        avg_length_end_cm: '',
        mortality_count: '',
        notes: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/kolam-sampling', {
            onSuccess: () => router.get('/kolam-sampling'),
            onError: (errors) => {
                // Validation errors (422)
                console.error('Validation Error:', errors);
            }
        });
    };

    // Filter kolam untuk pembudidaya
    const filteredKolamOptions = user_role === 'administrator'
        ? kolam_options
        : kolam_options.filter(k => user_kolam_ids.includes(k.value));

    const getLastBalance = async (kolamId: string, seedingId: string) => {
        try {
            const response = await fetch(`/kolam-sampling/${kolamId}/${seedingId}/balance`);
            const data = await response.json();
            form.setData('estimated_population', data.balance);
            form.setData('seeding_id', seedingId)
            form.setData('avg_weight_start_g', data.sampling.avg_weight_start_g)
            form.setData('avg_weight_end_g', data.sampling.avg_weight_end_g)
            form.setData('avg_length_start_cm', data.sampling.avg_length_start_cm)
            form.setData('avg_length_end_cm', data.sampling.avg_length_end_cm)
            // console.log(data)
        } catch (error) {
            console.error('Error fetching last balance:', error);
            return null;
        }
    }
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tambah Sampling Pertumbuhan Ikan" />

            <div className="max-w-full mx-auto p-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* ================== FORM ================== */}
                    <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-semibold mb-6">Form Sampling Pertumbuhan Ikan</h2>

                        <form onSubmit={submit} className="space-y-4">

                            {/* Pilih Kolam */}
                            <div className="flex gap-3 flex-col">
                                <FormInput
                                    label="Kolam"
                                    name="kolam_id"
                                    type="select"
                                    value={form.data.kolam_id}
                                    onChange={(e) => {
                                        form.setData('kolam_id', e);
                                        const kolam = filteredKolamOptions.find(k => k.value === e) || null;
                                        setSelectedKolam(kolam);
                                        if (kolam?.seeding?.length) {
                                            // form.setData('seeding_id', kolam.seeding[0].id);
                                            getLastBalance(e, kolam.seeding[0].id);
                                        } else {
                                            form.setData('estimated_population', '');
                                        }
                                    }}
                                    options={[{ label: 'Pilih Kolam', value: '' }, ...filteredKolamOptions]}
                                    error={form.errors.kolam_id}
                                />



                                {selectedKolam?.seeding?.length ? (
                                    <div className="mt-3">
                                        <div className="space-y-4">
                                            <h4 className="text-md font-semibold text-neutral-800 dark:text-neutral-200">Seeding Aktif di Kolam</h4>
                                            <div className="space-y-3">
                                                {selectedKolam.seeding.map((s: any) => (
                                                    <div
                                                        key={s.id}
                                                        className="p-4 border rounded-lg shadow-sm bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 hover:shadow-md transition"
                                                    >
                                                        {/* Badge untuk Jenis Benih & Jumlah */}
                                                        <div className="flex flex-wrap gap-2 mb-3">
                                                            <span className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm font-medium">
                                                                {s.seed_type}
                                                            </span>
                                                            <span className="inline-block bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-3 py-1 rounded-full text-sm font-medium">
                                                                {s.balance} ekor
                                                            </span>
                                                        </div>

                                                        {/* Grid 2 kolom untuk detail lainnya */}
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-neutral-700 dark:text-neutral-300">
                                                            <div className="flex justify-between">
                                                                <span className="font-medium">Ukuran (cm)</span>
                                                                <span>{s.seed_size_cm ?? '-'}</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="font-medium">Berat Rata-rata (g)</span>
                                                                <span>{s.average_weight_seed_g ?? '-'}</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="font-medium">Tanggal Tebar</span>
                                                                <span>{s.date_seeded.split('T')[0]}</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="font-medium">Sumber</span>
                                                                <span>{s.source ?? '-'}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ) : null}
                            </div>

                            {/* Grid 2 kolom untuk field utama */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                <FormInput
                                    label="Tanggal Sampling"
                                    name="sampling_date"
                                    type="date"
                                    value={form.data.sampling_date}
                                    onChange={(e) => form.setData('sampling_date', e)}
                                    error={form.errors.sampling_date}
                                />

                                <FormInput
                                    label="Populasi Estimasi (ekor)"
                                    name="estimated_population"
                                    type="number"
                                    value={form.data.estimated_population}
                                    onChange={(e) => form.setData('estimated_population', e)}
                                    error={form.errors.estimated_population}
                                />

                                <FormInput
                                    label="Jumlah Sampel (ekor)"
                                    name="sample_size"
                                    type="number"
                                    value={form.data.sample_size}
                                    onChange={(e) => form.setData('sample_size', e)}
                                    error={form.errors.sample_size}
                                />

                                <FormInput
                                    label="Berat Awal Rata-rata (g)"
                                    name="avg_weight_start_g"
                                    type="number"
                                    value={form.data.avg_weight_start_g}
                                    onChange={(e) => form.setData('avg_weight_start_g', e)}
                                    error={form.errors.avg_weight_start_g}
                                />

                                <FormInput
                                    label="Berat Akhir Rata-rata (g)"
                                    name="avg_weight_end_g"
                                    type="number"
                                    value={form.data.avg_weight_end_g}
                                    onChange={(e) => form.setData('avg_weight_end_g', e)}
                                    error={form.errors.avg_weight_end_g}
                                />

                                <FormInput
                                    label="Panjang Awal Rata-rata (cm)"
                                    name="avg_lenght_start_cm"
                                    type="number"
                                    value={form.data.avg_length_start_cm}
                                    onChange={(e) => form.setData('avg_length_start_cm', e)}
                                    error={form.errors.avg_length_start_cm}
                                />

                                <FormInput
                                    label="Panjang Akhir Rata-rata (cm)"
                                    name="avg_length_end_cm"
                                    type="number"
                                    value={form.data.avg_length_end_cm}
                                    onChange={(e) => form.setData('avg_length_end_cm', e)}
                                    error={form.errors.avg_length_end_cm}
                                />

                                <FormInput
                                    label="Jumlah Mortalitas"
                                    name="mortality_count"
                                    type="number"
                                    value={form.data.mortality_count}
                                    onChange={(e) => form.setData('mortality_count', e)}
                                    error={form.errors.mortality_count}
                                />
                            </div>

                            {/* Remarks */}
                            <FormInput
                                label="Catatan Tambahan"
                                name="notes"
                                type="textarea"
                                value={form.data.notes}
                                onChange={(e) => form.setData('notes', e)}
                                placeholder="Masukkan catatan tambahan jika ada"
                                error={form.errors.notes}
                            />

                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={() => router.get('/kolam-sampling')} className="btn btn-outline">
                                    Batal
                                </button>
                                <button type="submit" className="btn btn-info">
                                    Simpan
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* ================== INFO CARD ================== */}
                    <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg shadow-md p-6 space-y-4">
                        <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200">Panduan Pengisian Sampling</h3>

                        <div className="space-y-2 text-sm text-neutral-700 dark:text-neutral-200">

                            <p>
                                <span className="font-medium">Kolam:</span> Pilih kolam tempat sampling.
                                <br />
                                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                                    User pembudidaya hanya dapat memilih kolam miliknya sendiri. Admin dapat memilih semua kolam.
                                </span>
                            </p>

                            <p>
                                <span className="font-medium">Tanggal Sampling:</span> Pilih tanggal pengambilan sampel.
                                <br />
                                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                                    Pastikan tanggal sesuai jadwal agar pertumbuhan ikan tercatat dengan akurat.
                                </span>
                            </p>

                            <p>
                                <span className="font-medium">Populasi Estimasi:</span> Masukkan jumlah total ikan di kolam sebelum sampling.
                                <br />
                                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                                    Berguna untuk menghitung persentase sampel dan mortalitas.
                                </span>
                            </p>

                            <p>
                                <span className="font-medium">Jumlah Sampel:</span> Masukkan jumlah ikan yang diambil sebagai sampel.
                                <br />
                                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                                    Pastikan jumlah sesuai standar sampling (misal 10% dari populasi).
                                </span>
                            </p>

                            <p>
                                <span className="font-medium">Berat & Panjang:</span> Catat berat dan panjang rata-rata ikan pada awal dan akhir periode sampling.
                                <br />
                                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                                    Data ini digunakan untuk menghitung pertumbuhan harian dan SGR (Specific Growth Rate).
                                </span>
                            </p>

                            <p>
                                <span className="font-medium">Mortalitas:</span> Catat jumlah ikan mati selama periode sampling.
                                <br />
                                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                                    Data ini penting untuk monitoring kesehatan ikan dan manajemen stok.
                                </span>
                            </p>

                            <p>
                                <span className="font-medium">Catatan Tambahan:</span> Masukkan informasi relevan lain seperti kondisi air, cuaca, atau kejadian khusus.
                                <br />
                                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                                    Contoh: Suhu tinggi, pakan diberikan lebih awal, ikan aktif dan sehat, dsb.
                                </span>
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </AppLayout>
    );
}
