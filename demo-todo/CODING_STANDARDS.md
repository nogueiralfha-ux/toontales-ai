# Coding Standards & Clean Architecture Guidelines

Este guia documenta as regras de escrita e organização de código do projeto.

## 1. Clean Architecture Layers

A arquitetura deve seguir estritamente o fluxo de dependências de fora para dentro:

```
[ Presentation (UI) ] ──> [ Use Cases ] ──> [ Entities ]
          │                    │
          └───> [ Data ] ──────┘
```

- **Domain Layer:** Contém as regras de negócio puras (Entities e Use Case interfaces). Não possui dependências de bibliotecas externas de UI ou persistência.
- **Data Layer:** Contém as implementações dos casos de uso (Use Cases) e os protocolos (interfaces) para repositórios e serviços de infraestrutura.
- **Infra Layer:** Implementação de serviços externos, chamadas HTTP (Axios/Fetch), banco de dados local (LocalSearch, Firebase, etc.).
- **Presentation Layer:** Componentes visuais (React/Vue/Angular), Controllers e ViewModels.
- **Main Layer:** Ponto de entrada da aplicação onde ocorrem as injeções de dependência (Composition Root).

## 2. Nomenclatura e Convenções
- **Arquivos e Pastas:** PascalCase para Componentes e Use Cases, camelCase para utilitários e funções auxiliares.
- **TypeScript:**
  - Sempre explicitar tipos de retorno em funções de Use Cases e Repositórios.
  - Utilizar interfaces para tipagem de contratos (`TodoRepository`, `CreateTodo`).
  - Utilizar types para definições estáticas locais ou uniões de tipos.
- **Async/Await:** Sempre utilizar `async/await` ao invés de encadeamento de `.then()`.

## 3. Regras Importantes
1. **Sem acoplamento direto:** A camada de UI (Presentation) nunca deve instanciar repositórios ou casos de uso diretamente. Use Injeção de Dependências.
2. **Imutabilidade:** Trate estados do domínio como imutáveis.
3. **Erros:** Trate erros de infraestrutura na camada Data/Infra e exponha erros de domínio amigáveis para a apresentação.
