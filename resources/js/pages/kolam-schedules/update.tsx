import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { FormInput } from '@/components/ui/form-input';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Jadwal Kolam', href: '/schedules' },
    { title: 'Edit Jadwal', href: '#' },
];

interface Option {
    label: string;
    value: string;
}

interface Schedule {
    id: string;
    kolam_id: string;
    activity_type: string;
    scheduled_date: string;
    scheduled_time: string | null;
    details: string | null;
    status: string;
}

interface Props {
    schedule: Schedule;
    kolam_options: Option[];
    activity_options: Option[];
    status_options: Option[];
    user_role: string;
    user_kolam_ids: string[];
}

export default function update({
    schedule,
    kolam_options,
    activity_options,
    status_options,
    user_role,
    user_kolam_ids,
}: Props) {
    const form = useForm({
        kolam_id: schedule.kolam_id || '',
        activity_type: schedule.activity_type || '',
        scheduled_date: schedule.scheduled_date || '',
        scheduled_time: schedule.scheduled_time || '',
        details: schedule.details || '',
        status: schedule.status || 'pending',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        form.put(`/schedules/${schedule.id}`, {
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
            <Head title="Edit Jadwal Kolam" />

            <div className="max-w-6xl mx-auto p-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* ================== FORM ================== */}
                    <div className="bg-white dark:bg-neutral-900 rounded-md shadow-sm p-6">
                        <h2 className="text-xl font-semibold mb-4">
                            Edit Jadwal Kegiatan Kolam
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
                                    value={form.data.scheduled_time || ''}
                                    onChange={(e) =>
                                        form.setData('scheduled_time', e)
                                    }
                                    error={form.errors.scheduled_time}
                                />
                            </div>

                            {/* Status */}
                            <FormInput
                                label="Status Jadwal"
                                name="status"
                                type="select"
                                value={form.data.status}
                                onChange={(e) =>
                                    form.setData('status', e)
                                }
                                options={[
                                    { label: 'Pilih Status', value: '' },
                                    ...status_options,
                                ]}
                                error={form.errors.status}
                            />

                            {/* Details */}
                            <FormInput
                                label="Detail / Catatan"
                                name="details"
                                type="textarea"
                                value={form.data.details || ''}
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
                                    className="btn btn-warning"
                                    disabled={form.processing}
                                >
                                    Update Jadwal
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* ================== INFO CARD ================== */}
                    <div className="bg-neutral-50 dark:bg-neutral-800 rounded-md shadow-sm p-6">
                        <h3 className="text-lg font-semibold mb-3">
                            Panduan Update Jadwal
                        </h3>

                        <div className="space-y-3 text-sm text-neutral-700 dark:text-neutral-200">
                            <p>
                                <span className="font-medium">
                                    Kolam:
                                </span>{' '}
                                Pastikan kolam yang dipilih sesuai dengan
                                lokasi kegiatan.
                            </p>

                            <p>
                                <span className="font-medium">
                                    Status:
                                </span>{' '}
                                Ubah status menjadi{' '}
                                <span className="font-medium">Done</span>{' '}
                                setelah kegiatan selesai atau{' '}
                                <span className="font-medium">
                                    Cancelled
                                </span>{' '}
                                jika dibatalkan.
                            </p>

                            <p>
                                <span className="font-medium">
                                    Detail:
                                </span>{' '}
                                Catat perubahan atau hasil kegiatan agar
                                riwayat kolam tetap terdokumentasi dengan
                                baik.
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </AppLayout>
    );
}
