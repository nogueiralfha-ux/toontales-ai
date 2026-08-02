# BusinessOS - Especificação de Arquitetura e Design (BUSINESSOS_SPEC.md)

## 1. Stack Tecnológica
- **Framework Principal**: Next.js (App Router) para roteamento, renderização híbrida (SSR/SSG) e estruturação da aplicação.
- **Backend/Integração**: Supabase (utilizado para persistência de dados, autenticação e integração com o briefing).
- **Documentação e Teste Visual**: Storybook (para desenvolvimento isolado e documentação de componentes UI).
- **Biblioteca de Componentes**: Shadcn/ui (para componentes base acessíveis e customizáveis).

## 2. Design System e Tokens Visuais
- **Tema Visual**: Estilo minimalista Black & White (Preto e Branco), focado em alto contraste e clareza.
- **Tipografia**: Fonte **Inter** em toda a aplicação para excelente legibilidade.
- **Geometria**: Cantos arredondados (rounded corners) consistentes em botões, modais, cards e inputs para suavizar o design.
- **Navegação (Sidebar)**: Efeitos de hover sofisticados e fluidos na barra lateral para melhorar o feedback visual e a experiência do usuário (UX).
- **Exibição de Dados**: Componentes de visualização em Cards com opção de alternância dinâmica (toggle) entre **Grid** (grade) e **Lista**.

## 3. Diretrizes de Arquitetura (Clean Architecture & SOLID)
- **Apresentação (Presentation)**: Componentes React (Shadcn/ui) no Next.js App Router, mantendo a UI "burra" e focada na renderização.
- **Domínio (Domain)**: Lógica de negócios isolada e independente de frameworks, facilitando testes e evolução.
- **Dados (Data)**: Abstração de repositórios para comunicação com o Supabase, garantindo que o banco de dados possa evoluir sem quebrar as regras de negócio.
- **Reutilização e Escalabilidade**: Componentização através do Storybook e criação de hooks customizados para reaproveitamento de código.
