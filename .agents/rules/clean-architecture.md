---
name: Clean Architecture & SOLID
always_on: true
---

# Clean Architecture, SOLID & Boas Práticas

Sempre aplique estes padrões no desenvolvimento de código neste workspace:

## Princípios
- **Clean Architecture:** Mantenha a lógica de negócios isolada de detalhes de infraestrutura (banco de dados, UI, frameworks).
- **SOLID:**
  - *Single Responsibility:* Cada classe/função/módulo deve ter um único motivo para mudar.
  - *Open/Closed:* Código aberto para extensão, fechado para modificação.
  - *Liskov Substitution:* Subtipos devem ser substituíveis por seus tipos base.
  - *Interface Segregation:* Prefira muitas interfaces específicas a uma genérica.
  - *Dependency Inversion:* Dependa de abstrações, não de implementações.
- **DRY (Don't Repeat Yourself):** Centralize regras e lógicas duplicadas em funções ou componentes reutilizáveis.
- **KISS (Keep It Simple, Stupid):** Evite complexidade desnecessária ou sobre-engenharia.

## Padrões de Projeto recomendados
- **Repository Pattern:** Abstração de acesso a dados.
- **Service Layer:** Encapsulamento de regras de negócio complexas.
- **Componentização:** Separação de elementos visuais em blocos independentes e reutilizáveis.
