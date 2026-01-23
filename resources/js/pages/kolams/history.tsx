import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { useState } from 'react';
import { BreadcrumbItem } from '@/types';

interface Props {
    histories: {
        id: string;
        kolam: { id: string; name: string };
        user: { id: string; name: string } | null;
        action: string;
        description: string;
        changes: Record<string, any>;
        created_at: string;
    }[];
    pagination: any;
    filters: { search: string };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Data Kolam', href: '/kolams' },
    { title: 'Riwayat Semua Kolam', href: '#' },
];

export default function HistoryAll({ histories, pagination, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/kolams/history-all', { search }, { preserveState: true });
    };

    const actionColor = (action: string) => {
        return action === 'created'
            ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
            : action === 'updated'
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100'
                : action === 'deleted'
                    ? 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                    : action === 'status_changed'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Riwayat Semua Kolam" />

            <div className="max-w-6xl mx-auto p-4 bg-white dark:bg-neutral-900 rounded-md shadow-sm">
                <h2 className="text-xl font-semibold mb-4">Riwayat Aktivitas Semua Kolam</h2>

                <form onSubmit={handleSearch} className="mb-4 flex gap-2">
                    <input
                        type="text"
                        placeholder="Cari deskripsi..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 px-3 py-2 text-sm text-neutral-800 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                    <button type="submit" className="btn btn-info">Cari</button>
                </form>

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
                            {histories.map((h, i) => (
                                <tr key={h.id}>
                                    <td className="px-4 py-2 text-sm">{i + 1 + (pagination.current_page - 1) * pagination.per_page}</td>
                                    <td className="px-4 py-2 text-sm">{h.kolam?.name || '-'}</td>
                                    <td className="px-4 py-2 text-sm">{h.user?.name || 'System'}</td>
                                    <td className="px-4 py-2 text-sm">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${actionColor(h.action)}`}>
                                            {h.action}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2 text-sm">{h.description}</td>
                                    <td className="px-4 py-2 text-sm">{h.changes ? JSON.stringify(h.changes) : '-'}</td>
                                    <td className="px-4 py-2 text-sm">{new Date(h.created_at).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex justify-between mt-4 text-sm text-neutral-600 dark:text-neutral-300">
                    <span>Menampilkan {pagination.from} - {pagination.to} dari {pagination.total} data</span>
                    <div className="flex gap-2">
                        {pagination.has_prev && (
                            <button onClick={() => router.get(`/kolams/history-all?page=${pagination.prev_page}&search=${search}`)} className="btn btn-outline btn-sm">Prev</button>
                        )}
                        {pagination.has_next && (
                            <button onClick={() => router.get(`/kolams/history-all?page=${pagination.next_page}&search=${search}`)} className="btn btn-outline btn-sm">Next</button>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
