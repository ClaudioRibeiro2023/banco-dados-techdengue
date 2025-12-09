# ⚡ GUIA DE EXECUÇÃO - METODOLOGIA CISARP

**Para executar AGORA e ter apresentação pronta**

---

## 🎯 VISÃO EXECUTIVA

```
5 FASES → 25-34 SLIDES → 30-45 MIN APRESENTAÇÃO

FASE 1: Contexto (3-4 slides)
FASE 2: Performance (6-8 slides)
FASE 3: Impacto (5-7 slides)
FASE 4: Benchmarking (3-4 slides)
FASE 5: Insights (4-6 slides)
```

---

## 🚀 EXECUÇÃO EM 3 ETAPAS

### ETAPA 1: Gerar Análises (10-15 min)

```bash
cd apresentacao

# Executar análises automatizadas
python 02_analise_cisarp.py
python 03_visualizacoes.py

# OU usar automação
EXECUTAR_ANALISE.bat
```

**Arquivos gerados:**
- ✅ `dados/cisarp_completo.csv`
- ✅ `dados/cisarp_metricas.json`
- ✅ `dados/cisarp_sumario.txt`
- ✅ `visualizacoes/*.html` (10+ gráficos)
- ✅ `visualizacoes/*.png` (para slides)

---

### ETAPA 2: Compilar Apresentação (2-3h)

**Use a estrutura detalhada em:** `METODOLOGIA_APRESENTACAO_CISARP.md`

#### Estrutura de 25-34 Slides

**BLOCO 1: Abertura (3 slides)**
1. Capa + Logos
2. Agenda
3. Contexto e objetivos

**BLOCO 2: Contexto (4 slides)**
4. Cenário epidemiológico MG
5. Caracterização CISARP (52 municípios)
6. Timeline (dez/24 - ago/25, 263 dias)
7. Metodologia

**BLOCO 3: Performance (7 slides)**
8. **Dashboard KPIs** ← Use `visualizacoes/01_kpis_principais.html`
9. **Top municípios** ← Use `visualizacoes/03_top_municipios.png`
10. **Evolução temporal** ← Use `visualizacoes/02_evolucao_temporal.png`
11. Categorias de POIs
12. Cobertura territorial
13. Densidade e eficiência
14. Destaques operacionais

**BLOCO 4: Impacto (6 slides)**
15. Taxa de conversão
16. Tipos de tratamento
17. Correlação com dengue (1)
18. Correlação com dengue (2)
19. Índice de efetividade
20. Resumo de impacto

**BLOCO 5: Benchmarking (4 slides)**
21. **Ranking nacional** ← Use `visualizacoes/06_benchmarking_contratantes.png`
22. Comparação de indicadores
23. Análise de pares
24. Posicionamento estratégico

**BLOCO 6: Insights (5 slides)**
25. Top 5 insights
26. Oportunidades
27. Recomendações (curto prazo)
28. Recomendações (médio/longo)
29. Próximos passos

**BLOCO 7: Encerramento (2 slides)**
30. Conclusões
31. Agradecimentos

---

### ETAPA 3: Revisar e Finalizar (1h)

- [ ] Validar todos os números
- [ ] Testar abertura de gráficos
- [ ] Revisar narrativa
- [ ] Preparar materiais de apoio
- [ ] Ensaiar tempo

---

## 📊 NÚMEROS-CHAVE PARA SLIDES

### Use Estes Números (Validados)

```
108 registros/intervenções
71 atividades principais
52 municípios únicos
13.584 POIs identificados
9.440 hectares mapeados
263 dias de operação
4º lugar nacional (Top 6%)
```

### Calculados por Scripts

```python
# Estes serão calculados automaticamente:
- Devolutivas totais
- Taxa de conversão
- POIs por categoria
- Densidade POIs/hectare
- Comparações com outros consórcios
- Evolução mensal
- Rankings por município
```

---

## 🎨 DICAS DE DESIGN

### Paleta de Cores

```
Primária:   #0066CC (Azul CISARP)
Sucesso:    #28A745 (Verde)
Alerta:     #FFA500 (Laranja)
Crítico:    #DC3545 (Vermelho)
Neutro:     #6C757D (Cinza)
```

### Fontes

- **Títulos:** Arial Bold, 24-28pt
- **Corpo:** Arial Regular, 14-18pt
- **Dados:** Arial/Courier, 12-14pt

### Layout

- Margens: 2cm
- Logo CISARP: Canto superior direito
- Rodapé: Número da página + data
- Máximo 5-7 bullets por slide

---

## 💡 NARRATIVA SUGERIDA

### Mensagem Central

> "Em 263 dias de operação, o CISARP realizou 108 intervenções detalhadas em 52 municípios, mapeando 9.440 hectares e identificando 13.584 POIs, alcançando o 4º lugar nacional e posicionando-se como referência em combate à dengue."

### Key Messages (Repetir 3x)

1. **Performance excepcional** - 4º lugar nacional, Top 6%
2. **Cobertura estratégica** - 52 municípios, 9.440 hectares
3. **Impacto mensurável** - 13.584 POIs, taxa de conversão X%

### Storytelling

**INÍCIO:** Contexto (problema da dengue)  
**MEIO:** O que fizemos (108 intervenções)  
**FIM:** Resultados e próximos passos

---

## 📋 CHECKLIST PRÉ-APRESENTAÇÃO

### Conteúdo
- [ ] Todos os números conferidos
- [ ] Visualizações testadas
- [ ] Narrativa coerente
- [ ] Slides numerados
- [ ] Fontes citadas

### Técnico
- [ ] PowerPoint salvo (versão final)
- [ ] PDF gerado (backup)
- [ ] USB com arquivos
- [ ] Arquivos na nuvem
- [ ] Dashboard HTML offline

### Apresentação
- [ ] Ensaio realizado (30-45 min)
- [ ] Tempo validado
- [ ] Q&A preparado
- [ ] Materiais impressos
- [ ] Laptop carregado

---

## 🎯 ESTRUTURA DETALHADA DOS SLIDES

### SLIDE 8: Dashboard KPIs (EXEMPLO COMPLETO)

**Layout:**
```
┌─────────────────────────────────────────────────┐
│ PERFORMANCE OPERACIONAL - CISARP                │
├──────────┬──────────┬──────────┬───────────────┤
│   108    │  13.584  │  9.440   │      4º       │
│ Interven-│   POIs   │ Hectares │    Nacional   │
│   ções   │          │          │               │
└──────────┴──────────┴──────────┴───────────────┘

Período: 09/12/2024 - 29/08/2025 (263 dias)
Municípios: 52 | Densidade: 1.44 POIs/ha
```

### SLIDE 25: Top 5 Insights (EXEMPLO)

**Estrutura:**
```
1. 🏆 PERFORMANCE: 4º lugar nacional, Top 6%

2. 📊 COBERTURA: 52 municípios, 9.440 ha mapeados

3. 🎯 EFETIVIDADE: Taxa de conversão X%, Score Y/100

4. 📈 FOCO ESTRATÉGICO: 70% em 10 municípios prioritários

5. 💡 OPORTUNIDADE: Potencial de expansão para Z municípios
```

### SLIDE 29: Próximos Passos (EXEMPLO)

**Timeline Visual:**
```
CURTO PRAZO (1-3 meses)
├─ Expandir para 5 municípios prioritários
├─ Aumentar taxa conversão para X%
└─ Campanhas de conscientização

MÉDIO PRAZO (3-6 meses)
├─ Monitoramento contínuo
├─ Integração dados epidemiológicos
└─ Capacitação avançada

LONGO PRAZO (6-12 meses)
├─ Modelo CISARP como referência
├─ Pesquisa e inovação
└─ Captação de recursos
```

---

## 🔥 QUICK WINS

### Se Tiver Pouco Tempo

**MÍNIMO VIÁVEL (2h):**
1. Executar scripts (15 min)
2. Criar 15 slides essenciais:
   - Capa
   - Contexto (2)
   - KPIs (1)
   - Top municípios (1)
   - Evolução (1)
   - Benchmarking (1)
   - Taxa conversão (1)
   - Insights (3)
   - Recomendações (2)
   - Próximos passos (1)
   - Encerramento (1)
3. Revisar (30 min)

**IDEAL (4-5h):**
- Estrutura completa de 25-34 slides
- Todos os 6 blocos
- Materiais de apoio
- Ensaio completo

---

## 📞 SUPORTE RÁPIDO

### Documentos de Referência

1. **Metodologia completa:** `METODOLOGIA_APRESENTACAO_CISARP.md`
2. **Números validados:** `NUMEROS_CORRETOS_CISARP.md`
3. **Correção aplicada:** `CORRECAO_DIVERGENCIA.md`
4. **Dados gerados:** `dados/cisarp_sumario.txt`

### Em Caso de Dúvida

- Números conflitantes? → Veja `NUMEROS_CORRETOS_CISARP.md`
- Estrutura? → Veja `METODOLOGIA_APRESENTACAO_CISARP.md`
- Visualizações? → Abra `visualizacoes/index.html`
- Dados brutos? → Veja `dados/cisarp_completo.csv`

---

## ✅ RESULTADO ESPERADO

### Você Terá

1. ✅ Apresentação PowerPoint profissional (25-34 slides)
2. ✅ Dashboard HTML interativo para demonstração
3. ✅ Relatório executivo com insights
4. ✅ Dados validados e conferidos
5. ✅ Materiais de apoio para Q&A

### Impacto

- 🎯 Demonstração clara de valor
- 📊 Números validados e precisos
- 🏆 Posicionamento estratégico forte
- 💡 Recomendações acionáveis
- 🚀 Call to action claro

---

**PRONTO PARA COMEÇAR!**

Execute: `python 02_analise_cisarp.py` e siga este guia. Sucesso! 🚀
