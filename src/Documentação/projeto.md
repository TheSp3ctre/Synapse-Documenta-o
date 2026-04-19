# Roadmap

10 fases de implementação ordenadas por prioridade para o hackathon. As fases 1 a 6 são o mínimo para uma demo funcional. As fases 7 a 10 enriquecem a apresentação mas podem ser entregues parcialmente.

---

## Fases de implementação

| Fase | Entregável | Prioridade | Estimativa |
|---|---|---|---|
| 1 — Domain Model | 8 entidades + associations + enumerations | Crítica | 1–2h |
| 2 — Mock REST | JSONs estáticos para sensores e preços | Crítica | 30min |
| 3 — ImportarLeitura | Published REST + Import Mapping + Commit | Crítica | 1h |
| 4 — AnalisarRisco | 4 Exclusive Splits + Create AlertaBiologico + App Constants | Crítica | 1–2h |
| 5 — Page Saúde | Gauges + banner risco + lista alertas + botões | Crítica | 2h |
| 6 — CalcularOtimizacao | Guard biológico + fórmulas + Create Recomendacao | Alta | 1–2h |
| 7 — Page Econômica | Metric cards + gráfico + recomendação ativa | Alta | 1–2h |
| 8 — Scheduled Event | Coleta periódica de preços via REST | Média | 1h |
| 9 — Page Histórico | Data Grid 2 + filtros + gráficos de resumo | Média | 1–2h |
| 10 — Notificações | POST REST externo para alertas críticos | Baixa | 1h |

**Total estimado:** 12–17 horas de desenvolvimento

---

## Fase 1 — Domain Model (Crítica)

**Por onde começar:**
1. Criar o módulo principal: `NucleoDigest`
2. Criar as enumerations antes das entidades:
   - `StatusBiodigestor`: ATIVO, MANUTENCAO, INATIVO
   - `TipoAlerta`: ACIDIFICACAO, ACUMULO_AGV, QUEDA_METANO, INIBICAO_AMONIA
   - `Severidade`: BAIXO, MEDIO, CRITICO
   - `AcaoRecomendada`: VENDER_ENERGIA, EMITIR_CARBONO, ACEITAR_TIPPING, CORRECAO_BIOLOGICA
   - `StatusRecomendacao`: PENDENTE, APROVADA, REJEITADA, EXPIRADA
   - `PerfilUsuario`: OPERADOR, GESTOR, ADMIN
3. Criar entidades na ordem: Biodigestor → LeituraSensor → AlertaBiologico → Insumo → PrecoMercado → Recomendacao → ProducaoDiaria → Usuario
4. Adicionar associations depois de criar todas as entidades

---

## Fase 2 — Mocks REST (Crítica)

**Criar dois bins no jsonbin.io:**

Bin 1 — leitura saudável:
```json
{"biodigestor_id":1,"ph":7.1,"ch4_pct":62.5,"temperatura_c":37.0,"agv_mgL":2100,"nh3_mgL":1500,"timestamp":"2026-04-19T14:30:00Z","origem":"mock"}
```

Bin 2 — leitura crítica (para demo de alerta):
```json
{"biodigestor_id":1,"ph":6.2,"ch4_pct":47.8,"temperatura_c":36.5,"agv_mgL":4800,"nh3_mgL":3200,"timestamp":"2026-04-19T14:30:00Z","origem":"mock"}
```

Bin 3 — preços de mercado:
```json
{"preco_mwh":312.50,"preco_tcO2e":28.40,"gas_natural_mwh":185.00,"fonte":"mock","timestamp":"2026-04-19T14:00:00Z"}
```

---

## Checklist de demo mínima (fases 1–6)

- [ ] Domain Model completo com 8 entidades
- [ ] Pelo menos 1 Biodigestor cadastrado no banco
- [ ] Endpoint POST /api/leitura funcionando
- [ ] AnalisarRisco gerando AlertaBiologico com leitura crítica
- [ ] Page Saúde mostrando gauges e alerta
- [ ] Botão Aprovar funcionando
- [ ] Recomendacao gerada e visível

---

# Script de demo

Roteiro de 5 minutos para apresentar o NucleoDigest ao júri do hackathon com o máximo de impacto.

---

## Estrutura dos 5 minutos

| Tempo | Momento | O que mostrar |
|---|---|---|
| 0:00–0:30 | Abertura | Contextualizar o problema em uma frase |
| 0:30–1:30 | Demo Saúde (normal) | Dashboard verde, dados em tempo real |
| 1:30–2:30 | Demo Saúde (alerta) | Simular leitura crítica, mostrar alerta |
| 2:30–3:30 | Demo Econômico | Mostrar cálculo de lucro e recomendação |
| 3:30–4:30 | Demo Histórico | Mostrar resultado e taxa de aprovação |
| 4:30–5:00 | Fechamento | Destacar o diferencial e a escala |

---

## Roteiro palavra a palavra

**0:00 — Abertura (30s)**

> "Um biodigestor industrial perde até R$ 90 mil quando o microbioma colapsa. O problema é que o operador só descobre o colapso quando ele já aconteceu. O NucleoDigest detecta os sinais 2 a 5 dias antes — e ainda decide quando é mais lucrativo vender a energia gerada."

---

**0:30 — Dashboard Saúde, estado normal (30s)**

> "Aqui está o dashboard de saúde. Os quatro gauges mostram pH, metano, temperatura e ácido graxo volátil em tempo real. Tudo verde — o sistema está saudável. O operador pode ver numa olhada."

Ação: mostrar a Page Saúde com dados normais, gauges verdes.

---

**1:00 — Simulação de leitura crítica (60s)**

> "Agora vou simular uma leitura de sensor com pH caindo para 6.2 e AGV acima de 4.800."

Ação: fazer POST com o JSON de leitura crítica (via Postman, curl ou botão de teste).

> "O sistema detectou imediatamente. O banner ficou vermelho, dois alertas foram criados — acidificação crítica e acúmulo de AGV. E olha aqui embaixo: o sistema já gerou uma recomendação de ação corretiva com instrução específica para o operador."

Ação: mostrar o banner vermelho, lista de alertas, card de recomendação.

> "Repara que o botão de recomendação econômica sumiu. O sistema entende que não adianta otimizar receita quando o biodigestor está comprometido. Biologia primeiro, dinheiro depois."

---

**2:30 — Painel Econômico (60s)**

> "Agora vou resolver o alerta e mostrar o painel econômico."

Ação: marcar alerta como resolvido, navegar para Page Econômica.

> "Quatro fontes de receita calculadas em tempo real: energia, crédito de carbono CBIO, tipping fee dos resíduos que recebemos e biofertilizante. O sistema consultou o preço spot da CCEE — R$ 312 por MWh — e calculou que vender energia agora gera R$ 4.200 de lucro líquido."

Ação: mostrar os 4 metric cards e o card de recomendação com breakdown.

> "O operador aprova com um clique. Ou rejeita e o sistema gera uma nova recomendação."

Ação: clicar em Aprovar.

---

**3:30 — Histórico (60s)**

> "No histórico, o gestor vê todas as recomendações dos últimos 30 dias. 47 recomendações, 81% aprovadas, R$ 142 mil de receita gerada. E o gráfico mostra que quando o sistema estava monitorando, a receita foi consistente — sem os vales de um colapso."

Ação: mostrar a tabela com badges coloridos e os dois gráficos do rodapé.

---

**4:30 — Fechamento (30s)**

> "Tudo isso rodando em Mendix, sem infra customizada, consumindo APIs REST simples. A Siemens garante que o equipamento funciona. O NucleoDigest garante que a biologia não para — e que cada metro cúbico de biogás gere o máximo possível de retorno."

---

## Dicas para a demo

- **Tenha o JSON de leitura crítica copiado** no clipboard antes de começar — a simulação precisa ser rápida
- **Abra as três páginas em abas** para navegar sem delay
- **Conheça os números de cor:** R$ 4.200 de lucro, pH 6.2, AGV 4.800, 81% aprovadas
- **Se algo quebrar:** "Vou mostrar diretamente no banco de dados" — abra o Mendix Data Explorer
- **Foco no guard biológico:** é o diferencial mais forte e o que o júri vai lembrar

---

# Pitch para investidores

Argumentos estruturados para apresentar o NucleoDigest a investidores de impacto, fundos de energia renovável e corporates como a própria Siemens.

---

## O problema em números

- Mercado global de biodigestores: **USD 63 bilhões até 2037** (CAGR 6–10% ao ano)
- Perda por colapso biológico: **R$ 52.000 a R$ 90.000 por evento**
- Colapsos por ano sem monitoramento: **2 a 4 eventos**
- Perda anual evitável: **R$ 100.000 a R$ 360.000 por planta**

---

## O que o mercado atual não resolve

| Solução atual | O que monitora | O que ignora |
|---|---|---|
| Siemens industrial IoT | Equipamento, sensores físicos | Biologia do microbioma |
| SCADA tradicional | Pressão, temperatura, fluxo | AGV, amônia, tendências biológicas |
| Planilhas manuais | pH diário | Tudo o mais |
| Nenhuma solução | — | Otimização econômica em tempo real |

---

## O diferencial do NucleoDigest

1. **Monitoramento biológico preditivo** — monitora AGV (indicador 2–5 dias antes do colapso), não apenas pH
2. **Guard biológico integrado** — a otimização econômica só roda quando o sistema está saudável
3. **4 fontes de receita otimizadas simultaneamente** — energia + CBIO + tipping + biofertilizante
4. **Low-code em Mendix** — deploy em semanas, não meses; replicável sem infra adicional
5. **Regulação a favor** — Lei 15.042/2024 criou mercado regulado de carbono no Brasil

---

## Modelo de receita (SaaS)

| Tier | Preço sugerido | Inclui |
|---|---|---|
| Starter | R$ 1.500/mês/planta | Monitoramento biológico + alertas |
| Pro | R$ 3.500/mês/planta | Starter + otimizador econômico + relatórios |
| Enterprise | Sob consulta | Multi-planta + API customizada + SLA dedicado |

**Break-even para o cliente:** uma colapse evitada por ano cobre mais de 12 meses de assinatura Pro.

---

## Oportunidade no Brasil

| Indicador | Dado |
|---|---|
| Biodigestores industriais ativos | ~800 plantas (estimativa ABiogás 2024) |
| Potencial de expansão | +3.000 plantas até 2030 (meta RenovaBio) |
| Mercado endereçável (TAM) | R$ 126 M/ano (3.000 plantas × R$ 3.500/mês) |
| Mercado acessível inicial (SAM) | R$ 25 M/ano (600 plantas Tier Pro) |

---

## Próximos passos

1. **Piloto pago** com 3 plantas industriais parceiras (frigorífico, usina de cana, aterro)
2. **Validar fórmulas de conversão** com dados reais de produção
3. **Integrar API CCEE** para preço spot em tempo real (atualmente mockado)
4. **Certificação CBIO** — parceria com certificador acreditado pela ANP

---

# Glossário

Termos técnicos biológicos e econômicos usados na documentação.

---

## Termos biológicos

**AGV (Ácido Graxo Volátil)**
Ácidos orgânicos de cadeia curta (acético, propiônico, butírico) produzidos durante a digestão anaeróbia. Seu acúmulo é o principal indicador preditivo de acidificação — sobe 2 a 5 dias antes da queda de pH. Medido em mg/L. Range saudável: abaixo de 3000 mg/L.

**Acidificação**
Processo de queda do pH do digestor causado pelo acúmulo de ácidos (AGV). Abaixo de pH 6.5, as bactérias metanogênicas são inibidas e a produção de metano cessa. Recuperação leva de 3 a 15 dias.

**Anaerobiose**
Processo de decomposição de matéria orgânica na ausência de oxigênio. Base do funcionamento do biodigestor. Envolve quatro grupos de microrganismos em cadeia: hidrolíticos → acidogênicos → acetogênicos → metanogênicos.

**Biogás**
Mistura gasosa produzida pela digestão anaeróbia. Composição típica: 55–70% metano (CH4) e 30–45% dióxido de carbono (CO2). Pode ser usado diretamente para gerar energia elétrica ou purificado para biometano.

**Biometano**
Biogás purificado para concentração de metano acima de 97%. Pode ser injetado na rede de gás natural ou usado como combustível veicular.

**CH4 (Metano)**
Principal componente energético do biogás. Abaixo de 50% do volume total indica problema na etapa de metanogênese. GWP (potencial de aquecimento global) = 21 em 100 anos.

**Digestato**
Resíduo líquido gerado após a digestão anaeróbia. Rico em nitrogênio, fósforo e potássio — funciona como biofertilizante orgânico para agricultura. É a quarta fonte de receita do biodigestor.

**GWP (Global Warming Potential)**
Medida de quanto um gás de efeito estufa aquece a atmosfera comparado ao CO2 (GWP = 1). O metano tem GWP = 21 em 100 anos (IPCC AR4) — base para calcular tCO2e gerado ao queimar biogás.

**Inibição por amônia**
Toxicidade causada pelo acúmulo de amônia livre (NH3) no digestor, geralmente por excesso de proteínas no substrato. Inibe as arqueas metanogênicas de forma progressiva. Acima de 3000 mg/L é considerado nível de alerta.

**Metanogênese**
Última etapa da digestão anaeróbia, realizada por arqueas metanogênicas. Converte acetato e hidrogênio em metano e CO2. É a etapa mais sensível a pH, temperatura e toxinas.

**Microbioma**
Comunidade de microrganismos (bactérias e arqueas) responsável pela digestão anaeróbia. Inclui pelo menos quatro grupos funcionais em cadeia trófica. O equilíbrio do microbioma é o que determina a eficiência e a estabilidade do biodigestor.

**pH**
Medida de acidez ou alcalinidade numa escala de 0 a 14. pH 7 é neutro. O biodigestor opera idealmente entre 6.8 e 7.5. Abaixo de 6.5, as arqueas metanogênicas são inibidas.

**Substrato**
Material orgânico utilizado como alimentação do biodigestor. Pode ser: dejetos animais, resíduos agroindustriais, lixo orgânico urbano, efluentes de frigoríficos, bagaço de cana, entre outros.

---

## Termos econômicos

**CBIO (Crédito de Descarbonização)**
Ativo financeiro criado pelo programa RenovaBio (Lei 13.576/2017). Cada CBIO representa 1 tonelada de CO2 que deixou de ser emitida. Negociado na B3. Distribuidoras de combustíveis têm meta compulsória de compra anual.

**CCEE (Câmara de Comercialização de Energia Elétrica)**
Entidade que administra o mercado de energia elétrica no Brasil, incluindo o Mercado de Curto Prazo (spot) onde são definidos os preços de energia a cada hora.

**PLD (Preço de Liquidação das Diferenças)**
Preço spot de energia elétrica no Brasil, definido semanalmente pela CCEE com base no custo marginal de operação do sistema elétrico. Varia por submercado e período úmido/seco.

**RenovaBio**
Política Nacional de Biocombustíveis (Lei 13.576/2017) que estabelece metas de descarbonização para distribuidoras de combustíveis, estimulando a produção de biocombustíveis e biometano.

**SBCE (Sistema Brasileiro de Comércio de Emissões)**
Mercado regulado de carbono criado pela Lei 15.042/2024. Estabelece limites de emissão para grandes emissores e permite comercialização de créditos verificados (CRVE). Entra em operação a partir de 2025.

**tCO2e (Tonelada de CO2 equivalente)**
Unidade de medida de gases de efeito estufa, normalizada pelo GWP de cada gás. É a unidade de 1 crédito de carbono — seja CBIO, CRVE ou crédito voluntário.

**Tipping fee**
Taxa cobrada pelo biodigestor para receber e tratar resíduos orgânicos de terceiros (frigoríficos, supermercados, prefeituras). Funciona como receita adicional: o biodigestor é pago para receber o insumo que vai transformar em energia. Valor típico: R$ 50 a R$ 200 por tonelada.

---

*Fim da documentação — versão 1.0 — Abril 2026*
