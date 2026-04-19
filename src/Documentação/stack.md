# Stack tecnológica

Todas as decisões de stack foram tomadas com um critério central: **o máximo de resultado com o mínimo de complexidade**, dado o contexto de hackathon e a restrição de usar Mendix como plataforma low-code.

---

## Visão geral da stack

```
┌─────────────────────────────────────────────────────┐
│                   FONTES EXTERNAS                   │
│  Sensores IoT · API Energia · API CBIO · Logística  │
└──────────────────────┬──────────────────────────────┘
                       │ REST / JSON
┌──────────────────────▼──────────────────────────────┐
│                     MENDIX                          │
│                                                     │
│  Published REST   Consumed REST   Scheduled Event   │
│  (recebe sensor)  (busca preços)  (a cada 1h)       │
│                                                     │
│  Microflows ─────────────────────────────────────   │
│  ImportarLeitura → AnalisarRisco → CalcularOtim.    │
│                                                     │
│  Domain Model (PostgreSQL gerenciado)               │
│  8 entidades · Associations · XPath queries         │
│                                                     │
│  Pages (interface)                                  │
│  Saúde · Econômico · Histórico                      │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│                    OUTPUTS                          │
│  Dashboard · Notificações · Recomendações           │
└─────────────────────────────────────────────────────┘
```

---

## Componentes e decisões

### Mendix Studio Pro

**Por que:** Plataforma obrigatória do hackathon. Além disso, atende bem ao caso de uso: lógica de negócio configurável visualmente, REST nativo sem código, banco de dados gerenciado e interface construída por drag-and-drop.

**O que cobre nessa solução:**
- Domain Model (banco de dados visual)
- Microflows (lógica de negócio)
- Published REST Service (endpoint para sensores)
- Consumed REST Service (consumo de APIs externas)
- Scheduled Events (tarefas periódicas)
- Pages (interface do operador)
- App Constants (thresholds configuráveis)
- Module Security (controle de acesso por perfil)

---

### Published REST Service

**Função:** Expõe o endpoint `POST /api/leitura` que recebe dados dos sensores IoT.

**Configuração no Mendix:**
- Criar um REST Service publicado no módulo principal
- Adicionar recurso `/leitura` com operação POST
- Configurar Import Mapping para mapear JSON → entidade `LeituraSensor`
- Vincular ao Microflow `ImportarLeitura`
- Autenticação: API Key no header `X-API-Key`

---

### Consumed REST Services

**Função:** Faz chamadas GET para APIs externas de preço de energia e CBIO.

**Dois serviços configurados:**

| Serviço | URL | Retorno |
|---|---|---|
| Preço energia | `GET /api/preco-energia` | `{ preco_mwh, unidade, fonte, timestamp }` |
| Preço CBIO | `GET /api/preco-cbio` | `{ preco_tcO2e, unidade, fonte, timestamp }` |

**Para o hackathon:** Ambos os endpoints podem ser simulados com JSONs estáticos hospedados no [mockapi.io](https://mockapi.io) ou [jsonbin.io](https://jsonbin.io). O Mendix os consome identicamente a uma API real.

---

### Scheduled Events

**Função:** Executa o Microflow de coleta de preços a cada hora, sem intervenção humana.

**Configuração:**
- Nome: `ColetarPrecosMercado`
- Intervalo: 3600 segundos (1 hora)
- Microflow associado: `CalcularOtimizacao` (que internamente chama o Consumed REST)
- Timezone: America/Sao_Paulo

---

### Domain Model (PostgreSQL)

**Função:** Persistência de todos os dados. O Mendix gerencia o banco automaticamente — não há DDL, migrations ou conexões para configurar.

**8 entidades:** `Biodigestor`, `LeituraSensor`, `AlertaBiologico`, `Insumo`, `PrecoMercado`, `Recomendacao`, `ProducaoDiaria`, `Usuario`.

Veja a documentação completa em [Banco de dados →](/banco-de-dados).

---

### App Constants

**Função:** Thresholds biológicos configuráveis em tempo real sem necessidade de redeploy.

| Constante | Valor padrão | Descrição |
|---|---|---|
| `threshold_ph_critico` | 6.5 | pH abaixo = alerta crítico |
| `threshold_agv_critico` | 4000 | AGV (mg/L) acima = alerta crítico |
| `threshold_ch4_medio` | 50 | CH4 (%) abaixo = alerta médio |
| `threshold_nh3_medio` | 3000 | NH3 (mg/L) acima = alerta médio |
| `intervalo_coleta_precos` | 3600 | Segundos entre coletas de mercado |

> **Dica de demo:** Mostrar ao júri que é possível mudar o `threshold_ph_critico` de 6.5 para 6.8 no painel de constantes e o sistema imediatamente passa a gerar alertas em mais leituras — sem redeploy, sem código.

---

### Module Security

**Função:** Controle de acesso por perfil de usuário.

| Perfil | Acesso |
|---|---|
| `Operador` | Ver alertas, aprovar/rejeitar recomendações, ver dashboard saúde |
| `Gestor` | Tudo do Operador + ver painel econômico e histórico |
| `Admin` | Tudo + configurar App Constants e cadastrar biodigestores |

---

## O que deliberadamente não está na stack

| O que foi descartado | Por quê |
|---|---|
| Machine learning / modelo preditivo | Thresholds configuráveis resolvem o problema para o hackathon com muito menos complexidade |
| Banco de dados externo | Domain Model Mendix é suficiente e elimina toda a infra de banco |
| Backend customizado (Node/Python) | Mendix Microflows cobrem toda a lógica necessária nativamente |
| Fila de mensagens (Kafka, RabbitMQ) | Volume de dados não justifica; REST síncrono é suficiente |
| Container / Kubernetes | Mendix Cloud gerencia o deploy automaticamente |

---

*Próxima seção: [Arquitetura →](/arquitetura)*
