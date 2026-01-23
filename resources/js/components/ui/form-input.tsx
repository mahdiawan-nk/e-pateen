import { useState } from "react";

type InputType =
    | "text"
    | "email"
    | "password"
    | "textarea"
    | "select"
    | "checkbox"
    | "radio"
    | "toggle"
    | "date"
    | "time"
    | "number"; // <-- ditambahkan

interface FormInputProps {
    label?: string;
    name: string;
    type?: InputType;
    value: any;
    onChange: (value: any) => void;
    placeholder?: string;
    options?: { label: string; value: string }[]; // untuk select & radio
    disabled?: boolean;
    error?: string;
    min?: number; // untuk type number
    max?: number; // untuk type number
    required?: boolean;
    helper?: string
}

export function FormInput({
    label,
    name,
    type = "text",
    value,
    onChange,
    placeholder,
    options = [],
    disabled = false,
    error = "",
    min,
    max,
    required = false,
    helper=""
}: FormInputProps) {
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        if (type === "checkbox" || type === "toggle") {
            onChange((e.target as HTMLInputElement).checked);
        } else if (type === "number") {
            const val = (e.target as HTMLInputElement).value;
            onChange(val === "" ? "" : Number(val)); // convert ke number
        } else {
            onChange(e.target.value);
        }
    };

    const baseInput =
        "w-full rounded-lg border px-3 py-2 text-sm " +
        "focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary " +
        "transition disabled:opacity-50 disabled:cursor-not-allowed " +
        (error
            ? "border-red-500 text-red-700 placeholder-red-300 dark:bg-neutral-900 dark:border-red-400 dark:text-red-300"
            : "border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-100 placeholder-neutral-400");

    const labelClass = "text-sm font-medium text-neutral-700 dark:text-neutral-300";
    const errorClass = "text-xs text-red-600 dark:text-red-400 mt-1";

    return (
        <div className="flex flex-col gap-1.5">
            {label && <label className={labelClass}>{label} {required && <span className="text-red-500">*</span>}</label>}

            {/* TEXTAREA */}
            {type === "textarea" && (
                <textarea
                    name={name}
                    value={value}
                    onChange={handleChange}
                    placeholder={placeholder}
                    className={`${baseInput} min-h-[90px] resize-y`}
                    disabled={disabled}
                />
            )}

            {/* SELECT */}
            {type === "select" && (
                <select
                    name={name}
                    value={value}
                    onChange={handleChange}
                    className={baseInput}
                    disabled={disabled}
                >
                    {options.map((opt) => (
                        <option key={opt.value} value={opt.value} >
                            {opt.label}
                        </option>
                    ))}
                </select>
            )}

            {/* CHECKBOX / TOGGLE */}
            {(type === "checkbox" || type === "toggle") && (
                <label className="flex items-center gap-3 cursor-pointer select-none">
                    <input
                        type="checkbox"
                        checked={!!value}
                        onChange={handleChange}
                        disabled={disabled}
                        className="h-4 w-4 rounded border-neutral-400 dark:border-neutral-600 
                       text-primary focus:ring-primary/40 transition"
                    />
                    {label && (
                        <span className="text-sm text-neutral-700 dark:text-neutral-300">{label}</span>
                    )}
                </label>
            )}

            {/* PASSWORD */}
            {type === "password" && (
                <div className="relative">
                    <input
                        type={showPassword ? "text" : "password"}
                        name={name}
                        value={value}
                        onChange={handleChange}
                        placeholder={placeholder}
                        className={baseInput}
                        disabled={disabled}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs 
                       text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition"
                    >
                        {showPassword ? "Hide" : "Show"}
                    </button>
                </div>
            )}

            {/* NUMBER / DEFAULT INPUT */}
            {(type === "text" || type === "email" || type === "number" || type === "date" || type === "time") && (
                <input
                    type={type}
                    name={name}
                    value={value}
                    onChange={handleChange}
                    placeholder={placeholder}
                    className={baseInput}
                    disabled={disabled}
                    min={min}
                    max={max}
                />
            )}
            <span className="text-xs text-neutral-500">{helper}</span>
            {/* ERROR MESSAGE */}
            {error && <span className={errorClass}>{error}</span>}
        </div>
    );
}
