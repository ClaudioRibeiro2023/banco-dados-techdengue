@echo off
echo ========================================
echo   ATIVANDO DASHBOARD NOVO v6.0
echo ========================================
echo.

cd /d "%~dp0"

echo [1/5] Fazendo backup do dashboard antigo...
copy /Y dashboard\app.py dashboard\app_antigo_backup.py >nul 2>&1

echo [2/5] Substituindo pelo dashboard novo...
copy /Y dashboard\app_v6_novo.py dashboard\app.py >nul 2>&1

echo [3/5] Limpando cache...
rmdir /S /Q .streamlit\cache >nul 2>&1

echo [4/5] Matando processos Streamlit antigos...
taskkill /F /IM streamlit.exe >nul 2>&1
taskkill /F /IM python.exe /FI "WINDOWTITLE eq *streamlit*" >nul 2>&1
timeout /t 2 >nul

echo [5/5] Iniciando dashboard NOVO...
echo.
echo ========================================
echo   DASHBOARD v6.0 ATIVADO!
echo ========================================
echo.
echo Aguarde 5 segundos e abra:
echo http://localhost:8501
echo.
echo IMPORTANTE: No navegador, pressione Ctrl+Shift+R
echo.

python -m streamlit run dashboard\app.py

pause
