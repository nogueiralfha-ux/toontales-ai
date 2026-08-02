# Arquitetura Técnica - A.I.O. (Agente Inteligente de Oportunidades)

Este documento especifica a arquitetura de software, a stack tecnológica, as diretrizes do design system, as convenções de código e a modelagem do banco de dados para a plataforma **A.I.O.**.

---

## 1. Stack Tecnológica Proposta

### Frontend (SPA Premium)
* **Framework**: React.js (com Vite para build ultra-rápido) ou Next.js (se houver necessidade de SSR/SEO).
* **Estilização**: Tailwind CSS + Shadcn/ui (Radix UI) para componentes premium e acessíveis.
* **Ícones**: Lucide React.
* **Gerenciamento de Estado**: Zustand (leve e reativo).

### Backend & Serviços (BaaS)
* **Plataforma**: Supabase (PostgreSQL, Auth nativo, Row Level Security).
* **Integração com IA**: Google Gemini API (usando o SDK oficial `@google/generative-ai` encapsulado em Edge Functions/API Routes seguras para não expor a chave de API no client-side).

---

## 2. Estrutura de Pastas (Clean Architecture & SOLID)

A estrutura do projeto visa separar as responsabilidades em camadas bem definidas:

```text
src/
├── assets/             # Recursos estáticos (imagens, fontes)
├── core/               # Camada de Domínio e Lógica de Negócio (Pure TS)
│   ├── entities/       # Modelos de dados de domínio (User, Opportunity, SearchLog)
│   ├── use-cases/      # Regras de negócio da aplicação (ex: AnalyzePainPointUseCase)
│   └── repositories/   # Interfaces/Contratos para persistência e APIs
├── data/               # Camada de Implementação de Dados e Infraestrutura
│   ├── datasources/    # Clientes de API, SDK Gemini, Supabase Client
│   └── repositories/   # Implementações reais dos repositórios definidos no Core
├── presentation/       # Camada de Apresentação (React)
│   ├── components/     # Componentes visuais atômicos/moleculares (Button, Card, Input)
│   ├── hooks/          # React hooks personalizados
│   ├── pages/          # Páginas/Views da aplicação
│   ├── styles/         # Estilos globais (Tailwind)
│   └── context/        # Provedores de contexto globais
└── main.tsx            # Ponto de entrada do SPA
```

---

## 3. Esquema de Banco de Dados (Relacional - PostgreSQL)

Abaixo estão definidos os esquemas conceituais das tabelas essenciais da plataforma:

### Tabela `users` (Gerenciada pelo Auth do Supabase)
* `id` (UUID, PK) - Identificador único.
* `email` (VARCHAR, Unique) - E-mail do usuário.
* `created_at` (TIMESTAMPTZ) - Data de criação.

### Tabela `profiles` (Informações adicionais do usuário)
* `id` (UUID, PK, FK -> `users.id` ON DELETE CASCADE) - ID correspondente ao usuário.
* `full_name` (VARCHAR) - Nome completo do usuário.
* `avatar_url` (TEXT) - Link para foto de perfil.
* `preferences` (JSONB) - Preferências de nicho de mercado ou interesses salvos.
* `updated_at` (TIMESTAMPTZ) - Última atualização.

### Tabela `opportunities` (Oportunidades geradas pela IA)
* `id` (UUID, PK) - Identificador da oportunidade.
* `user_id` (UUID, FK -> `users.id`) - Dono da oportunidade gerada.
* `title` (VARCHAR) - Título da ideia/oportunidade.
* `description` (TEXT) - Description detalhada da solução ou SaaS.
* `market_niche` (VARCHAR) - Nicho de atuação identificado.
* `viability_score` (INT) - Pontuação de viabilidade de 0 a 100.
* `psychological_profile` (JSONB) - Análise das dores e perfil psicológico do público-alvo.
* `monetization_model` (VARCHAR) - Como gerar receita com a ideia.
* `action_plan` (JSONB) - Passo a passo para tirar a ideia do papel.
* `created_at` (TIMESTAMPTZ) - Data de geração.

### Tabela `search_logs` (Logs de busca e diagnósticos de dor)
* `id` (UUID, PK) - Identificador do log.
* `user_id` (UUID, FK -> `users.id` NULLABLE para buscas anônimas) - Usuário que fez a busca.
* `raw_query` (TEXT) - O input ou dor digitada pelo usuário.
* `gemini_response` (JSONB) - Resposta estruturada retornada pela Gemini API.
* `created_at` (TIMESTAMPTZ) - Data da busca.

---

## 4. Design System & Padrões Visuais (Tailwind HSL)

A interface deve seguir um design premium, minimalista e focado em produtividade.

### Cores Base (Tema Dark Premium)
* **Background**: `hsl(240, 10%, 3.9%)` (Preto profundo levemente azulado)
* **Card**: `hsl(240, 10%, 7%)` (Cinza escuro para contraste)
* **Primary (Accents)**: `hsl(263.4, 70%, 50.4%)` (Violeta vibrante para ações primárias)
* **Secondary**: `hsl(240, 5%, 15%)` (Cinza médio para botões secundários)
* **Muted**: `hsl(240, 5%, 64.9%)` (Texto secundário de suporte)
* **Accent/Success**: `hsl(142.1, 70.6%, 45.3%)` (Verde esmeralda para scores altos)

### Princípios Visuais
1. **Tipografia**: Uso da fonte `Geist` ou `Inter` para clareza e elegância. Títulos com pesos médios/fortes e espaçamento sutil.
2. **Bordas e Sombras**: Bordas finas (`border-[1px] border-white/10`) com efeitos de vidro fosco (`backdrop-blur`).
3. **Animações**: Transições suaves (`transition-all duration-300 ease-in-out`) em hovers e modais.

---

## 5. Coding Standards

* **TypeScript Obrigatório**: Definição clara de interfaces e tipos para todas as entidades e retornos de funções.
* **Princípio da Responsabilidade Única (SRP)**: Cada componente React ou classe de Use Case deve fazer apenas uma coisa muito bem.
* **Segurança de API**: Chaves privadas da API Gemini devem ser protegidas através de variáveis de ambiente (`.env`) e acessadas exclusivamente via Serverless Functions / Backend.
* **Componentização**: Reaproveitar componentes usando a abordagem atômica e estilizando com `tailwind-merge` e `clsx` para concatenação dinâmica de classes.
