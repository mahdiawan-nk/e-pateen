import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
    ArrowUpRight,
    ArrowDownRight,
    Droplets,
    Fish,
    Waves,
    Activity,
    Skull,
    Gauge
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/* -----------------------------
   MOTION VARIANTS
----------------------------- */
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08
        }
    }
};

const cardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.96 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            type: "spring",
            stiffness: 120,
            damping: 14
        }
    }
};

const fadeVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
};

/* -----------------------------
   KPI CARD
----------------------------- */
function KPI({ title, value, unit, trend, icon: Icon }: any) {
    const positive = trend >= 0;

    return (
        <motion.div animate={cardVariants}>
            <Card className="rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
                <CardContent className="p-5 flex justify-between items-center">
                    <div>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">
                            {title}
                        </p>

                        <div className="flex items-end gap-2">
                            <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
                                {value}
                            </h2>
                            {unit && (
                                <span className="text-sm text-neutral-500 dark:text-neutral-400">
                                    {unit}
                                </span>
                            )}
                        </div>

                        <div
                            className={`flex items-center mt-2 text-sm ${positive
                                    ? "text-emerald-600 dark:text-emerald-400"
                                    : "text-red-600 dark:text-red-400"
                                }`}
                        >
                            {positive ? (
                                <ArrowUpRight className="w-4 h-4 mr-1" />
                            ) : (
                                <ArrowDownRight className="w-4 h-4 mr-1" />
                            )}
                            <span>
                                {Math.abs(trend)}% dibanding periode lalu
                            </span>
                        </div>
                    </div>

                    <motion.div
                        whileHover={{ scale: 1.08, rotate: 5 }}
                        transition={{ type: "spring", stiffness: 200 }}
                        className={`p-3 rounded-xl ${positive
                                ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                                : "bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                            }`}
                    >
                        <Icon className="w-6 h-6" />
                    </motion.div>
                </CardContent>
            </Card>
        </motion.div>
    );
}

/* -----------------------------
   MAIN COMPONENT
----------------------------- */
export default function DashboardSummary({ initialRange = "monthly" }) {
    const [range, setRange] = useState(initialRange);
    const [data, setData] = useState<any | null>(null);
    const [loading, setLoading] = useState(false);

    const fetchSummary = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/dashboard-summary?range=${range}`);
            const json = await res.json();
            setData(json.summary);
        } catch (e) {
            console.error("Failed to load summary", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSummary();
    }, [range]);

    const ranges = ["daily", "weekly", "monthly"];

    return (
        <section className="space-y-6">
            {/* HEADER */}
            <motion.div
                variants={fadeVariants}
                initial="hidden"
                animate="visible"
                transition={{ duration: 0.4 }}
                className="flex items-center justify-between"
            >
                <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                    Ringkasan Operasional
                </h1>

                <div className="flex gap-2">
                    {ranges.map((r) => (
                        <motion.button
                            key={r}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setRange(r)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${range === r
                                    ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900"
                                    : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                                }`}
                        >
                            {r.charAt(0).toUpperCase() + r.slice(1)}
                        </motion.button>
                    ))}
                </div>
            </motion.div>

            {/* LOADING */}
            <AnimatePresence>
                {loading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-neutral-500 dark:text-neutral-400"
                    >
                        Memuat data ringkasan...
                    </motion.div>
                )}
            </AnimatePresence>

            {/* KPI GRID */}
            {data && (
                <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <KPI
                        title="Kolam Aktif"
                        value={`${data.kolam.active}/${data.kolam.total}`}
                        trend={5}
                        icon={Waves}
                    />

                    <KPI
                        title="Total Bibit Ditebar"
                        value={data.seeded.total_bibit.toLocaleString()}
                        unit="ekor"
                        trend={3}
                        icon={Fish}
                    />

                    <KPI
                        title="Total Pakan"
                        value={data.feed.total_feed_kg}
                        unit="kg"
                        trend={-2}
                        icon={Droplets}
                    />

                    <KPI
                        title="Total Panen"
                        value={data.harvest.total_biomass_kg}
                        unit="kg"
                        trend={4}
                        icon={Gauge}
                    />

                    <KPI
                        title="Pertumbuhan Berat"
                        value={data.growth.avg_weight_growth_g}
                        unit="g/hari"
                        trend={2}
                        icon={Activity}
                    />

                    <KPI
                        title="Survival Rate"
                        value={data.survival_rate_avg}
                        unit="%"
                        trend={1}
                        icon={Gauge}
                    />

                    <KPI
                        title="Mortalitas Tertinggi"
                        value={data.highest_mortality?.total_mortality || 0}
                        unit="ekor"
                        trend={-5}
                        icon={Skull}
                    />

                    {/* HIGHLIGHT CARD */}
                    <motion.div animate={cardVariants}>
                        <Card className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm">
                            <CardContent className="p-5">
                                <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">
                                    Kolam Mortalitas Tertinggi
                                </p>
                                <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                                    {data.highest_mortality?.kolam_name || "-"}
                                </h2>
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                    className="text-sm text-red-600 dark:text-red-400 mt-2"
                                >
                                    {data.highest_mortality?.total_mortality || 0} ekor mati
                                </motion.p>
                            </CardContent>
                        </Card>
                    </motion.div>
                </motion.div>
            )}
        </section>
    );
}
