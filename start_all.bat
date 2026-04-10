@echo off
title Health Platform Launcher

echo ============================================
echo   Health Platform - Starting all servers
echo ============================================
echo.

:: Start Screening (port 5000)
echo [1/3] Starting Doctor Screening on port 2030...
start "Screening - port 2030" cmd /k "cd /d %~dp0Screening && python app.py"

:: Start Resubmission (port 2200)
echo [2/3] Starting Resubmission Copilot on port 2200...
start "Resubmission - port 2200" cmd /k "cd /d %~dp0Resubmission && python flask_app.py"

:: Small delay then start portal
timeout /t 2 /nobreak >nul

:: Start Portal (port 8080)
echo [3/3] Starting Portal on port 8080...
start "Portal - port 2020" cmd /k "cd /d %~dp0 && python portal.py"

timeout /t 3 /nobreak >nul

echo.
echo ============================================
echo   All servers started!
echo   Open: http://localhost:2020
echo ============================================
echo.

:: Open browser
start http://localhost:2020

pause
