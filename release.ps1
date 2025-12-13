# ===================================
# RELEASE SCRIPT - PowerShell
# ===================================
# 
# Uso (PowerShell):
#   & '.\release.ps1' beta
#   & '.\release.ps1' stable

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("beta", "stable")]
    [string]$ReleaseType
)

Write-Host "🚀 Iniciando release automático: $ReleaseType" -ForegroundColor Cyan

# Validar que Node.js esté instalado
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js no está instalado" -ForegroundColor Red
    exit 1
}

# Ejecutar release automático
& node scripts/release-auto.js $ReleaseType

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ El release falló" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Release completado" -ForegroundColor Green
