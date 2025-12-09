@echo off
echo ========================================
echo   MONITOR DE QUALIDADE DE DADOS
echo   TechDengue Data Quality Dashboard
echo ========================================
echo.
echo Iniciando monitor de qualidade...
echo.

cd /d "%~dp0"
python -m streamlit run dashboard\monitor_qualidade.py

pause
