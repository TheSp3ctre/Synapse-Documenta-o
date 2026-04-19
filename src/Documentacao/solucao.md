# Solução

O NucleoDigest integra duas ideias que, juntas, resolvem o problema de ponta a ponta: primeiro garante que o biodigestor está saudável, depois maximiza o retorno econômico dessa saúde.

---

## Ideia 1 — Inteligência biológica preditiva

### Como funciona

O sistema recebe leituras de sensores a cada ciclo configurável (tipicamente 5 a 15 minutos) e analisa quatro parâmetros biológicos em cascata. Cada parâmetro tem um threshold de alerta e um de criticidade, configuráveis como App Constants no Mendix.

```
Leitura de sensor
       ↓
pH < 6.5?  ──sim──→  ALERTA CRÍTICO: Acidificação
       ↓ não
AGV > 4000?  ──sim──→  ALERTA CRÍTICO: Acúmulo AGV
       ↓ não
CH4 < 50%?  ──sim──→  ALERTA MÉDIO: Queda de metano
       ↓ não
NH3 > 3000?  ──sim──→  ALERTA MÉDIO: Inibição por amônia
       ↓ não
Status: SAUDÁVEL → segue para otimização econômica
```

### Por que esses quatro parâmetros

| Parâmetro                 | O que indica                           | Por que é preditivo                                        |
| ------------------------- | -------------------------------------- | ---------------------------------------------------------- |
| pH                        | Acidez geral do digestor               | Cai gradualmente dias antes do colapso visível             |
| AGV (ácido graxo volátil) | Acúmulo de ácidos intermediários       | Precursor direto da queda de pH — aparece 2 a 5 dias antes |
| CH4 (metano)              | Eficiência das bactérias metanogênicas | Queda indica inibição parcial antes do colapso total       |
| NH3 (amônia livre)        | Toxicidade para bactérias              | Acúmulo lento — detectável semanas antes de causar dano    |

O AGV é o indicador mais valioso: ele sobe antes do pH cair, dando ao operador uma janela de 2 a 5 dias para agir. Sem esse monitoramento, a única leitura disponível é o pH — e quando o pH cai, já é tarde.

### O que o sistema faz quando detecta risco

1. Cria um `AlertaBiologico` com tipo e severidade
2. Envia notificação imediata (email / webhook)
3. Gera uma `Recomendacao` de ação corretiva com instrução específica
4. Bloqueia recomendações econômicas até resolução do alerta crítico
5. Registra timestamp de criação e resolução para análise histórica

---

## Ideia 2 — Otimização econômica em tempo real

### Como funciona

A cada hora, o sistema coleta os preços de mercado atuais e calcula o lucro líquido estimado para cada possível ação. A recomendação é gerada automaticamente e fica pendente de aprovação do operador.

### As quatro fontes de receita

```
Biogás produzido (m³)
        │
        ├──→ Energia elétrica   = m³ × 0.6 × (R$/MWh ÷ 1000)
        │
        ├──→ Crédito de carbono = m³ × 0.00202 × R$/tCO₂e
        │
        ├──→ Tipping fee        = Σ tipping_fee_brl dos insumos do dia
        │
        └──→ Biofertilizante    = digestato_ton × preço_mercado_digestato
```

### Fórmula de lucro líquido

```
lucro_liquido = receita_energia
              + receita_cbio
              + receita_tipping
              + receita_digestato
              − custo_logistica
```

### Fatores de conversão explicados

| Fator                       | Valor          | Origem                                 |
| --------------------------- | -------------- | -------------------------------------- |
| Eficiência biogás → energia | 0.6 (60%)      | Eficiência média de geradores a biogás |
| Biogás → tCO₂e evitado      | 0.00202 ton/m³ | Fator de emissão do metano (GWP 21)    |
| Biogás → kWh                | ~6 kWh/m³      | Poder calorífico inferior do metano    |

### O guard biológico

A integração entre as duas ideias é o **guard biológico**: antes de calcular qualquer receita, o `CalcularOtimizacao` verifica se existe algum `AlertaBiologico` com severidade `CRÍTICO` e `resolvido = false`. Se sim, a recomendação gerada é de correção biológica — não de venda de energia.

```
Alerta CRÍTICO ativo?
   ↓ sim                          ↓ não
Rec: CORRECAO_BIOLOGICA    Calcular receitas e gerar
"Suspender insumo          Rec: VENDER_ENERGIA ou
e corrigir pH"             EMITIR_CARBONO ou
                           ACEITAR_TIPPING_FEE
```

Isso garante que o sistema nunca recomende uma ação econômica em um biodigestor que está biologicamente comprometido.

---

## Ciclo completo da solução

```
[Sensor] → POST /api/leitura
                ↓
         ImportarLeitura
                ↓
         AnalisarRisco ──→ AlertaBiologico + Notificação
                ↓
         CalcularOtimizacao
                ↓
         Recomendacao (pendente)
                ↓
         [Operador aprova/rejeita no dashboard]
                ↓
         ProducaoDiaria (resultado registrado)
```

---

_Próxima seção: [Stack tecnológica →](/stack)_
