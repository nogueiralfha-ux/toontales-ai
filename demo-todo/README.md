# Fábrica Todo List - React (Clean Architecture)

Um aplicativo de Lista de Tarefas (Todo List) moderno e acessível, construído em React com TypeScript, utilizando conceitos estritos de **Clean Architecture** e design responsivo baseado em HSL.

---

## 🏛️ Arquitetura do Sistema

O projeto foi dividido em camadas desacopladas de acordo com as regras de Clean Architecture:

```
src/
├── domain/                  # Lógica de Negócios Pura (sem dependências de frameworks)
│   ├── entities/            # Entidade Todo
│   └── use-cases/           # Contratos de Casos de Uso (Create, Get, Toggle, Delete)
├── data/                    # Implementações de Dados e Protocolos
│   ├── repositories/        # LocalStorageTodoRepository (infraestrutura/armazenamento)
│   ├── protocols/           # TodoRepository (interfaces de comunicação)
│   └── use-cases/           # Implementações concretas dos casos de uso (DbCreateTodo, etc.)
└── presentation/            # Camada de Interface e Interação
    ├── components/          # Componentes visuais React (TodoApp, TodoList, TodoItem, TodoInput)
    ├── hooks/               # Custom hook useTodos.ts (Composition Root local)
    └── styles/              # index.css contendo temas HSL e regras globais
```

### Por que usar essa estrutura?
1. **Desacoplamento:** A lógica de domínio (`domain`) é totalmente testável e independente. Se decidirmos trocar o React por Vue, ou trocar o LocalStorage por uma API REST, a camada de domínio permanece intacta.
2. **Testabilidade:** Casos de uso e repositórios podem ser mockados de forma trivial em testes de unidade.

---

## 🎨 UI/UX & Acessibilidade

- **Tema Claro & Escuro Nativos:** O app utiliza variáveis HSL dinâmicas e o atributo `data-theme` no elemento raiz, permitindo transição de temas sem flashes de tela.
- **Acessibilidade (WCAG):**
  - Botão de checkbox customizado implementa a semântica de `role="checkbox"` com suporte a eventos de teclado (`Enter` e `Space`).
  - Navegação fluida via teclado (`Tab` index padrão nos botões de deletar e inputs).
  - Uso de contrastes de cores adequados.

---

## 🛡️ Segurança

- **Mitigação de XSS:** O aplicativo renderiza os títulos das tarefas de forma segura através do escape automático de strings do React, bloqueando qualquer injeção de tags HTML ou execução de scripts (`<script>`).
- **Sanitização de Inputs:** Validação no caso de uso (`LocalStorageCreateTodo`) impede a criação de tarefas vazias ou compostas puramente por espaços em branco.
- **Tratamento de Erros:** Persistência no LocalStorage encapsulada com blocos `try/catch` para evitar falhas silenciosas na aplicação em caso de estouro de cota de armazenamento do navegador.

---

## 🚀 Instalação e Execução

### Pré-requisitos
- Node.js (versão 18 ou superior)
- npm ou yarn

### Passos para executar
1. Instale as dependências:
   ```bash
   npm install
   ```
2. Inicie o servidor de desenvolvimento local:
   ```bash
   npm run dev
   ```
3. Para executar a suíte de testes unitários:
   ```bash
   npm run test
   ```
