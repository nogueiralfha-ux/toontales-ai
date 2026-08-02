# LocalSecure - Cofre de Documentos Local-First

O **LocalSecure** é um cofre digital seguro e resiliente criado em **React**, **TypeScript** e **Vite** para gerenciar documentos, contratos e comprovantes sensíveis diretamente no navegador (local-first e offline).

---

## 🏛️ Arquitetura (Clean Architecture)
A estrutura segue a divisão de dependências desacopladas do framework:
- **`src/domain/`**: Entidades e regras puras (`Document.ts`).
- **`src/data/`**: Repositório concreto (`LocalStorageDocumentRepository.ts`) implementando a criptografia/ofuscação baseada em cifra local.
- **`src/presentation/`**: Componentes da UI (`DragAndDropUpload.tsx`, `Dashboard.tsx`, `DocumentList.tsx`) e estilos CSS premium baseados em HSL.

---

## 🛡️ Práticas de Segurança Implementadas
1. **Zero-Knowledge / Criptografia Local:** Arquivos e metadados são ofuscados localmente e nunca são enviados para servidores externos.
2. **Filtro contra Malware:** Upload bloqueia automaticamente a importação de scripts ou executáveis perigosos (ex: `.exe`, `.bat`, `.js`).
3. **Limitação de Payload:** Restrição de arquivos a 2MB para garantir a estabilidade do LocalStorage do navegador.

---

## 🚀 Instalação e Execução

Instale as dependências e inicie o servidor:
```bash
npm install
npm run dev
```
O aplicativo estará rodando em seu navegador!
