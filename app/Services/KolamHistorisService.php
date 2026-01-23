<?php

namespace App\Services;
use App\Models\KolamHistori;
class KolamHistorisService
{
    protected function create($data)
    {
        return KolamHistori::create($data);
    }

    public function createHistori(
        string $kolamId,
        string $userId,
        string $action,
        array $changes,
        string $description
    ) {
        return $this->create([
            'kolam_id' => $kolamId,
            'user_id' => $userId,
            'action' => $action,
            'changes' => $changes,
            'description' => $description
        ]);
    }
}
