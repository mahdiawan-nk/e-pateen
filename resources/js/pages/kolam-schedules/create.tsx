import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { FormInput } from '@/components/ui/form-input';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Jadwal Kolam', href: '/schedules' },
    { title: 'Tambah Jadwal', href: '/schedules/create' },
];

interface Props {
    kolam_options: { label: string; value: string }[];
    activity_options: { label: string; value: string }[];
    user_role: string;
    user_kolam_ids: string[];
}

export default function Create({
    kolam_options,
    activity_options,
    user_role,
    user_kolam_ids,
}: Props) {
    const form = useForm({
        kolam_id: '',
        activity_type: '',
        scheduled_date: '',
        scheduled_time: '',
        details: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        form.post('/schedules', {
            onSuccess: () => router.get('/schedules'),
        });
    };

    // Role-based kolam filter
    const filteredKolamOptions =
        user_role === 'administrator'
            ? kolam_options
            : kolam_options.filter((k) =>
                user_kolam_ids.includes(k.value)
            );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tambah Jadwal Kolam" />

            <div className="max-w-6xl mx-auto p-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* ================== FORM ================== */}
                    <div className="bg-white dark:bg-neutral-900 rounded-md shadow-sm p-6">
                        <h2 className="text-xl font-semibold mb-4">
                            Form Jadwal Kegiatan Kolam
                        </h2>

                        <form onSubmit={submit} className="space-y-4">

                            {/* Kolam */}
                            <FormInput
                                label="Kolam"
                                name="kolam_id"
                                type="select"
                                value={form.data.kolam_id}
                                onChange={(e) =>
                                    form.setData('kolam_id', e)
                                }
                                options={[
                                    { label: 'Pilih Kolam', value: '' },
                                    ...filteredKolamOptions,
                                ]}
                                error={form.errors.kolam_id}
                            />

                            {/* Activity Type */}
                            <FormInput
                                label="Jenis Aktivitas"
                                name="activity_type"
                                type="select"
                                value={form.data.activity_type}
                                onChange={(e) =>
                                    form.setData('activity_type', e)
                                }
                                options={[
                                    { label: 'Pilih Aktivitas', value: '' },
                                    ...activity_options,
                                ]}
                                error={form.errors.activity_type}
                            />

                            {/* Date & Time */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <FormInput
                                    label="Tanggal Kegiatan"
                                    name="scheduled_date"
                                    type="date"
                                    value={form.data.scheduled_date}
                                    onChange={(e) =>
                                        form.setData('scheduled_date', e)
                                    }
                                    error={form.errors.scheduled_date}
                                />

                                <FormInput
                                    label="Waktu (Opsional)"
                                    name="scheduled_time"
                                    type="time"
                                    value={form.data.scheduled_time}
                                    onChange={(e) =>
                                        form.setData('scheduled_time', e)
                                    }
                                    error={form.errors.scheduled_time}
                                />
                            </div>

                            {/* Details */}
                            <FormInput
                                label="Detail / Catatan"
                                name="details"
                                type="textarea"
                                value={form.data.details}
                                onChange={(e) =>
                                    form.setData('details', e)
                                }
                                placeholder="Contoh: Tebar benih ukuran 7–9 cm, estimasi 2.000 ekor"
                                error={form.errors.details}
                            />

                            <div className="flex justify-end gap-2 mt-4">
                                <button
                                    type="button"
                                    onClick={() =>
                                        router.get('/schedules')
                                    }
                                    className="btn btn-outline"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-info"
                                    disabled={form.processing}
                                >
                                    Simpan Jadwal
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* ================== INFO CARD ================== */}
                    <div className="bg-neutral-50 dark:bg-neutral-800 rounded-md shadow-sm p-6">
                        <h3 className="text-lg font-semibold mb-3">
                            Panduan Pengisian Jadwal
                        </h3>

                        <div className="space-y-3 text-sm text-neutral-700 dark:text-neutral-200">
                            <p>
                                <span className="font-medium">
                                    Kolam:
                                </span>{' '}
                                Pilih kolam yang akan dijadwalkan kegiatannya.
                                Pembudidaya hanya dapat memilih kolam miliknya.
                            </p>

                            <p>
                                <span className="font-medium">
                                    Jenis Aktivitas:
                                </span>{' '}
                                Pilih jenis kegiatan yang akan dilakukan:
                            </p>

                            <ul className="list-disc list-inside ml-4 space-y-1">
                                <li>
                                    <span className="font-medium">
                                        Seeding:
                                    </span>{' '}
                                    Penebaran benih ikan ke kolam
                                </li>
                                <li>
                                    <span className="font-medium">
                                        Feeding:
                                    </span>{' '}
                                    Pemberian pakan ikan
                                </li>
                                <li>
                                    <span className="font-medium">
                                        Sampling:
                                    </span>{' '}
                                    Pengukuran berat/panjang ikan dan kondisi air
                                </li>
                                <li>
                                    <span className="font-medium">
                                        Other:
                                    </span>{' '}
                                    Kegiatan lain seperti pembersihan kolam atau
                                    perbaikan
                                </li>
                            </ul>

                            <p>
                                <span className="font-medium">
                                    Tanggal & Waktu:
                                </span>{' '}
                                Tentukan kapan kegiatan akan dilakukan. Waktu
                                bersifat opsional.
                            </p>

                            <p>
                                <span className="font-medium">
                                    Detail / Catatan:
                                </span>{' '}
                                Isi keterangan tambahan agar tim atau
                                pembudidaya memahami kegiatan yang akan
                                dilakukan.
                            </p>

                            <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                Status jadwal akan otomatis diset ke{' '}
                                <span className="font-medium">Pending</span>{' '}
                                saat dibuat. Status dapat diubah menjadi{' '}
                                <span className="font-medium">Done</span> atau{' '}
                                <span className="font-medium">
                                    Cancelled
                                </span>{' '}
                                setelah kegiatan dilakukan.
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </AppLayout>
    );
}
