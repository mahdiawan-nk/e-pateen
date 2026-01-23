export default function Footer() {
    return (
        <footer className="bg-gray-900 text-gray-300 dark:bg-black">
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 gap-10 md:grid-cols-3">

                    {/* Brand */}
                    <div>
                        <h3 className="text-2xl font-extrabold text-white">
                            Kampung Patin
                        </h3>
                        <p className="mt-4 text-sm leading-relaxed text-gray-400">
                            Pusat budidaya dan penjualan ikan patin segar berkualitas dari Riau.
                            Melayani rumah tangga, restoran, hotel, dan acara khusus.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="mb-4 text-lg font-semibold text-white">
                            Tautan Cepat
                        </h4>
                        <ul className="space-y-2 text-sm">
                            {QUICK_LINKS.map((link) => (
                                <li key={link.href}>
                                    <a
                                        href={link.href}
                                        className="transition hover:text-white hover:underline"
                                    >
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* CTA */}
                    <div>
                        <h4 className="mb-4 text-lg font-semibold text-white">
                            Pesan Sekarang
                        </h4>

                        <a
                            href="https://wa.me/628123456789"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-lg bg-green-500 px-4 py-2.5 text-sm font-semibold text-white shadow transition hover:-translate-y-0.5 hover:bg-green-600 hover:shadow-lg"
                        >
                            <WhatsAppIcon />
                            WhatsApp
                        </a>

                        <p className="mt-6 text-xs text-gray-500">
                            © {new Date().getFullYear()} Kampung Patin.
                            All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}

/* ---------------------------------- */
/* Data */
/* ---------------------------------- */

const QUICK_LINKS = [
    { label: "Tentang Kami", href: "#tentang" },
    { label: "Produk", href: "#produk" },
    { label: "Testimoni", href: "#testimoni" },
    { label: "Kontak", href: "#kontak" },
];

/* ---------------------------------- */
/* Icons */
/* ---------------------------------- */

function WhatsAppIcon() {
    return (
        <svg
            className="h-4 w-4"
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
    );
}
