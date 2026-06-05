# Plano de Desenvolvimento: study-todo-workspace (Alinhado)

## 📋 Visão Geral
Este documento estabelece o roteiro de tarefas passo a passo para a criação do **SOW (Study & Work Operating System)**, uma central de produtividade e estudos local-first com Next.js, IndexedDB e IA local.

---

## 🎯 Tipo de Projeto
*   **Tipo:** WEB
*   **Agente Responsável Principal:** `frontend-specialist` (com suporte de `database-architect` para dados locais e `backend-specialist` para APIs).

---

## 💻 Tech Stack
*   **Framework:** Next.js (com exportação estática)
*   **Armazenamento:** IndexedDB (`Dexie.js`)
*   **Estilos:** CSS Vanilla (variáveis para o tema escuro chumbo/grafite premium)
*   **Componentes:** `@hello-pangea/dnd`, `mermaid` (fluxogramas), `pdfjs-dist` (PDFs locais)

---

## 🛠️ Roteiro de Tarefas Detalhado

### Fase 1: Fundação & Design System
*   **Tarefa 1.1: Configuração do Dexie.js (IndexedDB)**
    *   **Agente:** `database-architect` | **Skill:** `database-design`
    *   **INPUT:** Esquema de tabelas relacionais (`workspaces`, `tasks`, `flashcards`, `periodic_reports`).
    *   **OUTPUT:** Inicialização do banco em `src/db/dexie.ts`.
    *   **VERIFICAÇÃO:** Gravar dados fictícios e testar persistência após recarregar.
*   **Tarefa 1.2: Design Tokens & Sidebar de Ambientes**
    *   **Agente:** `frontend-specialist` | **Skill:** `frontend-design`
    *   **INPUT:** Paleta de cores escura (tons de preto, grafite e cinza-escuro com detalhes ciano e sol/lua toggle).
    *   **OUTPUT:** `src/styles/variables.css` e menu de alternância de Ambientes Globais (Estudos, Trabalho, Pessoal).
    *   **VERIFICAÇÃO:** Garantir contraste e conformidade visual (sem tons violetas/roxos).

### Fase 2: Kanban & Calendário Dinâmicos
*   **Tarefa 2.1: Kanban Drag-and-Drop**
    *   **Agente:** `frontend-specialist` | **Skill:** `frontend-design`
    *   **INPUT:** Tarefas carregadas por ambiente (`workspaceId`).
    *   **OUTPUT:** Kanban board com arraste fluido mudando status e salvando no banco.
    *   **VERIFICAÇÃO:** Reordenar e mover cartões confirmando a persistência.
*   **Tarefa 2.2: Calendário Interativo e Previews de Hover**
    *   **Agente:** `frontend-specialist` | **Skill:** `frontend-design`
    *   **INPUT:** Mapeamento de prazos no calendário.
    *   **OUTPUT:** Clique para criar tarefas por data e pop-ups flutuantes (tooltips) com dados de progresso e resumos de tarefas no hover.
    *   **VERIFICAÇÃO:** Passar o mouse e verificar a exibição suave de informações resumidas.

### Fase 3: Task Hub (Notion Editor, Split-Screen & Embeds)
*   **Tarefa 3.1: Editor Notion-style, Post-its e Links Wiki**
    *   **Agente:** `frontend-specialist` | **Skill:** `frontend-design`
    *   **INPUT:** Editor central com barra de atalho `/` e post-its flutuantes.
    *   **OUTPUT:** Criação de links wiki `[[` vinculando tarefas.
    *   **VERIFICAÇÃO:** Linkar duas tarefas e salvar anotações no editor.
*   **Tarefa 3.2: Navegação Split-Screen, Painel Lateral e Embeds**
    *   **Agente:** `frontend-specialist` | **Skill:** `frontend-design`
    *   **INPUT:** Escolha do usuário ao clicar no link da tarefa vinculada.
    *   **OUTPUT:** Abertura da tarefa paralela em Tela Dividida (Split-screen) ou Barra Lateral (Sidebar), e widgets de vídeo do YouTube e leitor PDF side-by-side integrados.
    *   **VERIFICAÇÃO:** Assistir a uma aula no iframe lateral enquanto toma notas no documento principal.

### Fase 4: Flashcards Evolutivos (Algoritmo SM2 & Enriquecimento Visual)
*   **Tarefa 4.1: Motor de Repetição Espaçada & Upload de Prova**
    *   **Agente:** `backend-specialist` | **Skill:** `api-patterns`
    *   **INPUT:** Algoritmo SM2 e leitor de PDFs/Anotações com a chave de IA local do usuário.
    *   **OUTPUT:** Geração de perguntas em decks com parâmetros de dificuldade e intenção (Prova, Estudo, Revisão).
    *   **VERIFICAÇÃO:** Simular sessões de estudo acertando/errando e certificar o reordenamento correto dos cards.
*   **Tarefa 4.2: Tutor de Erros com IA, Scraping e Mermaid**
    *   **Agente:** `frontend-specialist` | **Skill:** `nextjs-react-expert`
    *   **INPUT:** API de scraping de imagens (Wikimedia Commons) e prompt de IA de correção.
    *   **OUTPUT:** Feedbacks construtivos ao errar e inserção de imagens ou fluxos Mermaid na explicação.
    *   **VERIFICAÇÃO:** Selecionar uma opção incorreta e ver a explicação explicativa com links/esquemas na hora.

### Fase 5: Compilador de Documentos, Relatórios e GitHub
*   **Tarefa 5.1: Compilador de Notas & Exportação Avançada**
    *   **Agente:** `frontend-specialist` | **Skill:** `frontend-design`
    *   **INPUT:** Notas e resumos de tarefas selecionados.
    *   **OUTPUT:** Painel de exportação para PDF, Markdown, Slides HTML e arquivos Anki (.apkg/CSV) com refino em tons selecionáveis (Feynman, Acadêmico).
    *   **VERIFICAÇÃO:** Exportar um conjunto de notas de estudo como slides e visualizar o arquivo gerado.
*   **Tarefa 5.2: Relatórios de Retrospectivas & Integração GitHub**
    *   **Agente:** `backend-specialist` | **Skill:** `api-patterns`
    *   **INPUT:** Logs de uso local e API do GitHub via token PAT.
    *   **OUTPUT:** Relatórios de progresso periódicos sumarizados por IA e listagem de commits/issues.
    *   **VERIFICAÇÃO:** Gerar relatório semanal e sincronizar uma issue do repositório conectado.

---

## 🏁 PHASE X: Final Verification
*   Executar `python .agents/scripts/checklist.py .` para auditoria geral.
*   Garantir integridade e performance no modo offline.
*   Cumprir as restrições estéticas (sem roxo/violeta, cinzas escuros elegantes).

---

## ✅ PHASE X COMPLETE
*   Status: ⏳ Pendente de aprovação final do usuário.
