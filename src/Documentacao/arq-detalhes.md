# Camadas da solução

Detalhamento de cada camada arquitetural — o que entra, o que sai e quem é responsável por cada transformação.

---

## Camada 1 — Fontes externas

Tudo que vem de fora do sistema. O NucleoDigest não produz dados brutos — ele os consome e transforma.

| Fonte                                         | Protocolo         | Frequência         | Dado entregue                    |
| --------------------------------------------- | ----------------- | ------------------ | -------------------------------- |
| Sensores IoT (pH, CH4, AGV, NH3, temperatura) | HTTP POST         | A cada 5–15 min    | JSON com leitura completa        |
| API preço energia (CCEE)                      | HTTP GET          | A cada 1h          | R$/MWh spot                      |
| API preço CBIO (B3/RenovaBio)                 | HTTP GET          | A cada 1h          | R$/tCO₂e                         |
| Sistema de logística                          | HTTP GET / manual | Por lote de insumo | Custo de transporte por tonelada |

**Para o hackathon:** todas as fontes externas podem ser simuladas com JSONs estáticos. O Mendix não distingue uma API real de um mock — o que importa é o contrato JSON.

---

## Camada 2 — Normalização REST

Responsável por garantir que dados de origens diferentes cheguem ao Mendix no mesmo formato. No Mendix, isso é feito via **Import Mappings** — mapeamento visual de JSON para entidade, sem código.

**Contrato JSON padrão do sensor:**

```json
{
  "biodigestor_id": 1,
  "ph": 6.3,
  "ch4_pct": 58.2,
  "temperatura_c": 37.1,
  "agv_mgL": 4200,
  "nh3_mgL": 1800,
  "timestamp": "2026-04-19T14:30:00Z",
  "origem": "sensor-A1"
}
```

**Contrato JSON padrão de preço:**

```json
{
  "preco_mwh": 312.5,
  "preco_tcO2e": 28.4,
  "gas_natural_mwh": 185.0,
  "fonte": "CCEE/B3",
  "timestamp": "2026-04-19T14:00:00Z"
}
```

---

## Camada 3 — Mendix (núcleo)

Dividida em dois grupos funcionais:

### Grupo de inteligência (backend)

| Componente             | Tipo Mendix          | Função                                        |
| ---------------------- | -------------------- | --------------------------------------------- |
| `ImportarLeitura`      | Microflow            | Valida e persiste leitura do sensor           |
| `AnalisarRisco`        | Microflow            | 4 checks biológicos em cascata                |
| `CalcularOtimizacao`   | Microflow            | Fórmulas de receita + geração de recomendação |
| `ColetarPrecosMercado` | Scheduled Event      | Busca preços externos a cada hora             |
| Domain Model           | Entity + Association | Persistência de 8 entidades                   |
| App Constants          | Configuration        | Thresholds e intervalos configuráveis         |

### Grupo de interface (frontend)

| Componente      | Tipo Mendix        | Função                                  |
| --------------- | ------------------ | --------------------------------------- |
| Page: Saúde     | Page + Data View   | Gauges biológicos + alertas ativos      |
| Page: Econômico | Page + Data View   | Receitas + recomendação econômica ativa |
| Page: Histórico | Page + Data Grid 2 | Tabela filtrada + gráficos de resumo    |

---

## Camada 4 — Outputs econômicos

O resultado de cada `Recomendacao` aprovada pelo operador gera um registro em `ProducaoDiaria` com as quatro receitas discriminadas.

| Output           | Condição para gerar                          | Entidade atualizada                  |
| ---------------- | -------------------------------------------- | ------------------------------------ |
| Venda de energia | Recomendacao.acao = VENDER_ENERGIA, aprovada | ProducaoDiaria.receita_energia_brl   |
| Emissão CBIO     | Recomendacao.acao = EMITIR_CARBONO, aprovada | ProducaoDiaria.receita_cbio_brl      |
| Tipping fee      | Insumo recebido no dia                       | ProducaoDiaria.receita_tipping_brl   |
| Venda digestato  | Produção do dia registrada                   | ProducaoDiaria.receita_digestato_brl |

---

# Fluxo de dados

Passo a passo de como o dado percorre o sistema do sensor até a decisão do operador.

---

## Fluxo completo

```
1. SENSOR
   Sensor IoT mede pH, CH4, AGV, NH3, temperatura
   Envia POST /api/leitura com JSON

2. IMPORTAR LEITURA
   Mendix recebe a requisição no Published REST Service
   Valida campos obrigatórios (pH, CH4, temperatura)
   Se inválido → retorna HTTP 400
   Se válido → cria objeto LeituraSensor e faz Commit

3. ANALISAR RISCO
   Verifica pH < threshold_ph_critico (padrão: 6.5)
   Verifica AGV > threshold_agv_critico (padrão: 4000)
   Verifica CH4 < threshold_ch4_medio (padrão: 50%)
   Verifica NH3 > threshold_nh3_medio (padrão: 3000)
   Para cada threshold violado: cria AlertaBiologico
   Se alerta crítico: dispara notificação REST externa

4. COLETA DE PREÇOS (paralelo, a cada 1h)
   Scheduled Event dispara ColetarPrecosMercado
   GET /api/preco-energia → preco_energia_mwh
   GET /api/preco-cbio → preco_cbio_brl
   Cria PrecoMercado com timestamp atual

5. CALCULAR OTIMIZAÇÃO
   Busca último PrecoMercado disponível
   Verifica AlertaBiologico CRÍTICO ativo
   Se crítico ativo → gera Recomendacao: CORRECAO_BIOLOGICA
   Se saudável → calcula receita_energia, receita_cbio, tipping
   Calcula lucro_liquido = soma receitas - custo_logistica
   Cria Recomendacao com status PENDENTE

6. DASHBOARD
   Operador vê Recomendacao pendente
   Aprova → status = APROVADA, ProducaoDiaria atualizada
   Rejeita → status = REJEITADA, nova Recomendacao gerada
   Histórico disponível na Page 3
```

---

## Latência esperada

| Etapa                                 | Latência típica                   |
| ------------------------------------- | --------------------------------- |
| Sensor → LeituraSensor criada         | < 500ms                           |
| LeituraSensor → AlertaBiologico       | < 200ms                           |
| AlertaBiologico → Notificação enviada | < 2s (depende do serviço externo) |
| Coleta de preços (Scheduled Event)    | < 3s (2 chamadas REST)            |
| PrecoMercado → Recomendacao gerada    | < 300ms                           |
| Recomendacao → Visível no dashboard   | imediato (data binding)           |

---

# Componentes Mendix

Referência de cada tipo de componente Mendix usado na solução e como configurá-lo.

---

## Published REST Service

Cria um endpoint HTTP que o Mendix expõe publicamente para receber dados.

**Como criar:**

1. Project Explorer → Add module → REST Services
2. Published REST Service → New
3. Adicionar recurso: `/leitura`
4. Adicionar operação: `POST`
5. Selecionar Microflow: `ImportarLeitura`
6. Configurar autenticação: `Custom` com validação de API Key

**Contrato de resposta:**

```json
{ "status": "ok", "leitura_id": 1547, "alerta_gerado": true, "severidade": "CRITICO" }
```

---

## Consumed REST Service

Faz chamadas HTTP para APIs externas a partir de Microflows.

**Como criar:**

1. Project Explorer → Add module → Consumed REST Services
2. New Consumed REST Service
3. Base URL: URL da API de preços
4. Adicionar request: GET com parâmetros de autenticação
5. Import Mapping: mapear JSON de resposta para entidade `PrecoMercado`
6. Usar em Microflow via `Call REST Service` activity

---

## Scheduled Event

Executa um Microflow automaticamente em intervalos regulares.

**Como criar:**

1. Project Explorer → Add Scheduled Event
2. Microflow: `ColetarPrecosMercado`
3. Interval: 3600 segundos
4. Start: On startup
5. Timezone: America/Sao_Paulo

> Em ambiente de desenvolvimento, use o botão `Run Now` para executar manualmente sem aguardar o intervalo.

---

## Microflow

Lógica de negócio visual. Cada ação é um bloco arrastável.

**Blocos usados nessa solução:**

| Bloco               | Função                           |
| ------------------- | -------------------------------- |
| `Create Object`     | Instancia nova entidade          |
| `Commit Object`     | Persiste no banco                |
| `Retrieve`          | Busca objetos com XPath          |
| `Exclusive Split`   | Bifurcação condicional (if/else) |
| `Call Microflow`    | Encadeia sub-microflows          |
| `Call REST Service` | Chama API externa                |
| `Change Variable`   | Calcula e atualiza variável      |
| `Aggregate List`    | SUM, COUNT em listas             |
| `Log Message`       | Debug e auditoria                |
| `Return Value`      | Retorna resultado ao chamador    |

---

## App Constants

Valores de configuração editáveis sem redeploy.

**Como criar:**

1. Project Explorer → Add App Constant
2. Definir nome, tipo (Integer ou Decimal) e valor padrão
3. Referenciar no Microflow via `$Configuration/threshold_ph_critico`
4. Para editar em produção: App → Configuration → Constants

---

## Data Grid 2

Componente de tabela com filtros, ordenação e paginação nativos. Usado na Page de Histórico.

**Configuração para a tabela de Recomendações:**

- Data source: Database (entidade `Recomendacao`)
- Filtros: Período (Date Picker), Status (Drop-down), Tipo (Drop-down)
- Colunas: data/hora, ação, motivo, lucro estimado, lucro real, status (badge condicional)
- Ordenação padrão: `criado_em` descending
- Paginação: 20 registros por página

---

_Próxima seção: [Banco de dados →](/banco-de-dados)_
