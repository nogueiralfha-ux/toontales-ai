---
name: criar-app
description: Skill de criação de novos aplicativos utilizando o fluxo de agentes da fábrica de software.
---

# SKILL: Criar Aplicativo

Use esta skill para gerenciar a criação de novos projetos e aplicativos do zero na Fábrica de Software.

## Fluxo de Trabalho
1. **Entrada:** Receber a descrição detalhada do aplicativo que o usuário deseja criar.
2. **Arquitetura & Configuração inicial:**
   - Inicie o `master-ai` para planejar os agentes envolvidos.
   - Solicite ao `project-manager` para criar `ROADMAP.md` e `TASKS.md` iniciais.
   - Solicite ao `software-architect` para definir a estrutura de diretórios e padrões.
3. **Criação da Estrutura de Pastas:**
   - Crie as pastas básicas definidas no framework (ex: `/components`, `/services`, `/models`, `/docs`).
4. **Implementação:**
   - Programe iterativamente usando engenheiros específicos (Frontend, Backend, etc.).
5. **Validação:**
   - Submeta a implementação para `qa-engineer` e `code-reviewer`.
6. **Entrega:**
   - Solicite a documentação final ao `documentation-engineer` e entregue o projeto completo.
