import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { useState } from 'react';
import { BreadcrumbItem } from '@/types';

interface History {
    id: string;
    kolam: { id: string; name: string } | null;
    user: { id: string; name: string } | null;
    action: string;
    description: string;
    changes: Record<string, any> | null;
    created_at: string;
}

interface Props {
    histories: History[];
    pagination: any;
    filters: { search: string; kolam_id?: string };
    kolam_options: { label: string; value: string }[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Data Kolam', href: '/kolams' },
    { title: 'Riwayat Semua Kolam', href: '#' },
];

export default function HistoryAll({ histories, pagination, filters, kolam_options }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [kolamId, setKolamId] = useState(filters.kolam_id || '');

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const kolamSelect = form.querySelector<HTMLSelectElement>('select[name="kolam_id"]');
        const kolamValue = kolamSelect?.value || '';
        router.get('/kolams/history-all', { search, kolam_id: kolamValue }, { preserveState: true });
    };

    const actionColor = (action: string) => {
        switch (action) {
            case 'created': return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100';
            case 'updated': return 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100';
            case 'deleted': return 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100';
            case 'status_changed': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100';
        }
    };

    const formatChanges = (changes: any) => {
        if (!changes || changes.length === 0) return '-';

        // Jika changes berupa array [{field, old, new}, ...]
        if (Array.isArray(changes)) {
            return changes.map((c, i) => (
                <div key={i} className="text-xs">
                    <span className="font-medium">{c.field}:</span> {c.old} → {c.new}
                </div>
            ));
        }

        // Jika changes berupa object {field: value, ...}
        return Object.entries(changes).map(([key, val]) => (
            <div key={key} className="text-xs">
                <span className="font-medium">{key}:</span> {val?.toString()}
            </div>
        ));
    };


    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Riwayat Semua Kolam" />

            <div className="rounded-md m-3 border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm overflow-hidden p-6">

                <h2 className="text-xl font-semibold mb-4">Riwayat Aktivitas Semua Kolam</h2>

                {/* ================== FILTER ================== */}
                <form onSubmit={handleSearch} className="mb-4 flex flex-col md:flex-row gap-2 items-center">
                    <input
                        type="text"
                        placeholder="Cari deskripsi..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full md:w-1/2 rounded-lg border border-neutral-300 dark:border-neutral-700 px-3 py-2 text-sm text-neutral-800 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                    <select
                        name="kolam_id"
                        value={kolamId}
                        onChange={(e) => setKolamId(e.target.value)}
                        className="w-full select"
                    >
                        <option value="">Semua Kolam</option>
                        {kolam_options.map((k) => (
                            <option key={k.value} value={k.value}>{k.label}</option>
                        ))}
                    </select>
                    <button type="submit" className="btn btn-info w-full md:w-auto">Filter</button>
                </form>

                {/* ================== TABLE ================== */}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
                        <thead className="bg-neutral-100 dark:bg-neutral-800">
                            <tr>
                                <th className="px-4 py-2 text-left text-sm font-medium text-neutral-700 dark:text-neutral-200">#</th>
                                <th className="px-4 py-2 text-left text-sm font-medium text-neutral-700 dark:text-neutral-200">Kolam</th>
                                <th className="px-4 py-2 text-left text-sm font-medium text-neutral-700 dark:text-neutral-200">User</th>
                                <th className="px-4 py-2 text-left text-sm font-medium text-neutral-700 dark:text-neutral-200">Action</th>
                                <th className="px-4 py-2 text-left text-sm font-medium text-neutral-700 dark:text-neutral-200">Deskripsi</th>
                                <th className="px-4 py-2 text-left text-sm font-medium text-neutral-700 dark:text-neutral-200">Perubahan</th>
                                <th className="px-4 py-2 text-left text-sm font-medium text-neutral-700 dark:text-neutral-200">Tanggal</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
                            {histories.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-4 py-4 text-center text-sm text-neutral-500">Tidak ada data</td>
                                </tr>
                            )}
                            {histories.map((h, i) => (
                                <tr key={h.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800 transition">
                                    <td className="px-4 py-2 text-sm">{i + 1 + (pagination.current_page - 1) * pagination.per_page}</td>
                                    <td className="px-4 py-2 text-sm">{h.kolam?.name || '-'}</td>
                                    <td className="px-4 py-2 text-sm">{h.user?.name || 'System'}</td>
                                    <td className="px-4 py-2 text-sm">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${actionColor(h.action)}`}>
                                            {h.action.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2 text-sm">{h.description}</td>
                                    <td className="px-4 py-2 text-sm">{formatChanges(h.changes)}</td>
                                    <td className="px-4 py-2 text-sm">{new Date(h.created_at).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* ================== PAGINATION ================== */}
                <div className="flex flex-col md:flex-row justify-between mt-4 text-sm text-neutral-600 dark:text-neutral-300 items-center gap-2">
                    <span>Menampilkan {pagination.from} - {pagination.to} dari {pagination.total} data</span>
                    <div className="flex gap-2">
                        {pagination.has_prev && (
                            <button
                                onClick={() => router.get(`/kolams/history-all?page=${pagination.prev_page}&search=${search}&kolam_id=${kolamId}`)}
                                className="btn btn-outline btn-sm"
                            >
                                Prev
                            </button>
                        )}
                        {pagination.has_next && (
                            <button
                                onClick={() => router.get(`/kolams/history-all?page=${pagination.next_page}&search=${search}&kolam_id=${kolamId}`)}
                                className="btn btn-outline btn-sm"
                            >
                                Next
                            </button>
                        )}
                    </div>
                </div>

            </div>
        </AppLayout>
    );
}
