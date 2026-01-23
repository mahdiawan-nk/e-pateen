import { Head, Link, usePage } from '@inertiajs/react';

import { dashboard, login, register } from '@/routes';
import { type SharedData } from '@/types';
import Header from '../components/landing/Header';
import ContactSection from '@/components/landing/ContactSection';
import Footer from '@/components/landing/Footer';

type Feature = {
    title: string;
    description: string;
};

type Step = {
    title: string;
    description: string;
};

type Testimonial = {
    name: string;
    company: string;
    content: string;
    rating: number;
};

type Fact = {
    value: string;
    title: string;
    description: string;
};

type OrderStep = {
    title: string;
    description: string;
};

const FEATURES: Feature[] = [
    {
        title: "Kolam Seluas ±42 Hektar",
        description:
            "Luas kolam yang memadai menjamin suplai ikan patin yang stabil dan berkualitas.",
    },
    {
        title: "Panen Harian 3–4 Ton",
        description:
            "Dipanen setiap hari untuk memastikan kesegaran maksimal sampai ke konsumen.",
    },
    {
        title: "Teknik Budidaya Ramah Lingkungan",
        description:
            "Metode budidaya berkelanjutan yang menjaga ekosistem dan kesejahteraan ikan.",
    },
    {
        title: "Bersertifikat & Terpercaya",
        description:
            "Telah bersertifikat dan dipercaya oleh pelanggan dari berbagai daerah.",
    },
];

const STEPS: Step[] = [
    {
        title: "Pemilihan Bibit Unggul",
        description:
            "Seleksi bibit patin berkualitas tinggi untuk memastikan pertumbuhan optimal.",
    },
    {
        title: "Pemberian Pakan Sehat",
        description:
            "Pakan bernutrisi tinggi tanpa bahan kimia berbahaya, aman dan alami.",
    },
    {
        title: "Pemeliharaan Air & Lingkungan",
        description:
            "Pengelolaan kualitas air dan ekosistem kolam secara berkelanjutan.",
    },
    {
        title: "Panen & Distribusi",
        description:
            "Panen harian dan distribusi cepat untuk menjaga kesegaran ikan.",
    },
];

const TESTIMONIALS: Testimonial[] = [
    {
        name: "Budi Santoso",
        company: "Restoran Sari Laut",
        content:
            "Sudah 2 tahun kami menggunakan patin dari Kampung Patin. Kualitasnya selalu konsisten segar dan harganya kompetitif.",
        rating: 5,
    },
    {
        name: "Dewi Lestari",
        company: "Hotel Grand Riau",
        content:
            "Patin fillet dari Kampung Patin menjadi favorit tamu hotel kami. Dagingnya lembut dan tanpa bau amis.",
        rating: 5,
    },
    {
        name: "Ahmad Rizki",
        company: "Catering Sejahtera",
        content:
            "Untuk acara besar, kami selalu percaya pada Kampung Patin. Suplai terjamin dan pengirimannya tepat waktu.",
        rating: 5,
    },
];

const FACTS: Fact[] = [
    {
        value: "90%+",
        title: "Warga Terlibat Budidaya",
        description:
            "Mayoritas warga desa terlibat aktif dalam proses budidaya ikan patin",
    },
    {
        value: "3–4 Ton",
        title: "Panen Harian",
        description:
            "Setiap hari kami memanen 3–4 ton ikan patin segar berkualitas",
    },
    {
        value: "Seluruh Riau",
        title: "Area Distribusi",
        description:
            "Melayani pengiriman ke seluruh wilayah Riau dan Sumatera",
    },
];

const STEPORDERS: OrderStep[] = [
    {
        title: "Hubungi Kami",
        description:
            "Hubungi via WhatsApp atau marketplace untuk konsultasi kebutuhan",
    },
    {
        title: "Pilih Produk",
        description:
            "Tentukan jenis produk dan jumlah ikan patin sesuai kebutuhan",
    },
    {
        title: "Pengiriman",
        description:
            "Ikan patin segar dikirim cepat dan aman sampai ke tujuan",
    },
];
function Stars({ rating }: { rating: number }) {
    return (
        <div className="flex gap-1">
            {Array.from({ length: rating }).map((_, i) => (
                <svg
                    key={i}
                    className="h-5 w-5 text-yellow-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
            ))}
        </div>
    );
}

export default function Welcome({
    canRegister = true,
}: {
    canRegister?: boolean;
}) {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title="Welcome">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600"
                    rel="stylesheet"
                />
            </Head>
            <div className='class="min-h-screen bg-white dark:bg-zinc-900'>
                <Header />
                <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-blue-50 via-white to-white dark:from-gray-900 dark:via-gray-900 dark:to-gray-950">
                    {/* Background Image */}
                    <div className="absolute inset-0">
                        <img
                            src="https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/48594bbe-a79a-4ec0-bfbf-3b2901ca83f8.png"
                            alt="Panen ikan patin di Kampung Patin XIII Koto Kampar"
                            className="h-full w-full object-cover opacity-20 dark:opacity-15"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/70 to-transparent dark:from-gray-950 dark:via-gray-950/80" />
                    </div>

                    {/* Content */}
                    <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
                        <span className="inline-flex items-center rounded-full bg-blue-100 px-4 py-1.5 text-sm font-semibold text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">
                            Sentra Patin Terbesar di Riau
                        </span>

                        <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl dark:text-white">
                            Patin Segar Langsung dari{" "}
                            <span className="text-blue-600 dark:text-blue-400">
                                Kampung Patin XIII Koto Kampar
                            </span>
                        </h1>

                        <p className="mt-6 max-w-3xl mx-auto text-lg sm:text-xl text-gray-600 dark:text-gray-300">
                            Budidaya alami & berkelanjutan. Panen harian{" "}
                            <span className="font-semibold text-gray-900 dark:text-white">
                                3–4 ton
                            </span>
                            , kualitas premium langsung dari kolam ke tangan Anda.
                        </p>

                        {/* CTA */}
                        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
                            <a
                                href="https://wa.me/628123456789?text=Halo,%20saya%20ingin%20memesan%20ikan%20patin%20segar"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group inline-flex items-center justify-center rounded-xl bg-blue-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-700 transition"
                            >
                                Pesan Ikan Segar
                                <svg
                                    className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 5l7 7-7 7"
                                    />
                                </svg>
                            </a>

                            <a
                                href="#tentang"
                                className="group inline-flex items-center justify-center rounded-xl border border-green-600/20 bg-green-500 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-green-600/20 hover:bg-green-600 transition"
                            >
                                Lihat Proses Budidaya
                                <svg
                                    className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 5l7 7-7 7"
                                    />
                                </svg>
                            </a>
                        </div>
                    </div>
                </section>
                <section
                    id="tentang"
                    className="py-20 bg-white dark:bg-gray-950"
                >
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        {/* Header */}
                        <div className="mx-auto mb-16 max-w-3xl text-center">
                            <span className="inline-flex items-center rounded-full bg-blue-100 px-4 py-1.5 text-sm font-semibold text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">
                                Tentang Kami
                            </span>

                            <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                                Kenapa Patin dari{" "}
                                <span className="text-blue-600 dark:text-blue-400">
                                    Kampung Patin
                                </span>
                                ?
                            </h2>

                            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
                                Keunggulan budidaya ikan patin kami yang membuat perbedaan nyata
                            </p>
                        </div>

                        {/* Content */}
                        <div className="grid grid-cols-1 items-center gap-14 md:grid-cols-2">
                            {/* Features */}
                            <div className="space-y-8">
                                {FEATURES.map((feature) => (
                                    <div
                                        key={feature.title}
                                        className="group flex items-start gap-4"
                                    >
                                        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition dark:bg-blue-500/10 dark:text-blue-400 dark:group-hover:bg-blue-500">
                                            <svg
                                                className="h-6 w-6"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M5 13l4 4L19 7"
                                                />
                                            </svg>
                                        </div>

                                        <div>
                                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                                {feature.title}
                                            </h3>
                                            <p className="mt-1 text-gray-600 dark:text-gray-300">
                                                {feature.description}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Images */}
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    {
                                        src: "https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/1250b783-a9ec-4d1c-8fb7-ecbb0b4b6555.png",
                                        alt: "Kolam ikan patin yang luas",
                                    },
                                    {
                                        src: "https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/7ee82406-3f62-4de8-9d96-0f0f976cd301.png",
                                        alt: "Proses pemberian pakan alami",
                                    },
                                    {
                                        src: "https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/c5a8195d-104e-48ee-b553-795e648b9490.png",
                                        alt: "Panen ikan patin segar",
                                    },
                                    {
                                        src: "https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/ad800521-0d53-4cb0-94a0-46828476ae85.png",
                                        alt: "Ikan patin kualitas terbaik",
                                    },
                                ].map((img) => (
                                    <div
                                        key={img.src}
                                        className="overflow-hidden rounded-2xl shadow-lg"
                                    >
                                        <img
                                            src={img.src}
                                            alt={img.alt}
                                            className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
                <section className="py-20 bg-blue-50 dark:bg-gray-900">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        {/* Header */}
                        <div className="mx-auto mb-16 max-w-3xl text-center">
                            <span className="inline-flex items-center rounded-full bg-blue-100 px-4 py-1.5 text-sm font-semibold text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">
                                Proses Budidaya
                            </span>

                            <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                                Proses Budidaya Kami
                            </h2>

                            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
                                Langkah terstruktur untuk menghasilkan ikan patin berkualitas tinggi
                            </p>
                        </div>

                        {/* Steps */}
                        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
                            {STEPS.map((step, index) => (
                                <div
                                    key={step.title}
                                    className="group relative rounded-2xl bg-white p-6 text-center shadow-lg transition hover:-translate-y-1 hover:shadow-xl dark:bg-gray-950"
                                >
                                    {/* Number */}
                                    <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-2xl font-bold text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white dark:bg-blue-500/10 dark:text-blue-400 dark:group-hover:bg-blue-500">
                                        {index + 1}
                                    </div>

                                    <h3 className="mb-3 text-xl font-semibold text-gray-900 dark:text-white">
                                        {step.title}
                                    </h3>

                                    <p className="text-gray-600 dark:text-gray-300">
                                        {step.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
                <section
                    id="testimoni"
                    className="py-20 bg-blue-50 dark:bg-gray-900"
                >
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        {/* Header */}
                        <div className="mx-auto mb-16 max-w-3xl text-center">
                            <span className="inline-flex items-center rounded-full bg-blue-100 px-4 py-1.5 text-sm font-semibold text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">
                                Testimoni
                            </span>

                            <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                                Testimoni Pelanggan
                            </h2>

                            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
                                Apa kata mereka yang telah mempercayai kualitas ikan patin kami
                            </p>
                        </div>

                        {/* Cards */}
                        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                            {TESTIMONIALS.map((testimonial) => (
                                <div
                                    key={testimonial.name}
                                    className="group flex h-full flex-col rounded-2xl bg-white p-6 shadow-lg transition hover:-translate-y-1 hover:shadow-xl dark:bg-gray-950"
                                >
                                    <Stars rating={testimonial.rating} />

                                    <p className="mt-4 flex-1 text-gray-600 italic dark:text-gray-300">
                                        “{testimonial.content}”
                                    </p>

                                    <div className="mt-6 border-t border-gray-200 pt-4 dark:border-white/10">
                                        <p className="font-semibold text-gray-900 dark:text-white">
                                            {testimonial.name}
                                        </p>
                                        <p className="text-sm text-blue-600 dark:text-blue-400">
                                            {testimonial.company}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
                <section className="py-20 bg-white dark:bg-gray-950">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        {/* Header */}
                        <div className="mx-auto mb-16 max-w-3xl text-center">
                            <span className="inline-flex items-center rounded-full bg-blue-100 px-4 py-1.5 text-sm font-semibold text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">
                                Data & Fakta
                            </span>

                            <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                                Data & Fakta Produksi
                            </h2>

                            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
                                Bukti nyata komitmen kami dalam menyediakan ikan patin berkualitas
                            </p>
                        </div>

                        {/* Facts */}
                        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                            {FACTS.map((fact) => (
                                <div
                                    key={fact.title}
                                    className="group rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-white/10 dark:bg-gray-900"
                                >
                                    <div className="mb-4 text-5xl font-extrabold text-blue-600 dark:text-blue-400">
                                        {fact.value}
                                    </div>

                                    <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
                                        {fact.title}
                                    </h3>

                                    <p className="text-gray-600 dark:text-gray-300">
                                        {fact.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
                <section className="py-20 bg-blue-50 dark:bg-blue-950/40">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        {/* Header */}
                        <div className="mx-auto mb-16 max-w-3xl text-center">
                            <span className="inline-flex items-center rounded-full bg-blue-100 px-4 py-1.5 text-sm font-semibold text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">
                                Cara Pemesanan
                            </span>

                            <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                                Cara Pemesanan Mudah
                            </h2>

                            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
                                Hanya 3 langkah sederhana untuk mendapatkan ikan patin segar kami
                            </p>
                        </div>

                        {/* Steps */}
                        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
                            {STEPORDERS.map((step, index) => (
                                <div
                                    key={step.title}
                                    className="group text-center"
                                >
                                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-xl font-bold text-white transition group-hover:scale-110 group-hover:bg-blue-700">
                                        {index + 1}
                                    </div>

                                    <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
                                        {step.title}
                                    </h3>

                                    <p className="text-gray-600 dark:text-gray-300">
                                        {step.description}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* CTA */}
                        <div className="mt-14 text-center">
                            <a
                                href="https://wa.me/628123456789?text=Halo,%20saya%20ingin%20konsultasi%20tentang%20pemesanan%20ikan%20patin"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center rounded-xl bg-green-500 px-8 py-4 font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-green-600 hover:shadow-lg"
                            >
                                <svg
                                    className="mr-2 h-5 w-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                                    />
                                </svg>
                                Konsultasi via WhatsApp
                            </a>
                        </div>
                    </div>
                </section>
                <ContactSection />
                <Footer />
            </div>
        </>
    );
}
