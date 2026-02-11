@echo off
echo ========================================
echo   CRM TWS DIGITAL - Iniciando Sistema
echo ========================================
echo.

echo [1/2] Iniciando Backend (porta 4000)...
start "Backend" cmd /k "cd apps\backend && npm run dev"
timeout /t 5 /nobreak >nul

echo [2/2] Iniciando Frontend (porta 3000)...
start "Frontend" cmd /k "cd apps\frontend && npm run dev"

echo.
echo ========================================
echo   Sistema iniciado com sucesso!
echo ========================================
echo.
echo Backend:  http://localhost:4000
echo Frontend: http://localhost:3000
echo.
echo Login: admin@nexo.com
echo Senha: admin123
echo.
echo Pressione qualquer tecla para sair...
pause >nul
