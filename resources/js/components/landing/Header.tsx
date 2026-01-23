import { useState } from "react";
import { Link } from "@inertiajs/react";

const MENU = [
    { label: "Tentang", href: "#tentang" },
    { label: "Produk", href: "#produk" },
    { label: "Testimoni", href: "#testimoni" },
    { label: "Kontak", href: "#kontak" },
];

export default function Header() {
    const [isOpen, setIsOpen] = useState<boolean>(false);

    return (
        <header className="sticky top-0 z-50 border-b border-gray-200/70 dark:border-white/10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl">
            <nav className="max-w-7xl mx-auto px-6 lg:px-8 py-4">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <img
                            src="/logo.png"
                            alt="Kampung Patin Logo"
                            className="h-10 w-10 object-contain transition-transform duration-300 group-hover:scale-105"
                        />
                        <span className="text-2xl font-extrabold tracking-tight text-blue-600 dark:text-blue-400 group-hover:opacity-90 transition">
                            E-PATEEN
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-8">
                        {MENU.map((item) => (
                            <a
                                key={item.href}
                                href={item.href}
                                className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition"
                            >
                                {item.label}
                            </a>
                        ))}
                    </div>

                    {/* Desktop CTA */}
                    <div className="hidden md:block">
                        <a
                            href="https://wa.me/628123456789"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-600/20 hover:bg-blue-700 dark:hover:bg-blue-500 transition"
                        >
                            Pesan Sekarang
                        </a>
                    </div>

                    {/* Mobile Toggle */}
                    <button
                        onClick={() => setIsOpen((prev) => !prev)}
                        aria-expanded={isOpen}
                        aria-label="Toggle navigation"
                        className={`md:hidden rounded-lg p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 transition ${
                            isOpen ? "rotate-90" : ""
                        }`}
                    >
                        {!isOpen ? (
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
                                    d="M4 6h16M4 12h16m-7 6h7"
                                />
                            </svg>
                        ) : (
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
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        )}
                    </button>
                </div>

                {/* Mobile Menu */}
                <div
                    className={`md:hidden mt-4 space-y-4 rounded-2xl border border-gray-200/70 dark:border-white/10 bg-white dark:bg-gray-900 p-5 shadow-xl transition-all duration-300 ${
                        isOpen
                            ? "opacity-100 translate-y-0"
                            : "opacity-0 -translate-y-2 pointer-events-none"
                    }`}
                >
                    {MENU.map((item) => (
                        <a
                            key={item.href}
                            href={item.href}
                            onClick={() => setIsOpen(false)}
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition"
                        >
                            {item.label}
                        </a>
                    ))}

                    <a
                        href="https://wa.me/628123456789"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block rounded-xl bg-blue-600 px-5 py-2.5 text-center text-sm font-semibold text-white shadow-md shadow-blue-600/20 hover:bg-blue-700 dark:hover:bg-blue-500 transition"
                    >
                        Pesan Sekarang
                    </a>
                </div>
            </nav>
        </header>
    );
}
