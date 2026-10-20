@echo off
setlocal enabledelayedexpansion
title SPARC AgriSense AI - Real-Time GitHub & Web Sync

echo =====================================================================
echo   🌿 SPARC AgriSense AI - GitHub & Live Website Sync Engine
echo   Repository: https://github.com/Shikhar28007/SPARC--agri_sense
echo =====================================================================
echo.
echo Choose an option:
echo   [1] Sync and Push to GitHub NOW (Immediate Update)
echo   [2] Start Real-Time Auto-Watcher (Auto-pushes whenever files change)
echo   [3] Exit
echo.

set /p OPTION="Enter choice (1, 2, or 3) [Default 1]: "
if "%OPTION%"=="" set OPTION=1

if "%OPTION%"=="2" (
    echo.
    echo Starting Real-Time Background Watcher...
    python auto_sync_watcher.py
    pause
    exit /b
)

if "%OPTION%"=="3" (
    exit /b
)

echo.
set /p MSG="Enter commit description (Press Enter for auto-timestamp): "
if "!MSG!"=="" (
    for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value 2^>nul') do set DT=%%I
    set MSG=auto-sync: update project !DT:~0,4!-!DT:~4,2!-!DT:~6,2! !DT:~8,2!:!DT:~10,2!
)

echo.
echo [1/4] Staging all files...
git add -A

echo [2/4] Creating commit: "!MSG!"...
git commit -m "!MSG!" 2>nul

echo [3/4] Pulling remote updates with rebase...
git pull --rebase origin main

echo [4/4] Pushing to GitHub (origin main)...
git push origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo =====================================================================
    echo   [SUCCESS] Pushed to GitHub successfully!
    echo   Repo: https://github.com/Shikhar28007/SPARC--agri_sense
    echo   Your connected Streamlit Cloud website will now auto-redeploy!
    echo =====================================================================
) else (
    echo.
    echo [ERROR] Push failed. Please check your GitHub credentials or connection.
)

pause
