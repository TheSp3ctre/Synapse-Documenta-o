# Problema

Biodigestores industriais são sistemas biologicamente frágeis operados como se fossem máquinas. Essa é a raiz do problema.

---

## O que acontece quando o microbioma colapsa

Um biodigestor funciona graças a uma cadeia de bactérias anaérobias que decompõem matéria orgânica em etapas. Quando qualquer elo dessa cadeia falha — por excesso de ácido, amônia ou temperatura — o sistema entra em colapso biológico.

O operador normalmente só descobre o problema quando o medidor de biogás começa a cair. Nesse ponto, o colapso já aconteceu. A correção leva de 3 a 15 dias, durante os quais **todas as fontes de receita estão fechadas simultaneamente**.

```
Colapso biológico típico
─────────────────────────────────────────────────
Dia 0      Sinais invisíveis (pH caindo lentamente)
Dia 2      pH abaixo de 6.8 — ainda sem alerta visual
Dia 5      pH abaixo de 6.5 — produção de CH4 cai
Dia 6      Operador percebe queda no biogás
Dia 7      Diagnóstico e início da correção
Dia 14–22  Recuperação completa do microbioma
─────────────────────────────────────────────────
Janela de perda: 15 a 20 dias de produção zero
```

---

## Impacto financeiro real

| Métrica | Valor estimado |
|---|---|
| Produção média de biogás | 500 m³/dia |
| Energia gerada por dia | 300 kWh |
| Receita diária total (todas as fontes) | R$ 3.500 – R$ 6.000 |
| Duração média de um colapso | 15 dias |
| **Perda por evento de colapso** | **R$ 52.000 – R$ 90.000** |
| Colapsos típicos por ano (sem monitoramento) | 2 a 4 |
| **Perda anual estimada** | **R$ 100.000 – R$ 360.000** |

Esses números não incluem custo de correção biológica (aditivos, mão de obra especializada) nem o impacto de resíduo não tratado acumulado durante o período.

---

## Por que o problema persiste

### 1. Monitoramento focado no equipamento, não na biologia

As soluções de mercado — incluindo as da Siemens — monitoram sensores físicos: temperatura, pressão, nível de líquido. Nenhuma monitora os **indicadores biológicos** que precedem o colapso: acúmulo de ácido graxo volátil (AGV), queda de metano ou elevação de amônia livre.

### 2. Ausência de previsão — apenas detecção tardia

O operador recebe um alerta quando o pH já caiu abaixo do limite. Nesse ponto, o sistema já está doente. O que falta é um sistema que detecte a **tendência** antes de cruzar o threshold.

### 3. Decisões econômicas feitas no escuro

Mesmo quando o biodigestor está saudável, o operador não tem visibilidade sobre o momento ideal de vender energia, emitir créditos de carbono ou aceitar um lote de resíduo novo. Essas decisões são tomadas por intuição, sem considerar os preços de mercado em tempo real.

---

## A combinação dos dois problemas

O pior cenário é quando os dois problemas se somam: o biodigestor colapsa exatamente no momento em que o preço de energia estava alto. Ou o operador aceita um lote de resíduo de alta carga orgânica (que pagaria bom tipping fee) sem saber que o sistema está próximo do limite de AGV.

O NucleoDigest resolve os dois problemas com uma arquitetura integrada: a saúde biológica é o **guard** da otimização econômica. Se o sistema está em risco, a recomendação econômica é bloqueada automaticamente.

---

*Próxima seção: [Solução →](/solucao)*
