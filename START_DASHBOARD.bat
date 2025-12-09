@echo off
REM ============================================
REM TechDengue Analytics - Dashboard Launcher
REM Design System v3.0.0
REM ============================================

echo.
echo ============================================
echo  TechDengue Analytics Dashboard
echo  Design System v3.0.0
echo ============================================
echo.

REM Verificar se estamos no diretório correto
if not exist "dashboard\app.py" (
    echo [ERRO] Arquivo dashboard\app.py nao encontrado!
    echo Execute este script na raiz do projeto.
    pause
    exit /b 1
)

echo [1/3] Verificando dependencias...
python -c "import streamlit, plotly, pandas" 2>nul
if errorlevel 1 (
    echo [AVISO] Algumas dependencias podem estar faltando.
    echo Instalando dependencias...
    pip install -r dashboard\requirements.txt
)

echo [2/3] Limpando cache do Streamlit...
streamlit cache clear

echo [3/3] Iniciando dashboard...
echo.
echo ============================================
echo  Dashboard iniciando em:
echo  http://localhost:8501
echo ============================================
echo.
echo Abrindo navegador automaticamente...
echo Pressione Ctrl+C para parar o servidor
echo.

REM Abrir navegador automaticamente após 3 segundos
start "" timeout /t 3 /nobreak && start http://localhost:8501

python -m streamlit run dashboard\app.py --server.headless false

pause
