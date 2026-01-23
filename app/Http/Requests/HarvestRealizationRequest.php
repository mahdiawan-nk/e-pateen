<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class HarvestRealizationRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'kolam_id' => 'required|uuid',
            'seeding_id' => 'required|uuid',
            'harvest_date' => 'required|date',
            'harvested_population' => 'required|numeric|min:1',
            'average_weight_g' => 'required|numeric|min:1',
            'total_biomass_kg' => 'required|numeric|min:1',
            'notes' => 'nullable|string',
        ];
    }

    // Pesan validasi dalam Bahasa Indonesia
    public function messages(): array
    {
        return [
            // ================= KOLAM =================
            'kolam_id.required' => 'Kolam harus dipilih.',
            'kolam_id.uuid' => 'Format kolam tidak valid.',

            // ================= SEEDING =================
            'seeding_id.required' => 'Seeding harus dipilih.',
            'seeding_id.uuid' => 'Format seeding tidak valid.',

            // ================= TANGGAL PANEN =================
            'harvest_date.required' => 'Tanggal panen wajib diisi.',
            'harvest_date.date' => 'Format tanggal panen tidak valid.',

            // ================= POPULASI PANEN =================
            'harvested_population.required' => 'Jumlah populasi panen wajib diisi.',
            'harvested_population.numeric' => 'Jumlah populasi panen harus berupa angka.',
            'harvested_population.min' => 'Jumlah populasi panen minimal 1 ekor.',

            // ================= BERAT RATA-RATA =================
            'average_weight_g.required' => 'Berat rata-rata wajib diisi.',
            'average_weight_g.numeric' => 'Berat rata-rata harus berupa angka.',
            'average_weight_g.min' => 'Berat rata-rata minimal 1 gram.',

            // ================= TOTAL BIOMASS =================
            'total_biomass_kg.required' => 'Total biomassa wajib diisi.',
            'total_biomass_kg.numeric' => 'Total biomassa harus berupa angka.',
            'total_biomass_kg.min' => 'Total biomassa minimal 1 kg.',

            // ================= CATATAN =================
            'notes.string' => 'Catatan harus berupa teks.',
        ];
    }

}
