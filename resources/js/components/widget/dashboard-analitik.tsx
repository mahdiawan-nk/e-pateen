import { useEffect, useState } from 'react'
import axios from 'axios'
import {
    LineChart, Line,
    BarChart, Bar,
    XAxis, YAxis,
    Tooltip, ResponsiveContainer,
    CartesianGrid, Legend
} from 'recharts'

interface Option {
    id: number
    name?: string
    label?: string
}

interface AnalyticsResponse {
    analytics: {
        growth_trend: any[]
        water_quality_trend: any[]
        feed_consumption: any[]
        biomass_vs_feed: {
            total_feed_kg: number
            total_biomass_kg: number
            fcr: number | null
        }
        mortality_survival: any[]
        harvest_comparison: any[]
    }
}

export default function AnalyticsDashboard() {
    const [tab, setTab] = useState<'growth' | 'water' | 'feed' | 'mortality' | 'harvest'>('growth')
    const [data, setData] = useState<AnalyticsResponse | null>(null)
    const [loading, setLoading] = useState(false)

    // OPTIONS
    const [kolams, setKolams] = useState<Option[]>([])
    const [seedings, setSeedings] = useState<Option[]>([])
    const [loadingSeedings, setLoadingSeedings] = useState(false)

    // FILTER STATE
    const [filters, setFilters] = useState({
        kolam_id: '',
        seeding_id: '',
        range: 60,
    })

    // =========================
    // FETCH OPTIONS
    // =========================
    useEffect(() => {
        axios.get('/dashboard-kolam-options')
            .then(res => setKolams(res.data))
    }, [])

    useEffect(() => {
        if (!filters.kolam_id) {
            setSeedings([])
            setFilters(f => ({ ...f, seeding_id: '' }))
            return
        }

        setLoadingSeedings(true)

        axios.get('/dashboard-seeding-options', {
            params: { kolam_id: filters.kolam_id }
        }).then(res => {
            setSeedings(res.data)
        }).finally(() => {
            setLoadingSeedings(false)
        })

    }, [filters.kolam_id])

    // =========================
    // FETCH ANALYTICS
    // =========================
    const fetchData = async () => {
        setLoading(true)
        try {
            const res = await axios.get('/dashboard-analytics', {
                params: filters,
            })
            setData(res.data)
        } catch (e) {
            console.error(e)
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchData()
    }, [filters])

    const clearFilters = () => {
        setFilters({
            kolam_id: '',
            seeding_id: '',
            range: 60,
        })
    }

    const tabs = [
        { key: 'growth', label: 'Growth' },
        { key: 'water', label: 'Water' },
        { key: 'feed', label: 'Feed' },
        { key: 'mortality', label: 'Mortality' },
        { key: 'harvest', label: 'Harvest' },
    ]

    return (
        <div className="space-y-6">

            {/* HEADER + TOOLBAR */}
            <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
                <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
                    Analytics Data
                </h1>

                <div className="flex flex-wrap items-end gap-3">

                    {/* KOLAM SELECT */}
                    <div className="flex flex-col gap-1 min-w-[200px]">
                        <label className="text-xs text-neutral-500">Kolam</label>
                        <select
                            value={filters.kolam_id}
                            onChange={e => setFilters(f => ({
                                ...f,
                                kolam_id: e.target.value
                            }))}
                            className="select rounded-xl border border-neutral-300 dark:border-neutral-700
                            px-3 py-2 text-sm"
                        >
                            <option value="">Semua Kolam</option>
                            {kolams.map(k => (
                                <option key={k.id} value={k.id}>
                                    {k.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* SEEDING SELECT */}
                    <div className="flex flex-col gap-1 min-w-[240px]">
                        <label className="text-xs text-neutral-500">Seeding</label>
                        <select
                            disabled={!filters.kolam_id || loadingSeedings}
                            value={filters.seeding_id}
                            onChange={e => setFilters(f => ({
                                ...f,
                                seeding_id: e.target.value
                            }))}
                            className="select rounded-xl border border-neutral-300 dark:border-neutral-700
                            px-3 py-2 text-sm
                            disabled:opacity-50"
                        >
                            <option value="">
                                {loadingSeedings
                                    ? 'Loading seeding...'
                                    : 'Semua Seeding'}
                            </option>

                            {seedings.map(s => (
                                <option key={s.id} value={s.id}>
                                    {s.label || s.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* RANGE */}
                    <div className="flex flex-col gap-1 min-w-[120px]">
                        <label className="text-xs text-neutral-500">Range</label>
                        <select
                            value={filters.range}
                            onChange={e => setFilters(f => ({
                                ...f,
                                range: Number(e.target.value)
                            }))}
                            className="rounded-xl border border-neutral-300 dark:border-neutral-700
                            bg-white dark:bg-neutral-800 px-3 py-2 text-sm"
                        >
                            <option value={7}>7 Hari</option>
                            <option value={30}>30 Hari</option>
                            <option value={60}>60 Hari</option>
                            <option value={90}>90 Hari</option>
                        </select>
                    </div>

                    {/* CLEAR BUTTON */}
                    <button
                        onClick={clearFilters}
                        className="h-[38px] px-4 rounded-xl text-sm font-medium
                        border border-neutral-300 dark:border-neutral-700
                        text-neutral-600 dark:text-neutral-300
                        hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
                    >
                        Clear
                    </button>

                </div>
            </div>

            {/* TABS */}
            <div className="flex gap-2 border-b border-neutral-200 dark:border-neutral-800">
                {tabs.map(t => (
                    <button
                        key={t.key}
                        onClick={() => setTab(t.key as any)}
                        className={`px-4 py-2 rounded-t-xl text-sm font-medium transition
                        ${tab === t.key
                                ? 'bg-white dark:bg-neutral-900 border border-b-0 border-neutral-200 dark:border-neutral-800 text-blue-600'
                                : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
                            }`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {/* CONTENT */}
            <div className="bg-white dark:bg-neutral-900 rounded-2xl p-5 shadow-sm min-h-[400px]">
                {loading && (
                    <div className="text-center text-neutral-500">
                        Loading analytics...
                    </div>
                )}

                {!loading && data && (
                    <>
                        {tab === 'growth' && (
                            <ResponsiveContainer width="100%" height={350}>
                                <LineChart data={data.analytics.growth_trend}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="avg_weight_g" name="Avg Weight (g)" />
                                    <Line type="monotone" dataKey="avg_length_cm" name="Avg Length (cm)" />
                                    <Line type="monotone" dataKey="sgr_percent" name="SGR (%)" />
                                </LineChart>
                            </ResponsiveContainer>
                        )}

                        {tab === 'water' && (
                            <ResponsiveContainer width="100%" height={350}>
                                <LineChart data={data.analytics.water_quality_trend}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="temp_c" name="Temp (°C)" />
                                    <Line type="monotone" dataKey="ph" name="pH" />
                                    <Line type="monotone" dataKey="oxygen" name="Oxygen (mg/L)" />
                                    <Line type="monotone" dataKey="ammonia" name="Ammonia" />
                                    <Line type="monotone" dataKey="turbidity" name="Turbidity" />
                                </LineChart>
                            </ResponsiveContainer>
                        )}

                        {tab === 'feed' && (
                            <div className="space-y-4">
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={data.analytics.feed_consumption}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="date" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="feed_kg" name="Feed (kg)" />
                                    </BarChart>
                                </ResponsiveContainer>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <StatCard title="Total Feed (kg)" value={data.analytics.biomass_vs_feed.total_feed_kg} />
                                    <StatCard title="Total Biomass (kg)" value={data.analytics.biomass_vs_feed.total_biomass_kg} />
                                    <StatCard title="FCR" value={data.analytics.biomass_vs_feed.fcr ?? '-'} />
                                </div>
                            </div>
                        )}

                        {tab === 'mortality' && (
                            <ResponsiveContainer width="100%" height={350}>
                                <LineChart data={data.analytics.mortality_survival}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="mortality" name="Mortality" />
                                    <Line type="monotone" dataKey="survival_rate" name="Survival Rate (%)" />
                                </LineChart>
                            </ResponsiveContainer>
                        )}

                        {tab === 'harvest' && (
                            <ResponsiveContainer width="100%" height={350}>
                                <BarChart data={data.analytics.harvest_comparison}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="harvest_date" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="estimated_biomass_kg" name="Estimated Biomass" />
                                    <Bar dataKey="real_biomass_kg" name="Real Biomass" />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}

function StatCard({ title, value }: { title: string; value: any }) {
    return (
        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800
        bg-neutral-50 dark:bg-neutral-800 p-4">
            <div className="text-xs text-neutral-500 mb-1">{title}</div>
            <div className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                {value}
            </div>
        </div>
    )
}
