@echo off
title CRM TWS - Frontend
cd "%~dp0apps\frontend"
echo ========================================
echo   FRONTEND iniciando na porta 3000...
echo ========================================
echo.
echo Aguarde 30 segundos e acesse:
echo http://localhost:3000
echo.
npm run dev
pause
