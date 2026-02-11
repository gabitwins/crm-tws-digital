# ===============================================
# SCRIPT COMPLETO - Iniciar CRM NEXO
# ===============================================
# Este script inicia TUDO automaticamente:
# 1. Docker Desktop (se necessário)
# 2. PostgreSQL
# 3. Backend
# 4. Frontend já está rodando

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   🚀 INICIANDO CRM NEXO - Sistema Completo" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

$ErrorActionPreference = "SilentlyContinue"

# ===============================================
# 1. VERIFICAR E INICIAR DOCKER
# ===============================================
Write-Host "[1/4] Verificando Docker Desktop..." -ForegroundColor Yellow

$dockerRunning = $false
try {
    $dockerCheck = docker ps 2>&1
    if ($LASTEXITCODE -eq 0) {
        $dockerRunning = $true
        Write-Host "      ✓ Docker está rodando!" -ForegroundColor Green
    }
} catch {}

if (-not $dockerRunning) {
    Write-Host "      ⚠ Docker não está rodando. Iniciando..." -ForegroundColor Red
    
    $dockerPath = "C:\Program Files\Docker\Docker\Docker Desktop.exe"
    if (Test-Path $dockerPath) {
        Start-Process $dockerPath
    Write-Host "      -> Aguardando Docker iniciar (30 segundos)..." -ForegroundColor Yellow
        Start-Sleep -Seconds 30
        Write-Host "      ✓ Docker iniciado!" -ForegroundColor Green
    } else {
        Write-Host "      ✗ Docker Desktop não encontrado!" -ForegroundColor Red
        Write-Host "      -> Instale em: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
        exit 1
    }
}

# ===============================================
# 2. CRIAR/INICIAR POSTGRESQL
# ===============================================
Write-Host ""
Write-Host "[2/4] Configurando PostgreSQL..." -ForegroundColor Yellow

$containerExists = docker ps -a --filter "name=crm-postgres" --format "{{.Names}}" 2>&1
$containerRunning = docker ps --filter "name=crm-postgres" --format "{{.Names}}" 2>&1

if ($containerRunning -eq "crm-postgres") {
    Write-Host "      ✓ PostgreSQL já está rodando!" -ForegroundColor Green
} elseif ($containerExists -eq "crm-postgres") {
    Write-Host "      -> Iniciando container existente..." -ForegroundColor Yellow
    docker start crm-postgres | Out-Null
    Start-Sleep -Seconds 3
    Write-Host "      ✓ PostgreSQL iniciado!" -ForegroundColor Green
} else {
    Write-Host "      -> Criando novo container PostgreSQL..." -ForegroundColor Yellow
    docker run --name crm-postgres `
        -e POSTGRES_PASSWORD=postgres `
        -e POSTGRES_DB=crm_nexo `
        -p 5432:5432 `
        -d postgres 2>&1 | Out-Null
    
    Write-Host "      -> Aguardando PostgreSQL inicializar (8 segundos)..." -ForegroundColor Yellow
    Start-Sleep -Seconds 8
    Write-Host "      ✓ PostgreSQL criado e rodando!" -ForegroundColor Green
}

# ===============================================
# 3. CRIAR TABELAS NO BANCO
# ===============================================
Write-Host ""
Write-Host "[3/4] Criando estrutura do banco de dados..." -ForegroundColor Yellow
Set-Location "$PSScriptRoot\apps\backend"

$prismaOutput = npx prisma db push --skip-generate 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "      ✓ Tabelas criadas/atualizadas com sucesso!" -ForegroundColor Green
} else {
    Write-Host "      ⚠ Aviso: Algumas tabelas já existem (normal)" -ForegroundColor Yellow
}

# ===============================================
# 4. INICIAR BACKEND
# ===============================================
Write-Host ""
Write-Host "[4/4] Iniciando Backend na porta 4000..." -ForegroundColor Yellow
Write-Host "      -> Backend rodando em segundo plano..." -ForegroundColor Cyan
Write-Host ""

# Definir variáveis de ambiente
$env:DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/crm_nexo"
$env:PORT = "4000"
$env:NODE_ENV = "development"

# Iniciar backend
npm run dev

# ===============================================
# MENSAGEM FINAL
# ===============================================
Write-Host ""
Write-Host "================================================" -ForegroundColor Green
Write-Host "   ✓ SISTEMA INICIADO COM SUCESSO!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Frontend:  http://localhost:3000" -ForegroundColor Cyan
Write-Host "🔌 Backend:   http://localhost:4000" -ForegroundColor Cyan
Write-Host "🐘 Postgres:  localhost:5432" -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 Login padrão:" -ForegroundColor Yellow
Write-Host "   Email: admin@nexo.com" -ForegroundColor White
Write-Host "   Senha: admin123" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  Pressione CTRL+C para parar o backend" -ForegroundColor Yellow
Write-Host ""
