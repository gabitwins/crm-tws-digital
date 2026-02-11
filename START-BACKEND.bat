@echo off
title CRM TWS - Backend
cd "%~dp0apps\backend"
echo ========================================
echo   BACKEND iniciando na porta 4000...
echo ========================================
npm run dev
pause
