---
name: corrigir-bug
description: Skill para diagnosticar, isolar e corrigir bugs ou regressões seguindo os padrões de qualidade da fábrica.
---

# SKILL: Corrigir Bug

Use esta skill para investigar erros e aplicar correções no código existente.

## Fluxo de Trabalho
1. **Coleta de Informações:** Identifique a mensagem de erro, comportamento esperado e comportamento atual.
2. **Diagnóstico:**
   - Encontre o arquivo e linha que originou a falha.
   - Analise se viola princípios do `clean-architecture` ou de segurança.
3. **Planejamento de Solução:**
   - Planeje a correção de forma que não quebre outros fluxos (sem regressão).
4. **Implementação da Correção:**
   - Realize as alterações no código de forma limpa.
5. **Revisão:**
   - Solicite que o `qa-engineer` e o `code-reviewer` confirmem a correção.
6. **Changelog:**
   - Atualize `CHANGELOG.md` documentando a correção.
