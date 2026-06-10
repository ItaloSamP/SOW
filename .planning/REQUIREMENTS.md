# SOW — Requisitos do Produto

Derivados da conversa de planejamento. Cada REQ tem ID único.

---

## Core / Fundação

- **REQ-001** Toda a persistência ocorre no IndexedDB via Dexie. Sem backend, sem servidor.
- **REQ-002** App funciona 100% offline após primeira carga.
- **REQ-003** Tema escuro como padrão (preto puro, cinza-grafite). Toggle dark/light com ícone sol/lua.
- **REQ-004** Visual sóbrio e profissional. Sem cores básicas puras. Accent: ciano (#00E5FF no dark).

## Workspaces

- **REQ-005** Workspaces separados por tipo: Estudos, Trabalho, Pessoal.
- **REQ-006** Cada tipo de workspace expõe features específicas (Estudos → Flashcards, Trabalho → GitHub).
- **REQ-007** Cada workspace tem quick links próprios visíveis no header.
- **REQ-008** Workspace criado via modal (não via `prompt()` nativo).
- **REQ-009** Colunas do Kanban são customizáveis por workspace.

## Tasks

- **REQ-010** Cada task é um "Task Hub" imersivo com editor rich text (Notion-style).
- **REQ-011** Tasks têm identidade visual: cor/gradiente de capa, ícone/emoji.
- **REQ-012** Tasks suportam post-its flutuantes (scratchpad) no painel lateral.
- **REQ-013** Tasks suportam anexos de arquivo (imagens, PDFs) salvos localmente como Blob.
- **REQ-014** Tasks podem ser vinculadas entre si de forma bidirecional (`[[wiki-link]]`).
- **REQ-015** Tasks podem ser arquivadas ao ser concluídas e reabertas do arquivo.

## Editor Rich Text

- **REQ-016** Editor TipTap com suporte a headings, listas, code blocks, blockquote.
- **REQ-017** Code blocks com syntax highlighting.
- **REQ-018** Suporte a diagramas Mermaid.js inline.
- **REQ-019** Atalho `[[` para linkar tasks dentro do editor.

## Flashcards

- **REQ-020** Flashcards são sempre de múltipla escolha (1 correta + 3 distratores).
- **REQ-021** Três níveis: Prova (complexo), Estudo (conceitual), Revisão (rápido).
- **REQ-022** Algoritmo SM2 (repetição espaçada): cards errados aparecem com mais frequência.
- **REQ-023** Flashcards suportam imagens, code blocks e diagramas Mermaid nas perguntas.
- **REQ-024** Geração de flashcards via IA a partir de notas da task ou upload de PDF.
- **REQ-025** Ao errar: feedback construtivo via IA (por que errou, conceito correto, plano de ação).
- **REQ-026** Relatório de sessão ao finalizar deck: nota, pontos fortes/fracos, tempo.
- **REQ-027** Relatório de sessão vinculado à task correspondente.
- **REQ-028** Metas diárias/semanais de revisão por deck.
- **REQ-029** Dashboard de evolução: taxa de acerto, cards dominados, streak.
- **REQ-030** Upload de prova/avaliação anterior → IA gera flashcards com mesmo conteúdo/formato.

## IA (BYOK)

- **REQ-031** Chave de API (Gemini ou OpenAI) inserida pelo usuário nas settings.
- **REQ-032** Chave criptografada e salva 100% no IndexedDB. Nunca sai do dispositivo.
- **REQ-033** Modos de refinamento de notas: Resumir, Estruturar, Socrático, Feynman, Lacunas.
- **REQ-034** Sugestão de subtarefas via IA a partir do título + descrição da task.
- **REQ-035** Chat por workspace com histórico persistido individualmente.
- **REQ-036** Relatórios periódicos narrados pela IA (diário, semanal, mensal).

## Analytics

- **REQ-037** Heatmap anual estilo GitHub: intensidade = tasks concluídas + flashcards revisados.
- **REQ-038** Tooltip no hover do heatmap: data, contagem, títulos.
- **REQ-039** Bar charts semanais: tasks concluídas, horas de foco.
- **REQ-040** Line chart: taxa de acerto em flashcards ao longo do tempo.
- **REQ-041** Comparativo semana atual vs semana anterior.
- **REQ-042** Relatórios periódicos: histórico editável + campo de notas do usuário.

## Power Features

- **REQ-043** Cmd+K / Ctrl+K: busca global + ações rápidas + parsing de linguagem natural.
- **REQ-044** Central de notificações in-app: alertas de prazo calculados localmente.
- **REQ-045** Browser Notification API para alertas nativos com app aberto.
- **REQ-046** GitHub integration via Personal Access Token: issues, commits, PRs, alertas.
- **REQ-047** Modo Foco Imersivo: tela limpa com timer + Spotify embed + lofi player.
- **REQ-048** Undo/Ctrl+Z: desfaz últimas 20 ações (move kanban, delete, mudança de status).
- **REQ-049** Eisenhower Matrix: view alternativa do workspace com 4 quadrantes.
- **REQ-050** Exportação: Markdown, PDF, Anki (.apkg/CSV), Slides HTML.
- **REQ-051** Exportação com refinamento de IA: Acadêmico, Cheat Sheet, Feynman, Slides.
- **REQ-052** Filtros avançados combinados (workspace, status, priority, tag, prazo) com views salvas.
- **REQ-053** Knowledge graph (`/graph`): visualização das conexões entre tasks.
