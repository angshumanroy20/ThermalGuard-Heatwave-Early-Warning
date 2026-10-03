@echo off
title ThermalGuard - Live Public Deployment
echo ======================================================================
echo   ThermalGuard: Extreme Heatwave Early Warning Platform
echo   Unified Full-Stack Live Cloudflare Tunnel
echo ======================================================================
echo.
echo [1/2] Starting FastAPI Backend + React Frontend on Port 8000...
start "ThermalGuard Backend" .\python_embed\python.exe -m uvicorn backend.main:app --host 127.0.0.1 --port 8000
timeout /t 3 /nobreak >nul
echo.
echo [2/2] Generating secure public HTTPS URL via Cloudflare Tunnel...
echo Look for the 'https://*.trycloudflare.com' link below to share with judges or users:
echo.
.\cloudflared.exe tunnel --url http://127.0.0.1:8000
pause
