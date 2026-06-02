@echo off
title NI Admin Server
echo ============================================
echo   Naoussi Industries OS - Admin Portal
echo ============================================
echo.
echo [1/2] Installing dependencies...
cd /d "%~dp0"
cd backend
call npm install >nul 2>&1
cd ..
echo [2/2] Building frontend...
cd frontend
call npm install >nul 2>&1
call npx vite build >nul 2>&1
cd ..
echo.
echo Starting server at http://localhost:3001
echo.
cd backend
node src/server.js
pause
