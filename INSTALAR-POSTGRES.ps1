# ==========================================
# SOLUCAO SEM DOCKER - Instala PostgreSQL
# ==========================================

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  INSTALACAO AUTOMATICA DO POSTGRESQL" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se PostgreSQL ja esta instalado
$pgInstalled = Test-Path "C:\Program Files\PostgreSQL\*\bin\psql.exe"

if (-not $pgInstalled) {
    Write-Host "PostgreSQL nao encontrado. Iniciando instalacao..." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "INSTRUCOES DURANTE A INSTALACAO:" -ForegroundColor Yellow
    Write-Host "1. Senha do superusuario: postgres" -ForegroundColor White
    Write-Host "2. Porta: 5432" -ForegroundColor White
    Write-Host "3. Locale: Portuguese, Brazil" -ForegroundColor White
    Write-Host ""
    Write-Host "Baixando PostgreSQL..." -ForegroundColor Cyan
    
    $installerUrl = "https://get.enterprisedb.com/postgresql/postgresql-16.1-1-windows-x64.exe"
    $installerPath = "$env:TEMP\postgresql-installer.exe"
    
    Invoke-WebRequest -Uri $installerUrl -OutFile $installerPath
    
    Write-Host "Executando instalador..." -ForegroundColor Cyan
    Write-Host "IMPORTANTE: Use a senha 'postgres' quando solicitado!" -ForegroundColor Yellow
    
    Start-Process $installerPath -Wait
    
    Write-Host ""
    Write-Host "Instalacao concluida!" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host "PostgreSQL ja esta instalado!" -ForegroundColor Green
}

# Aguardar servico PostgreSQL iniciar
Write-Host "Aguardando servico PostgreSQL..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Criar banco de dados
Write-Host "Criando banco 'crm_nexo'..." -ForegroundColor Yellow

$env:PGPASSWORD = "postgres"
& "C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -c "CREATE DATABASE crm_nexo;" 2>$null

if ($LASTEXITCODE -eq 0) {
    Write-Host "Banco criado com sucesso!" -ForegroundColor Green
} else {
    Write-Host "Banco ja existe ou erro ao criar (normal se ja existir)" -ForegroundColor Yellow
}

# Criar tabelas
Write-Host ""
Write-Host "Criando estrutura do banco..." -ForegroundColor Yellow
Set-Location "$PSScriptRoot\apps\backend"
npx prisma db push --skip-generate 2>$null
Write-Host "Tabelas criadas!" -ForegroundColor Green

# Iniciar backend
Write-Host ""
Write-Host "================================================================" -ForegroundColor Green
Write-Host "  SISTEMA PRONTO!" -ForegroundColor Green
Write-Host "================================================================" -ForegroundColor Green
Write-Host ""
Write-Host "  Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "  Backend:  http://localhost:4000" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Login: admin@nexo.com / admin123" -ForegroundColor Yellow
Write-Host ""

$env:DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/crm_nexo"
npm run dev
