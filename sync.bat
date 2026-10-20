@echo off
setlocal enabledelayedexpansion

echo ========================================================
echo   SPARC AgriSense AI - One-Click GitHub & Web Sync
echo ========================================================
echo.

set /p MSG="Enter commit message (Press Enter for auto-update): "
if "!MSG!"=="" (
    for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set DT=%%I
    set MSG=auto-sync: update project !DT:~0,4!-!DT:~4,2!-!DT:~6,2! !DT:~8,2!:!DT:~10,2!
)

echo [1/3] Staging all modified and new project files...
git add -A

echo [2/3] Creating commit: "!MSG!"...
git commit -m "!MSG!"

echo [3/3] Pushing to GitHub (main)...
git push origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================================
    echo   [SUCCESS] Pushed to GitHub successfully!
    echo   Your connected live website (Streamlit Cloud) will
    echo   now auto-redeploy in real-time within ~30-60 seconds!
    echo ========================================================
) else (
    echo.
    echo [ERROR] Push failed. Please check your GitHub login or connection.
)

pause
