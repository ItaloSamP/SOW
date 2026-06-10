# SOW — Roadmap de Desenvolvimento

**Projeto:** SOW (Study & Organization Workspace)
**Stack:** Next.js 16 · React 19 · Dexie 4 (IndexedDB) · TypeScript strict · Vanilla CSS
**Arquitetura:** Local-first, offline-first. Sem backend. Dados no IndexedDB.

---

## Visão do Produto

Um workspace de produtividade científica que centraliza tarefas, estudos, flashcards, IA e GitHub em um único ambiente. O usuário não precisa sair do app para estudar, focar, revisar ou planejar.

Fluxo central:
```
GitHub Issues → Kanban/Calendário → Task Hub (Notion-style) → IA Copilot
     → Flashcards (SM2) → Stats/Heatmap → Relatórios IA
```

---

## Estado Atual (baseline)

Já construído e funcionando:
- Overview com pinned tasks + grouping por workspace + search
- Kanban (4 colunas fixas) com drag-and-drop
- Calendar view com drag para mudar dueDate
- TaskDetailPanel (status, priority, tags, dueDate, workspace, links, embed, subtasks, pomodoro counter)
- PomodoroTimer no sidebar
- Stats page básica (totais, sem gráfico temporal)
- Schema Dexie completo: workspaces, tasks, flashcardDecks, flashcards, periodicReports
- CSS tokens dark/light em `variables.css` (sem toggle na UI)

Dívida técnica conhecida:
- `console.log` em KanbanBoard.tsx:37
- `fixStrandedSubtasks` duplicado em page.tsx e WorkspaceSidebar.tsx
- Link inputs usam `document.getElementById` (antipadrão React)
- CalendarView: offset de dia errado + 30 dias hardcoded
- Workspace criado via `prompt()` nativo
- `QuickAddTask` existe mas não está renderizado
- Settings page: link existe, página não existe

---

## Fase 1 — Estabilização e Polish

**Objetivo:** App estável, sem dívida técnica, com UX básica completa.

### 1.1 Bug fixes e código
- [ ] Remover `console.log` de KanbanBoard.tsx:37
- [ ] Centralizar `fixStrandedSubtasks` em um único hook `useOrphanRepair.ts` chamado uma vez no layout
- [ ] Refatorar link inputs do TaskDetailPanel para usar `useState` (remover `document.getElementById`)
- [ ] Corrigir CalendarView: calcular primeiro dia do mês correto, suportar 28/29/30/31 dias

### 1.2 UX e navegação
- [ ] Toggle dark/light: ícone sol/lua no sidebar, persistido em `localStorage`
- [ ] Settings page (`/settings`): estrutura inicial com abas (Geral, IA, GitHub, Aparência)
- [ ] Workspace creation modal real (substituir `prompt()`)
- [ ] Workspace deletion com confirmação
- [ ] Workspace edit (nome, tipo, themeColor, icon)
- [ ] Integrar `QuickAddTask` na workspace page abaixo do header
- [ ] Filtros básicos no Overview: por status, por prioridade, por workspace

### 1.3 Kanban melhorias
- [ ] Colunas customizáveis por workspace (usar campo `columns` já no schema)
- [ ] Adicionar/renomear/remover colunas via modal
- [ ] Reorder de tasks dentro da mesma coluna (índice de ordem)

**Entregável:** App sem bugs conhecidos, settings page estruturada, toggle de tema funcional.

---

## Fase 2 — Task Hub (Ambiente Notion-style por Tarefa)

**Objetivo:** Cada tarefa vira um workspace imersivo com editor rico, arquivos e identidade visual.

### 2.1 Editor Rich Text
- [ ] Integrar TipTap (leve, extensível, React-native)
- [ ] Substituir `<textarea>` de description pelo editor TipTap
- [ ] Suporte a: headings, bold, italic, bullet list, ordered list, code block, blockquote
- [ ] Comando `/` para inserir blocos (heading, code, image, etc.)
- [ ] Salvar conteúdo como JSON no campo `description` (Dexie)
- [ ] Syntax highlighting em code blocks (Shiki ou lowlight)

### 2.2 Post-its / Scratchpad
- [ ] Painel lateral retrátil "Scratchpad" no TaskDetailPanel
- [ ] Post-its coloridos: criar, editar, mover (drag), deletar
- [ ] Cores configuráveis (amarelo, verde, azul, rosa, roxo)
- [ ] Salvos como array no campo `task.scratchpad` (adicionar ao schema)
- [ ] Persistência via Dexie (nova migration de versão)

### 2.3 Identidade Visual da Tarefa
- [ ] Campo `coverColor` / `coverGradient` na task
- [ ] Campo `icon` (emoji picker) na task
- [ ] Header visual no TaskDetailPanel com cor/gradiente e emoji

### 2.4 Anexos de Arquivo Locais
- [ ] Drag & drop de imagens e PDFs no TaskDetailPanel
- [ ] Compressão automática de imagens para WebP (client-side)
- [ ] Armazenamento como Blob no IndexedDB (nova tabela `attachments`)
- [ ] Preview inline de imagens; link de download para PDFs

### 2.5 Ambientes por Tipo de Workspace
- [ ] Workspace type `studies`: tab extra "Flashcards" visível
- [ ] Workspace type `work`: tab extra "GitHub" visível
- [ ] Workspace type `personal`: sem tabs extras
- [ ] Quick links do workspace exibidos no header da workspace page

**Entregável:** Tarefas com editor Notion, post-its, cover visual, anexos locais.

---

## Fase 3 — Sistema de Flashcards Evolutivos

**Objetivo:** Sistema completo de revisão espaçada com IA, metas e relatórios.

### 3.1 UI de Decks (aproveitando schema existente)
- [ ] Página `/flashcards` ou aba dentro da task
- [ ] Listar decks vinculados a uma task (`flashcardDecks.taskId`)
- [ ] Criar deck: nome, nível (prova/estudo/revisão), quantidade alvo
- [ ] Listar cards do deck com status SM2

### 3.2 Sessão de Estudo
- [ ] Tela de sessão: apresenta pergunta + 4 opções (múltipla escolha)
- [ ] Suporte a imagens na pergunta e nas opções
- [ ] Suporte a code blocks (Prism.js/Shiki) nas perguntas
- [ ] Suporte a diagramas Mermaid nas perguntas
- [ ] Ao responder: feedback imediato (certo/errado + explicação)
- [ ] Algoritmo SM2: atualizar `repetitions`, `interval`, `easeFactor`, `nextReviewDate`
- [ ] Histórico de resposta salvo por card (`cardAnswers` — nova tabela)

### 3.3 Feedback Construtivo (IA Tutor)
- [ ] Se errar: IA explica por que a resposta escolhida está errada
- [ ] IA indica conceito correto com referência às notas da tarefa
- [ ] IA sugere recursos externos (links de estudo)
- [ ] Respostas construtivas salvas no histórico do card

### 3.4 Metas e Evolução
- [ ] Definir meta de cards por dia/semana por deck
- [ ] Dashboard de evolução: taxa de acerto, cards dominados, streak
- [ ] Heatmap de revisões (grid mensal por deck)
- [ ] Quadro de progresso: % dominado por nível de dificuldade

### 3.5 Relatório de Sessão
- [ ] Ao finalizar deck: gerar report (nota, pontos fortes/fracos, tempo)
- [ ] Report salvo e vinculado à task (`periodicReports` ou nova tabela)
- [ ] Histórico de sessões acessível na task

### 3.6 Geração via Upload
- [ ] Upload de PDF → extração de texto (PDF.js no browser)
- [ ] Envio do texto extraído para IA → geração de flashcards
- [ ] Configurar: quantidade, nível, formato antes de gerar

**Entregável:** Sistema de flashcards funcional, SM2, feedback IA, metas, relatórios.

---

## Fase 4 — Integração com IA (BYOK)

**Objetivo:** Copiloto de IA local, sem servidor próprio, usando chave do usuário.

### 4.1 Configuração BYOK
- [ ] Aba "IA" em `/settings`: campo para Gemini API Key ou OpenAI API Key
- [ ] Chave criptografada e salva 100% no IndexedDB (nunca vai a servidor nosso)
- [ ] Seletor de provider (Gemini/OpenAI) e modelo
- [ ] Teste de conexão na settings page

### 4.2 Assistente de Notas
- [ ] Botão "Refinar com IA" no editor TipTap da tarefa
- [ ] Modos: Resumir, Estruturar, Modo Socrático (perguntas), Feynman (simplificar), Identificar lacunas
- [ ] Resultado exibido em painel lateral sem sobrescrever o original

### 4.3 Geração de Subtarefas
- [ ] Botão "Sugerir subtarefas" no TaskDetailPanel
- [ ] IA lê título + descrição da tarefa e sugere checklist ordenado
- [ ] Usuário aprova/edita antes de salvar

### 4.4 Chat por Workspace
- [ ] Ícone de chat flutuante em cada workspace
- [ ] Histórico de conversa salvo por workspace no IndexedDB
- [ ] Contexto: IA tem acesso às tasks e notas do workspace atual
- [ ] Cada workspace tem seu chat independente

### 4.5 Geração de Flashcards via IA
- [ ] Botão "Gerar Flashcards com IA" dentro da task
- [ ] IA lê notas do editor TipTap e gera deck configurável
- [ ] Suporte a upload de PDF (Fase 3.6) integrado aqui

### 4.6 Relatórios com IA
- [ ] Botão "Gerar relatório com IA" na página de Stats
- [ ] IA narra as métricas: conquistas, eficiência, lacunas, plano de ação
- [ ] Relatório editável + salvo em `periodicReports`

**Entregável:** IA integrada, chat por workspace, refinamento de notas, geração de flashcards.

---

## Fase 5 — Analytics e Relatórios

**Objetivo:** Painel de evolução visual completo.

### 5.1 Heatmap Estilo GitHub
- [ ] Grade anual de 52 semanas × 7 dias
- [ ] Intensidade = tarefas concluídas + flashcards revisados naquele dia
- [ ] Tooltip no hover: data, contagem, títulos das tasks concluídas
- [ ] Cor base = `--accent-cyan` do tema atual

### 5.2 Gráficos de Evolução
- [ ] Tarefas concluídas por semana (bar chart, últimas 8 semanas)
- [ ] Horas de foco por semana (pomodoros × 25min)
- [ ] Taxa de acerto em flashcards ao longo do tempo (line chart)
- [ ] Distribuição por workspace/tag (donut/pie chart)
- [ ] Comparativo semana atual vs semana anterior
- [ ] Usar Recharts (leve, React-native, sem canvas externo)

### 5.3 Relatórios Periódicos
- [ ] Aba "Relatórios" em `/stats`
- [ ] Geração automática ao fim do dia/semana/mês (ou manual)
- [ ] Estrutura: conquistas, foco, flashcards, lacunas, próximos passos
- [ ] IA narra o relatório (requer Fase 4)
- [ ] Editável pelo usuário (campo `userNotes`)
- [ ] Histórico de relatórios acessível e filtrado por período

**Entregável:** Heatmap, charts temporais, relatórios periódicos com IA.

---

## Fase 6 — Power Features

**Objetivo:** Features avançadas que tornam o app único.

### 6.1 Cmd+K Global
- [ ] Atalho Ctrl+K / Cmd+K em qualquer tela
- [ ] Busca instantânea em tasks, notas, links, decks
- [ ] Ações rápidas: criar task, mudar tema, ir para workspace
- [ ] Parsing de linguagem natural: "Comprar café amanhã #pessoal" → cria task

### 6.2 Central de Notificações
- [ ] Ícone de sino no sidebar com badge de contagem
- [ ] Calcula prazos localmente: hoje, atrasado, próximos 3 dias
- [ ] Ações por alerta: marcar lida, arquivar, abrir task
- [ ] Browser Notification API: alerta nativo se app estiver aberto

### 6.3 GitHub Integration
- [ ] Aba "GitHub" em `/settings`: Personal Access Token
- [ ] Listagem de issues dos repos conectados
- [ ] Converter issue → task no kanban local
- [ ] Ver commits/PRs recentes por repo
- [ ] Alertas: issues atribuídas, menções em PRs

### 6.4 Arquivo e Histórico de Tarefas
- [ ] Ao marcar `done`, opção "Arquivar" além de manter no kanban
- [ ] Página `/archive`: listar tasks arquivadas, busca por data/tag/título
- [ ] Ficha de task arquivada: notas, pomodoros, datas, relatório de flashcards
- [ ] Botão "Reabrir" → volta ao kanban com status `todo`

### 6.5 Modo Foco Imersivo
- [ ] Ao iniciar pomodoro: botão "Entrar no modo foco"
- [ ] Tela limpa: apenas timer + task ativa + player de áudio
- [ ] Spotify embed: colar link de playlist → player oficial embutido
- [ ] Lofi player nativo: streams integrados (rádio lo-fi)
- [ ] Botão atalho para abrir app Spotify nativo (protocolo `spotify:`)
- [ ] ESC para sair do modo foco

### 6.6 Undo / Histórico Local
- [ ] Stack de ações recentes (últimas 20 operações)
- [ ] Ctrl+Z desfaz: move de kanban, delete de task, mudança de status
- [ ] Implementar com padrão Command (undo/redo stack em memória)

### 6.7 Task Linking e Knowledge Graph
- [ ] Digitar `[[` no editor TipTap abre menu de tasks existentes
- [ ] Link criado é bidirecional (ambas tasks sabem do vínculo)
- [ ] Split-screen ao clicar em link: task conectada abre no painel lateral
- [ ] Sugestão automática por IA: "Task X tem conteúdo similar, deseja linkar?"
- [ ] Página `/graph`: visualização do grafo de conhecimento (vis.js ou D3)

### 6.8 Exportação de Documentos
- [ ] Exportar task/notas como Markdown
- [ ] Exportar como PDF (html2pdf.js ou Puppeteer client-side)
- [ ] Exportar deck de flashcards como arquivo Anki (.apkg ou CSV)
- [ ] Compilar múltiplas tasks em um documento (seleção múltipla)
- [ ] Estilos de export via IA: Acadêmico, Cheat Sheet, Explicativo Simples, Slides HTML

### 6.9 Eisenhower Matrix
- [ ] View alternativa no workspace (além de Kanban e Calendar)
- [ ] 4 quadrantes: Urgente+Importante, Não urgente+Importante, Urgente+Não importante, Eliminar
- [ ] Mapeamento automático por `priority` + `dueDate`
- [ ] Drag entre quadrantes atualiza priority/dueDate

### 6.10 Filtros Avançados
- [ ] Barra de filtros persistente no overview e workspace
- [ ] Filtros combinados: workspace AND status AND priority AND tag AND prazo
- [ ] Salvar filtros como "views" nomeadas

---

## Decisões Técnicas

| Decisão | Escolha | Motivo |
|---------|---------|--------|
| Rich text editor | TipTap | Extensível, React-native, suporta extensões customizadas |
| Charts | Recharts | React-native, leve, sem canvas externo |
| Drag & drop | @hello-pangea/dnd (já instalado) | Já em uso, estável |
| PDF parsing | PDF.js (pdfjs-dist) | Client-side, sem servidor |
| Syntax highlighting | Shiki | Preciso, suporta temas, roda no browser |
| Diagramas | Mermaid.js | Padrão para fluxos em markdown |
| Export PDF | jspdf + html2canvas | Client-side, sem servidor |
| Animações | CSS transitions + Framer Motion (opcional) | Manter leveza |
| Image compression | browser-image-compression | WebP client-side |
| AI provider | Gemini (grátis para devs) ou OpenAI | BYOK — chave local no IndexedDB |

---

## Ordem de Execução Recomendada

```
Fase 1 (2-3 dias)   → Estabiliza o que existe
Fase 2 (1-2 semanas)  → Cria o coração do app (Task Hub)
Fase 3 (1-2 semanas)  → Flashcards (schema já pronto, "só" falta UI)
Fase 4 (1 semana)   → IA plugada (desbloqueará features de Fase 3 + 5)
Fase 5 (3-5 dias)   → Analytics visual (heatmap + charts)
Fase 6 (contínuo)   → Power features em ordem de valor
```

---

## DB Migrations Necessárias

Versão atual: `db.version(1)`

| Versão | Mudanças |
|--------|----------|
| v2 | `tasks`: adicionar `coverColor`, `coverGradient`, `taskIcon`, `scratchpad` (array), `tiptapContent` (JSON) |
| v3 | Nova tabela `attachments`: `id, taskId, name, type, size, blob, createdAt` |
| v4 | Nova tabela `cardAnswers`: `id, cardId, deckId, sessionId, wasCorrect, chosenOption, answeredAt` |
| v5 | Nova tabela `aiChats`: `id, workspaceId, messages` (JSON array), `updatedAt` |
| v6 | Nova tabela `undoStack`: gerenciado em memória (não precisa persistir) |
| v7 | `tasks`: adicionar `linkedTaskIds` (bidirecional, substituindo `relatedTaskIds`) |

---

## Convenções de Desenvolvimento

- CSS co-localizado com componente: `Component.tsx` + `Component.css`
- `'use client'` obrigatório em todos os componentes que usam hooks
- Estado DB: `useLiveQuery` do dexie-react-hooks (nunca `useEffect` + fetch manual)
- Estado local transiente: `useState` antes de commitar ao DB
- Sem Redux, Zustand ou Context desnecessário
- Migrations Dexie: sempre incrementais, nunca dropar tabelas existentes
- Path alias: `@/*` → `src/*`
