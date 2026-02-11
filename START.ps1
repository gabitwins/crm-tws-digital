# ==========================================
# INICIAR CRM - Testa Docker ou usa alternativa
# ==========================================

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  INICIANDO CRM NEXO" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# ==========================================
# TESTAR DOCKER
# ==========================================
Write-Host "Testando Docker Desktop..." -ForegroundColor Yellow

$dockerWorks = $false
$attempt = 0
$maxAttempts = 30  # 1 minuto

while (-not $dockerWorks -and $attempt -lt $maxAttempts) {
    try {
        docker ps 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) {
            $dockerWorks = $true
            Write-Host "OK Docker funcionando!" -ForegroundColor Green
            break
        }
    } catch {}
    
    $attempt++
    if ($attempt % 10 -eq 0) {
        Write-Host "Aguardando Docker... ($attempt segundos)" -ForegroundColor Yellow
    }
    Start-Sleep -Seconds 1
}

# ==========================================
# SE DOCKER NAO FUNCIONAR
# ==========================================
if (-not $dockerWorks) {
    Write-Host ""
    Write-Host "================================================================" -ForegroundColor Red
    Write-Host "  DOCKER NAO ESTA FUNCIONANDO" -ForegroundColor Red
    Write-Host "================================================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "OPCOES:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1. Abra Docker Desktop manualmente e aguarde iniciar" -ForegroundColor White
    Write-Host "   Depois execute: .\START.ps1" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "2. OU instale PostgreSQL sem Docker (mais facil):" -ForegroundColor White
    Write-Host "   .\INSTALAR-POSTGRES.ps1" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "3. OU baixe PostgreSQL manualmente:" -ForegroundColor White
    Write-Host "   https://www.postgresql.org/download/windows/" -ForegroundColor Cyan
    Write-Host "   Senha: postgres | Porta: 5432" -ForegroundColor Gray
    Write-Host ""
    exit 1
}

# ==========================================
# CRIAR/INICIAR POSTGRESQL
# ==========================================
Write-Host ""
Write-Host "Configurando PostgreSQL..." -ForegroundColor Yellow

$containerExists = docker ps -a --filter "name=crm-postgres" --format "{{.Names}}" 2>&1
$containerRunning = docker ps --filter "name=crm-postgres" --format "{{.Names}}" 2>&1

if ($containerRunning -eq "crm-postgres") {
    Write-Host "OK PostgreSQL rodando!" -ForegroundColor Green
} elseif ($containerExists -eq "crm-postgres") {
    docker start crm-postgres | Out-Null
    Start-Sleep -Seconds 5
    Write-Host "OK PostgreSQL iniciado!" -ForegroundColor Green
} else {
    Write-Host "Criando PostgreSQL..." -ForegroundColor Yellow
    docker run --name crm-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=crm_nexo -p 5432:5432 -d postgres 2>&1 | Out-Null
    Start-Sleep -Seconds 10
    Write-Host "OK PostgreSQL criado!" -ForegroundColor Green
}

# ==========================================
# CRIAR TABELAS
# ==========================================
Write-Host ""
Write-Host "Criando tabelas..." -ForegroundColor Yellow
Set-Location "$PSScriptRoot\apps\backend"
npx prisma db push --skip-generate 2>&1 | Out-Null
Write-Host "OK Banco configurado!" -ForegroundColor Green

# ==========================================
# INICIAR BACKEND
# ==========================================
Write-Host ""
Write-Host "================================================================" -ForegroundColor Green
Write-Host "  SISTEMA RODANDO!" -ForegroundColor Green
Write-Host "================================================================" -ForegroundColor Green
Write-Host ""
Write-Host "  Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "  Backend:  http://localhost:4000" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Login: admin@nexo.com / admin123" -ForegroundColor Yellow
Write-Host ""
Write-Host "Pressione CTRL+C para parar" -ForegroundColor Gray
Write-Host ""

$env:DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/crm_nexo"
npm run dev
