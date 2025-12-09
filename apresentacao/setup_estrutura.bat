@echo off
REM Setup Estrutura Dashboard CISARP

echo ========================================
echo CRIANDO ESTRUTURA DE PASTAS
echo ========================================

cd /d "%~dp0"

REM Dashboard folders
mkdir dashboard\config 2>nul
mkdir dashboard\core 2>nul
mkdir dashboard\shared 2>nul
mkdir dashboard\modules 2>nul
mkdir dashboard\pages 2>nul
mkdir dashboard\utils 2>nul
mkdir dashboard\assets 2>nul

REM Data folders
mkdir dados\cache 2>nul
mkdir dados\exports 2>nul
mkdir dados\logs 2>nul

echo.
echo ========================================
echo ESTRUTURA CRIADA COM SUCESSO!
echo ========================================
echo.
echo Dashboard:
echo   - config/
echo   - core/
echo   - shared/
echo   - modules/
echo   - pages/
echo   - utils/
echo   - assets/
echo.
echo Dados:
echo   - cache/
echo   - exports/
echo   - logs/
echo.
echo Pronto para Fase 1: Core System
echo ========================================

pause
