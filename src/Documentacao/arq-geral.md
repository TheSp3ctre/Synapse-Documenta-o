# Arquitetura geral

A arquitetura do NucleoDigest é organizada em quatro camadas verticais. Cada camada tem uma responsabilidade única e se comunica com a camada adjacente por REST ou chamada interna de Microflow.

---

## Diagrama de camadas

```
┌─────────────────────────────────────────────────────────┐
│                   CAMADA 1 — FONTES EXTERNAS            │
│                                                         │
│  [Sensores IoT]  [API Energia]  [API CBIO]  [Logística] │
└───────────────────────────┬─────────────────────────────┘
                            │ REST / JSON
┌───────────────────────────▼─────────────────────────────┐
│                  CAMADA 2 — NORMALIZAÇÃO REST            │
│                                                         │
│      Mendix REST calls diretos ou JSON mock (hackathon) │
│      Normaliza formato → JSON padronizado               │
└───────────────────────────┬─────────────────────────────┘
                            │ objetos Mendix
┌───────────────────────────▼─────────────────────────────┐
│                  CAMADA 3 — MENDIX (NÚCLEO)             │
│                                                         │
│  ┌─────────────────┐  ┌──────────────┐  ┌───────────┐  │
│  │ Monitor biológico│  │Motor preditivo│  │Otimizador │  │
│  │ pH·CH4·AGV·NH3  │  │thresholds    │  │econômico  │  │
│  └─────────────────┘  └──────────────┘  └───────────┘  │
│                                                         │
│  ┌─────────────────┐  ┌──────────────┐  ┌───────────┐  │
│  │Dashboard operador│  │Recomendações │  │Relatórios │  │
│  │alertas·gráficos │  │ação·motivo   │  │histórico  │  │
│  └─────────────────┘  └──────────────┘  └───────────┘  │
└───────────────────────────┬─────────────────────────────┘
                            │ decisão do operador
┌───────────────────────────▼─────────────────────────────┐
│                  CAMADA 4 — OUTPUTS ECONÔMICOS          │
│                                                         │
│  [Vender energia]  [Emitir CBIO]  [Tipping]  [Digestato]│
└─────────────────────────────────────────────────────────┘
```

---

## Responsabilidade de cada camada

| Camada            | Responsabilidade                                  | Tecnologia                 |
| ----------------- | ------------------------------------------------- | -------------------------- |
| Fontes externas   | Produzir dados brutos (sensores, preços)          | IoT, APIs públicas         |
| Normalização REST | Converter dados externos para JSON padronizado    | Mendix REST calls / mock   |
| Mendix (núcleo)   | Toda a lógica biológica, econômica e de interface | Mendix Studio Pro          |
| Outputs           | Registrar e executar as decisões tomadas          | ProducaoDiaria + aprovação |

---

## Princípios arquiteturais

**Separação de responsabilidades:** cada Microflow faz uma coisa. `ImportarLeitura` não analisa risco — ele delega para `AnalisarRisco`. `AnalisarRisco` não calcula receita — ele apenas cria alertas.

**Fail-safe biológico:** a otimização econômica só roda se não houver alerta crítico ativo. A biologia é sempre prioridade sobre a receita.

**Configurabilidade sem redeploy:** todos os thresholds são App Constants. O operador pode ajustá-los no painel sem envolver desenvolvimento.

**Rastreabilidade completa:** cada `Recomendacao` tem FK para o `PrecoMercado` usado no cálculo. Cada `AlertaBiologico` tem FK para a `LeituraSensor` que o originou. O histórico é auditável de ponta a ponta.

---

_Ver também: [Camadas da solução →](/arq-camadas) · [Fluxo de dados →](/arq-fluxo) · [Componentes Mendix →](/arq-componentes)_
