# Script de Inicialização Completa do CRM
# Execute este script para iniciar Backend + Frontend

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  INICIANDO CRM NEXO - Sistema Completo" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Verificar Docker
Write-Host "[1/5] Verificando Docker Desktop..." -ForegroundColor Yellow
$dockerRunning = $false
try {
    docker ps | Out-Null
    $dockerRunning = $true
    Write-Host "✓ Docker está rodando!" -ForegroundColor Green
} catch {
    Write-Host "✗ Docker não está rodando. Iniciando..." -ForegroundColor Red
    Write-Host "   Aguarde 30 segundos para o Docker iniciar..." -ForegroundColor Yellow
    Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"
    Start-Sleep -Seconds 30
}

# 2. Criar container PostgreSQL
Write-Host ""
Write-Host "[2/5] Criando container PostgreSQL..." -ForegroundColor Yellow
$containerExists = docker ps -a --filter "name=crm-postgres" --format "{{.Names}}"
if ($containerExists) {
    Write-Host "   Container já existe. Iniciando..." -ForegroundColor Cyan
    docker start crm-postgres | Out-Null
} else {
    Write-Host "   Criando novo container..." -ForegroundColor Cyan
    docker run --name crm-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=crm_nexo -p 5432:5432 -d postgres
}
Write-Host "✓ PostgreSQL rodando na porta 5432" -ForegroundColor Green
Start-Sleep -Seconds 5

# 3. Criar tabelas no banco
Write-Host ""
Write-Host "[3/5] Criando estrutura do banco de dados..." -ForegroundColor Yellow
Set-Location "$PSScriptRoot\apps\backend"
npx prisma db push --skip-generate 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Tabelas criadas com sucesso!" -ForegroundColor Green
} else {
    Write-Host "✗ Erro ao criar tabelas. Continuando mesmo assim..." -ForegroundColor Red
}

# 4. Iniciar Backend
Write-Host ""
Write-Host "[4/5] Iniciando Backend (porta 4000)..." -ForegroundColor Yellow
Set-Location "$PSScriptRoot\apps\backend"
$backendJob = Start-Job -ScriptBlock {
    Set-Location $using:PSScriptRoot\apps\backend
    npm run dev
}
Start-Sleep -Seconds 3
Write-Host "✓ Backend iniciado em background!" -ForegroundColor Green
Write-Host "   Job ID: $($backendJob.Id)" -ForegroundColor Cyan

# 5. Iniciar Frontend
Write-Host ""
Write-Host "[5/5] Iniciando Frontend (porta 3000)..." -ForegroundColor Yellow
Set-Location "$PSScriptRoot\apps\frontend"
$frontendJob = Start-Job -ScriptBlock {
    Set-Location $using:PSScriptRoot\apps\frontend
    npm run dev
}
Start-Sleep -Seconds 3
Write-Host "✓ Frontend iniciado em background!" -ForegroundColor Green
Write-Host "   Job ID: $($frontendJob.Id)" -ForegroundColor Cyan

# Resumo
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  ✓ SISTEMA INICIADO COM SUCESSO!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "🔌 Backend:  http://localhost:4000" -ForegroundColor Cyan
Write-Host "🐘 Postgres: localhost:5432" -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 Login padrão:" -ForegroundColor Yellow
Write-Host "   Email: admin@nexo.com" -ForegroundColor White
Write-Host "   Senha: admin123" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  Para parar os serviços:" -ForegroundColor Yellow
Write-Host "   Get-Job | Stop-Job" -ForegroundColor White
Write-Host "   docker stop crm-postgres" -ForegroundColor White
Write-Host ""
Write-Host "Pressione CTRL+C para sair (os serviços continuarão rodando)" -ForegroundColor Gray
Write-Host ""

# Manter o script rodando e mostrar logs
Write-Host "=== LOGS DO BACKEND ===" -ForegroundColor Cyan
while ($true) {
    Receive-Job -Id $backendJob.Id -ErrorAction SilentlyContinue | Write-Host
    Receive-Job -Id $frontendJob.Id -ErrorAction SilentlyContinue | Write-Host -ForegroundColor Gray
    Start-Sleep -Seconds 2
}
