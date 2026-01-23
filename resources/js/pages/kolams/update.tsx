import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { useState, useEffect } from 'react';
import { BreadcrumbItem } from '@/types';
import { FormInput } from '@/components/ui/form-input';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Data Kolam', href: '/kolams' },
    { title: 'Edit Kolam', href: '#' },
];

interface Props {
    kolam: any; // data kolam dari backend
    type_options: { label: string; value: string }[];
    condition_status_options: { label: string; value: string }[];
    production_status_options: { label: string; value: string }[];
    owner_options: { label: string; value: string }[];
    user_role: string;
    user_id: string;
}

export default function Update({
    kolam,
    type_options,
    condition_status_options,
    production_status_options,
    owner_options,
    user_role,
    user_id,
}: Props) {
    const form = useForm({
        name: kolam.name || '',
        location: kolam.location || '',
        length_m: kolam.length_m || 0,
        width_m: kolam.width_m || 0,
        depth_m: kolam.depth_m || 0,
        water_volume_l: kolam.water_volume_l || 0,
        capacity_fish: kolam.capacity_fish || 0,
        type: kolam.type || '',
        condition_status: kolam.condition_status || 'active',
        production_status: kolam.production_status || 'idle',
        owner_id: user_role === 'administrator' ? kolam.owner_id || '' : user_id,
    });

    const [autoVolume, setAutoVolume] = useState(kolam.water_volume_l || 0);

    useEffect(() => {
        setAutoVolume(kolam.water_volume_l || 0);
    }, [kolam.water_volume_l]);

    const hitungVolume = (length: number, width: number, depth: number) =>
        Math.round(length * width * depth * 1000);

    const handleChangeDimension = (field: 'length_m' | 'width_m' | 'depth_m', value: number) => {
        form.setData(field, value);

        const volume = hitungVolume(
            field === 'length_m' ? value : form.data.length_m,
            field === 'width_m' ? value : form.data.width_m,
            field === 'depth_m' ? value : form.data.depth_m
        );
        setAutoVolume(volume);
        form.setData('water_volume_l', volume);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.put(`/kolams/${kolam.id}`, {
            onSuccess: () => router.get('/kolams'),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Kolam" />

            <div className="max-w-6xl mx-auto p-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* ================== FORM ================== */}
                    <div className="bg-white dark:bg-neutral-900 rounded-md shadow-sm p-6">
                        <h2 className="text-xl font-semibold mb-4">Edit Kolam</h2>

                        <form onSubmit={submit} className="space-y-4">

                            {/* Pemilik */}
                            {user_role === 'administrator' && (
                                <FormInput
                                    label="Pemilik Kolam"
                                    name="owner_id"
                                    type="select"
                                    value={form.data.owner_id}
                                    onChange={(e) => form.setData('owner_id', e)}
                                    options={[{ label: 'Pilih Pemilik', value: '' }, ...owner_options]}
                                    error={form.errors.owner_id}
                                    helper="Pilih pemilik kolam (hanya admin yang bisa memilih)"
                                    required
                                />
                            )}

                            {/* Nama & Lokasi */}
                            <FormInput
                                label="Nama Kolam"
                                name="name"
                                type="text"
                                value={form.data.name}
                                onChange={(e) => form.setData('name', e)}
                                placeholder="Masukkan nama kolam"
                                error={form.errors.name}
                                helper="Nama kolam unik atau mudah dikenali"
                                required
                            />

                            <FormInput
                                label="Lokasi Kolam"
                                name="location"
                                type="text"
                                value={form.data.location}
                                onChange={(e) => form.setData('location', e)}
                                placeholder="Masukkan lokasi kolam"
                                error={form.errors.location}
                                helper="Deskripsi lokasi kolam, misal 'Blok A' atau 'Tepi Sungai'"
                                required
                            />

                            {/* Dimensi */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <FormInput
                                    label="Panjang (m)"
                                    name="length_m"
                                    type="number"
                                    value={form.data.length_m}
                                    onChange={(e) => handleChangeDimension('length_m', parseFloat(e))}
                                    error={form.errors.length_m}
                                    required
                                />
                                <FormInput
                                    label="Lebar (m)"
                                    name="width_m"
                                    type="number"
                                    value={form.data.width_m}
                                    onChange={(e) => handleChangeDimension('width_m', parseFloat(e))}
                                    error={form.errors.width_m}
                                    required
                                />
                                <FormInput
                                    label="Kedalaman (m)"
                                    name="depth_m"
                                    type="number"
                                    value={form.data.depth_m}
                                    onChange={(e) => handleChangeDimension('depth_m', parseFloat(e))}
                                    error={form.errors.depth_m}
                                    required
                                />
                            </div>

                            {/* Volume & Kapasitas */}
                            <FormInput
                                label="Volume Air (L)"
                                name="water_volume_l"
                                type="number"
                                value={autoVolume}
                                onChange={(e) => form.setData('water_volume_l', parseInt(e))}
                                placeholder="Volume otomatis dihitung dari dimensi"
                                disabled
                                helper="Volume air dihitung otomatis: panjang × lebar × kedalaman × 1000"
                            />

                            <FormInput
                                label="Kapasitas Ikan (ekor)"
                                name="capacity_fish"
                                type="number"
                                value={form.data.capacity_fish}
                                onChange={(e) => form.setData('capacity_fish', parseInt(e))}
                                error={form.errors.capacity_fish}
                                helper="Jumlah maksimal ikan yang bisa ditampung"
                                required
                            />

                            {/* Jenis Kolam */}
                            <FormInput
                                label="Jenis Kolam"
                                name="type"
                                type="select"
                                value={form.data.type}
                                onChange={(e) => form.setData('type', e)}
                                options={[{ label: 'Pilih Jenis', value: '' }, ...type_options]}
                                error={form.errors.type}
                                helper="Contoh: Terpal, Beton, Tanah"
                                required
                            />

                            {/* Status Kolam & Produksi */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">

                                {/* Kondisi Kolam */}
                                <div className="space-y-1">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs uppercase tracking-wide text-neutral-500">Kondisi Kolam <span className="text-red-500">*</span></label>
                                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium
                                            ${form.data.condition_status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' :
                                                form.data.condition_status === 'maintenance' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100' :
                                                    'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'}`}>
                                            {form.data.condition_status}
                                        </span>
                                    </div>
                                    <FormInput
                                        name="condition_status"
                                        type="select"
                                        value={form.data.condition_status}
                                        onChange={(e) => form.setData('condition_status', e)}
                                        options={condition_status_options}
                                        error={form.errors.condition_status}
                                        required
                                    />
                                    <p className="text-[11px] text-neutral-400">
                                        Menunjukkan kondisi fisik kolam
                                    </p>
                                </div>

                                {/* Status Produksi */}
                                <div className="space-y-1">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs uppercase tracking-wide text-neutral-500">Status Produksi <span className="text-red-500">*</span></label>
                                        <span className="badge badge-sm badge-info">{form.data.production_status}</span>
                                    </div>
                                    <FormInput
                                        name="production_status"
                                        type="select"
                                        value={form.data.production_status}
                                        onChange={(e) => form.setData('production_status', e)}
                                        options={production_status_options}
                                        error={form.errors.production_status}
                                        required
                                    />
                                    <p className="text-[11px] text-neutral-400">
                                        Menunjukkan tahap budidaya ikan di kolam
                                    </p>
                                </div>
                            </div>

                            {/* Buttons */}
                            <div className="flex justify-end gap-2 mt-4">
                                <button type="button" onClick={() => router.get('/kolams')} className="btn btn-outline">
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
                        <h3 className="text-lg font-semibold mb-3">Informasi Kolam & Panduan Pengisian</h3>

                        <div className="space-y-3 text-sm text-neutral-700 dark:text-neutral-200">
                            <p>
                                <span className="font-medium">Jenis Kolam:</span> Pilih jenis kolam yang sesuai, misal Terpal, Beton, atau Tanah.
                            </p>

                            <p>
                                <span className="font-medium">Kondisi Kolam:</span>
                                <span className="inline-flex ml-2 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">Active</span>,
                                <span className="inline-flex ml-2 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100">Maintenance</span>,
                                <span className="inline-flex ml-2 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100">Damaged</span>
                            </p>

                            <p>
                                <span className="font-medium">Status Produksi:</span>
                            </p>
                            <ul className="list-disc list-inside ml-4 space-y-1">
                                <li><span className="font-medium">Idle:</span> Kolam tidak sedang digunakan untuk budidaya, siap atau kosong.</li>
                                <li><span className="font-medium">Stocking:</span> Kolam baru diisi benih ikan, proses awal budidaya.</li>
                                <li><span className="font-medium">Nursery:</span> Kolam digunakan untuk pemeliharaan benih kecil sampai siap pindah ke kolam utama.</li>
                                <li><span className="font-medium">Growing:</span> Kolam digunakan untuk pemeliharaan ikan dalam pertumbuhan normal hingga panen.</li>
                                <li><span className="font-medium">Harvest:</span> Kolam sedang dipanen atau siap panen.</li>
                            </ul>

                            <p>
                                <span className="font-medium">Tata Cara Pengisian Form:</span>
                                <ul className="list-disc list-inside ml-4 space-y-1 mt-1">
                                    <li>Isi Nama & Lokasi Kolam.</li>
                                    <li>Isi Panjang, Lebar, Kedalaman (m), volume otomatis dihitung.</li>
                                    <li>Isi Kapasitas Ikan (ekor).</li>
                                    <li>Pilih Jenis Kolam.</li>
                                    <li>Pilih Kondisi Kolam & Status Produksi.</li>
                                    <li>Jika admin, pilih Pemilik Kolam; pembudidaya otomatis miliknya sendiri.</li>
                                </ul>
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </AppLayout>
    );
}
