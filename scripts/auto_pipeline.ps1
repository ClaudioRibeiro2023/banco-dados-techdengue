#requires -Version 5.1
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

# Orquestração do pipeline TechDengue (Windows PowerShell)
# - A0: Pré-checagens
# - A1: (Opcional) Bootstrap de roles/usuário no Warehouse via psql
# - A2: Ingestão no Warehouse (fato)
# - A3: Validação da tabela no Warehouse
# - A4: Materialização GOLD (analise_integrada)
# - A5: Smoke da API (health + gold/analise)

$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$dotenvPath = Join-Path $root '.env'
$sqlInitPath = Join-Path $root 'scripts/sql/init_warehouse.sql'
$sqlGisInitPath = Join-Path $root 'scripts/sql/init_gis.sql'
$sqlGisSchemaPath = Join-Path $root 'scripts/sql/gis_schema.sql'

function Write-Section($title) {
  Write-Host "`n==== $title ====`n" -ForegroundColor Cyan
}

function Confirm-Step($message, [string]$default='Y') {
  $suffix = if ($default -match '^(Y|y)$') { '[Y/n]' } else { '[y/N]' }
  $resp = Read-Host "$message $suffix"
  if ([string]::IsNullOrWhiteSpace($resp)) { $resp = $default }
  return ($resp -match '^(Y|y)$')
}

function Ensure-Cmd($name) {
  if (-not (Get-Command $name -ErrorAction SilentlyContinue)) {
    throw "Comando não encontrado: $name"
  }
}

function Exec($file, $argList) {
  $p = Start-Process -FilePath $file -ArgumentList $argList -WorkingDirectory $root -NoNewWindow -Wait -PassThru
  if ($p.ExitCode -ne 0) { throw "Falha ao executar: $file $argList (ExitCode=$($p.ExitCode))" }
}

function Parse-DotEnv($path) {
  $map = @{}
  if (-not (Test-Path $path)) { return $map }
  Get-Content -Path $path | ForEach-Object {
    $line = $_.Trim()
    if ($line -eq '' -or $line.StartsWith('#')) { return }
    $idx = $line.IndexOf('=')
    if ($idx -lt 1) { return }
    $k = $line.Substring(0, $idx).Trim()
    $v = $line.Substring($idx + 1).Trim().Trim('"')
    $map[$k] = $v
  }
  return $map
}

function Assert-Sql-NoPlaceholder($path) {
  $raw = Get-Content -Path $path -Raw
  if ($raw -match '<SENHA_FORTE>') {
    throw "Arquivo contém placeholder <SENHA_FORTE>. Substitua por uma senha robusta antes de executar: $path"
  }
}

Write-Section 'A0: Pré-checagens'
Ensure-Cmd 'python'
python --version

if (-not (Test-Path $root)) { throw "Pasta raiz não encontrada: $root" }
if (-not (Test-Path $dotenvPath)) {
  Write-Warning "Arquivo .env não encontrado em $dotenvPath. Prosseguir assim mesmo?"
  if (-not (Confirm-Step 'Continuar sem .env?' 'N')) { throw 'Abortado pelo usuário' }
}

# Checar libs principais
python -c "import pandas, fastapi, uvicorn, pyarrow; print('deps_ok')" | Out-Null

$envs = Parse-DotEnv $dotenvPath

# Checagem mínima de variáveis
$neededWh = @('WAREHOUSE_DB_HOST','WAREHOUSE_DB_NAME','WAREHOUSE_DB_USERNAME','WAREHOUSE_DB_PASSWORD')
$missingWh = @()
foreach ($k in $neededWh) { if (-not $envs.ContainsKey($k)) { $missingWh += $k } }
if ($missingWh.Count -gt 0) {
  Write-Warning ("Variáveis do Warehouse ausentes no .env: " + ($missingWh -join ', '))
  if (-not (Confirm-Step 'Continuar mesmo assim? (você pode inserir manualmente no provedor/psql)' 'N')) { throw 'Abortado pelo usuário' }
}

$neededGis = @('GIS_DB_HOST','GIS_DB_NAME','GIS_DB_USERNAME','GIS_DB_PASSWORD')
$missingGis = @()
foreach ($k in $neededGis) { if (-not $envs.ContainsKey($k)) { $missingGis += $k } }
if ($missingGis.Count -gt 0) {
  Write-Warning ("Variáveis do GIS ausentes no .env: " + ($missingGis -join ', '))
  if (-not (Confirm-Step 'Continuar mesmo assim? (você pode inserir manualmente no provedor/psql)' 'N')) { throw 'Abortado pelo usuário' }
}

if (-not (Confirm-Step 'Prosseguir para A1 (opcional) criação de roles/usuário no Warehouse?' 'N')) {
  Write-Host 'Pulando A1.' -ForegroundColor Yellow
} else {
  Write-Section 'A1: Criar roles/usuário (td_writer/td_app) no Warehouse'
  if (-not (Test-Path $sqlInitPath)) { throw "Script SQL não encontrado: $sqlInitPath" }
  Assert-Sql-NoPlaceholder $sqlInitPath
  if (-not (Get-Command 'psql' -ErrorAction SilentlyContinue)) {
    Write-Warning 'psql não encontrado no PATH. Instale o cliente do PostgreSQL ou rode esta etapa manualmente.'
  } else {
    $dbHost = if ($envs.ContainsKey('WAREHOUSE_DB_HOST')) { $envs['WAREHOUSE_DB_HOST'] } else { Read-Host 'Host do Warehouse' }
    $db = if ($envs.ContainsKey('WAREHOUSE_DB_NAME')) { $envs['WAREHOUSE_DB_NAME'] } else { Read-Host 'Database do Warehouse (ex.: techdengue_wh)' }
    $port = if ($envs.ContainsKey('WAREHOUSE_DB_PORT')) { $envs['WAREHOUSE_DB_PORT'] } else { '5432' }
    $adminUser = Read-Host 'Usuário admin para executar psql (NÃO é td_app)'
    Write-Host 'O psql solicitará a senha do usuário admin de forma segura.' -ForegroundColor Yellow
    $psqlArgs = @('-h', $dbHost, '-p', $port, '-U', $adminUser, '-d', $db, '-f', $sqlInitPath)
    Exec 'psql' $psqlArgs
  }
}

if (-not (Confirm-Step 'Prosseguir para A1-GIS (opcional) bootstrap do banco GIS (roles + schema)?' 'N')) {
  Write-Host 'Pulando A1-GIS.' -ForegroundColor Yellow
} else {
  Write-Section 'A1-GIS: Bootstrap do banco GIS (roles/usuario + schema)'
  if (-not (Test-Path $sqlGisInitPath)) { throw "Script SQL não encontrado: $sqlGisInitPath" }
  if (-not (Test-Path $sqlGisSchemaPath)) { throw "Script SQL não encontrado: $sqlGisSchemaPath" }
  Assert-Sql-NoPlaceholder $sqlGisInitPath
  if (-not (Get-Command 'psql' -ErrorAction SilentlyContinue)) {
    Write-Warning 'psql não encontrado no PATH. Instale o cliente do PostgreSQL ou rode esta etapa manualmente.'
  } else {
    $dbHost = if ($envs.ContainsKey('GIS_DB_HOST')) { $envs['GIS_DB_HOST'] } else { Read-Host 'Host do GIS' }
    $db = if ($envs.ContainsKey('GIS_DB_NAME')) { $envs['GIS_DB_NAME'] } else { Read-Host 'Database do GIS' }
    $port = if ($envs.ContainsKey('GIS_DB_PORT')) { $envs['GIS_DB_PORT'] } else { '5432' }
    $adminUser = Read-Host 'Usuário admin para executar psql (NÃO é td_app)'
    Write-Host 'O psql solicitará a senha do usuário admin de forma segura.' -ForegroundColor Yellow
    $psqlArgs1 = @('-h', $dbHost, '-p', $port, '-U', $adminUser, '-d', $db, '-f', $sqlGisInitPath)
    Exec 'psql' $psqlArgs1
    $psqlArgs2 = @('-h', $dbHost, '-p', $port, '-U', $adminUser, '-d', $db, '-f', $sqlGisSchemaPath)
    Exec 'psql' $psqlArgs2
  }
}

Write-Section 'A2: Ingestão no Warehouse (fato_atividades_techdengue)'
if (Confirm-Step 'Executar ingestão no Warehouse agora?' 'Y') {
  Exec 'python' @('scripts/cli/gis_cli.py', 'warehouse-ingest')
} else { Write-Host 'Pulando A2.' -ForegroundColor Yellow }

Write-Section 'A3: Validação da tabela (contagem + amostra)'
if (Confirm-Step 'Validar tabela agora?' 'Y') {
  Exec 'python' @('scripts/cli/gis_cli.py', 'warehouse-validate', '--sample')
} else { Write-Host 'Pulando A3.' -ForegroundColor Yellow }

Write-Section 'A3b: Análise de qualidade (parquets + caches)'
if (Confirm-Step 'Executar análise de qualidade agora?' 'Y') {
  Exec 'python' @('scripts/analyze_data_quality.py')
} else { Write-Host 'Pulando A3b.' -ForegroundColor Yellow }

Write-Section 'A4: Materialização GOLD (analise_integrada)'
if (Confirm-Step 'Materializar GOLD agora?' 'Y') {
  $pyCode = 'from src.materialize import materialize_gold_analise; import json; result=materialize_gold_analise(); print(json.dumps(result, ensure_ascii=False))'
  Exec 'python' @('-c', $pyCode)
} else { Write-Host 'Pulando A4.' -ForegroundColor Yellow }

Write-Section 'A5: Smoke da API (health + gold/analise)'
if (Confirm-Step 'Executar smoke da API agora?' 'Y') {
  $apiArgs = '-m uvicorn src.api.app:app --host 127.0.0.1 --port 8001'
  $apiProc = Start-Process -FilePath 'python' -ArgumentList $apiArgs -WorkingDirectory $root -NoNewWindow -PassThru
  try {
    # Aguardar ficar de pé
    $ok = $false
    for ($i=0; $i -lt 20; $i++) {
      Start-Sleep -Seconds 1
      try {
        $resp = Invoke-WebRequest -Uri 'http://127.0.0.1:8001/health' -UseBasicParsing -TimeoutSec 3
        if ($resp.StatusCode -eq 200) { $ok = $true; break }
      } catch { }
    }
    if (-not $ok) { throw 'API não respondeu ao /health a tempo' }

    Write-Host '✓ /health OK' -ForegroundColor Green
    $gold = Invoke-WebRequest -Uri 'http://127.0.0.1:8001/gold/analise?limit=5' -UseBasicParsing -TimeoutSec 5
    Write-Host "✓ /gold/analise OK (len=$($gold.Content.Length))" -ForegroundColor Green
  } finally {
    if ($apiProc -and !$apiProc.HasExited) { Stop-Process -Id $apiProc.Id -Force }
  }
} else { Write-Host 'Pulando A5.' -ForegroundColor Yellow }

Write-Section 'Concluído'
Write-Host 'Pipeline finalizado. Consulte evidências acima.' -ForegroundColor Green
