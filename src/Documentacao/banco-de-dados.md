# Domain model — visão geral

O banco de dados do NucleoDigest é composto por 8 entidades organizadas em 3 grupos lógicos. No Mendix, cada entidade é criada visualmente no Domain Model e o banco (PostgreSQL) é gerenciado automaticamente pela plataforma.

---

## Os três grupos

```
GRUPO FÍSICO          GRUPO INTELIGÊNCIA      GRUPO RESULTADOS
─────────────         ──────────────────       ────────────────
Biodigestor      →    AlertaBiologico    →     ProducaoDiaria
LeituraSensor    →    PrecoMercado       →     (consolida tudo)
Insumo           →    Recomendacao
```

**Grupo físico:** representa o que existe no mundo real — o digestor, as medições e os insumos que entram.

**Grupo de inteligência:** representa o que o sistema processa — alertas gerados, preços capturados e recomendações calculadas.

**Grupo de resultados:** consolida as decisões tomadas em registros de produção diária para relatórios e análise histórica.

---

## Diagrama de relacionamentos

```
Biodigestor ──1:N──→ LeituraSensor ──1:N──→ AlertaBiologico
     │                                              │
     ├──1:N──→ Insumo                               │
     │                                              │
     ├──1:N──→ Recomendacao ←────────── PrecoMercado
     │              │
     ├──1:N──→ ProducaoDiaria ←──────── Recomendacao
     │
     └──1:N──→ Usuario
```

---

## Regras gerais do Domain Model

- Todo objeto tem `id` como AutoNumber (chave primária gerada pelo Mendix)
- Toda entidade exceto `PrecoMercado` tem `biodigestor_id` como FK — o contexto de biodigestor é sempre obrigatório
- `PrecoMercado` é global — não pertence a um biodigestor específico
- Associations diretas no Domain Model para relações frequentemente navegadas
- Retrieve via XPath para relações menos frequentes (ex: Insumo → ProducaoDiaria)

---

# Biodigestor

Entidade raiz e âncora de todo o sistema. Toda consulta começa com o contexto de um `Biodigestor` específico.

---

## Campos

| Campo           | Tipo Mendix  | Obrigatório | Descrição                                               |
| --------------- | ------------ | ----------- | ------------------------------------------------------- |
| `id`            | AutoNumber   | Sim         | Chave primária gerada automaticamente                   |
| `nome`          | String (100) | Sim         | Nome identificador da planta (ex: Biodigestor Norte 01) |
| `localizacao`   | String (255) | Não         | Endereço ou coordenadas GPS                             |
| `capacidade_m3` | Decimal      | Sim         | Capacidade volumétrica total em metros cúbicos          |
| `status`        | Enumeration  | Sim         | `ATIVO`, `MANUTENCAO`, `INATIVO`                        |
| `criado_em`     | DateTime     | Sim         | Timestamp de cadastro no sistema                        |

## Associations

| Para              | Cardinalidade | Tipo               |
| ----------------- | ------------- | ------------------ |
| `LeituraSensor`   | 1 para N      | Association direta |
| `AlertaBiologico` | 1 para N      | Association direta |
| `Insumo`          | 1 para N      | Association direta |
| `Recomendacao`    | 1 para N      | Association direta |
| `ProducaoDiaria`  | 1 para N      | Association direta |
| `Usuario`         | 1 para N      | Association direta |

## Validações

- `nome`: único por instalação (validação no Microflow de cadastro)
- `capacidade_m3`: deve ser maior que zero
- `status`: padrão `ATIVO` na criação

---

# LeituraSensor

Registro de cada medição recebida dos sensores IoT. É a entidade mais frequentemente inserida — uma entrada por ciclo de leitura.

---

## Campos

| Campo            | Tipo Mendix      | Obrigatório | Descrição                                               |
| ---------------- | ---------------- | ----------- | ------------------------------------------------------- |
| `id`             | AutoNumber       | Sim         | Chave primária                                          |
| `biodigestor_id` | Association (FK) | Sim         | Biodigestor que gerou a leitura                         |
| `timestamp`      | DateTime         | Sim         | Momento exato da medição no sensor                      |
| `ph`             | Decimal          | Sim         | Potencial hidrogeniônico — range saudável: 6.8 a 7.5    |
| `ch4_pct`        | Decimal          | Sim         | Percentual de metano no biogás — saudável: > 55%        |
| `temperatura_c`  | Decimal          | Sim         | Temperatura interna em graus Celsius — ótima: 35 a 38°C |
| `agv_mgL`        | Decimal          | Não         | Ácido graxo volátil em mg/L — saudável: < 3000          |
| `nh3_mgL`        | Decimal          | Não         | Amônia livre em mg/L — saudável: < 2000                 |
| `origem`         | String (50)      | Não         | Identificador do sensor (ex: sensor-A1)                 |

## Notas

- `agv_mgL` e `nh3_mgL` são opcionais pois nem todas as instalações terão sensores para esses parâmetros. Quando ausentes, os checks correspondentes no `AnalisarRisco` são ignorados
- `timestamp` deve vir do sensor (não do servidor) para preservar a hora real da medição
- Registros são imutáveis após o Commit — nunca atualizar uma leitura, sempre criar nova

---

# Insumo

Registra cada entrada de resíduo orgânico no biodigestor. Essencial para calcular o custo real de operação e o lucro líquido por dia.

---

## Campos

| Campo                 | Tipo Mendix      | Obrigatório | Descrição                                                |
| --------------------- | ---------------- | ----------- | -------------------------------------------------------- |
| `id`                  | AutoNumber       | Sim         | Chave primária                                           |
| `biodigestor_id`      | Association (FK) | Sim         | Biodigestor receptor                                     |
| `tipo_residuo`        | String (100)     | Sim         | Categoria do resíduo (ex: bagaço de cana, dejeto bovino) |
| `volume_ton`          | Decimal          | Sim         | Volume recebido em toneladas                             |
| `tipping_fee_brl`     | Decimal          | Sim         | Valor cobrado pelo tratamento do resíduo (R$)            |
| `custo_logistica_brl` | Decimal          | Sim         | Custo de transporte e manuseio (R$)                      |
| `data_entrada`        | DateTime         | Sim         | Data e hora da entrada do insumo                         |

## Uso no cálculo econômico

```
receita_tipping_dia = Aggregate(Insumo, SUM, tipping_fee_brl)
                      WHERE data_entrada = hoje
                      AND biodigestor = contexto atual

custo_logistica_dia = Aggregate(Insumo, SUM, custo_logistica_brl)
                      WHERE data_entrada = hoje
```

---

# AlertaBiologico

Gerado automaticamente pelo `AnalisarRisco` quando um threshold biológico é violado. Uma única `LeituraSensor` pode gerar múltiplos alertas simultâneos.

---

## Campos

| Campo            | Tipo Mendix      | Obrigatório | Descrição                                                        |
| ---------------- | ---------------- | ----------- | ---------------------------------------------------------------- |
| `id`             | AutoNumber       | Sim         | Chave primária                                                   |
| `leitura_id`     | Association (FK) | Sim         | LeituraSensor que originou o alerta                              |
| `biodigestor_id` | Association (FK) | Sim         | Biodigestor em alerta (denormalizado para consulta rápida)       |
| `tipo_alerta`    | Enumeration      | Sim         | `ACIDIFICACAO`, `ACUMULO_AGV`, `QUEDA_METANO`, `INIBICAO_AMONIA` |
| `severidade`     | Enumeration      | Sim         | `BAIXO`, `MEDIO`, `CRITICO`                                      |
| `descricao`      | String (500)     | Não         | Mensagem descritiva gerada automaticamente                       |
| `resolvido`      | Boolean          | Sim         | `false` enquanto ativo, `true` após confirmação                  |
| `criado_em`      | DateTime         | Sim         | Timestamp de criação do alerta                                   |
| `resolvido_em`   | DateTime         | Não         | Timestamp de resolução (nulo se ativo)                           |

## Ciclo de vida

```
CRIADO (resolvido = false)
    ↓
Operador toma ação corretiva
    ↓
Operador marca como resolvido no dashboard
    ↓
RESOLVIDO (resolvido = true, resolvido_em = agora)
```

## Consulta XPath para alertas ativos

```
[Biodigestor/NucleoDigest.Biodigestor/id = $BiodId
 AND resolvido = false]
```

---

# PrecoMercado

Snapshot periódico dos preços de mercado. Não possui FK para `Biodigestor` — é uma informação global compartilhada por todos os biodigestores.

---

## Campos

| Campo             | Tipo Mendix  | Obrigatório | Descrição                                               |
| ----------------- | ------------ | ----------- | ------------------------------------------------------- |
| `id`              | AutoNumber   | Sim         | Chave primária                                          |
| `timestamp`       | DateTime     | Sim         | Momento exato da captura dos preços                     |
| `energia_mwh_brl` | Decimal      | Sim         | Preço spot energia em R$/MWh (fonte: CCEE)              |
| `cbio_brl`        | Decimal      | Sim         | Preço do crédito CBIO em R$/tCO₂e (fonte: B3/RenovaBio) |
| `gas_natural_mwh` | Decimal      | Não         | Preço de referência do gás natural para comparação      |
| `fonte`           | String (100) | Não         | Identificador da API de origem dos dados                |

## Como é criado

Pelo Scheduled Event `ColetarPrecosMercado` a cada hora. O Microflow faz dois GET REST e consolida o resultado em um único objeto `PrecoMercado`.

## Como é consultado

No `CalcularOtimizacao`, o Retrieve busca o registro mais recente:

```
[id = max(PrecoMercado/id)]
```

---

# Recomendacao

Entidade central da Ideia 2. Cruza estado biológico com preços de mercado e gera a ação mais lucrativa possível.

---

## Campos

| Campo                | Tipo Mendix      | Obrigatório | Descrição                                                                   |
| -------------------- | ---------------- | ----------- | --------------------------------------------------------------------------- |
| `id`                 | AutoNumber       | Sim         | Chave primária                                                              |
| `biodigestor_id`     | Association (FK) | Sim         | Biodigestor alvo                                                            |
| `preco_mercado_id`   | Association (FK) | Sim         | Snapshot de preços usado no cálculo                                         |
| `acao_recomendada`   | Enumeration      | Sim         | `VENDER_ENERGIA`, `EMITIR_CARBONO`, `ACEITAR_TIPPING`, `CORRECAO_BIOLOGICA` |
| `lucro_estimado_brl` | Decimal          | Sim         | Lucro líquido estimado em reais                                             |
| `motivo`             | String (500)     | Não         | Justificativa detalhada da recomendação                                     |
| `status`             | Enumeration      | Sim         | `PENDENTE`, `APROVADA`, `REJEITADA`, `EXPIRADA`                             |
| `criado_em`          | DateTime         | Sim         | Timestamp de criação                                                        |
| `decidido_em`        | DateTime         | Não         | Timestamp da decisão do operador                                            |

## Ciclo de vida

```
PENDENTE → operador aprova → APROVADA → ProducaoDiaria atualizada
PENDENTE → operador rejeita → REJEITADA → nova recomendação gerada
PENDENTE → nova leitura chega antes → EXPIRADA
```

## Nota sobre CORRECAO_BIOLOGICA

Quando `acao_recomendada = CORRECAO_BIOLOGICA`, o campo `lucro_estimado_brl` registra a **perda evitada** — o valor que seria perdido se o colapso ocorresse. Isso dá ao operador uma dimensão econômica da urgência da ação corretiva.

---

# ProducaoDiaria

Consolida todos os resultados de um dia de operação. É a entidade de onde saem todos os gráficos do dashboard histórico.

---

## Campos

| Campo                   | Tipo Mendix      | Obrigatório | Descrição                                |
| ----------------------- | ---------------- | ----------- | ---------------------------------------- |
| `id`                    | AutoNumber       | Sim         | Chave primária                           |
| `biodigestor_id`        | Association (FK) | Sim         | Biodigestor do registro                  |
| `recomendacao_id`       | Association (FK) | Não         | Recomendação aprovada vigente no dia     |
| `data`                  | Date             | Sim         | Data de referência (sem hora)            |
| `biogas_m3`             | Decimal          | Não         | Volume total de biogás produzido no dia  |
| `energia_kwh`           | Decimal          | Não         | Energia elétrica gerada em kWh           |
| `receita_energia_brl`   | Decimal          | Não         | Receita da venda de energia (R$)         |
| `receita_cbio_brl`      | Decimal          | Não         | Receita de créditos CBIO (R$)            |
| `receita_tipping_brl`   | Decimal          | Não         | Receita de tipping fees do dia (R$)      |
| `receita_digestato_brl` | Decimal          | Não         | Receita da venda de biofertilizante (R$) |
| `receita_total_brl`     | Decimal          | Sim         | Soma de todas as receitas do dia         |

## Como é calculado `receita_total_brl`

```
receita_total_brl = receita_energia_brl
                  + receita_cbio_brl
                  + receita_tipping_brl
                  + receita_digestato_brl
```

Calculado no Microflow após aprovação da `Recomendacao` e persistido com Commit.

---

# Usuario

Vincula operadores e gestores a um biodigestor específico.

---

## Campos

| Campo            | Tipo Mendix      | Obrigatório | Descrição                      |
| ---------------- | ---------------- | ----------- | ------------------------------ |
| `id`             | AutoNumber       | Sim         | Chave primária                 |
| `biodigestor_id` | Association (FK) | Sim         | Biodigestor vinculado          |
| `nome`           | String (100)     | Sim         | Nome completo                  |
| `email`          | String (200)     | Sim         | Email de acesso (login Mendix) |
| `perfil`         | Enumeration      | Sim         | `OPERADOR`, `GESTOR`, `ADMIN`  |

## Permissões por perfil

| Perfil     | Saúde               | Econômico           | Histórico        | Configurações |
| ---------- | ------------------- | ------------------- | ---------------- | ------------- |
| `OPERADOR` | Leitura + aprovação | Somente leitura     | Não acessa       | Não acessa    |
| `GESTOR`   | Leitura + aprovação | Leitura + aprovação | Leitura completa | Não acessa    |
| `ADMIN`    | Acesso total        | Acesso total        | Acesso total     | Acesso total  |

---

# Relacionamentos

Tabela completa de todos os relacionamentos do Domain Model com cardinalidade e tipo de implementação.

---

## Tabela de relacionamentos

| Entidade origem | Entidade destino  | Cardinalidade       | Implementação Mendix                                 |
| --------------- | ----------------- | ------------------- | ---------------------------------------------------- |
| `Biodigestor`   | `LeituraSensor`   | 1 para N            | Association direta — `Biodigestor_LeituraSensor`     |
| `Biodigestor`   | `AlertaBiologico` | 1 para N            | Association direta — `Biodigestor_AlertaBiologico`   |
| `Biodigestor`   | `Insumo`          | 1 para N            | Association direta — `Biodigestor_Insumo`            |
| `Biodigestor`   | `Recomendacao`    | 1 para N            | Association direta — `Biodigestor_Recomendacao`      |
| `Biodigestor`   | `ProducaoDiaria`  | 1 para N            | Association direta — `Biodigestor_ProducaoDiaria`    |
| `Biodigestor`   | `Usuario`         | 1 para N            | Association direta — `Biodigestor_Usuario`           |
| `LeituraSensor` | `AlertaBiologico` | 1 para N            | Association direta — `LeituraSensor_AlertaBiologico` |
| `PrecoMercado`  | `Recomendacao`    | 1 para N            | Association direta — `PrecoMercado_Recomendacao`     |
| `Recomendacao`  | `ProducaoDiaria`  | 1 para N            | Association direta — `Recomendacao_ProducaoDiaria`   |
| `Insumo`        | `ProducaoDiaria`  | referência indireta | Retrieve via XPath por data no Microflow             |

## Convenção de nomenclatura das associations no Mendix

```
[EntidadeOrigem]_[EntidadeDestino]
Exemplo: Biodigestor_LeituraSensor
```

A association fica no módulo principal. O lado "1" é sempre o dono da association no Domain Model do Mendix.

## Por que `Insumo → ProducaoDiaria` é indireta

O `Insumo` não tem uma FK para `ProducaoDiaria` porque um insumo pode entrar em qualquer momento do dia e seu tipping fee é agregado (SUM) no final do dia quando `ProducaoDiaria` é criado. A relação é temporal — não estrutural.

---

_Próxima seção: [Integrações REST →](/integracoes)_
