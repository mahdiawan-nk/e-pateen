import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { useState } from 'react';
import { BreadcrumbItem } from '@/types';
import { FormInput } from '@/components/ui/form-input';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Monitoring Kolam', href: '/kolam-monitoring' },
    { title: 'Tambah Monitoring', href: '/kolam-monitoring/create' },
];

interface Props {
    kolam_options: { label: string; value: string }[];
    user_role: string;
    user_kolam_ids: string[]; // kolam yang bisa dipilih user pembudidaya
}

export default function Create({ kolam_options, user_role, user_kolam_ids }: Props) {
    const form = useForm({
        kolam_id: '',
        date: '',
        water_temp_c: '',
        ph: '',
        oxygen_mg_l: '',
        ammonia_mg_l: '',
        turbidity_ntu: '',
        remarks: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/kolam-monitoring', {
            onSuccess: () => router.get('/kolam-monitoring'),
        });
    };

    // Filter kolam untuk pembudidaya
    const filteredKolamOptions = user_role === 'administrator'
        ? kolam_options
        : kolam_options.filter((k) => user_kolam_ids.includes(k.value));

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tambah Monitoring Kolam" />

            <div className="max-w-6xl mx-auto p-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* ================== FORM ================== */}
                    <div className="bg-white dark:bg-neutral-900 rounded-md shadow-sm p-6">
                        <h2 className="text-xl font-semibold mb-4">Form Monitoring Kolam</h2>

                        <form onSubmit={submit} className="space-y-4">

                            {/* Pilih Kolam */}
                            <FormInput
                                label="Kolam"
                                name="kolam_id"
                                type="select"
                                value={form.data.kolam_id}
                                onChange={(e) => form.setData('kolam_id', e)}
                                options={[{ label: 'Pilih Kolam', value: '' }, ...filteredKolamOptions]}
                                error={form.errors.kolam_id}
                            />

                            {/* Tanggal Monitoring */}
                            <FormInput
                                label="Tanggal Monitoring"
                                name="date"
                                type="date"
                                value={form.data.date}
                                onChange={(e) => form.setData('date', e)}
                                error={form.errors.date}
                            />

                            {/* Parameter Air */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <FormInput
                                    label="Suhu Air (°C)"
                                    name="water_temp_c"
                                    type="number"
                                    value={form.data.water_temp_c}
                                    onChange={(e) => form.setData('water_temp_c', e)}
                                    error={form.errors.water_temp_c}
                                />
                                <FormInput
                                    label="pH"
                                    name="ph"
                                    type="number"
                                    value={form.data.ph}
                                    onChange={(e) => form.setData('ph', e)}
                                    error={form.errors.ph}
                                />
                                <FormInput
                                    label="Oksigen Terlarut (mg/L)"
                                    name="oxygen_mg_l"
                                    type="number"
                                    value={form.data.oxygen_mg_l}
                                    onChange={(e) => form.setData('oxygen_mg_l', e)}
                                    error={form.errors.oxygen_mg_l}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <FormInput
                                    label="Ammonia Terlarut (mg/L)"
                                    name="ammonia_mg_l"
                                    type="number"
                                    value={form.data.ammonia_mg_l}
                                    onChange={(e) => form.setData('ammonia_mg_l', e)}
                                    error={form.errors.ammonia_mg_l}
                                />
                                <FormInput
                                    label="Kekeruhan (NTU)"
                                    name="turbidity_ntu"
                                    type="number"
                                    value={form.data.turbidity_ntu}
                                    onChange={(e) => form.setData('turbidity_ntu', e)}
                                    error={form.errors.turbidity_ntu}
                                />
                            </div>

                            {/* Remarks */}
                            <FormInput
                                label="Catatan / Remarks"
                                name="remarks"
                                type="textarea"
                                value={form.data.remarks}
                                onChange={(e) => form.setData('remarks', e)}
                                placeholder="Masukkan catatan tambahan"
                                error={form.errors.remarks}
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
                        <h3 className="text-lg font-semibold mb-3">Panduan Pengisian Monitoring</h3>
                        <div className="space-y-3 text-sm text-neutral-700 dark:text-neutral-200">

                            <p>
                                <span className="font-medium">Kolam:</span> Pilih kolam yang ingin dimonitor. User pembudidaya hanya melihat kolam miliknya sendiri.
                            </p>

                            <p>
                                <span className="font-medium">Tanggal Monitoring:</span> Pilih tanggal monitoring.
                            </p>

                            <p>
                                <span className="font-medium">Suhu Air (°C):</span> Masukkan suhu air dalam derajat Celsius.
                            </p>

                            <p>
                                <span className="font-medium">pH:</span> Masukkan nilai pH air.
                            </p>

                            <p>
                                <span className="font-medium">Oksigen Terlarut (mg/L):</span> Masukkan kadar oksigen terlarut di air.
                            </p>

                            <p>
                                <span className="font-medium">Ammonia Terlarut (mg/L):</span> Masukkan kadar ammonia terlarut di air.
                            </p>

                            <p>
                                <span className="font-medium">Kekeruhan (NTU):</span> Masukkan kekeruhan air dalam NTU.
                            </p>

                            <p>
                                <span className="font-medium">Catatan / Remarks:</span> Masukkan catatan tambahan bila perlu.
                            </p>

                        </div>
                    </div>

                </div>
            </div>
        </AppLayout>
    );
}
