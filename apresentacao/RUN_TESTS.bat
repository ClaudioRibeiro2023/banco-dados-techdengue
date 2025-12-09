@echo off
REM Script para executar testes do Dashboard CISARP
REM Versão: 1.0.0

echo ========================================
echo  Dashboard CISARP - Test Suite
echo ========================================
echo.

REM Verificar se pytest está instalado
python -c "import pytest" 2>nul
if %errorlevel% neq 0 (
    echo [ERRO] pytest não está instalado!
    echo Instalando pytest...
    pip install pytest pytest-cov
    echo.
)

echo [INFO] Executando testes...
echo.

REM Executar todos os testes
pytest tests/ -v --tb=short

echo.
echo ========================================
echo  Testes concluídos!
echo ========================================
echo.

REM Manter janela aberta
pause
