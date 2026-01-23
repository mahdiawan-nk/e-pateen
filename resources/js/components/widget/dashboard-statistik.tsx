import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, Fish, Gauge, Scale, Activity, Droplet, Calendar, X, Search } from "lucide-react";
import { motion } from "framer-motion";
import { usePage } from "@inertiajs/react";

interface KPIResponse {
    kpi: {
        kolam: {
            active: number;
            total: number;
        };
        total_population: number;
        avg_sgr: number;
        total_feed_kg: number;
        total_harvest_biomass_kg: number;
        avg_survival_rate: number;
    };
    tables: {
        problematic_kolams: ProblematicKolam[];
    };
}

interface ProblematicKolam {
    kolam_id: string;
    name: string;
    date: string;
    ph: number;
    oxygen_mg_l: number;
    ammonia_mg_l: number;
    remarks: string;
}

const StatCard = ({
    title,
    value,
    subtitle,
    icon: Icon,
}: {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: any;
}) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
    >
        <Card className="rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
            <CardContent className="p-5 flex items-center justify-between">
                <div>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">{title}</p>
                    <p className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">{value}</p>
                    {subtitle && (
                        <p className="text-xs mt-1 text-neutral-400">{subtitle}</p>
                    )}
                </div>
                <div className="p-3 rounded-xl bg-neutral-100 dark:bg-neutral-800">
                    <Icon className="w-6 h-6 text-neutral-700 dark:text-neutral-200" />
                </div>
            </CardContent>
        </Card>
    </motion.div>
);

export default function DashboardStats() {
    const { props } = usePage();
    const [data, setData] = useState<KPIResponse | null>(null);
    const [loading, setLoading] = useState(true);

    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const today = () => new Date().toISOString().split("T")[0];

    const applyQuickRange = (days: number) => {
        const end = today();
        const start = new Date();
        start.setDate(start.getDate() - days);

        const startStr = start.toISOString().split("T")[0];

        setStartDate(startStr);
        setEndDate(end);

        setTimeout(fetchData, 50);
    };

    const applyThisMonth = () => {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), 1)
            .toISOString()
            .split("T")[0];
        const end = today();

        setStartDate(start);
        setEndDate(end);

        setTimeout(fetchData, 50);
    };

    const isInvalidRange = Boolean(startDate && endDate && new Date(endDate) < new Date(startDate));
    const fetchData = () => {
        setLoading(true);

        const params = new URLSearchParams();
        if (startDate) params.append("start_date", startDate);
        if (endDate) params.append("end_date", endDate);

        fetch(`/dashboard-statistics?${params.toString()}`)
            .then((res) => res.json())
            .then((json) => {
                setData(json);
                setLoading(false);
                setStartDate(json.filters.startDate)
                setEndDate(json.filters.endDate)
            });
    };

    useEffect(() => {
        fetchData();
    }, []);

    const clearFilter = () => {
        setStartDate("");
        setEndDate("");
        fetch("/dashboard-statistics")
            .then((res) => res.json())
            .then((json) => {
                setData(json);
                setLoading(false);
            });
    };

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                    <Card
                        key={i}
                        className="h-24 animate-pulse bg-neutral-100 dark:bg-neutral-800 rounded-2xl"
                    />
                ))}
            </div>
        );
    }

    if (!data) return null;

    const { kpi, tables } = data;

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4">

                {/* LEFT — QUICK RANGE */}
                <div className="flex items-center gap-2">
                    {[
                        { label: "7D", action: () => applyQuickRange(7) },
                        { label: "30D", action: () => applyQuickRange(30) },
                        { label: "This Month", action: applyThisMonth },
                    ].map((btn) => (
                        <button
                            key={btn.label}
                            onClick={btn.action}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium
                           bg-neutral-100 dark:bg-neutral-800
                           text-neutral-700 dark:text-neutral-200
                           hover:bg-neutral-200 dark:hover:bg-neutral-700
                           transition"
                        >
                            {btn.label}
                        </button>
                    ))}
                </div>

                {/* RIGHT — DATE RANGE INPUT */}
                <div className="flex flex-wrap items-end gap-3">
                    <div className="flex flex-col gap-1">
                        <label className="text-sm text-neutral-500">
                            Range Tanggal
                        </label>

                        <div
                            className={`flex items-center overflow-hidden rounded-xl
                border ${isInvalidRange
                                    ? "border-red-500"
                                    : "border-neutral-300 dark:border-neutral-700"}
                bg-white dark:bg-neutral-800`}
                        >
                            {/* ICON */}
                            <div className="px-3 text-neutral-400">
                                <Calendar className="w-4 h-4" />
                            </div>

                            {/* START DATE */}
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="flex-1 bg-transparent px-2 py-2 text-sm
                               focus:outline-none"
                            />

                            {/* DIVIDER */}
                            <span className="px-2 text-neutral-400 select-none">|</span>

                            {/* END DATE */}
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="flex-1 bg-transparent px-2 py-2 text-sm
                               focus:outline-none"
                            />
                        </div>

                        {isInvalidRange && (
                            <span className="text-xs text-red-500">
                                End Date tidak boleh lebih kecil dari Start Date
                            </span>
                        )}
                    </div>

                    {/* ACTION BUTTONS */}
                    <button
                        onClick={fetchData}
                        disabled={isInvalidRange}
                        className={`btn btn-soft transition
            ${isInvalidRange
                                ? "btn-disabled cursor-not-allowed text-neutral-500"
                                : "btn-info"
                            }`}
                    >
                        <Search className="w-4 h-4" />
                        Filter
                    </button>

                    <button
                        onClick={clearFilter}
                        className="btn btn-soft btn-secondary"
                    >
                        <X className="w-4 h-4" />
                        Clear
                    </button>
                </div>
            </div>

            {/* KPI GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                <StatCard
                    title="Kolam Aktif / Total"
                    value={`${kpi.kolam.active} / ${kpi.kolam.total}`}
                    subtitle="Status operasional kolam"
                    icon={Fish}
                />

                <StatCard
                    title="Total Populasi Ikan"
                    value={kpi.total_population.toLocaleString()}
                    subtitle="Estimasi saat ini"
                    icon={Activity}
                />

                <StatCard
                    title="Rata-rata SGR (%)"
                    value={kpi.avg_sgr.toFixed(2)}
                    subtitle="Pertumbuhan harian"
                    icon={Gauge}
                />

                <StatCard
                    title="Total Konsumsi Pakan (kg)"
                    value={kpi.total_feed_kg.toFixed(2)}
                    subtitle="Akumulasi"
                    icon={Scale}
                />

                <StatCard
                    title="Total Biomassa Panen (kg)"
                    value={kpi.total_harvest_biomass_kg.toFixed(2)}
                    subtitle="Realisasi panen"
                    icon={Droplet}
                />

                <StatCard
                    title="Survival Rate (%)"
                    value={kpi.avg_survival_rate.toFixed(2)}
                    subtitle="Rata-rata hidup"
                    icon={Gauge}
                />
            </div>

            {/* TABLE PROBLEMATIC KOLAMS */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                <Card className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                                Kolam dengan Masalah Kualitas Air
                            </h2>
                            <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
                                <AlertTriangle className="w-4 h-4" />
                                Perlu Perhatian
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <div className="max-h-[320px] overflow-y-auto rounded-xl border border-neutral-200 dark:border-neutral-800">
                                <table className="w-full text-sm">
                                    <thead className="sticky top-0 bg-white dark:bg-neutral-900 z-10">
                                        <tr className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-500">
                                            <th className="py-2 px-3 text-left">Kolam</th>
                                            <th className="py-2 px-3 text-left">Tanggal</th>
                                            <th className="py-2 px-3 text-right">pH</th>
                                            <th className="py-2 px-3 text-right">O₂ (mg/L)</th>
                                            <th className="py-2 px-3 text-right">Amonia</th>
                                            <th className="py-2 px-3 text-left">Catatan</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {tables.problematic_kolams.length === 0 && (
                                            <tr>
                                                <td
                                                    colSpan={6}
                                                    className="text-center py-6 text-neutral-400"
                                                >
                                                    Tidak ada kolam bermasalah 🎉
                                                </td>
                                            </tr>
                                        )}

                                        {tables.problematic_kolams.map((row) => (
                                            <tr
                                                key={row.kolam_id + row.date}
                                                className="border-b border-neutral-100 dark:border-neutral-800
                                                hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition"
                                            >
                                                <td className="py-2 px-3 font-medium text-neutral-900 dark:text-neutral-100">
                                                    {row.name}
                                                </td>

                                                <td className="py-2 px-3 text-neutral-500">
                                                    {row.date}
                                                </td>

                                                <td
                                                    className={`py-2 px-3 text-right font-medium ${row.ph < 6.5 || row.ph > 8.5
                                                        ? "text-red-600"
                                                        : "text-neutral-700 dark:text-neutral-200"
                                                        }`}
                                                >
                                                    {row.ph}
                                                </td>

                                                <td
                                                    className={`py-2 px-3 text-right font-medium ${row.oxygen_mg_l < 4
                                                        ? "text-red-600"
                                                        : "text-neutral-700 dark:text-neutral-200"
                                                        }`}
                                                >
                                                    {row.oxygen_mg_l}
                                                </td>

                                                <td
                                                    className={`py-2 px-3 text-right font-medium ${row.ammonia_mg_l > 0.5
                                                        ? "text-red-600"
                                                        : "text-neutral-700 dark:text-neutral-200"
                                                        }`}
                                                >
                                                    {row.ammonia_mg_l}
                                                </td>

                                                <td className="py-2 px-3 text-neutral-500 truncate max-w-[240px]">
                                                    {row.remarks}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}

