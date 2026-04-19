# Pages Mendix — visão geral

A interface do NucleoDigest é composta por três Pages no Mendix. Todas usam data binding nativo — nenhuma lógica de apresentação é escrita manualmente.

---

## As três páginas

| Page                 | URL          | Usuários         | Função principal                                |
| -------------------- | ------------ | ---------------- | ----------------------------------------------- |
| Saúde do biodigestor | `/saude`     | Operador, Gestor | Monitoramento biológico em tempo real           |
| Painel econômico     | `/economico` | Gestor, Admin    | Receitas e recomendação econômica ativa         |
| Histórico            | `/historico` | Gestor, Admin    | Registro completo de recomendações e resultados |

---

## Navegação

Barra de navegação superior com três itens (Saúde · Econômico · Histórico) + logo NucleoDigest à esquerda + avatar do usuário à direita. Implementada como **Navigation Layout** no Mendix — compartilhada entre as três Pages.

---

## Página de entrada

A Page `/saude` é a página de entrada padrão para perfis `OPERADOR`. Para `GESTOR` e `ADMIN`, a entrada padrão pode ser configurada para `/economico`.

---

# Saúde do biodigestor

Tela principal de monitoramento biológico. É o que o operador vê ao abrir o sistema.

---

## Layout

```
┌────────────────────────────────────────────────────┐
│  NucleoDigest    Saúde · Econômico · Histórico  👤  │
├────────────────────────────────────────────────────┤
│  [BANNER DE RISCO — CRÍTICO / SAUDÁVEL]            │
├──────────────────────┬─────────────────────────────┤
│                      │                             │
│   GAUGE pH           │   Tendência 6h (gráfico)    │
│   GAUGE CH4          │                             │
│                      │   Alertas ativos            │
│   GAUGE Temperatura  │   • Acidificação CRÍTICO    │
│   GAUGE AGV          │   • Queda CH4 MÉDIO         │
│                      │                             │
│                      │   Recomendação de ação      │
│                      │   [Aprovar] [Rejeitar]      │
└──────────────────────┴─────────────────────────────┘
```

---

## Componentes Mendix

| Componente        | Tipo                               | Data source                                    | Dados exibidos              |
| ----------------- | ---------------------------------- | ---------------------------------------------- | --------------------------- |
| Banner de risco   | Data View + Conditional Visibility | AlertaBiologico (mais recente, não resolvido)  | Status, severidade, tipo    |
| Gauge pH          | Progress Circle widget             | LeituraSensor (mais recente)                   | Valor atual de pH           |
| Gauge CH4         | Progress Circle widget             | LeituraSensor (mais recente)                   | Percentual de metano        |
| Gauge Temperatura | Progress Circle widget             | LeituraSensor (mais recente)                   | Temperatura em °C           |
| Gauge AGV         | Progress Circle widget             | LeituraSensor (mais recente)                   | AGV em mg/L                 |
| Gráfico tendência | Line Chart widget                  | List de LeituraSensor (últimas 6h)             | pH ao longo do tempo        |
| Lista de alertas  | List View                          | AlertaBiologico (resolvido = false)            | Tipo, severidade, timestamp |
| Card recomendação | Data View                          | Recomendacao (status = PENDENTE, mais recente) | Ação, motivo                |
| Botão Aprovar     | Microflow button                   | Recomendacao                                   | Atualiza status → APROVADA  |
| Botão Rejeitar    | Microflow button                   | Recomendacao                                   | Atualiza status → REJEITADA |

---

## Configuração dos gauges

Cada gauge usa o widget **Progress Circle** (disponível no Mendix Marketplace, gratuito).

| Gauge            | Mínimo | Máximo | Faixa verde | Faixa amarela | Faixa vermelha |
| ---------------- | ------ | ------ | ----------- | ------------- | -------------- |
| pH               | 0      | 14     | 6.8 – 7.5   | 6.5 – 6.8     | < 6.5          |
| CH4 (%)          | 0      | 100    | > 55        | 50 – 55       | < 50           |
| Temperatura (°C) | 20     | 60     | 35 – 38     | 30 – 35       | < 30 ou > 42   |
| AGV (mg/L)       | 0      | 8000   | < 3000      | 3000 – 4000   | > 4000         |

---

## Banner de risco

Implementado com **Conditional Visibility** no Mendix:

- Se `AlertaBiologico.severidade = CRITICO AND resolvido = false` → mostrar banner vermelho com texto "RISCO CRÍTICO — [tipo_alerta]"
- Se `AlertaBiologico.severidade = MEDIO AND resolvido = false` → mostrar banner âmbar com texto "ATENÇÃO — [tipo_alerta]"
- Se nenhum alerta ativo → mostrar banner teal com texto "SAUDÁVEL — Todos os parâmetros normais"

---

## Microflow do botão Aprovar

```
[Início] Param: Recomendacao
       ↓
Change Object: status = APROVADA, decidido_em = DateTime.now()
       ↓
Commit Recomendacao
       ↓
Retrieve: ProducaoDiaria WHERE biodigestor = hoje
       ↓
Exclusive Split: ProducaoDiaria existe para hoje?
       ├─ não → Create ProducaoDiaria (data = hoje, recomendacao_id = param)
       └─ sim → Change ProducaoDiaria (recomendacao_id = param)
       ↓
Commit ProducaoDiaria
       ↓
[Fim] Refresh Page
```

---

# Painel econômico

Visão financeira completa do biodigestor. Mostra receitas em tempo real e a recomendação econômica ativa.

---

## Layout

```
┌────────────────────────────────────────────────────┐
│  NucleoDigest    Saúde · Econômico · Histórico  👤  │
├────────┬────────┬────────┬───────────────────────┤
│Energia │  CBIO  │Tipping │  Lucro líquido hoje   │
│R$3.840 │R$1.120 │  R$640 │  R$ 5.280  (+9%)      │
├────────────────────────┬───────────────────────────┤
│                        │                           │
│  Receita por fonte     │  Recomendação ativa       │
│  (barras 7 dias)       │  Vender energia agora     │
│                        │  Lucro estimado R$4.200   │
│                        │                           │
│                        │  energia  R$3.840         │
│                        │  CBIO     R$1.120         │
│                        │  tipping    R$640         │
│                        │  logística −R$320         │
│                        │                           │
│                        │  [Aprovar] [Rejeitar]     │
├────────────────────────┴───────────────────────────┤
│  Energia spot: R$312/MWh · CBIO: R$28,40 · Gás: R$185/MWh │
└────────────────────────────────────────────────────┘
```

---

## Componentes Mendix

| Componente              | Tipo                         | Data source                           | Dados exibidos                  |
| ----------------------- | ---------------------------- | ------------------------------------- | ------------------------------- |
| Card receita energia    | Data View + expressão        | ProducaoDiaria (hoje)                 | `receita_energia_brl`           |
| Card receita CBIO       | Data View + expressão        | ProducaoDiaria (hoje)                 | `receita_cbio_brl`              |
| Card tipping fee        | Data View + expressão        | ProducaoDiaria (hoje)                 | `receita_tipping_brl`           |
| Card lucro líquido      | Data View + expressão        | ProducaoDiaria (hoje)                 | `receita_total_brl`             |
| Gráfico barras 7 dias   | Bar Chart widget (empilhado) | List ProducaoDiaria (7 dias)          | receitas por fonte empilhadas   |
| Card recomendação ativa | Data View                    | Recomendacao (PENDENTE, mais recente) | Ação, lucro, breakdown          |
| Barra preços ao vivo    | Data View                    | PrecoMercado (mais recente)           | energia_mwh_brl, cbio_brl       |
| Botões aprovar/rejeitar | Microflow buttons            | Recomendacao                          | Mesmos microflows da Page Saúde |

---

## Configuração do gráfico de barras empilhadas

- Widget: **Any Chart** ou **Bar Chart** (Mendix Marketplace)
- Tipo: `stacked bar`
- Series 1: `receita_energia_brl` (cor teal)
- Series 2: `receita_cbio_brl` (cor purple)
- Series 3: `receita_tipping_brl` (cor amber)
- Eixo X: `data` formatado como dia da semana (Seg, Ter...)
- Eixo Y: valores em R$

---

# Histórico

Registro completo de todas as recomendações e seus resultados. Base para análise de performance e argumento financeiro para investidores.

---

## Layout

```
┌────────────────────────────────────────────────────┐
│  NucleoDigest    Saúde · Econômico · Histórico  👤  │
├───────────────────────────────────────────────────┤
│  Período ▼   Tipo ▼   Status ▼   [Buscar...]      │
├────────────┬───────────────┬──────────────────────┤
│ 47 total   │ 38 aprovadas  │ R$ 142.800 gerados    │
├────────────────────────────────────────────────────┤
│ Data/hora  │ Ação         │ Motivo │Lucro est.│ Status │
│ 19/04 14h  │ Vender energ.│ Preço │ R$4.200  │ APROV  │
│ 19/04 13h  │ Corr. biol.  │ pH    │ R$52.000 │ APROV  │
│ 18/04 15h  │ Emitir CBIO  │ Preço │ R$1.120  │ REJEIT │
│ ...        │ ...          │ ...   │ ...      │ ...    │
├────────────────────────────────────────────────────┤
│                 ← 1  2  3 →                        │
├──────────────────────────┬─────────────────────────┤
│  Receita 30 dias (linha) │ Aprovadas vs Rejeitadas │
│                          │ (donut 81% / 19%)       │
└──────────────────────────┴─────────────────────────┘
```

---

## Componentes Mendix

| Componente        | Tipo                   | Data source                   | Configuração                                                       |
| ----------------- | ---------------------- | ----------------------------- | ------------------------------------------------------------------ |
| Filtro período    | Date Range Picker      | Context                       | XPath: `criado_em >= inicio AND criado_em <= fim`                  |
| Filtro tipo       | Drop-down              | Enumeration                   | Valores: Todas, VENDER_ENERGIA, EMITIR_CARBONO, CORRECAO_BIOLOGICA |
| Filtro status     | Drop-down              | Enumeration                   | Valores: Todos, PENDENTE, APROVADA, REJEITADA                      |
| Card total        | Data View + count      | List Recomendacao             | Count da lista filtrada                                            |
| Card aprovadas    | Data View + expressão  | List Recomendacao             | Count WHERE status = APROVADA                                      |
| Card receita      | Data View + aggregate  | List ProducaoDiaria           | SUM receita_total_brl                                              |
| Tabela histórico  | Data Grid 2            | Recomendacao (filtrada)       | 20 registros por página                                            |
| Badge status      | Conditional formatting | Recomendacao.status           | Teal=APROVADA, Vermelho=REJEITADA, Âmbar=PENDENTE                  |
| Gráfico linha 30d | Line Chart             | List ProducaoDiaria (30 dias) | receita_total_brl por data                                         |
| Gráfico donut     | Pie Chart              | Aggregate Recomendacao        | COUNT por status                                                   |

---

## Configuração do Data Grid 2

```
Data source: Database
Entity: Recomendacao
Sort: criado_em DESC
Page size: 20

Colunas:
  criado_em         → formatado "dd/MM HH:mm"
  acao_recomendada  → label da Enumeration
  motivo            → texto (truncado 60 chars)
  lucro_estimado_brl → formatado R$ #.##0,00
  lucro_real_brl    → ProducaoDiaria/receita_total_brl (via association)
  status            → badge com cor condicional
  [Ver detalhe]     → botão que abre popup com ProducaoDiaria completa
```

---

# Prompt Figma AI

Prompt completo e pronto para colar no Figma AI (ou outra IA de design) e gerar as três páginas do NucleoDigest.

---

## Como usar

Cole o bloco de **contexto geral** sempre primeiro. Em seguida, cole o bloco da página que deseja gerar. Você pode gerar as três de uma vez ou uma por vez.

---

## Contexto geral (sempre incluir)

```
Design a low-code web application prototype for an industrial biodigester
monitoring and economic optimization system. The product is called NucleoDigest.
The interface is used by biodigester plant operators on desktop.

Visual style: clean, data-dense, industrial — inspired by Siemens industrial
dashboards and modern SaaS tools like Linear or Grafana.

Color palette:
- Background: #0F1117
- Card surface: #1A1D27
- Teal accent (healthy): #1D9E75
- Amber accent (warning): #EF9F27
- Red accent (critical): #E24B4A
- Purple accent (economic/recommendations): #7F77DD
- Text primary: #F1EFE8
- Text secondary: #888780

Typography: Inter or similar geometric sans-serif.
Grid: 24px. Components: flat, no complex micro-interactions.
Navigation bar: "NucleoDigest" logo left, three nav items
(Saúde / Econômico / Histórico), user avatar right. Dark background.
```

---

## Página 1 — Saúde do biodigestor

```
Design Page 1 titled "Saúde do Biodigestor".

Full-width status banner below nav:
- CRITICAL state: red (#E24B4A at 15% opacity), badge "RISCO CRÍTICO —
  Acidificação detectada"
- HEALTHY state: teal (#1D9E75 at 15% opacity), badge "SAUDÁVEL"
Show CRITICAL state.

Main content: two columns (60% / 40%).

LEFT COLUMN — 2×2 grid of biological gauge cards. Each card:
- Parameter name bold
- Large semicircular arc gauge showing value vs range
- Numeric value centered, large and bold
- Colored status dot: teal=normal, amber=warning, red=critical
- Min/max threshold labels on arc

Values:
- pH = 6.3 (critical, red arc)
- CH4 = 58% (normal, teal arc)
- Temperatura = 37°C (normal, teal arc)
- AGV = 4200 mg/L (critical, red arc)

RIGHT COLUMN — vertical stack:
1. "Tendência das últimas 6h" line chart, pH over time, starts ~7.0
   drops to 6.3. Teal line above 6.5, red below. Dashed threshold
   line at 6.5 labeled "limite mínimo".
2. "Alertas ativos" card with 2 alert rows: colored severity dot,
   alert type, timestamp, "Ver detalhe" link.
   Row 1: red dot, "Acidificação — pH 6.3", "há 14 min"
   Row 2: amber dot, "AGV elevado — 4200 mg/L", "há 14 min"
3. "Recomendação de ação" card in purple (#7F77DD at 15% opacity):
   text "Reduzir carga de insumo em 20% e monitorar pH por 2h."
   Teal primary button "Aprovar ação", ghost button "Rejeitar".
```

---

## Página 2 — Painel econômico

```
Design Page 2 titled "Painel Econômico". Same nav bar.

Top row — 4 metric summary cards side by side:
- Card: muted 12px label above, bold 28px value below, small delta
- "Receita energia" → R$ 3.840 / +12% (green delta)
- "Receita CBIO" → R$ 1.120 / +5% (green delta)
- "Tipping fee" → R$ 640 / 0%
- "Lucro líquido hoje" → R$ 5.280 / +9% (highlight: teal left border 3px)

Two columns below (55% / 45%):

LEFT — stacked bar chart "Receita por fonte — últimos 7 dias":
- X axis: Seg Ter Qua Qui Sex Sab Dom
- Stacked segments: teal=energia, purple=CBIO, amber=tipping
- Legend below chart
- Realistic values varying day to day

RIGHT — "Recomendação econômica ativa" card with purple left border:
- Header small muted: "Ação recomendada agora"
- Large bold: "Vender energia — preço spot alto"
- "Lucro estimado: R$ 4.200" medium weight
- Breakdown rows (small, with colored dots):
  energia R$ 3.840 / CBIO R$ 1.120 / tipping R$ 640 / logística −R$ 320
- Teal "Aprovar" button + ghost "Rejeitar" button
- Small muted footer: "Baseado em CCEE: R$312/MWh · CBIO: R$28,40 · atualizado há 4 min"

Bottom bar "Preços de mercado em tempo real" — 3 inline metrics
with small colored up/down arrows:
- Energia spot: R$ 312/MWh (↑)
- CBIO atual: R$ 28,40/tCO₂e (↓)
- Gás natural: R$ 185/MWh (→)
```

---

## Página 3 — Histórico

```
Design Page 3 titled "Histórico de Recomendações". Same nav bar.

Filter bar: 3 dropdowns (Período: "Últimos 30 dias", Tipo: "Todas",
Status: "Todos") + search input right-aligned.

Summary strip — 3 inline stat cards:
- "Total recomendações: 47"
- "Aprovadas: 38 (81%)"
- "Receita gerada: R$ 142.800"

Data table with columns:
Data/hora | Ação recomendada | Motivo | Lucro est. | Lucro real | Status | Ações

Show 6 rows with realistic data:
- 19/04 14:30 | Vender energia | Preço alto | R$4.200 | R$4.050 | APROVADA (teal badge)
- 19/04 13:15 | Correção biológica | pH crítico | R$52.000 | — | APROVADA (teal badge)
- 18/04 15:00 | Emitir CBIO | Preço CBIO alto | R$1.120 | — | REJEITADA (red badge)
- 18/04 14:00 | Vender energia | Preço alto | R$3.800 | R$3.920 | APROVADA (teal badge)
- 17/04 16:20 | Aceitar tipping | Slot disponível | R$640 | R$640 | APROVADA (teal badge)
- 17/04 09:00 | Correção biológica | AGV elevado | R$28.000 | — | APROVADA (teal badge)

Alternate row background. Teal highlight on hover.
Pagination: Previous · 1 2 3 · Next, centered.

Bottom section "Resumo do período" — two side-by-side cards:
Left: line chart "Receita diária — 30 dias", Y axis R$, realistic
      daily values with some variation, teal line.
Right: donut chart "Resultado das recomendações":
       81% Aprovadas (teal), 19% Rejeitadas (red).
       Legend below with percentages.
```

---

_Próxima seção: [Roadmap →](/roadmap)_
