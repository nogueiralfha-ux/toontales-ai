# Design System - Todo App

Este documento define as especificações visuais, paletas, tipografia e diretrizes de UI/UX para a interface da aplicação.

## 1. Paleta de Cores (Modern HSL)
Utilizamos uma paleta de cores balanceada baseada em HSL para fácil manipulação de opacidade e temas.

- **Primary (Blue-Indigo):** `hsl(220, 90%, 56%)`
- **Secondary (Slate):** `hsl(215, 15%, 50%)`
- **Background (Light Mode):** `hsl(210, 20%, 98%)`
- **Surface (Light Mode Card):** `hsl(0, 0%, 100%)`
- **Text Primary:** `hsl(224, 71%, 4%)`
- **Text Secondary:** `hsl(220, 9%, 46%)`
- **Success (Completed state):** `hsl(142, 76%, 36%)`
- **Destructive (Delete):** `hsl(346, 84%, 61%)`
- **Border:** `hsl(220, 13%, 91%)`

## 2. Tipografia
- **Font-Family:** Inter, system-ui, -apple-system, sans-serif
- **Escala de Tamanhos:**
  - `h1`: 2rem (32px) / Line-height: 1.2
  - `h2`: 1.5rem (24px) / Line-height: 1.3
  - `body-large`: 1.125rem (18px) / Line-height: 1.5
  - `body`: 1rem (16px) / Line-height: 1.5
  - `caption`: 0.875rem (12px) / Line-height: 1.4

## 3. Espaçamento & Grid
- **Base Grid:** 8px (`0.5rem`)
- **Spacing Scale:**
  - `xs`: 4px (0.25rem)
  - `sm`: 8px (0.5rem)
  - `md`: 16px (1rem)
  - `lg`: 24px (1.5rem)
  - `xl`: 32px (2rem)

## 4. Componentes Base
- **Cards:** Border-radius de `12px`, sombra suave (`box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)`).
- **Inputs:** Padding `12px 16px`, border-radius `8px`, border `1px solid var(--border)`. Foco com outline contendo `hsl(220, 90%, 56%)`.
- **Buttons:** Altura mínima de `44px` para acessibilidade de toque (WCAG), border-radius `8px`, transição suave de `150ms ease-in-out` no hover e active.
