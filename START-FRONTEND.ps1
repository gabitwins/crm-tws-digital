# Iniciar apenas o FRONTEND
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  INICIANDO FRONTEND - Porta 3000" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "🌐 Frontend será acessível em: http://localhost:3000" -ForegroundColor Green
Write-Host ""
Write-Host "Iniciando servidor Next.js..." -ForegroundColor Yellow
Set-Location "$PSScriptRoot\apps\frontend"
npm run dev
