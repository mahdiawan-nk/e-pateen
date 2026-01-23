import type { ReactNode } from "react";

export default function ContactSection() {
    return (
        <section id="kontak" className="py-20 bg-white dark:bg-gray-950">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="mx-auto mb-16 max-w-3xl text-center">
                    <span className="inline-flex items-center rounded-full bg-blue-100 px-4 py-1.5 text-sm font-semibold text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">
                        Kontak
                    </span>

                    <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                        Hubungi Kami
                    </h2>

                    <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
                        Jangan ragu menghubungi kami untuk informasi produk, harga, dan kerja sama
                    </p>
                </div>

                {/* Content */}
                <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
                    {/* Left */}
                    <div>
                        <h3 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-white">
                            Informasi Kontak
                        </h3>

                        <div className="space-y-5">
                            <ContactItem
                                title="Telepon / WhatsApp"
                                value="+62 812-3456-7890"
                                icon={<WhatsAppIcon />}
                            />

                            <ContactItem
                                title="Email"
                                value="info@kampungpatin.com"
                                icon={<EmailIcon />}
                            />

                            <ContactItem
                                title="Alamat"
                                value="Desa Koto Mesjid, XIII Koto Kampar, Riau"
                                icon={<LocationIcon />}
                            />
                        </div>

                        <div className="mt-10 rounded-xl border border-gray-200 bg-gray-50 p-6 dark:border-gray-800 dark:bg-gray-900">
                            <h4 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
                                Jam Operasional
                            </h4>
                            <p className="text-gray-600 dark:text-gray-300">
                                Senin – Minggu: 07.00 – 18.00 WIB
                            </p>
                            <p className="text-gray-600 dark:text-gray-300">
                                Pengiriman: Setiap hari sesuai permintaan
                            </p>
                        </div>
                    </div>

                    {/* Right */}
                    <div>
                        <h3 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-white">
                            Lokasi Kami
                        </h3>

                        <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm dark:border-gray-800">
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d127672.0335425312!2d100.69523519726565!3d0.3327203000000031!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31d539fefea335eb%3A0x75db50c80566d9df!2sLaman%20Kampung%20Patin%20Desa%20Koto%20Mesjid!5e0!3m2!1sid!2sid!4v1757790468828!5m2!1sid!2sid"
                                className="h-72 w-full border-0"
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            />

                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

/* ---------------------------------- */
/* Components */
/* ---------------------------------- */

type ContactItemProps = {
    title: string;
    value: string;
    icon: ReactNode;
};

function ContactItem({ title, value, icon }: ContactItemProps) {
    return (
        <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                {icon}
            </div>
            <div>
                <p className="font-semibold text-gray-900 dark:text-white">
                    {title}
                </p>
                <p className="text-gray-600 dark:text-gray-300">
                    {value}
                </p>
            </div>
        </div>
    );
}

/* ---------------------------------- */
/* Icons */
/* ---------------------------------- */

function WhatsAppIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
            <path d="M12 2C6.477 2 2 6.484 2 12a9.96 9.96 0 0 0 1.347 5.016L2 22l5.016-1.347A10 10 0 1 0 12 2Z" />
        </svg>
    );
}

function EmailIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-5 w-5">
            <path
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
        </svg>
    );
}

function LocationIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
            <path d="M12 2a8 8 0 0 0-6.895 12.06L12 22l6.326-7.222A8 8 0 0 0 12 2Zm0 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z" />
        </svg>
    );
}
