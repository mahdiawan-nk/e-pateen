<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SamplingRequest extends FormRequest
{
    // Tentukan siapa yang bisa melakukan request ini
    public function authorize(): bool
    {
        // Bisa diubah sesuai logic autentikasi user
        return true;
    }

    // Atur rules validasi
    public function rules(): array
    {
        return [
            'kolam_id' => 'required|uuid',
            'seeding_id' => 'required|uuid',
            'sampling_date' => 'required|date',
            'estimated_population' => 'required|integer|min:1',
            'sample_size' => 'required|integer|min:1',
            'avg_weight_start_g' => 'required|numeric|min:1',
            'avg_weight_end_g' => 'required|numeric|min:1',
            'avg_length_start_cm' => 'required|numeric|min:1',
            'avg_length_end_cm' => 'required|numeric|min:1',
            'mortality_count' => 'required|integer|min:0',
            'notes' => 'nullable|string',
        ];
    }

    // Pesan validasi dalam Bahasa Indonesia
    public function messages(): array
    {
        return [
            'kolam_id.required' => 'Kolam harus dipilih.',
            'kolam_id.uuid' => 'Kolam tidak valid.',

            'seeding_id.required' => 'Seeding harus dipilih.',
            'seeding_id.uuid' => 'Seeding tidak valid.',

            'sampling_date.required' => 'Tanggal sampling harus diisi.',
            'sampling_date.date' => 'Tanggal sampling tidak valid.',

            'estimated_population.required' => 'Populasi estimasi harus diisi.',
            'estimated_population.integer' => 'Populasi estimasi harus berupa angka.',
            'estimated_population.min' => 'Populasi estimasi minimal 1 ekor.',

            'sample_size.required' => 'Jumlah sampel harus diisi.',
            'sample_size.integer' => 'Jumlah sampel harus berupa angka.',
            'sample_size.min' => 'Jumlah sampel minimal 1 ekor.',

            'avg_weight_start_g.required' => 'Berat awal rata-rata harus diisi.',
            'avg_weight_start_g.numeric' => 'Berat awal rata-rata harus berupa angka.',
            'avg_weight_start_g.min' => 'Berat awal rata-rata minimal 1 gram.',

            'avg_weight_end_g.required' => 'Berat akhir rata-rata harus diisi.',
            'avg_weight_end_g.numeric' => 'Berat akhir rata-rata harus berupa angka.',
            'avg_weight_end_g.min' => 'Berat akhir rata-rata minimal 1 gram.',

            'avg_length_start_cm.required' => 'Panjang awal rata-rata harus diisi.',
            'avg_length_start_cm.numeric' => 'Panjang awal rata-rata harus berupa angka.',
            'avg_length_start_cm.min' => 'Panjang awal rata-rata minimal 1 cm.',

            'avg_length_end_cm.required' => 'Panjang akhir rata-rata harus diisi.',
            'avg_length_end_cm.numeric' => 'Panjang akhir rata-rata harus berupa angka.',
            'avg_length_end_cm.min' => 'Panjang akhir rata-rata minimal 1 cm.',

            'mortality_count.required' => 'Jumlah mortalitas harus diisi.',
            'mortality_count.integer' => 'Jumlah mortalitas harus berupa angka.',
            'mortality_count.min' => 'Jumlah mortalitas minimal 0 ekor.',

            'notes.string' => 'Catatan harus berupa teks.',
        ];
    }
}
