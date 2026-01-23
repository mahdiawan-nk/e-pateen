<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use App\Http\Controllers\UserController;
use App\Http\Controllers\KolamController;
use App\Http\Controllers\KolamMonitoringController;
use App\Http\Controllers\ScheduleController;
use App\Http\Controllers\KolamSeedingController;
use App\Http\Controllers\KolamFeedingController;
use App\Http\Controllers\KolamSamplingController;
use App\Http\Controllers\HarvestEstimationController;
use App\Http\Controllers\HarvestRealizationController;
use App\Http\Controllers\ReportController;

use App\Http\Controllers\DashboardDataController;
/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/
Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');



Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::resource('users', UserController::class);
    Route::get('kolams/history-all', [KolamController::class, 'historyAll'])->name('kolams.historyAll');
    Route::resource('kolams', KolamController::class);
    Route::resource('kolam-monitoring', KolamMonitoringController::class);
    Route::resource('schedules', ScheduleController::class);
    Route::resource('kolam-seeding', KolamSeedingController::class);
    Route::get(
        '/kolam-seeding/{id}/movement',
        [KolamSeedingController::class, 'movementView']
    )->name('kolam-seeding.movement');
    Route::post('/kolam-seeding/{seeding}/movement-store', [KolamSeedingController::class, 'movementStock']);

    Route::resource('kolam-feeding', KolamFeedingController::class);
    Route::resource('kolam-sampling', KolamSamplingController::class);
    Route::get('/kolam-sampling/{id}/{seeding_id}/balance', [KolamSamplingController::class, 'checkIsSamplingExist'])->name('kolam-sampling.balance');

    Route::resource('harvest/estimation', HarvestEstimationController::class);
    Route::resource('harvest/realization', HarvestRealizationController::class);
    Route::get('reports', [ReportController::class, 'index'])->name('reports.index');

    Route::get('/dashboard-statistics', [DashboardDataController::class, 'index'])->name('dashboard-statistics');
    Route::get('/dashboard-analytics', [DashboardDataController::class, 'analytics'])->name('dashboard-analytics');
    Route::get('/dashboard-summary', [DashboardDataController::class, 'summary'])->name('dashboard-summary');
    Route::get('/dashboard-highlights', [DashboardDataController::class, 'highlights'])->name('dashboard-highlights');
    Route::get('/dashboard-kolam-options', [DashboardDataController::class, 'kolamOptions'])->name('dashboard-kolam-options');
    Route::get('/dashboard-seeding-options', [DashboardDataController::class, 'seedingOptions'])->name('dashboard-seeding-options');

});

require __DIR__ . '/settings.php';
