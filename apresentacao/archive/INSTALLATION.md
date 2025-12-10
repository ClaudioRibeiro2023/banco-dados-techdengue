# 📦 Gu

ia de Instalação - Dashboard CISARP

**Dashboard CISARP Enterprise**  
**Versão:** 1.0.0  
**Data:** 01/11/2025

---

## 📋 Índice

1. [Requisitos](#requisitos)
2. [Instalação Rápida](#instalação-rápida)
3. [Instalação Detalhada](#instalação-detalhada)
4. [Configuração](#configuração)
5. [Verificação](#verificação)
6. [Troubleshooting](#troubleshooting)

---

## 🎯 Requisitos

### Sistema Operacional

- ✅ **Windows** 10/11
- ✅ **macOS** 10.15+
- ✅ **Linux** Ubuntu 20.04+

### Software

- ✅ **Python** 3.8 ou superior
- ✅ **pip** 21.0 ou superior
- ✅ **Git** (opcional, para clonar)

### Hardware Mínimo

```
CPU:    2 cores
RAM:    4 GB
Disco:  500 MB livre
```

### Hardware Recomendado

```
CPU:    4+ cores
RAM:    8+ GB
Disco:  1 GB livre
```

---

## ⚡ Instalação Rápida

### Método 1: Script Automático (Windows)

```bash
# 1. Navegue até o diretório
cd banco-dados-techdengue/apresentacao

# 2. Execute o script
.\RUN_DASHBOARD.bat
```

O script fará automaticamente:
- ✅ Verificação de Python
- ✅ Instalação de dependências
- ✅ Configuração do ambiente
- ✅ Execução do dashboard

### Método 2: Manual (Multiplataforma)

```bash
# 1. Navegue até o diretório
cd banco-dados-techdengue/apresentacao

# 2. Instale dependências
pip install -r requirements_dashboard_full.txt

# 3. Execute o dashboard
cd dashboard
streamlit run app.py
```

**Pronto!** Dashboard disponível em: `http://localhost:8501`

---

## 🔧 Instalação Detalhada

### Passo 1: Verificar Python

```bash
# Verificar versão do Python
python --version

# Deve exibir: Python 3.8.x ou superior
```

**Se não tiver Python:**
- Windows: https://www.python.org/downloads/
- macOS: `brew install python3`
- Linux: `sudo apt install python3 python3-pip`

### Passo 2: Criar Ambiente Virtual (Opcional mas Recomendado)

```bash
# Criar ambiente virtual
python -m venv venv

# Ativar (Windows)
.\venv\Scripts\activate

# Ativar (macOS/Linux)
source venv/bin/activate
```

**Vantagens do venv:**
- ✅ Isolamento de dependências
- ✅ Evita conflitos
- ✅ Facilita gestão

### Passo 3: Atualizar pip

```bash
# Atualizar pip para última versão
python -m pip install --upgrade pip
```

### Passo 4: Instalar Dependências

```bash
# Navegar até diretório
cd apresentacao

# Instalar todas as dependências
pip install -r requirements_dashboard_full.txt
```

**Dependências instaladas (~20 pacotes):**
- streamlit 1.28+
- plotly 5.17+
- pandas 2.0+
- numpy 1.24+
- pydantic 2.0+
- loguru 0.7+
- scipy 1.11+
- E mais...

**Tempo estimado:** 2-5 minutos

### Passo 5: Verificar Instalação

```bash
# Verificar Streamlit
streamlit --version

# Verificar imports
python -c "import streamlit, plotly, pandas; print('OK!')"
```

Se exibir "OK!", instalação bem-sucedida! ✅

### Passo 6: Preparar Dados

```bash
# Verificar existência dos dados
ls dados/cisarp_dados_validados.csv

# Se não existir, execute script de validação
python 01_validacao_dados.py
```

### Passo 7: Executar Dashboard

```bash
# Método 1: Script (Windows)
.\RUN_DASHBOARD.bat

# Método 2: Manual
cd dashboard
streamlit run app.py

# Método 3: Com opções
streamlit run app.py --server.port 8501 --server.address localhost
```

**Dashboard iniciará em:** `http://localhost:8501`

---

## ⚙️ Configuração

### Variáveis de Ambiente (Opcional)

Crie um arquivo `.env` no diretório `apresentacao/`:

```env
# Dashboard Settings
STREAMLIT_SERVER_PORT=8501
STREAMLIT_SERVER_ADDRESS=localhost
STREAMLIT_BROWSER_GATHER_USAGE_STATS=false

# Data Settings
DADOS_DIR=./dados
CACHE_TTL=300

# Logging
LOG_LEVEL=INFO
LOG_FILE=dashboard.log
```

### Configurações do Streamlit

Crie `.streamlit/config.toml`:

```toml
[theme]
primaryColor = "#0066CC"
backgroundColor = "#FFFFFF"
secondaryBackgroundColor = "#F0F2F6"
textColor = "#262730"
font = "sans serif"

[server]
port = 8501
enableCORS = false
enableXsrfProtection = true

[browser]
gatherUsageStats = false
```

### Configurações Avançadas

Edite `dashboard/config/settings.py`:

```python
class Settings(BaseSettings):
    # Personalizar configurações aqui
    PAGE_TITLE: str = "Dashboard CISARP"
    CACHE_TTL: int = 300  # 5 minutos
    # ...
```

---

## ✅ Verificação

### Checklist de Instalação

- [ ] Python 3.8+ instalado
- [ ] pip atualizado
- [ ] Dependências instaladas
- [ ] Dados disponíveis
- [ ] Dashboard executando
- [ ] Acesso via browser funcionando

### Executar Testes

```bash
# Verificar se tudo está ok
.\RUN_TESTS.bat

# Ou manualmente
pytest

# Resultado esperado: 31 passed
```

### Verificar Páginas

Acesse cada página do dashboard:
1. ✅ 🏠 Home
2. ✅ 📊 Performance
3. ✅ 💊 Impacto Epidemiológico
4. ✅ 🏆 Benchmarking
5. ✅ 🔍 Exploração
6. ✅ 💡 Insights

---

## 🔧 Troubleshooting

### Problema: "Python não é reconhecido"

**Solução:**
```bash
# Adicionar Python ao PATH
# Windows: Reinstalar Python marcando "Add to PATH"
# macOS/Linux: Adicionar ao .bashrc ou .zshrc
export PATH="/usr/local/bin/python3:$PATH"
```

### Problema: "pip install falha"

**Solução:**
```bash
# Atualizar pip
python -m pip install --upgrade pip

# Tentar instalar individualmente
pip install streamlit
pip install plotly
pip install pandas
```

### Problema: "ModuleNotFoundError"

**Solução:**
```bash
# Reinstalar dependências
pip install -r requirements_dashboard_full.txt --force-reinstall

# Verificar ambiente virtual ativado
# Se não, ativar: .\venv\Scripts\activate
```

### Problema: "Porta 8501 em uso"

**Solução:**
```bash
# Usar outra porta
streamlit run app.py --server.port 8502

# Ou matar processo existente (Windows)
taskkill /F /IM streamlit.exe

# macOS/Linux
pkill -f streamlit
```

### Problema: "Dados não encontrados"

**Solução:**
```bash
# Verificar caminho dos dados
ls dados/cisarp_dados_validados.csv

# Se não existir, executar validação
python 01_validacao_dados.py

# Ou verificar caminho em settings.py
```

### Problema: "Erro de memória"

**Solução:**
```bash
# Limpar cache do Streamlit
streamlit cache clear

# Reiniciar dashboard
```

### Problema: "Dashboard lento"

**Soluções:**
1. Verificar recursos do sistema
2. Limpar cache: `streamlit cache clear`
3. Reduzir TTL do cache
4. Fechar abas/apps desnecessárias

### Problema: "Gráficos não aparecem"

**Solução:**
```bash
# Verificar instalação do Plotly
pip install plotly --upgrade

# Limpar cache do browser
# Ctrl+Shift+Del (Chrome/Edge)
```

---

## 🚀 Instalação em Produção

### Streamlit Cloud

```bash
# 1. Fazer push para GitHub
git push origin main

# 2. Conectar repositório no Streamlit Cloud
# https://streamlit.io/cloud

# 3. Configurar:
# - Main file: dashboard/app.py
# - Python version: 3.11
# - Requirements: requirements_dashboard_full.txt
```

### Docker (Futuro)

```bash
# Build image
docker build -t dashboard-cisarp .

# Run container
docker run -p 8501:8501 dashboard-cisarp
```

### Servidor Local (Linux)

```bash
# Instalar como serviço systemd
sudo nano /etc/systemd/system/dashboard-cisarp.service

# Adicionar:
[Unit]
Description=Dashboard CISARP
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/dashboard
ExecStart=/usr/bin/streamlit run dashboard/app.py
Restart=always

[Install]
WantedBy=multi-user.target

# Ativar
sudo systemctl enable dashboard-cisarp
sudo systemctl start dashboard-cisarp
```

---

## 📚 Próximos Passos

Instalação completa! Agora:

1. ✅ **Execute o dashboard:** `.\RUN_DASHBOARD.bat`
2. ✅ **Leia o guia de uso:** [USAGE.md](USAGE.md)
3. ✅ **Explore as páginas:** Navegue pelas 6 páginas
4. ✅ **Execute testes:** `.\RUN_TESTS.bat`
5. ✅ **Personalize:** Edite `settings.py`

---

## 📞 Suporte

**Problemas não resolvidos?**

- 📖 Consulte [USAGE.md](USAGE.md)
- 🧪 Execute [TESTING_GUIDE.md](TESTING_GUIDE.md)
- 🎨 Veja [UI_UX_GUIDE.md](UI_UX_GUIDE.md)
- 🐛 Abra uma [Issue](../../issues)

---

**Instalação criada:** Fase 6 - Deploy  
**Última atualização:** 01/11/2025
