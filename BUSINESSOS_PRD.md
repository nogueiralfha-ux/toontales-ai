# BusinessOS PRD (Product Requirements Document)

## 1. Visão Geral
O BusinessOS é o Sistema Operacional de Negócios concebido para centralizar, gerenciar e orquestrar as informações fundamentais da empresa. Ele provê uma interface para humanos e atua como uma fonte da verdade estruturada para múltiplos agentes de IA e Skills, permitindo automação de decisões, marketing, suporte e estratégia comercial.

## 2. Requisitos de Usuário
- **Centralização do Conhecimento:** Os usuários precisam de um painel web para cadastrar, editar e visualizar os dados de negócios (tom de voz, ofertas, público-alvo e métricas).
- **Armazenamento de Dados para LLMs:** O armazenamento dos contextos de negócios deve ser salvo em arquivos Markdown com Front-matter (YAML), favorecendo rápida indexação e leitura eficiente por IAs.
- **Interação e Orquestração de Agentes:** Permitir a configuração de quais agentes têm acesso a quais escopos de contexto.
- **Painel de Configuração User-Friendly:** Interfaces intuitivas para o usuário final sem a necessidade de editar os arquivos `.md` diretamente.

## 3. Fluxos de Usuário e Mapeamento de Páginas
A interface web mapeará as ações do usuário em salvamentos nos arquivos `.md` locais:
- **Dashboard (/)**: Visão geral de integridade dos dados, saúde do negócio e status dos agentes ativos.
- **Empresa (/company)**: Configurações de nome, missão, visão, valores e cultura. Mapeia para o arquivo `.context/company.md`.
- **Produtos/Ofertas (/products)**: Catálogo de produtos, preços, propostas de valor e features. Mapeia para `.context/products.md`.
- **Audiência/ICP (/audience)**: Definição do Perfil de Cliente Ideal, dores, desejos, objeções e segmentação de mercado. Mapeia para `.context/audience.md`.
- **Marca e Estratégia (/brand)**: Definição do tom de voz, regras de copy e canais de aquisição. Mapeia para `.context/brand.md`.
- **Agentes (/agents)**: Gerenciamento de acessos e ativação de skills (ex: `agente-oportunidade`, `aio-master`).

## 4. Estrutura de Arquivos de Contexto (Context Data Structure)
Para garantir que os agentes leiam as informações com o máximo de precisão, o sistema salvará os metadados em uma pasta (ex: `.context/`), contendo Markdown e YAML Front-matter.

### Exemplo de Estrutura de Diretórios:
```text
/
├── .context/
│   ├── company.md
│   ├── audience.md
│   ├── products.md
│   └── brand.md
```

### Exemplo do Padrão do Arquivo: `.context/company.md`
```yaml
---
name: "SaaS Maker AIO"
industry: "Tecnologia / Inteligência Artificial"
mission: "Democratizar a criação de soluções automatizadas de software."
status: "active"
target_kpis: 
  - "MRR > $10K"
  - "Churn < 2%"
---
# Visão e Cultura
A empresa foca em eficiência extrema através de micro-agentes de inteligência artificial.

## Valores Principais
1. Automação First
2. Centrado no humano, resolvido pela máquina
3. Escalabilidade infinita
```

## 5. Orquestração de Agentes (Skills Connections)
A estrutura em Markdown permite o consumo nativo pelo ecossistema de agentes da fábrica:
- **agente-oportunidade:** Carrega os arquivos `audience.md` e `products.md` para encontrar gaps de mercado.
- **aio-master (Agente 100):** Analisa e correlaciona todos os arquivos em `.context/` para gerar estratégias macro, acionando sub-agentes conforme o estado atual lido nos metadados.
- **Fluxo de Integração:** O frontend atualiza os arquivos localmente via API; sempre que um arquivo muda, os agentes podem ser notificados ou ler os arquivos em cada nova iteração.
