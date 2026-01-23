import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { useState, useEffect } from 'react';
import { BreadcrumbItem } from '@/types';
import { FormInput } from '@/components/ui/form-input';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Data Panen', href: '#' },
    { title: 'Realisasi Panen', href: '/harvest/realization' },
    { title: 'Tambah Realisasi Panen', href: '/harvest/realization/create' },
];

interface Props {
    realization: {
        id: string;
        kolam_id: string;
        seeding_id: string;
        harvest_date: string;
        harvest_estimation_id: string;
        harvested_population: string;
        average_weight_g: string;
        total_biomass_kg: string;
        notes: string;
    };
    kolam_options: { label: string; value: string, seeding: any }[];
    user_role: string;
    user_kolam_ids: string[]; // kolam yang bisa dipilih user pembudidaya
}

export default function Update({ realization, kolam_options, user_role, user_kolam_ids }: Props) {
    const [selectedKolam, setSelectedKolam] = useState<{ label: string, value: string, seeding: any[] } | null>(null);
    const form = useForm({
        kolam_id: realization.kolam_id,
        seeding_id: realization.seeding_id,
        harvest_date: realization.harvest_date,
        harvested_population: realization.harvested_population,
        average_weight_g: realization.average_weight_g,
        total_biomass_kg: realization.total_biomass_kg,
        notes: '',
    });

    const filteredKolamOptions = user_role === 'administrator'
        ? kolam_options
        : kolam_options.filter((k) => user_kolam_ids.includes(k.value));

    useEffect(() => {
        const kolam = filteredKolamOptions.find(k => k.value === realization.kolam_id) || null;
        setSelectedKolam(kolam);
    }, [realization.kolam_id, filteredKolamOptions]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.put(`/harvest/realization/${realization.id}`, {
            onSuccess: () => router.get('/harvest/realization'),
        });
    };

    // Filter kolam untuk pembudidaya


    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tambah Pemberian Pakan" />

            <div className="max-w-full mx-auto p-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* ================== FORM ================== */}
                    <div className="bg-white dark:bg-neutral-900 rounded-md shadow-sm p-6">
                        <h2 className="text-xl font-semibold mb-4">Form Realisasi Panen</h2>

                        <form onSubmit={submit} className="space-y-4">

                            {/* Pilih Kolam */}
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
                                        form.setData('seeding_id', kolam?.seeding[0]?.id || '');
                                        setSelectedKolam(kolam);
                                    }}
                                    options={[{ label: 'Pilih Kolam', value: '' }, ...filteredKolamOptions]}
                                    error={form.errors.kolam_id}
                                    disabled
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
                                                                {s.initial_quantity} ekor
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



                            {/* Tanggal Monitoring */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <FormInput
                                    label="Tanggal Panen"
                                    name="harvested_date"
                                    type="date"
                                    value={form.data.harvest_date}
                                    onChange={(e) => form.setData('harvest_date', e)}
                                    error={form.errors.harvest_date}
                                />
                                <FormInput
                                    label="Jumlah Ikan Di panen"
                                    name="harvested_population"
                                    type="text"
                                    value={form.data.harvested_population}
                                    onChange={(e) => form.setData('harvested_population', e)}
                                    error={form.errors.harvested_population}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <FormInput
                                    label="Rata-rata Berat (g)"
                                    name="average_weight_g"
                                    type="number"
                                    value={form.data.average_weight_g}
                                    onChange={(e) => form.setData('average_weight_g', e)}
                                    error={form.errors.average_weight_g}
                                />
                                <FormInput
                                    label="Total Biomass (kg)"
                                    name="total_biomass_kg"
                                    type="number"
                                    value={form.data.total_biomass_kg}
                                    onChange={(e) => form.setData('total_biomass_kg', e)}
                                    error={form.errors.total_biomass_kg}
                                />

                            </div>
                            {/* Remarks */}
                            <FormInput
                                label="Catatan"
                                name="notes"
                                type="textarea"
                                value={form.data.notes}
                                onChange={(e) => form.setData('notes', e)}
                                placeholder="Masukkan catatan tambahan"
                                error={form.errors.notes}
                            />

                            <div className="flex justify-end gap-2 mt-4">
                                <button type="button" onClick={() => router.get('/kolam-monitoring')} className="btn btn-outline">
                                    Batal
                                </button>
                                <button type="submit" className="btn btn-info">
                                    Simpan
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* ================== CARD INFO ================== */}
                    <div className="bg-neutral-50 dark:bg-neutral-800 rounded-md shadow-sm p-6">
                        <h3 className="text-lg font-semibold mb-3">Panduan Pengisian Pemberian Pakan (Feeding)</h3>
                        <div className="space-y-3 text-sm text-neutral-700 dark:text-neutral-200">

                            <p>
                                <span className="font-medium">Kolam:</span> Pilih kolam tempat pemberian pakan.
                                <br />
                                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                                    User pembudidaya hanya dapat memilih kolam miliknya sendiri. Admin dapat memilih semua kolam.
                                </span>
                            </p>

                            <p>
                                <span className="font-medium">Tanggal Pemberian:</span> Pilih tanggal pemberian pakan.
                                <br />
                                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                                    Pastikan tanggal sesuai jadwal feeding agar catatan pertumbuhan ikan tetap akurat.
                                </span>
                            </p>

                            <p>
                                <span className="font-medium">Jenis Pakan:</span> Pilih jenis pakan yang diberikan (misal: Pelet, Pelet Natural, Pelet Mix).
                                <br />
                                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                                    Jenis pakan memengaruhi konsumsi ikan dan estimasi pertumbuhan.
                                </span>
                            </p>

                            <p>
                                <span className="font-medium">Jumlah Pakan (kg):</span> Masukkan jumlah pakan yang diberikan dalam kilogram.
                                <br />
                                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                                    Contoh: 15.5 kg. Pastikan jumlah sesuai kapasitas kolam dan jadwal feeding.
                                </span>
                            </p>

                            <p>
                                <span className="font-medium">Metode Pemberian:</span> Pilih metode pemberian pakan jika ada (Manual / Otomatis).
                                <br />
                                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                                    Opsional. Digunakan untuk mencatat cara pemberian pakan.
                                </span>
                            </p>

                            <p>
                                <span className="font-medium">Sumber Pakan:</span> Masukkan asal pakan atau supplier.
                                <br />
                                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                                    Contoh: Supplier ABC, Pabrik Pakan XYZ. Berguna untuk tracking kualitas pakan.
                                </span>
                            </p>

                            <p>
                                <span className="font-medium">Catatan / Remarks:</span> Masukkan catatan tambahan bila perlu.
                                <br />
                                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                                    Contoh: Pakan diberikan lebih awal karena cuaca panas, ikan sehat, dsb.
                                </span>
                            </p>

                        </div>
                    </div>


                </div>
            </div >
        </AppLayout >
    )

}