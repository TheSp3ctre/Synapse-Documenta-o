# Visão geral

**NucleoDigest** é um sistema de monitoramento biológico e otimização econômica para biodigestores industriais, construído em Mendix (low-code) para o Hackathon Low Hack — Siemens & Truechange.

> Tema: Geração de energia via economia circular a partir de resíduos, sem incineração.

---

## O que é o NucleoDigest

Biodigestores industriais transformam resíduos orgânicos em energia elétrica, biogás e biofertilizante. O problema é que esses sistemas dependem de um microbioma vivo — bactérias que "digerem" o resíduo — e quando esse microbioma adoece, toda a produção para.

O NucleoDigest resolve dois problemas independentes que custam receita ao operador:

1. **Falhas biológicas imprevistas** — o sistema detecta sinais de colapso do microbioma dias antes de acontecer, dando tempo para corrigir sem parar a produção.
2. **Decisões econômicas subótimas** — o sistema calcula em tempo real qual a ação mais lucrativa considerando preço de energia, créditos de carbono, tipping fee e custo logístico.

---

## As duas ideias centrais

### Ideia 1 — Inteligência biológica preditiva

Monitoramento contínuo de quatro parâmetros do microbioma:

| Parâmetro | Sigla | Range saudável | Threshold de alerta |
|---|---|---|---|
| Potencial hidrogeniônico | pH | 6.8 – 7.5 | < 6.5 (crítico) |
| Percentual de metano | CH4 | > 55% | < 50% (médio) |
| Ácido graxo volátil | AGV | < 3000 mg/L | > 4000 mg/L (crítico) |
| Amônia livre | NH3 | < 2000 mg/L | > 3000 mg/L (médio) |

Quando qualquer threshold é cruzado, o sistema gera um `AlertaBiologico` com severidade graduada, notifica o operador e recomenda a ação corretiva antes que a produção colapse.

### Ideia 2 — Otimização econômica, não apenas técnica

O sistema decide o que fazer com o biogás com base no **lucro líquido por MWh**, calculado em tempo real:

```
lucro_liquido = receita_energia + receita_cbio + tipping_fee − custo_logistica
```

Onde:
- `receita_energia` = biogás × 0.6 × preço spot energia (R$/MWh)
- `receita_cbio` = CO₂ evitado (ton) × preço CBIO (R$/tCO₂e)
- `tipping_fee` = valor cobrado por receber o resíduo de terceiros
- `custo_logistica` = custo de transporte e manuseio do insumo

---

## Quatro fontes de receita simultâneas

Um biodigestor bem gerido tem quatro torneiras de dinheiro abertas ao mesmo tempo. O NucleoDigest monitora e otimiza todas elas:

```
┌─────────────────────────────────────────┐
│              Biodigestor                │
│                                         │
│  → Energia elétrica   (venda por MWh)  │
│  → Crédito de carbono (CBIO / mercado) │
│  → Tipping fee        (aceitar resíduo)│
│  → Biofertilizante    (venda digestato)│
└─────────────────────────────────────────┘
```

---

## Posicionamento competitivo

> "A Siemens garante que o equipamento não quebra. O NucleoDigest garante que a biologia não para — e ainda diz ao operador quando vender energia, quando emitir carbono, e quanto cada decisão vale em reais."

O diferencial central é monitorar o **microbioma** (a biologia), não apenas o equipamento. Concorrentes como as próprias ferramentas da Siemens focam em manutenção preditiva de sensores e atuadores. O NucleoDigest foca no que realmente determina se o sistema vai produzir ou não: as bactérias.

---

## Plataforma e stack

| Componente | Tecnologia | Motivo da escolha |
|---|---|---|
| Aplicação principal | Mendix (low-code) | Desenvolvimento rápido, REST nativo, sem infra customizada |
| Banco de dados | Domain Model Mendix (PostgreSQL) | Gerenciado pela plataforma, zero configuração |
| Integrações externas | Consumed REST Services | GET preços energia e CBIO a cada hora |
| Entrada de dados | Published REST Service | POST de sensores IoT via `/api/leitura` |
| Lógica de negócio | Microflows + App Constants | Thresholds configuráveis sem redeploy |
| Agendamento | Scheduled Events | Coleta de preços periódica |
| Interface | Pages Mendix | 3 páginas: Saúde, Econômico, Histórico |

---

## Estrutura da documentação

Esta documentação está organizada nas seguintes seções:

- **[Problema](/problema)** — detalhamento do impacto financeiro de colapsos biológicos
- **[Solução](/solucao)** — as duas ideias em profundidade técnica e econômica
- **[Stack tecnológica](/stack)** — decisões de arquitetura e por que Mendix
- **[Arquitetura](/arquitetura)** — camadas, fluxo de dados e componentes
- **[Banco de dados](/banco-de-dados)** — 8 entidades, campos e relacionamentos
- **[Integrações REST](/integracoes)** — 4 blocos de integração com payloads
- **[Microflows](/microflows)** — lógica de decisão passo a passo com fórmulas
- **[Interface](/interface)** — 3 pages Mendix com componentes e data binding
- **[Roadmap](/roadmap)** — 10 fases de implementação para o hackathon
- **[Script de demo](/demo)** — roteiro de 5 minutos para o júri
- **[Pitch para investidores](/pitch)** — argumentos econômicos e de mercado
- **[Glossário](/glossario)** — termos biológicos e econômicos explicados

---

## Contexto do hackathon

| Item | Detalhe |
|---|---|
| Evento | Hackathon Low Hack |
| Organizadores | Siemens & Truechange |
| Tema | Geração de energia via economia circular — resíduos sem incineração |
| Plataforma obrigatória | Mendix (low-code) |
| Versão da documentação | 1.0 — Abril 2026 |

---

*Próxima seção: [Problema →](/problema)*
