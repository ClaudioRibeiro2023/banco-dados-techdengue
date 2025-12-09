@echo off
REM Executar Dashboard CISARP Enterprise

echo ========================================
echo DASHBOARD CISARP - ENTERPRISE GRADE
echo ========================================
echo.

cd /d "%~dp0"

REM Verificar Python
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERRO] Python nao encontrado!
    pause
    exit /b 1
)

echo [1/2] Verificando dependencias...
pip show streamlit >nul 2>&1
if errorlevel 1 (
    echo Instalando dependencias...
    pip install streamlit plotly pandas numpy pydantic loguru pydantic-settings
)

echo.
echo [2/2] Iniciando dashboard...
echo.
echo ========================================
echo Dashboard abrira em: http://localhost:8501
echo Pressione CTRL+C para encerrar
echo ========================================
echo.

cd dashboard
streamlit run app.py

pause
