@echo off
setlocal

:: =============================================
:: TechDengue Dashboard - Production Deploy
:: =============================================

title TechDengue Dashboard - Deploy

set CONTAINER_NAME=techdengue-dashboard
set PORT=9000
set MAX_ATTEMPTS=45

cls
echo.
echo ===============================================================
echo        TechDengue Dashboard - Production Deploy
echo ===============================================================
echo.

:: =============================================
:: FASE 1: PREREQUISITOS
:: =============================================
echo [FASE 1/6] Verificando prerequisitos...
echo ---------------------------------------------------------------

echo   Verificando Docker...
docker --version >nul 2>&1
if errorlevel 1 (
    echo   [ERRO] Docker nao encontrado!
    goto :falhou
)
echo   [OK] Docker instalado

docker info >nul 2>&1
if errorlevel 1 (
    echo   [AVISO] Docker nao esta rodando. Iniciando...
    start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"
    echo   Aguardando 30 segundos...
    timeout /t 30 /nobreak >nul
    docker info >nul 2>&1
    if errorlevel 1 (
        echo   [ERRO] Docker nao iniciou. Inicie manualmente.
        goto :falhou
    )
)
echo   [OK] Docker rodando

docker compose version >nul 2>&1
if errorlevel 1 (
    echo   [ERRO] Docker Compose nao encontrado!
    goto :falhou
)
echo   [OK] Docker Compose

echo.

:: =============================================
:: FASE 2: ARQUIVOS
:: =============================================
echo [FASE 2/6] Verificando arquivos...
echo ---------------------------------------------------------------

cd /d "%~dp0"
echo   Diretorio: %CD%

if not exist Dockerfile (
    echo   [ERRO] Dockerfile nao encontrado!
    goto :falhou
)
echo   [OK] Dockerfile

if not exist docker-compose.yml (
    echo   [ERRO] docker-compose.yml nao encontrado!
    goto :falhou
)
echo   [OK] docker-compose.yml

if not exist package.json (
    echo   [ERRO] package.json nao encontrado!
    goto :falhou
)
echo   [OK] package.json

if not exist src (
    echo   [ERRO] Diretorio src nao encontrado!
    goto :falhou
)
echo   [OK] src/

echo.

:: =============================================
:: FASE 3: LIMPEZA
:: =============================================
echo [FASE 3/6] Limpando ambiente...
echo ---------------------------------------------------------------

docker compose down --remove-orphans >nul 2>&1
docker stop %CONTAINER_NAME% >nul 2>&1
docker rm -f %CONTAINER_NAME% >nul 2>&1
echo   [OK] Containers limpos

echo.

:: =============================================
:: FASE 4: BUILD
:: =============================================
echo [FASE 4/6] Construindo imagem Docker...
echo ---------------------------------------------------------------
echo   Isso pode levar alguns minutos...
echo.

docker compose build
if errorlevel 1 (
    echo   [ERRO] Falha no build!
    goto :falhou
)

echo.
echo   [OK] Imagem construida
echo.

:: =============================================
:: FASE 5: INICIAR
:: =============================================
echo [FASE 5/6] Iniciando container...
echo ---------------------------------------------------------------

docker compose up -d
if errorlevel 1 (
    echo   [ERRO] Falha ao iniciar!
    docker compose logs --tail=20
    goto :falhou
)

timeout /t 3 /nobreak >nul
echo   [OK] Container iniciado
echo.

:: =============================================
:: FASE 6: VALIDACAO
:: =============================================
echo [FASE 6/6] Validando aplicacao...
echo ---------------------------------------------------------------

set attempts=0

:loop
set /a attempts=attempts+1
if %attempts% gtr %MAX_ATTEMPTS% (
    echo   [ERRO] Timeout!
    docker compose logs --tail=15
    goto :falhou
)

echo   Tentativa %attempts%/%MAX_ATTEMPTS%...
timeout /t 2 /nobreak >nul

curl -s http://localhost:%PORT% >nul 2>&1
if not errorlevel 1 goto :ok

powershell -Command "Invoke-WebRequest -Uri 'http://localhost:%PORT%' -UseBasicParsing -TimeoutSec 3" >nul 2>&1
if not errorlevel 1 goto :ok

goto :loop

:ok
echo   [OK] Aplicacao respondendo!
echo.

:: =============================================
:: SUCESSO
:: =============================================
echo ===============================================================
echo              DEPLOY CONCLUIDO COM SUCESSO!
echo ===============================================================
echo.
echo   URL: http://localhost:%PORT%
echo.
echo   Credenciais:
echo   Email: teste@techdengue.com
echo   Senha: senha123
echo.
echo   Comandos:
echo   - docker compose logs -f   (ver logs)
echo   - docker compose down      (parar)
echo   - docker compose restart   (reiniciar)
echo.
echo   Logs recentes:
echo   ---------------------------------------------------------------
docker compose logs --tail=8
echo.

start "" http://localhost:%PORT%

echo.
echo   Concluido!
pause
exit /b 0

:: =============================================
:: FALHOU
:: =============================================
:falhou
echo.
echo ===============================================================
echo                     DEPLOY FALHOU
echo ===============================================================
echo.
echo   Verifique:
echo   1. Docker Desktop esta rodando?
echo   2. Execute: docker compose logs
echo   3. Tente: docker compose build --no-cache
echo.
docker compose logs --tail=15 2>nul
pause
exit /b 1
