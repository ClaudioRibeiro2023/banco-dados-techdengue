# 🚀 Como Executar o Dashboard

## ⚠️ Problema: Streamlit não instalado

O Streamlit precisa ser instalado antes de executar o dashboard.

---

## ✅ Solução: Instalar Streamlit

### Opção 1: Instalação Simples (Recomendado)

```bash
# Abrir PowerShell como Administrador e executar:
pip install streamlit plotly altair
```

### Opção 2: Instalação com requirements.txt

```bash
# Navegar até a pasta do projeto
cd C:\Users\claud\CascadeProjects\banco-dados-techdengue

# Instalar dependências
pip install -r dashboard/requirements.txt
```

### Opção 3: Instalação Manual

```bash
pip install streamlit==1.28.0
pip install plotly==5.17.0
pip install altair==5.1.0
```

---

## 🚀 Executar o Dashboard

Após instalar o Streamlit:

```bash
# Navegar até a pasta do projeto
cd C:\Users\claud\CascadeProjects\banco-dados-techdengue

# Executar dashboard
streamlit run dashboard/app.py

# OU usando Python diretamente
python -m streamlit run dashboard/app.py
```

---

## 🌐 Acessar o Dashboard

Após executar, o dashboard estará disponível em:

```
URL: http://localhost:8501
```

O navegador deve abrir automaticamente. Se não abrir, copie e cole a URL no navegador.

---

## 🔧 Solução de Problemas

### Problema: "streamlit não é reconhecido"

**Causa:** Streamlit não está no PATH do Windows

**Solução:**
```bash
# Use Python diretamente
python -m streamlit run dashboard/app.py
```

### Problema: "No module named streamlit"

**Causa:** Streamlit não está instalado

**Solução:**
```bash
pip install streamlit
```

### Problema: Erro de importação de módulos

**Causa:** Dependências faltando

**Solução:**
```bash
pip install pandas plotly altair psycopg2-binary
```

---

## 📊 Alternativa: Visualizar Dados sem Dashboard

Se não conseguir instalar o Streamlit, você pode visualizar os dados diretamente:

### Ver MEGA TABELA

```python
import pandas as pd

# Carregar MEGA TABELA
df = pd.read_parquet('data_lake/gold/mega_tabela_analitica.parquet')

# Visualizar
print(df.head())
print(f"\nTotal de registros: {len(df):,}")
print(f"Colunas: {list(df.columns)}")
```

### Ver Relatório de Qualidade

```python
import json

# Carregar relatório
with open('data_lake/metadata/relatorio_qualidade_completo.json', 'r') as f:
    relatorio = json.load(f)

# Visualizar
print(f"Score de Qualidade: {relatorio['score_qualidade_geral']}%")
print(f"Checks Aprovados: {relatorio['checks_passed']}/{relatorio['checks_total']}")
```

---

## 📝 Comandos Úteis

```bash
# Verificar se Streamlit está instalado
pip show streamlit

# Listar pacotes instalados
pip list

# Atualizar pip
python -m pip install --upgrade pip

# Instalar todas as dependências do projeto
pip install pandas openpyxl psycopg2-binary matplotlib seaborn streamlit plotly altair
```

---

## ✅ Checklist de Instalação

- [ ] Python 3.8+ instalado
- [ ] pip atualizado
- [ ] Streamlit instalado (`pip install streamlit`)
- [ ] Plotly instalado (`pip install plotly`)
- [ ] Altair instalado (`pip install altair`)
- [ ] Pandas instalado (já deve estar)
- [ ] Dashboard executado (`streamlit run dashboard/app.py`)
- [ ] Navegador aberto em http://localhost:8501

---

## 🎯 Próximos Passos

Após instalar e executar:

1. ✅ Acesse http://localhost:8501
2. ✅ Navegue pelos módulos do dashboard
3. ✅ Visualize as métricas de qualidade
4. ✅ Explore os dados disponíveis

---

**Precisa de ajuda?** Consulte a documentação completa em `DASHBOARD_GESTAO.md`
