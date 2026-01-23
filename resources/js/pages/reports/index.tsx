import { Head } from '@inertiajs/react'
import { useState, useRef, useCallback } from 'react'
import AppLayout from '@/layouts/app-layout'
import { router } from '@inertiajs/react'
import {
    Search
} from 'lucide-react'
import { type BreadcrumbItem } from '@/types'

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Report', href: '/reports' },
]
type KolamOption = {
    id: string;
    name: string;
};



export default function Index({ kolam_options, seeding_options, kolam, summary, detail, filters }: any) {
    const [kolamId, setKolamId] = useState(filters.kolam_id || "");
    const [startDate, setStartDate] = useState(filters.start_date || "");
    const [endDate, setEndDate] = useState(filters.end_date || "");
    const [showSeedingModal, setShowSeedingModal] = useState(false)
    const [selectedSeedings, setSelectedSeedings] = useState<string[]>([])
    const [appliedSeedings, setAppliedSeedings] = useState<string[]>([])

    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const triggerSearch = useCallback(
        (params: {
            kolam_id: string
            start_date: string
            end_date: string
            seeding_ids: string[]
        }) => {
            if (debounceRef.current) clearTimeout(debounceRef.current)

            const payload: any = {
                kolam_id: params.kolam_id,
                start_date: params.start_date || undefined,
                end_date: params.end_date || undefined,
            }

            if (params.seeding_ids.length === 1) {
                payload.seeding_id = params.seeding_ids[0]
            } else if (params.seeding_ids.length > 1) {
                payload.seeding_ids = params.seeding_ids
            }

            debounceRef.current = setTimeout(() => {
                router.get("/reports", payload, {
                    preserveState: true,
                    replace: true,
                })
            }, 300)
        },
        [router]
    )


    const handleKolamChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setKolamId(e.target.value);
        setSelectedSeedings([])
    };

    const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setStartDate(e.target.value);
    };

    const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEndDate(e.target.value);
    };

    const cariData = () => {
        if (!kolamId) return

        // STEP 1: ambil seeding_options dulu dari backend
        triggerSearch({
            kolam_id: kolamId,
            start_date: startDate,
            end_date: endDate,
            seeding_ids: [], // 🔥 kosongkan dulu
        })

        // STEP 2: buka modal
        setShowSeedingModal(true)
    }

    const toggleSeeding = (id: string) => {
        setSelectedSeedings(prev =>
            prev.includes(id)
                ? prev.filter(x => x !== id)
                : [...prev, id]
        )
    }

    const applySeedingFilter = () => {
        const seedings = [...selectedSeedings] // 🔥 copy nilai terbaru

        setShowSeedingModal(false)
        setAppliedSeedings(seedings)

        triggerSearch({
            kolam_id: kolamId,
            start_date: startDate,
            end_date: endDate,
            seeding_ids: seedings,
        })
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Data Reports" />
            <div className="m-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm overflow-hidden">
                <div
                    className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 px-5 py-4
  bg-neutral-50 dark:bg-neutral-800/60
  border-b border-neutral-200 dark:border-neutral-800"
                >
                    {/* Title */}
                    <div>
                        <h2 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100">
                            Report Data
                        </h2>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                            Menampilkan riwayat keseluruhan aktivitas pada kolam
                        </p>
                    </div>

                    {/* Filters */}
                    <div className="w-full md:w-auto flex flex-col md:flex-row items-stretch md:items-center gap-2">

                        {/* Filter Kolam */}
                        <select
                            value={kolamId}
                            onChange={handleKolamChange}
                            className="h-9 rounded-lg border border-neutral-300 dark:border-neutral-700
      bg-white dark:bg-neutral-900 px-3 text-sm
      text-neutral-800 dark:text-neutral-200
      focus:outline-none focus:ring-2 focus:ring-primary/40"
                        >
                            <option value="">Semua Kolam</option>
                            {kolam_options.map((k: any) => (
                                <option key={k.id} value={k.id}>
                                    {k.name}
                                </option>
                            ))}
                        </select>
                        <input
                            type="date"
                            value={startDate}
                            onChange={handleStartDateChange}
                            className="h-9 rounded-lg border border-neutral-300 dark:border-neutral-700
bg-white dark:bg-neutral-900 px-3 text-sm
text-neutral-800 dark:text-neutral-200
focus:outline-none focus:ring-2 focus:ring-primary/40"
                        />

                        {/* End Date */}
                        <input
                            type="date"
                            value={endDate}
                            onChange={handleEndDateChange}
                            className="h-9 rounded-lg border border-neutral-300 dark:border-neutral-700
bg-white dark:bg-neutral-900 px-3 text-sm
text-neutral-800 dark:text-neutral-200
focus:outline-none focus:ring-2 focus:ring-primary/40"
                        />

                        {/* Button Cari */}
                        <button
                            onClick={cariData}
                            className="h-9 inline-flex items-center justify-center gap-2
      rounded-lg bg-primary px-4 text-sm font-medium text-white
      hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/40"
                        >
                            <Search className="h-4 w-4" />
                            Cari Data
                        </button>
                    </div>
                </div>
                {kolam && (
                    <>
                        {/* HEADER KOLOM & SUMMARY */}
                        <div className="p-3 grid grid-cols-1 xl:grid-cols-2 gap-6">
                            <section
                                className="rounded-2xl border border-neutral-200 dark:border-neutral-800
bg-white dark:bg-neutral-900 p-5 shadow-sm"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-base font-semibold text-neutral-800 dark:text-neutral-100">
                                        Informasi Kolam
                                    </h2>
                                    <span
                                        className="inline-flex items-center rounded-full
bg-emerald-100 dark:bg-emerald-900/30
px-3 py-1 text-xs font-medium
text-emerald-700 dark:text-emerald-400"
                                    >
                                        {kolam?.production_status || '-'}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <InfoItem label="Nama Kolam" value={kolam?.name || "-"} />
                                    <InfoItem label="Tipe Kolam" value={kolam?.type || "-"} />
                                    <InfoItem label="Pemilik" value={kolam?.owner || "-"} />
                                    <InfoItem
                                        label="Kapasitas Ikan"
                                        value={`${kolam?.capacity_fish.toLocaleString()} ekor`}
                                    />
                                    <InfoItem
                                        label="Volume Air"
                                        value={`${kolam?.water_volume_l.toLocaleString()} L`}
                                    />
                                    <InfoItem label="Lokasi" value={kolam?.location} span />
                                </div>
                            </section>

                            {/* SUMMARY */}
                            <section
                                className="rounded-2xl border border-neutral-200 dark:border-neutral-800
bg-white dark:bg-neutral-900 p-5 shadow-sm"
                            >
                                <h2 className="text-base font-semibold text-neutral-800 dark:text-neutral-100 mb-4">
                                    Ringkasan Produksi
                                </h2>

                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    <MetricCard
                                        label="Total Pakan"
                                        value={`${summary?.total_pakan_kg || 0} kg`}
                                        sub="Akumulasi feeding"
                                    />
                                    <MetricCard
                                        label="Total Panen"
                                        value={`${summary?.total_panen_kg || 0} kg`}
                                        sub="Biomassa panen"
                                    />
                                    <MetricCard
                                        label="Sampling Terakhir"
                                        value={summary?.last_sampling?.sample_date || "-"}
                                        sub="Tanggal sampling"
                                    />
                                    <MetricCard
                                        label="Berat Rata-rata"
                                        value={`${summary?.last_sampling?.avg_weight_g || 0} g`}
                                        sub="Rata-rata bobot ikan"
                                    />
                                    <MetricCard
                                        label="Panjang Rata-rata"
                                        value={`${summary?.last_sampling?.avg_length_cm || 0} cm`}
                                        sub="Rata-rata panjang ikan"
                                    />
                                </div>
                            </section>
                        </div>

                        {/* GROUP PER SEEDING */}
                        {detail?.groups.length > 0 && appliedSeedings.length > 0 &&
                            detail?.groups.map((gr: any, idx: number) => (
                                <div
                                    key={gr.seeding.id || idx}
                                    className="p-3 grid grid-cols-1 xl:grid-cols-1 gap-6"
                                >
                                    {/* TITLE SEEDING */}
                                    <div className="px-2">
                                        <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                                            Siklus Seeding: {gr.seeding.seed_type} •{" "}
                                            {gr.seeding.date_seeded}
                                        </h3>
                                    </div>

                                    <SectionTable
                                        title="Data Feeding"
                                        headers={["Tanggal", "Jenis Pakan", "Jumlah (kg)", "Metode"]}
                                        rows={gr.feeding.map((f: any) => [
                                            f.feeding_date.split("T")[0],
                                            f.feed_type,
                                            f.quantity_kg,
                                            f.feeding_method,
                                        ])}
                                    />

                                    <SectionTable
                                        title="Data Sampling"
                                        headers={[
                                            "Tanggal",
                                            "Populasi Awal",
                                            "Kematian",
                                            "Populasi Akhir",
                                            "Berat Awal (g)",
                                            "Berat Akhir (g)",
                                            "SGR (%)",
                                            "SR (%)",
                                        ]}
                                        rows={gr.sampling.map((s: any) => {
                                            const populasiAkhir =
                                                Number(s.estimated_population || 0) -
                                                Number(s.mortality_count || 0)

                                            return [
                                                s.sampling_date.split("T")[0],
                                                s.estimated_population,
                                                s.mortality_count,
                                                populasiAkhir,
                                                s.avg_weight_start_g,
                                                s.avg_weight_end_g,
                                                s.sgr_percent,
                                                s.survival_rate,
                                            ]
                                        })}
                                    />

                                    <SectionTable
                                        title="Data Estimasi Panen"
                                        headers={[
                                            "Tanggal Estimasi",
                                            "Populasi Estimasi Panen",
                                            "Berat Rata-rata (g)",
                                            "Biomassa (kg)",
                                        ]}
                                        rows={gr.estimation.map((h: any) => [
                                            h.estimated_harvest_date.split("T")[0],
                                            h.estimated_population,
                                            h.estimated_avg_weight_g,
                                            h.estimated_biomass_kg,
                                        ])}
                                    />

                                    <SectionTable
                                        title="Data Realisasi Panen"
                                        headers={[
                                            "Tanggal",
                                            "Populasi Panen",
                                            "Berat Rata-rata (g)",
                                            "Biomassa (kg)",
                                        ]}
                                        rows={gr.harvest.map((h: any) => [
                                            h.harvest_date.split("T")[0],
                                            h.harvested_population,
                                            h.average_weight_g,
                                            h.total_biomass_kg,
                                        ])}
                                    />

                                    <SectionTable
                                        title="Perbandingan Estimasi vs Realisasi Panen"
                                        headers={[
                                            "Tanggal Panen",
                                            "Estimasi Populasi",
                                            "Realisasi Populasi",
                                            "Selisih",
                                            "Estimasi Biomassa (kg)",
                                            "Realisasi Biomassa (kg)",
                                            "Selisih (kg)",
                                            "Deviasi (%)",
                                        ]}
                                        highlightNumericIndexes={[6, 7]}
                                        rows={gr.comparison.map((c: any) => [
                                            c.harvest_date,
                                            c.estimated_population,
                                            c.realized_population,
                                            c.population_diff,
                                            c.estimated_biomass_kg,
                                            c.realized_biomass_kg,
                                            c.biomass_diff_kg,
                                            `${c.biomass_diff_percent}%`,
                                        ])}
                                    />
                                </div>
                            ))}
                    </>
                )}

            </div>
            {showSeedingModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div
                        className="w-full max-w-lg rounded-2xl bg-white dark:bg-neutral-900
            shadow-xl border border-neutral-200 dark:border-neutral-800"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200 dark:border-neutral-800">
                            <h3 className="text-base font-semibold text-neutral-800 dark:text-neutral-100">
                                Pilih Siklus Seeding
                            </h3>
                            <button
                                onClick={() => setShowSeedingModal(false)}
                                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-5 space-y-3 max-h-[60vh] overflow-y-auto">
                            {seeding_options?.length ? (
                                seeding_options.map((g: any) => (
                                    <label
                                        key={g.id}
                                        className="flex items-start gap-3 p-3 rounded-lg
                            border border-neutral-200 dark:border-neutral-800
                            hover:bg-neutral-50 dark:hover:bg-neutral-800/50 cursor-pointer"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedSeedings.includes(g.id)}
                                            onChange={() => toggleSeeding(g.id)}
                                            className="mt-1 h-4 w-4 rounded border-neutral-300
                                text-primary focus:ring-primary"
                                        />
                                        <div className="text-sm">
                                            <p className="font-medium text-neutral-800 dark:text-neutral-100">
                                                {g.seed_type}
                                            </p>
                                            <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                                Tanggal: {g.date_seeded}
                                            </p>
                                            <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                                Populasi: {g.initial_quantity} ekor • Status: {g.cycle_status}
                                            </p>
                                        </div>
                                    </label>
                                ))
                            ) : (
                                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                    Tidak ada data seeding untuk kolam ini
                                </p>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="flex justify-end gap-2 px-5 py-4 border-t border-neutral-200 dark:border-neutral-800">
                            <button
                                onClick={() => setShowSeedingModal(false)}
                                className="h-9 px-4 rounded-lg border border-neutral-300 dark:border-neutral-700
                    text-sm text-neutral-700 dark:text-neutral-200
                    hover:bg-neutral-100 dark:hover:bg-neutral-800"
                            >
                                Batal
                            </button>
                            <button
                                onClick={applySeedingFilter}
                                className="h-9 px-4 rounded-lg bg-primary text-white text-sm
                    hover:bg-primary/90"
                            >
                                Terapkan Filter
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </AppLayout>
    );
}

function InfoItem({
    label,
    value,
    span = false,
}: {
    label: string;
    value: string;
    span?: boolean;
}) {
    return (
        <div className={span ? "col-span-2" : ""}>
            <p className="text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                {label}
            </p>
            <p className="mt-1 text-sm font-medium text-neutral-800 dark:text-neutral-100">
                {value || "-"}
            </p>
        </div>
    );
}

function MetricCard({
    label,
    value,
    sub,
}: {
    label: string;
    value: string;
    sub?: string;
}) {
    return (
        <div
            className="rounded-2xl border border-neutral-200 dark:border-neutral-800
      bg-neutral-50 dark:bg-neutral-800/50 p-4"
        >
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {label}
            </p>
            <p className="mt-1 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                {value}
            </p>
            {sub && (
                <p className="mt-1 text-[11px] text-neutral-400 dark:text-neutral-500">
                    {sub}
                </p>
            )}
        </div>
    );
}


/* REUSABLE TABLE COMPONENT */
function SectionTable({
    title,
    headers,
    rows,
    description,
    highlightNumericIndexes = [],
}: {
    title: string;
    headers: string[];
    rows: any[][];
    description?: string;
    highlightNumericIndexes?: number[];
}) {
    const isEmpty = !rows || rows.length === 0;

    const getDiffClass = (value: any) => {
        const num = Number(
            typeof value === "string" ? value.replace("%", "") : value
        );

        if (isNaN(num)) return "";
        if (num > 0)
            return "text-emerald-700 dark:text-emerald-400 font-semibold";
        if (num < 0)
            return "text-red-700 dark:text-red-400 font-semibold";
        return "text-neutral-600 dark:text-neutral-300";
    };

    return (
        <section
            className="rounded border border-neutral-200 dark:border-neutral-800
      bg-white dark:bg-neutral-900 shadow-sm"
        >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200 dark:border-neutral-800">
                <div>
                    <h2 className="text-base font-semibold text-neutral-800 dark:text-neutral-100">
                        {title}
                    </h2>
                    {description && (
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                            {description}
                        </p>
                    )}
                </div>
                <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                    {rows.length} baris
                </span>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="sticky top-0 z-10 bg-neutral-100 dark:bg-neutral-800">
                        <tr>
                            {headers.map((h, i) => (
                                <th
                                    key={i}
                                    className="px-4 py-2 text-left
                  text-xs font-semibold uppercase tracking-wide
                  text-neutral-600 dark:text-neutral-400
                  border-b border-neutral-200 dark:border-neutral-700"
                                >
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody>
                        {!isEmpty ? (
                            rows.map((row, i) => (
                                <tr
                                    key={i}
                                    className="
                    transition-colors
                    even:bg-neutral-50 dark:even:bg-neutral-800/40
                    hover:bg-primary/5 dark:hover:bg-primary/10
                  "
                                >
                                    {row.map((cell, j) => {
                                        const shouldHighlight =
                                            highlightNumericIndexes.includes(j);

                                        return (
                                            <td
                                                key={j}
                                                className={`
                          px-4 py-2
                          border-b border-neutral-100 dark:border-neutral-800
                          ${shouldHighlight
                                                        ? getDiffClass(cell)
                                                        : "text-neutral-700 dark:text-neutral-200"
                                                    }
                        `}
                                            >
                                                {cell ?? "-"}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan={headers.length}
                                    className="px-4 py-8 text-center
                  text-sm text-neutral-500 dark:text-neutral-400"
                                >
                                    Tidak ada data untuk ditampilkan
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </section>
    );
}


