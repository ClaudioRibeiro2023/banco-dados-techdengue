@echo off
echo ========================================
echo   TechDengue Analytics v6.0
echo   NOVO DASHBOARD - REDESIGN TOTAL
echo ========================================
echo.
echo Iniciando dashboard reformulado...
echo.

cd /d "%~dp0"
python -m streamlit run dashboard\app_v6_novo.py --server.port 8502

pause
