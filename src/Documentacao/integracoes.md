# Visão geral REST

O NucleoDigest usa quatro blocos de integração REST. Dois são **inbound** (o Mendix recebe dados) e dois são **outbound** (o Mendix envia dados para fora). Nenhum exige código customizado — tudo é configurado visualmente no Mendix Studio Pro.

---

## Os quatro blocos

| #   | Integração             | Direção  | Tipo Mendix                     | Frequência             |
| --- | ---------------------- | -------- | ------------------------------- | ---------------------- |
| 1   | Sensores IoT           | Inbound  | Published REST Service          | Por leitura (5–15 min) |
| 2   | Notificação biológica  | Outbound | Consumed REST + Call REST       | Quando alerta é criado |
| 3   | Preços de mercado      | Outbound | Consumed REST + Scheduled Event | A cada 1 hora          |
| 4   | Recomendação (interna) | Interna  | Microflow encadeado             | Após coleta de preços  |

---

## Princípios de integração

**Contratos JSON explícitos:** cada integração tem um contrato de request e response documentado abaixo. Mudanças no contrato exigem atualização do Import Mapping no Mendix.

**Idempotência no inbound:** o endpoint de leitura aceita a mesma leitura múltiplas vezes (sensores podem reenviar por falha de rede). O sistema cria um novo `LeituraSensor` para cada POST — a deduplicação não é necessária para o caso de uso do hackathon.

**Fallback no outbound:** se a chamada REST de preços falhar (timeout, API fora do ar), o Microflow registra um Log Warning e usa o último `PrecoMercado` disponível. A produção não para por falta de preço atualizado.

---

_Ver detalhes: [Sensores IoT →](/rest-sensor) · [Notificação →](/rest-notif) · [Preços →](/rest-precos) · [Mocks →](/rest-mock)_

---

# Sensores IoT (inbound)

O sistema recebe dados de sensores via HTTP POST. No Mendix, isso é implementado como um **Published REST Service**.

---

## Endpoint

```
POST /api/leitura
Host: {seu-app}.mendixcloud.com
Content-Type: application/json
X-API-Key: {chave-de-api}
```

---

## Request payload

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

| Campo            | Tipo     | Obrigatório | Validação             |
| ---------------- | -------- | ----------- | --------------------- |
| `biodigestor_id` | Integer  | Sim         | Deve existir no banco |
| `ph`             | Decimal  | Sim         | Range: 0 a 14         |
| `ch4_pct`        | Decimal  | Sim         | Range: 0 a 100        |
| `temperatura_c`  | Decimal  | Sim         | Range: -10 a 80       |
| `agv_mgL`        | Decimal  | Não         | Range: 0 a 20000      |
| `nh3_mgL`        | Decimal  | Não         | Range: 0 a 10000      |
| `timestamp`      | ISO 8601 | Sim         | Não pode ser futuro   |
| `origem`         | String   | Não         | Máximo 50 caracteres  |

---

## Responses

**HTTP 200 — Sucesso:**

```json
{
  "status": "ok",
  "leitura_id": 1547,
  "alerta_gerado": true,
  "severidade": "CRITICO",
  "tipo_alerta": "ACIDIFICACAO"
}
```

**HTTP 400 — Payload inválido:**

```json
{
  "status": "erro",
  "mensagem": "Campo 'ph' é obrigatório",
  "campo": "ph"
}
```

**HTTP 401 — Autenticação falhou:**

```json
{
  "status": "erro",
  "mensagem": "API Key inválida ou ausente"
}
```

---

## Configuração no Mendix

1. Project Explorer → Right-click módulo → `Add Published REST Service`
2. Name: `SensorAPI`
3. Add Resource: path `/leitura`
4. Add Operation: Method `POST`, Microflow `ImportarLeitura`
5. Authentication: `Custom` — validar header `X-API-Key` no início do Microflow
6. Enable: `Allow anonymous users` (a autenticação é feita pelo API Key)

---

# Notificação biológica

Quando o `AnalisarRisco` cria um `AlertaBiologico` com severidade `MEDIO` ou `CRITICO`, o sistema dispara uma notificação para serviço externo via HTTP POST.

---

## Endpoint alvo

Qualquer serviço que aceite um POST com JSON. Exemplos compatíveis:

| Serviço          | URL base                                | Uso             |
| ---------------- | --------------------------------------- | --------------- |
| SendGrid         | `https://api.sendgrid.com/v3/mail/send` | Email           |
| Slack Webhook    | `https://hooks.slack.com/services/...`  | Mensagem Slack  |
| Webhook genérico | Qualquer URL                            | Sistema interno |

---

## Payload enviado

```json
{
  "biodigestor": "Planta Norte 01",
  "biodigestor_id": 1,
  "tipo_alerta": "ACIDIFICACAO",
  "severidade": "CRITICO",
  "ph_atual": 6.3,
  "threshold": 6.5,
  "timestamp": "2026-04-19T14:30:00Z",
  "acao_recomendada": "Reduzir carga de insumo em 20% e monitorar pH nas próximas 2h",
  "leitura_id": 1547,
  "alerta_id": 89
}
```

---

## Configuração no Mendix

1. Project Explorer → `Add Consumed REST Service`
2. Name: `NotificacaoService`
3. Base URL: URL do serviço de notificação
4. No Microflow `AnalisarRisco`: após criar AlertaBiologico, adicionar `Call REST Service`
5. Method: POST, Body: Export Mapping do objeto AlertaBiologico
6. Tratar erro de rede com `Error Handler` — logar e continuar (não bloquear o fluxo principal)

---

# Preços de mercado

A cada hora, um Scheduled Event busca os preços atuais de energia e CBIO em APIs externas e persiste como um novo `PrecoMercado`.

---

## Endpoint energia

```
GET {BASE_URL}/preco-energia
Authorization: Bearer {token}
```

**Response:**

```json
{
  "preco_mwh": 312.5,
  "unidade": "BRL",
  "variacao_pct": 2.3,
  "fonte": "CCEE",
  "timestamp": "2026-04-19T14:00:00Z"
}
```

---

## Endpoint CBIO

```
GET {BASE_URL}/preco-cbio
Authorization: Bearer {token}
```

**Response:**

```json
{
  "preco_tcO2e": 28.4,
  "unidade": "BRL",
  "variacao_pct": -0.5,
  "fonte": "B3-RenovaBio",
  "timestamp": "2026-04-19T14:00:00Z"
}
```

---

## Configuração no Mendix

1. Criar dois Consumed REST Services: `EnergiaAPI` e `CarbonAPI`
2. Criar Scheduled Event `ColetarPrecosMercado` com intervalo 3600s
3. Microflow do Scheduled Event:
   - `Call REST Service`: GET energia → variável `preco_energia`
   - `Call REST Service`: GET CBIO → variável `preco_cbio`
   - `Create Object`: PrecoMercado com os dois valores
   - `Commit`: persiste o snapshot
4. Error Handler: se qualquer GET falhar, Log Warning e usar último PrecoMercado

---

# Recomendação interna

Esta "integração" é puramente interna ao Mendix — não há chamada REST externa. O Microflow `CalcularOtimizacao` lê os dados já persistidos e gera a `Recomendacao`.

---

## Por que não é REST

A recomendação é gerada por lógica de negócio (fórmulas + decisões condicionais) que vive inteiramente no Mendix. Torná-la um endpoint REST adicionaria latência e complexidade sem nenhum benefício para o caso de uso atual.

Se no futuro a lógica de otimização precisar de um modelo de ML externo, ela pode ser extraída para um microserviço e chamada via REST sem mudar o contrato com o frontend.

---

## Como o resultado chega ao dashboard

O `CalcularOtimizacao` cria e faz Commit de uma `Recomendacao` com `status = PENDENTE`. O dashboard usa **data binding** nativo do Mendix — a Page está vinculada diretamente à entidade `Recomendacao` e atualiza automaticamente quando um novo registro é persistido.

Não há polling, websocket ou refresh manual — o Mendix trata isso automaticamente via seu mecanismo de data binding.

---

# Mocks para o hackathon

Durante o desenvolvimento e a demo, todas as APIs externas podem ser simuladas com JSONs estáticos. O Mendix consome um mock exatamente da mesma forma que uma API real.

---

## Opções de hosting de mock

| Serviço                                | URL                                 | Gratuito          | Setup                             |
| -------------------------------------- | ----------------------------------- | ----------------- | --------------------------------- |
| [mockapi.io](https://mockapi.io)       | `https://api.mockapi.io/...`        | Sim (100 req/dia) | Criar projeto, adicionar endpoint |
| [jsonbin.io](https://jsonbin.io)       | `https://api.jsonbin.io/v3/b/...`   | Sim               | Criar bin com JSON                |
| [beeceptor.com](https://beeceptor.com) | `https://...free.beeceptor.com/...` | Sim (50 req/dia)  | Criar endpoint com resposta       |

---

## Mock: leitura saudável

```json
{
  "biodigestor_id": 1,
  "ph": 7.1,
  "ch4_pct": 62.5,
  "temperatura_c": 37.0,
  "agv_mgL": 2100,
  "nh3_mgL": 1500,
  "timestamp": "2026-04-19T14:30:00Z",
  "origem": "mock-sensor"
}
```

## Mock: leitura crítica (para demo de alerta)

```json
{
  "biodigestor_id": 1,
  "ph": 6.2,
  "ch4_pct": 47.8,
  "temperatura_c": 36.5,
  "agv_mgL": 4800,
  "nh3_mgL": 3200,
  "timestamp": "2026-04-19T14:30:00Z",
  "origem": "mock-sensor"
}
```

## Mock: preços de mercado (energia + CBIO)

```json
{
  "preco_mwh": 312.5,
  "preco_tcO2e": 28.4,
  "gas_natural_mwh": 185.0,
  "fonte": "mock",
  "timestamp": "2026-04-19T14:00:00Z"
}
```

---

## Script de demo com mocks

1. Usar leitura saudável → mostrar dashboard verde, recomendação econômica gerada
2. Usar leitura crítica → mostrar banner vermelho, alerta criado, recomendação bloqueada
3. Resolver alerta no dashboard → mostrar retorno ao estado saudável
4. Aprovar recomendação econômica → mostrar ProducaoDiaria atualizada no Histórico

---

_Próxima seção: [Microflows →](/microflows)_
