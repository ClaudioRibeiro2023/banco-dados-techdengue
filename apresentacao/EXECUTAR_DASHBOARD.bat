@echo off
REM Script para executar Dashboard CISARP
REM Windows Batch

echo ========================================
echo DASHBOARD INTERATIVO - CISARP
echo ========================================
echo.

REM Verificar Python
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERRO] Python nao encontrado!
    pause
    exit /b 1
)

echo [1/3] Verificando dependencias...
pip show streamlit >nul 2>&1
if errorlevel 1 (
    echo Instalando Streamlit...
    pip install -r requirements_dashboard.txt
)

echo.
echo [2/3] Preparando dados...
if not exist "dados\cisarp_dados_validados.csv" (
    echo [AVISO] Dados nao encontrados. Executando preparacao...
    python 02_analise_cisarp.py
    python 04_analise_impacto_epidemiologico.py
)

echo.
echo [3/3] Iniciando dashboard...
echo.
echo ========================================
echo Dashboard abrira em: http://localhost:8501
echo Pressione CTRL+C para encerrar
echo ========================================
echo.

streamlit run dashboard_cisarp.py

pause
