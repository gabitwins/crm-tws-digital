$Uri = 'https://web-production-1d256.up.railway.app/api/auth/seed'
$Body = @{token='seed_secret_key_12345'} | ConvertTo-Json
$Headers = @{'Content-Type' = 'application/json'}

Write-Host "🌱 Executando seed no banco remoto..."

try {
  $Response = Invoke-WebRequest -Uri $Uri -Method POST -Body $Body -Headers $Headers -TimeoutSec 10
  Write-Host "✅ SUCESSO!" -ForegroundColor Green
  Write-Host $Response.Content
} catch {
  Write-Host "❌ ERRO:" -ForegroundColor Red
  Write-Host $_.Exception.Message
}
