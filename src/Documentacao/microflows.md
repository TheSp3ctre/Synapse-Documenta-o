# Microflows — visão geral

Os três Microflows de decisão são o coração da solução. Eles implementam as duas ideias centrais em lógica executável no Mendix, sem nenhuma linha de código customizado.

---

## Os três Microflows e seus papéis

```
POST /api/leitura
        ↓
ImportarLeitura       ← portão de entrada: valida, persiste, encadeia
        ↓
AnalisarRisco         ← Ideia 1: inteligência biológica preditiva
        ↓
CalcularOtimizacao    ← Ideia 2: otimização econômica em tempo real
        ↓
Recomendacao (PENDENTE) → dashboard do operador
```

---

## Encadeamento

`ImportarLeitura` chama `AnalisarRisco` e `CalcularOtimizacao` via `Call Microflow`. Os três sempre rodam em sequência na mesma transação de banco. Se qualquer um falhar, toda a transação é revertida (rollback automático do Mendix).

---

## Parâmetros e retornos

| Microflow            | Parâmetro de entrada       | Retorno                          |
| -------------------- | -------------------------- | -------------------------------- |
| `ImportarLeitura`    | `HttpRequest` (corpo JSON) | `HttpResponse` (JSON com status) |
| `AnalisarRisco`      | `LeituraSensor` (objeto)   | `AlertaBiologico` (ou nulo)      |
| `CalcularOtimizacao` | `Biodigestor` (objeto)     | `Recomendacao` (objeto)          |

---

# ImportarLeitura

Ponto de entrada de todos os dados de sensores. Responsável por validar, persistir e encadear os próximos microflows.

---

## Fluxo passo a passo

```
[Início] POST /api/leitura recebido
       ↓
Extrair JSON do HttpRequest.Body
       ↓
Exclusive Split: ph presente E ch4_pct presente E temperatura_c presente?
       ├─ não → Create HttpResponse (400) + Return
       └─ sim ↓
Exclusive Split: biodigestor_id existe no banco?
       ├─ não → Create HttpResponse (400, "Biodigestor não encontrado") + Return
       └─ sim ↓
Create Object: LeituraSensor
  - biodigestor_id = param
  - ph, ch4_pct, temperatura_c, agv_mgL, nh3_mgL = do JSON
  - timestamp = do JSON (ou DateTime.now() se ausente)
  - origem = do JSON
       ↓
Commit LeituraSensor
       ↓
Call Microflow: AnalisarRisco (param: LeituraSensor)
  → retorna AlertaBiologico ou nulo
       ↓
Call Microflow: CalcularOtimizacao (param: Biodigestor)
  → retorna Recomendacao
       ↓
Create HttpResponse (200)
  - leitura_id = LeituraSensor/id
  - alerta_gerado = AlertaBiologico != nulo
  - severidade = AlertaBiologico/severidade (ou nulo)
       ↓
[Fim] Return HttpResponse
```

---

## Validações implementadas

| Validação                                         | Ação se falhar                  |
| ------------------------------------------------- | ------------------------------- |
| Campos `ph`, `ch4_pct`, `temperatura_c` presentes | HTTP 400 com campo ausente      |
| `biodigestor_id` existe no banco                  | HTTP 400 com mensagem           |
| `ph` entre 0 e 14                                 | HTTP 400 com range inválido     |
| `timestamp` não é futuro                          | Log Warning, usa DateTime.now() |
| `agv_mgL` e `nh3_mgL` ausentes                    | Aceita — campos opcionais       |

---

## Notas de implementação

- A autenticação via API Key deve ser o **primeiro** Exclusive Split do Microflow, antes de qualquer lógica de negócio
- O Import Mapping do JSON para `LeituraSensor` é feito com um `Import Mapping` activity — não manualmente campo a campo
- Use `$currentUser` para logar qual usuário fez a chamada (útil para auditoria)

---

# AnalisarRisco

Coração da Ideia 1. Verifica os quatro parâmetros biológicos em cascata usando App Constants como thresholds configuráveis.

---

## Fluxo passo a passo

```
[Início] Param: LeituraSensor
       ↓
Retrieve App Constants:
  - ph_critico = $Configuration/threshold_ph_critico (padrão 6.5)
  - agv_critico = $Configuration/threshold_agv_critico (padrão 4000)
  - ch4_medio = $Configuration/threshold_ch4_medio (padrão 50)
  - nh3_medio = $Configuration/threshold_nh3_medio (padrão 3000)
       ↓
Exclusive Split: ph < ph_critico?
       ├─ sim → Create AlertaBiologico
       │         tipo = ACIDIFICACAO, severidade = CRITICO
       │         descricao = "pH " + ph + " abaixo do limite " + ph_critico
       └─ não ↓
Exclusive Split: agv_mgL > agv_critico? (se agv_mgL não nulo)
       ├─ sim → Create AlertaBiologico
       │         tipo = ACUMULO_AGV, severidade = CRITICO
       └─ não ↓
Exclusive Split: ch4_pct < ch4_medio?
       ├─ sim → Create AlertaBiologico
       │         tipo = QUEDA_METANO, severidade = MEDIO
       └─ não ↓
Exclusive Split: nh3_mgL > nh3_medio? (se nh3_mgL não nulo)
       ├─ sim → Create AlertaBiologico
       │         tipo = INIBICAO_AMONIA, severidade = MEDIO
       └─ não ↓
[Todos saudáveis — nenhum alerta criado]
       ↓
Se qualquer AlertaBiologico foi criado:
  Commit AlertaBiologico(s)
  Call REST: NotificacaoService (payload com detalhes do alerta)
       ↓
[Fim] Return AlertaBiologico mais severo (ou nulo se nenhum)
```

---

## Por que os checks são em cascata (não paralelos)

A cascata garante que os checks de maior severidade (`CRITICO`) rodem antes dos de menor severidade (`MEDIO`). Isso permite que o retorno do microflow sempre carregue o alerta mais grave — o `ImportarLeitura` usa essa informação para montar o response HTTP.

Além disso, em versões futuras, um check `CRITICO` pode interromper os checks subsequentes para economizar processamento.

---

## Tabela de thresholds e significados

| App Constant            | Padrão    | Significado biológico                                              | Severidade |
| ----------------------- | --------- | ------------------------------------------------------------------ | ---------- |
| `threshold_ph_critico`  | 6.5       | Acidificação avançada — risco imediato de colapso anaeróbico       | CRITICO    |
| `threshold_agv_critico` | 4000 mg/L | Acúmulo de ácidos intermediários — precede queda de pH em 2–5 dias | CRITICO    |
| `threshold_ch4_medio`   | 50%       | Queda na eficiência metanogênica — produção de energia reduzida    | MEDIO      |
| `threshold_nh3_medio`   | 3000 mg/L | Inibição parcial das arqueas metanogênicas — progressiva           | MEDIO      |

---

# CalcularOtimizacao

Coração da Ideia 2. Combina estado biológico atual com preços de mercado para gerar a `Recomendacao` mais lucrativa — ou a ação corretiva urgente, se houver alerta crítico ativo.

---

## Fluxo passo a passo

```
[Início] Param: Biodigestor
       ↓
Retrieve: PrecoMercado (sort desc por timestamp, limit 1)
       ↓
Exclusive Split: PrecoMercado encontrado?
       ├─ não → Log Warning "Sem preço de mercado disponível"
       │         Return nulo
       └─ sim ↓
Retrieve: AlertaBiologico
  WHERE biodigestor = param AND resolvido = false
       ↓
Exclusive Split: existe AlertaBiologico com severidade = CRITICO?
       ├─ sim → Create Recomendacao
       │         acao = CORRECAO_BIOLOGICA
       │         lucro_estimado = perda_evitada (estimativa)
       │         motivo = "Alerta crítico ativo: " + tipo_alerta
       │         status = PENDENTE
       │         Commit + Return Recomendacao
       └─ não ↓
Retrieve: Insumo
  WHERE biodigestor = param AND data_entrada = hoje
       ↓
Change Variable: tipping_dia = Aggregate(Insumos, SUM, tipping_fee_brl)
Change Variable: logistica_dia = Aggregate(Insumos, SUM, custo_logistica_brl)
       ↓
Change Variable: biogas_estimado = Biodigestor/capacidade_m3 × 0.85
  (85% de utilização como estimativa conservadora)
       ↓
Change Variable: receita_energia =
  biogas_estimado × 0.6 × (PrecoMercado/energia_mwh_brl / 1000)
       ↓
Change Variable: receita_cbio =
  (biogas_estimado × 0.00202) × PrecoMercado/cbio_brl
       ↓
Change Variable: lucro_liquido =
  receita_energia + receita_cbio + tipping_dia - logistica_dia
       ↓
Create Recomendacao
  acao = VENDER_ENERGIA (ou EMITIR_CARBONO se CBIO > energia)
  lucro_estimado_brl = lucro_liquido
  preco_mercado_id = PrecoMercado/id
  biodigestor_id = Biodigestor/id
  motivo = "Energia R$" + receita_energia + " | CBIO R$" + receita_cbio
  status = PENDENTE
  criado_em = DateTime.now()
       ↓
Commit Recomendacao
       ↓
[Fim] Return Recomendacao
```

---

## Lógica de escolha da ação

```
Se receita_energia > receita_cbio:
    acao = VENDER_ENERGIA
Senão se receita_cbio > receita_energia:
    acao = EMITIR_CARBONO
Senão:
    acao = VENDER_ENERGIA (desempate padrão)
```

Na versão do hackathon, as ações são mutuamente exclusivas para simplificar. Em produção, seria possível dividir o biogás entre energia e crédito de carbono para maximizar ainda mais a receita.

---

# Fórmulas de cálculo

Referência completa das fórmulas usadas no `CalcularOtimizacao` com explicação de cada fator de conversão.

---

## Receita de energia elétrica

```
receita_energia = biogas_m3 × 0.6 × (preco_energia_mwh / 1000)
```

| Variável            | Unidade      | Origem                                                  |
| ------------------- | ------------ | ------------------------------------------------------- |
| `biogas_m3`         | m³/dia       | Estimado: `capacidade_m3 × 0.85`                        |
| `0.6`               | adimensional | Eficiência de conversão biogás → energia elétrica (60%) |
| `preco_energia_mwh` | R$/MWh       | PrecoMercado mais recente                               |
| `÷ 1000`            | —            | Converte kWh para MWh (1 MWh = 1000 kWh)                |

**Exemplo:**

```
500 m³ × 0.6 × (312.50 / 1000) = R$ 93,75/dia
```

---

## Receita de crédito de carbono (CBIO)

```
receita_cbio = (biogas_m3 × 0.00202) × preco_cbio_brl
```

| Variável         | Unidade  | Origem                                                      |
| ---------------- | -------- | ----------------------------------------------------------- |
| `biogas_m3`      | m³/dia   | Estimado: `capacidade_m3 × 0.85`                            |
| `0.00202`        | tCO₂e/m³ | Fator de emissão do metano (GWP 21, metano = 55% do biogás) |
| `preco_cbio_brl` | R$/tCO₂e | PrecoMercado mais recente                                   |

**Exemplo:**

```
(500 × 0.00202) × 28.40 = 1.01 tCO₂e × R$28.40 = R$ 28,68/dia
```

---

## Lucro líquido total

```
lucro_liquido = receita_energia
              + receita_cbio
              + tipping_dia
              − logistica_dia
```

| Variável          | Origem                                               |
| ----------------- | ---------------------------------------------------- |
| `receita_energia` | Calculado (ver acima)                                |
| `receita_cbio`    | Calculado (ver acima)                                |
| `tipping_dia`     | Aggregate SUM de `Insumo.tipping_fee_brl` do dia     |
| `logistica_dia`   | Aggregate SUM de `Insumo.custo_logistica_brl` do dia |

**Exemplo completo:**

```
R$ 93,75 (energia)
+ R$ 28,68 (CBIO)
+ R$ 640,00 (tipping de 3 lotes recebidos)
− R$ 120,00 (logística)
= R$ 642,43 de lucro líquido no dia
```

---

## Fator de conversão CO₂e — origem e cálculo

O fator `0.00202 tCO₂e/m³` é derivado da seguinte cadeia:

```
Biogás = 55% CH4 + 45% CO2 (composição típica)
CH4 no m³ = 0.55 m³/m³ × 0.717 kg/m³ = 0.394 kg CH4/m³ biogás
CO2e = 0.394 kg × GWP(21) = 8.28 kg CO2e/m³ → 0.00828 tCO2e/m³
Desconto por combustão (eficiência 85%) = 0.00828 × 0.244 = 0.00202 tCO2e/m³
```

> GWP (Global Warming Potential) do metano = 21 (IPCC AR4, período 100 anos), referência padrão para o mercado brasileiro de carbono.

---

# App Constants

Todos os parâmetros configuráveis da solução, sem necessidade de redeploy.

---

## Tabela completa

| Constante               | Tipo    | Valor padrão | Onde é usado                           |
| ----------------------- | ------- | ------------ | -------------------------------------- |
| `threshold_ph_critico`  | Decimal | 6.5          | `AnalisarRisco` — split pH             |
| `threshold_agv_critico` | Decimal | 4000         | `AnalisarRisco` — split AGV            |
| `threshold_ch4_medio`   | Decimal | 50           | `AnalisarRisco` — split CH4            |
| `threshold_nh3_medio`   | Decimal | 3000         | `AnalisarRisco` — split NH3            |
| `eficiencia_conversao`  | Decimal | 0.6          | `CalcularOtimizacao` — receita energia |
| `fator_co2e_m3`         | Decimal | 0.00202      | `CalcularOtimizacao` — receita CBIO    |
| `utilizacao_capacidade` | Decimal | 0.85         | `CalcularOtimizacao` — biogas estimado |
| `intervalo_coleta_min`  | Integer | 60           | Scheduled Event — frequência           |

---

## Como editar em produção

1. Mendix Portal → App → Environments → Details
2. Model Options → Constants
3. Editar valor → Save
4. **Não é necessário redeploy** — a alteração é aplicada imediatamente

---

## Recomendações de ajuste por tipo de biodigestor

| Tipo de biodigestor        | `threshold_ph_critico` | `threshold_agv_critico` | `eficiencia_conversao` |
| -------------------------- | ---------------------- | ----------------------- | ---------------------- |
| Resíduo agrícola (bagaço)  | 6.5                    | 4000                    | 0.58                   |
| Dejeto suíno               | 6.8                    | 3500                    | 0.62                   |
| RSU (lixo orgânico urbano) | 6.3                    | 4500                    | 0.55                   |
| Industrial (frigorífico)   | 6.6                    | 3800                    | 0.60                   |

---

_Próxima seção: [Interface →](/interface)_
