---
name: Security & Reliability Rules
always_on: true
---

# Diretrizes de Segurança e Confiabilidade

Siga rigorosamente estas práticas de segurança:

## Práticas de Segurança
- **Validação de Entradas:** Nunca confie em dados inseridos pelo usuário. Valide e sanitize todas as entradas no frontend e backend.
- **Gerenciamento de Segredos:** Nunca hardcodeie chaves de API, senhas ou tokens de acesso. Use variáveis de ambiente (`.env`) e certifique-se de que estão no `.gitignore`.
- **Tratamento de Erros:** Capture erros de forma graciosa sem expor stack traces ou dados sensíveis do sistema ao usuário final.
- **Autenticação e Permissões:** Implemente rotas protegidas e validações baseadas em escopo/papel (RBAC) onde apropriado.
