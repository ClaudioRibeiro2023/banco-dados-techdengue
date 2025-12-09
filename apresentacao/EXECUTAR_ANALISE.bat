@echo off
REM Script para executar análise completa do CISARP
REM Windows Batch

echo ========================================
echo ANALISE CISARP - EXECUCAO COMPLETA
echo ========================================
echo.

REM Verificar se Python está instalado
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERRO] Python nao encontrado!
    echo Por favor, instale Python 3.8+ antes de continuar.
    pause
    exit /b 1
)

echo [OK] Python detectado
echo.

REM Instalar dependências
echo [1/4] Instalando dependencias...
pip install -r requirements.txt --quiet
if errorlevel 1 (
    echo [AVISO] Erro ao instalar algumas dependencias
    echo Continuando mesmo assim...
)
echo.

REM Fase 1: Validação
echo [2/4] Executando FASE 1 - Validacao de Dados...
python 01_validacao_dados.py
if errorlevel 1 (
    echo [ERRO] Falha na validacao!
    pause
    exit /b 1
)
echo.

REM Fase 2: Análise
echo [3/4] Executando FASE 2 - Analise Exploratoria...
python 02_analise_cisarp.py
if errorlevel 1 (
    echo [ERRO] Falha na analise!
    pause
    exit /b 1
)
echo.

REM Fase 3: Visualizações
echo [4/4] Executando FASE 3 - Geracao de Visualizacoes...
python 03_visualizacoes.py
if errorlevel 1 (
    echo [ERRO] Falha ao gerar visualizacoes!
    pause
    exit /b 1
)
echo.

echo ========================================
echo ANALISE CONCLUIDA COM SUCESSO!
echo ========================================
echo.
echo Arquivos gerados:
echo   - dados/cisarp_completo.csv
echo   - dados/cisarp_metricas.json
echo   - visualizacoes/index.html
echo.
echo Abra o arquivo "visualizacoes/index.html" no navegador
echo.

REM Abrir index automaticamente
start visualizacoes\index.html

pause
