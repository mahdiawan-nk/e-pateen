import { useEffect, useState } from 'react'
import axios from 'axios'
import { motion } from 'framer-motion'

interface HighlightResponse {
    highlights: {
        water_quality_alerts: any[]
        high_mortality_kolams: any[]
        harvest_countdown: any[]
        fcr_alerts: any[]
        harvest_overachieved: any[]
        idle_kolams: any[]
    }
}

export default function HighlightPanel() {
    const [data, setData] = useState<HighlightResponse | null>(null)
    const [loading, setLoading] = useState(false)

    const fetchData = async () => {
        setLoading(true)
        try {
            const res = await axios.get('/dashboard-highlights', {
                params: { range: 30 },
            })
            setData(res.data)
        } catch (e) {
            console.error(e)
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchData()
    }, [])

    const fade = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 },
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                    Operational Highlights
                </h2>
                <button
                    onClick={fetchData}
                    className="text-sm px-3 py-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                >
                    Refresh
                </button>
            </div>

            {loading && (
                <div className="text-neutral-500 text-center py-10">Loading highlights...</div>
            )}

            {!loading && data && (
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={fade}
                    className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                >
                    <AlertCard
                        title="Water Quality Alerts"
                        icon="⚠️"
                        color="red"
                        items={data.highlights.water_quality_alerts}
                        render={(item: any) => (
                            <div className="flex justify-between">
                                <span>{item.name}</span>
                                <span className="text-xs text-neutral-500">{item.date}</span>
                            </div>
                        )}
                    />

                    <AlertCard
                        title="High Mortality"
                        icon="☠️"
                        color="orange"
                        items={data.highlights.high_mortality_kolams}
                        render={(item: any) => (
                            <div className="flex justify-between">
                                <span>{item.name}</span>
                                <span className="text-sm font-semibold text-red-500">
                                    {item.total_mortality}
                                </span>
                            </div>
                        )}
                    />

                    <ProgressCard
                        title="Harvest Countdown"
                        items={data.highlights.harvest_countdown}
                    />

                    <GaugeCard
                        title="Feed Efficiency (FCR)"
                        items={data.highlights.fcr_alerts}
                    />

                    <SuccessCard
                        title="Harvest Overachieved"
                        items={data.highlights.harvest_overachieved}
                    />

                    <WarningCard
                        title="Idle Kolams"
                        items={data.highlights.idle_kolams}
                    />
                </motion.div>
            )}
        </div>
    )
}

function CardShell({ title, icon, children }: any) {
    return (
        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
                <span className="text-lg">{icon}</span>
                <h3 className="font-medium text-neutral-800 dark:text-neutral-100">
                    {title}
                </h3>
            </div>
            {children}
        </div>
    )
}

function AlertCard({ title, icon, items, render }: any) {
    return (
        <CardShell title={title} icon={icon}>
            <div className="space-y-2 max-h-48 overflow-auto">
                {items.length === 0 && (
                    <div className="text-xs text-neutral-500">No alerts</div>
                )}
                {items.map((item: any, i: number) => (
                    <div
                        key={i}
                        className="p-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-sm"
                    >
                        {render(item)}
                    </div>
                ))}
            </div>
        </CardShell>
    )
}

function ProgressCard({ title, items }: any) {
    return (
        <CardShell title={title} icon="⏳">
            <div className="space-y-3">
                {items.length === 0 && (
                    <div className="text-xs text-neutral-500">No upcoming harvest</div>
                )}
                {items.map((item: any, i: number) => (
                    <div key={i}>
                        <div className="flex justify-between text-sm mb-1">
                            <span>{item.kolam_name}</span>
                            <span>{item.days_remaining} days</span>
                        </div>
                        <div className="w-full bg-neutral-200 dark:bg-neutral-800 rounded-full h-2">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${100 - item.days_remaining * 10}%` }}
                                className="bg-blue-500 h-2 rounded-full"
                            />
                        </div>
                    </div>
                ))}
            </div>
        </CardShell>
    )
}

function GaugeCard({ title, items }: any) {
    return (
        <CardShell title={title} icon="📉">
            <div className="space-y-2">
                {items.length === 0 && (
                    <div className="text-xs text-neutral-500">All FCR normal</div>
                )}
                {items.map((item: any, i: number) => (
                    <div key={i} className="flex justify-between items-center">
                        <span className="text-sm">{item.name}</span>
                        <span className="text-sm font-semibold text-red-500">
                            FCR {item.fcr}
                        </span>
                    </div>
                ))}
            </div>
        </CardShell>
    )
}

function SuccessCard({ title, items }: any) {
    return (
        <CardShell title={title} icon="✅">
            <div className="space-y-2">
                {items.length === 0 && (
                    <div className="text-xs text-neutral-500">No overachieved harvest</div>
                )}
                {items.map((item: any, i: number) => (
                    <div
                        key={i}
                        className="p-2 rounded-lg bg-green-50 dark:bg-green-900/20 text-sm flex justify-between"
                    >
                        <span>{item.name}</span>
                        <span className="text-green-600 font-semibold">+{item.delta} kg</span>
                    </div>
                ))}
            </div>
        </CardShell>
    )
}

function WarningCard({ title, items }: any) {
    return (
        <CardShell title={title} icon="⏸">
            <div className="space-y-2">
                {items.length === 0 && (
                    <div className="text-xs text-neutral-500">All kolams active</div>
                )}
                {items.map((item: any, i: number) => (
                    <div
                        key={i}
                        className="p-2 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 text-sm"
                    >
                        {item.name}
                    </div>
                ))}
            </div>
        </CardShell>
    )
}
