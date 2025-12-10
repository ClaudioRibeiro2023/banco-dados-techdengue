# 🚨 COMO VER O DASHBOARD NOVO - PASSO A PASSO

**O problema:** Você está vendo o dashboard ANTIGO ainda.

**A solução:** Siga estes passos **EXATAMENTE**:

---

## ✅ PASSO 1: Parar o Dashboard Antigo

Se o dashboard está rodando, **PARE-O:**

1. Vá na janela do terminal/cmd onde está rodando
2. Pressione `Ctrl + C`
3. Feche a janela completamente

---

## ✅ PASSO 2: Substituir o Arquivo Principal

**Execute este comando** no terminal (PowerShell):

```powershell
cd C:\Users\claud\CascadeProjects\banco-dados-techdengue

# Backup do antigo
Copy-Item dashboard\app.py dashboard\app_antigo_backup.py

# Substituir pelo novo
Copy-Item dashboard\app_v6_novo.py dashboard\app.py -Force
```

**OU faça manualmente:**

1. Abra a pasta: `C:\Users\claud\CascadeProjects\banco-dados-techdengue\dashboard`
2. **Renomeie:** `app.py` → `app_antigo_backup.py`
3. **Copie:** `app_v6_novo.py`
4. **Renomeie a cópia:** `app_v6_novo - Copy.py` → `app.py`

---

## ✅ PASSO 3: Limpar Cache do Streamlit

```powershell
cd C:\Users\claud\CascadeProjects\banco-dados-techdengue

# Limpar cache
Remove-Item -Recurse -Force .streamlit\cache -ErrorAction SilentlyContinue
```

---

## ✅ PASSO 4: Executar o Dashboard Novo

```bash
START_DASHBOARD.bat
```

**Aguarde** 5-10 segundos para carregar.

---

## ✅ PASSO 5: Abrir no Navegador (FORÇAR REFRESH)

1. Abra: `http://localhost:8501`

2. **FORCE REFRESH:**
   - **Chrome/Edge:** `Ctrl + Shift + R`
   - **Firefox:** `Ctrl + F5`
   - **Safari:** `Cmd + Shift + R`

---

## 🎯 O QUE VOCÊ DEVE VER (DIFERENTE!):

### ❌ Se ainda ver o ANTIGO:
- Fundo **BRANCO** ou cinza claro
- Sidebar **GRANDE** à esquerda
- Gráficos de **LINHA e PIZZA**
- Azul básico

### ✅ Se ver o NOVO:
- Fundo **ESCURO** (azul escuro / preto)
- **SEM SIDEBAR** (tela cheia)
- Título **"v6.0"** com cores gradient (azul → roxo)
- Gráficos **NOVOS**:
  - Treemap (blocos)
  - Sunburst (círculos)
  - Heatmap (matriz de calor)
- Cores **NEON** (azul brilhante, roxo, rosa)

---

## 🔧 SE AINDA NÃO FUNCIONAR:

### Opção 1: Fechar TODO o navegador

1. Feche **TODAS** as abas e janelas do navegador
2. Abra novamente
3. Vá para `http://localhost:8501`
4. Force refresh (`Ctrl + Shift + R`)

### Opção 2: Usar modo anônimo

1. Abra navegador em **modo anônimo/privado**
2. Acesse `http://localhost:8501`
3. Deve ver o novo visual

### Opção 3: Usar outro navegador

Se usar Chrome, tente **Edge** ou **Firefox**

### Opção 4: Verificar se substituiu correto

Abra o arquivo:
```
C:\Users\claud\CascadeProjects\banco-dados-techdengue\dashboard\app.py
```

**Linha 1 deve dizer:**
```python
"""
TechDengue Analytics v6.0 - REDESIGN TOTAL
Dashboard Executivo Moderno com Dark Theme
"""
```

**Se diz outra coisa**, a substituição não funcionou!

---

## 🎨 DIFERENÇAS VISUAIS (CHECKLIST):

Veja o dashboard e confira:

- [ ] Fundo ESCURO (não branco)
- [ ] Sem sidebar grande à esquerda
- [ ] Título diz "v6.0"
- [ ] Cards com números GRANDES
- [ ] Gráfico "Treemap" com blocos coloridos
- [ ] Gráfico "Sunburst" com círculos
- [ ] Gráfico "Heatmap" com cores quentes
- [ ] Cores vivas (azul neon, roxo, rosa)
- [ ] Scrollbar customizada (gradient azul/roxo)

**Se marcou TODOS**, o novo dashboard está funcionando! ✅

**Se marcou NENHUM**, ainda está no antigo. ❌

---

## 💡 DICA FINAL:

**Se NADA funcionar**, tire um **screenshot** do que você está vendo e me envie. Assim posso ver exatamente o que está aparecendo.

---

**Criado em:** 30/10/2025  
**Versão:** v6.0 Troubleshooting Guide
