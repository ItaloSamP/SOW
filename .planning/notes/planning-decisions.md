---
name: planning-decisions
description: Decisões arquiteturais e de produto tomadas na conversa de planejamento inicial
metadata:
  type: project
---

# Decisões de Planejamento — SOW

Decisões aprovadas na conversa de brainstorming com o usuário.

## Arquitetura
- Local-first, offline-first. Sem backend próprio. IndexedDB via Dexie.
- BYOK para IA: usuário insere chave Gemini/OpenAI nas settings. Chave fica no IndexedDB.
- GitHub integration via Personal Access Token (PAT). Chamadas direto do browser para API GitHub.

## UX / Visual
- Dark theme padrão: preto absoluto, cinza-grafite, accent ciano.
- Toggle dark/light (ícone sol/lua). Modo claro: tons bege-acinzentado estilo Notion light.
- Visual sóbrio e profissional. Sem cores primárias puras.
- Interações fluidas: drag & drop em tudo, manipulação direta.

## Task Hub (Notion-style)
- Cada task vira um workspace imersivo. Decisão: estilo Notion (limpo e minimalista), não widget modular.
- Post-its flutuantes separados do documento principal.
- Arquivos locais: imagens comprimidas para WebP antes de salvar.

## Flashcards
- Apenas múltipla escolha (1 correta + 3 distratores gerados pela IA).
- SM2 algorithm (estilo Anki) para repetição espaçada.
- Feedback de erro: construtivo e detalhado via IA (não apenas "errado").
- Imagens em flashcards: geradas/buscadas via Wikimedia Commons API ou upload manual.
- Diagramas: Mermaid.js renderizado nativamente.
- Upload de prova/PDF → extração texto → IA gera flashcards com mesmo conteúdo.

## Música / Foco
- Spotify: widget embed (colar link de playlist) + botão atalho para app nativo (protocolo spotify:).
- Lofi player nativo como fallback (sem login).
- Sem SDK Spotify OAuth (complexidade + instabilidade em apps locais).

## Task Linking
- Sintaxe `[[` no editor TipTap abre menu de tasks.
- Links bidirecionais.
- Split-screen ao clicar: task linkada abre no painel lateral (não fecha a atual).
- Usuário pode escolher: split horizontal ou painel lateral.

## Exportação
- Formatos: Markdown, PDF, Slides HTML, Anki (.apkg ou CSV).
- IA oferece estilos de tom antes de exportar.
- Compilador: selecionar múltiplas tasks e unir em um documento.

## **Why:** Todas decisões priorizando privacidade (dados locais), zero custo de infraestrutura, e experiência offline-first.
## **How to apply:** Toda feature nova deve funcionar sem internet. Qualquer integração externa (IA, GitHub) usa chave/token do usuário, nunca proxy nosso.
