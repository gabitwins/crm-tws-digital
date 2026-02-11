# Iniciar apenas o BACKEND
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  INICIANDO BACKEND - Porta 4000" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se PostgreSQL está rodando
Write-Host "Verificando PostgreSQL..." -ForegroundColor Yellow
try {
    $pgCheck = docker ps --filter "name=crm-postgres" --format "{{.Names}}"
    if ($pgCheck -eq "crm-postgres") {
        Write-Host "✓ PostgreSQL já está rodando!" -ForegroundColor Green
    } else {
        Write-Host "Iniciando PostgreSQL..." -ForegroundColor Yellow
        docker start crm-postgres 2>&1 | Out-Null
        if ($LASTEXITCODE -ne 0) {
            Write-Host "Criando container PostgreSQL..." -ForegroundColor Yellow
            docker run --name crm-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=crm_nexo -p 5432:5432 -d postgres
        }
        Start-Sleep -Seconds 5
        Write-Host "✓ PostgreSQL iniciado!" -ForegroundColor Green
    }
} catch {
    Write-Host "✗ Erro ao iniciar PostgreSQL. Certifique-se que Docker Desktop está rodando." -ForegroundColor Red
    Write-Host "  Inicie manualmente: docker run --name crm-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=crm_nexo -p 5432:5432 -d postgres" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Iniciando servidor backend..." -ForegroundColor Yellow
Set-Location "$PSScriptRoot\apps\backend"
npm run dev
