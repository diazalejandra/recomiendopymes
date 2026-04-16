# ============================================================
# start.ps1 — Script de arranque de RecomiendoPymes
# ============================================================
# USO:
#   1. Abre PowerShell en la carpeta raíz del proyecto
#      (c:\Users\adiaz389\Github\recomiendopymes)
#   2. Ejecuta:  .\start.ps1
#   3. Para detener:  Ctrl+C en CADA ventana abierta
# ============================================================

$rootDir = $PSScriptRoot

# ----- Colores -----
function Write-Step($msg) { Write-Host "`n>>> $msg" -ForegroundColor Cyan }
function Write-OK($msg)   { Write-Host "    [OK] $msg" -ForegroundColor Green }
function Write-Warn($msg) { Write-Host "    [!]  $msg" -ForegroundColor Yellow }

Write-Host ""
Write-Host "  ____                          _                 _      " -ForegroundColor Blue
Write-Host " |  _ \ ___  ___ ___  _ __ ___ (_) ___ _ __   __| | ___  " -ForegroundColor Blue
Write-Host " | |_) / _ \/ __/ _ \| '_ ' _ \| |/ _ \ '_ \ / _' |/ _ \ " -ForegroundColor Blue
Write-Host " |  _ <  __/ (_| (_) | | | | | | |  __/ | | | (_| | (_) |" -ForegroundColor Blue
Write-Host " |_| \_\___|\___\___/|_| |_| |_|_|\___|_| |_|\__,_|\___/ " -ForegroundColor Blue
Write-Host "                                      Pymes               " -ForegroundColor Blue
Write-Host ""

# ----- Verificar que las carpetas existen -----
$backendDir  = Join-Path $rootDir "backend"
$frontendDir = Join-Path $rootDir "frontend"

if (-not (Test-Path $backendDir))  { Write-Host "[ERROR] No se encontró la carpeta 'backend'" -ForegroundColor Red; exit 1 }
if (-not (Test-Path $frontendDir)) { Write-Host "[ERROR] No se encontró la carpeta 'frontend'" -ForegroundColor Red; exit 1 }

# ----- Backend -----
Write-Step "Iniciando Backend (FastAPI en puerto 8000)..."

# Matar cualquier proceso zombie en el puerto 8000
$pids8000 = (Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue).OwningProcess | Sort-Object -Unique
if ($pids8000) {
    Write-Warn "Cerrando proceso previo en puerto 8000 (PID: $pids8000)"
    $pids8000 | ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }
    Start-Sleep -Milliseconds 1000
}

# Limpiar bytecode cacheado para evitar versiones viejas
Get-ChildItem -Path $backendDir -Recurse -Directory -Filter "__pycache__" | 
    Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
Write-OK "Caché de Python (.pyc) limpiado"

# Iniciar backend en nueva ventana
Start-Process powershell -ArgumentList @(
    "-ExecutionPolicy", "Bypass",
    "-NoExit",
    "-Command",
    "Write-Host '[Backend] FastAPI corriendo en http://localhost:8000' -ForegroundColor Green; " +
    "Set-Location '$backendDir'; " +
    "python -m uvicorn server:app --reload --port 8000 --host 0.0.0.0"
) -WindowStyle Normal

Write-OK "Backend iniciado (nueva ventana de PowerShell)"

# Esperar que el backend esté listo
Write-Host "    Esperando que el backend inicie..." -ForegroundColor Gray
$maxWait = 20  # segundos
$waited  = 0
$backendReady = $false
while ($waited -lt $maxWait) {
    Start-Sleep -Seconds 1
    $waited++
    try {
        $r = Invoke-WebRequest -Uri "http://localhost:8000/health" -TimeoutSec 1 -ErrorAction Stop
        $backendReady = $true
        break
    } catch { }
    Write-Host "    . ($waited/$maxWait)" -ForegroundColor DarkGray -NoNewline
    Write-Host "`r" -NoNewline
}

if ($backendReady) {
    Write-OK "Backend listo en http://localhost:8000"
} else {
    Write-Warn "El backend tardó más de lo esperado. Revisa la ventana de Backend."
    Write-Warn "Si hay un error de MongoDB, conéctate a una red diferente (hotspot) y vuelve a correr este script."
}

# ----- Frontend -----
Write-Step "Iniciando Frontend (Vite en puerto 3001)..."

# Verificar node_modules
if (-not (Test-Path (Join-Path $frontendDir "node_modules"))) {
    Write-Warn "node_modules no encontrado. Instalando dependencias..."
    Start-Process powershell -ArgumentList @(
        "-ExecutionPolicy", "Bypass",
        "-NoExit",
        "-Command",
        "Write-Host '[Frontend] Instalando dependencias...' -ForegroundColor Yellow; " +
        "Set-Location '$frontendDir'; npm.cmd install; npm.cmd run dev"
    ) -WindowStyle Normal
} else {
    Start-Process powershell -ArgumentList @(
        "-ExecutionPolicy", "Bypass",
        "-NoExit",
        "-Command",
        "Write-Host '[Frontend] Vite corriendo en http://localhost:3001' -ForegroundColor Green; " +
        "Set-Location '$frontendDir'; npm.cmd run dev"
    ) -WindowStyle Normal
}

Write-OK "Frontend iniciado (nueva ventana de PowerShell)"

# ----- Listo -----
Write-Host ""
Write-Host "  ================================================" -ForegroundColor Green
Write-Host "   Aplicacion corriendo!" -ForegroundColor Green
Write-Host ""
Write-Host "   Frontend:  http://localhost:3001" -ForegroundColor White
Write-Host "   Backend:   http://localhost:8000" -ForegroundColor White  
Write-Host "   API Docs:  http://localhost:8000/docs" -ForegroundColor White
Write-Host ""
Write-Host "   Para detener: Ctrl+C en cada ventana abierta" -ForegroundColor Gray
Write-Host "  ================================================" -ForegroundColor Green
Write-Host ""

# Abrir el browser automaticamente
Start-Sleep -Seconds 3
Start-Process "http://localhost:3001"
