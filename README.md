# NucleoDigest Documentação Técnica

Este repositório centraliza toda a documentação da arquitetura e implementação do **Synapse**, uma solução inteligente para monitoramento biológico e otimização econômica de biodigestores industriais.

## 🚀 O que é o Synapse?

O NucleoDigest resolve a fragilidade biológica de biodigestores integrando **inteligência preditiva** (saúde do microbioma) com **otimização de receita** em tempo real. O sistema atua como um "guardião biológico", garantindo que a operação econômica só ocorra se o sistema estiver saudável.

## 🛠️ Stack Tecnológica

A solução foi construída utilizando uma abordagem Low-Code de alta performance:

* **Plataforma Core:** Mendix Studio Pro
* **Lógica de Negócio:** Mendix Microflows (ImportarLeitura, AnalisarRisco, CalcularOtimizacao)
* **Banco de Dados:** PostgreSQL (Gerenciado via Mendix Domain Model)
* **Integrações:** REST (JSON) para sensores IoT e APIs de preços de mercado (CCEE/RenovaBio)
* **Interface:** Mendix Atlas UI (Design focado em dashboards de operação e gestão)

## 📂 Estrutura da Documentação

Neste repositório, você encontrará o detalhamento de:

* **Arquitetura:** Visão geral das camadas, do fluxo de dados e da stack.
* **Modelo de Dados:** Entidades, associações e lógica do Domain Model.
* **Lógica Biológica:** Thresholds de pH, AGV, CH4 e NH3 para prevenção de colapsos.
* **Motor Econômico:** Fórmulas de cálculo para venda de energia, CBIOs e Tipping Fees.
* **Integrações:** Contratos JSON e especificações de endpoints Inbound/Outbound.

## 🎯 Objetivo

Servir como guia técnico para desenvolvedores e stakeholders entenderem como a solução transforma dados brutos de sensores em decisões financeiras seguras e rentáveis no setor de biogás.
