# 🧠 SOW — Study & Work Operating System

> **SOW** (pronunciado como *Sow* /semear/) é um Workspace de Produtividade Científica e Estudos local-first de alto desempenho. Um ambiente unificado que integra tarefas, anotações Notion-style, flashcards evolutivos com IA, cronogramas, conexões inteligentes e repositórios do GitHub, tudo sem sair do aplicativo e mantendo seus dados 100% privados.

---

## 🚀 Principais Recursos

### 💼 1. Ambientes Globais (Workspaces)
*   **Separação de Contexto:** Alterne facilmente entre ambientes como **Estudos**, **Trabalho** e **Desenvolvimento Pessoal**. Cada ambiente possui suas próprias tarefas, calendário, anotações, widgets e histórico de chat da IA.
*   **Métricas de Uso:** Gráficos interativos locais e heatmaps de produtividade estilo GitHub para rastrear seu progresso diário.

### 📝 2. Ambiente de Tarefas Notion-Style
*   **Editor Central Limpo:** Anotações em texto rico com suporte a comandos rápidos `/` (Markdown, listas de tópicos, blocos de código com destaque de sintaxe).
*   **Post-its Flutuantes:** Um painel lateral retrátil com notas autoadesivas rápidas que você pode arrastar e organizar como quiser.
*   **Conexões Wiki (`[[`):** Linke suas tarefas de forma direta. Ao clicar em um link, você escolhe se prefere abrir em **Tela Dividida (Split-screen)** ou **Painel Lateral (Sidebar)** para estudar simultaneamente.

### 🃏 3. Flashcards Inteligentes & Evolutivos
*   **Algoritmo SM2 (Estilo Anki):** Repetição espaçada baseada em acertos/erros para memorização ativa a longo prazo.
*   **Gerador de Flashcards:** Carregue suas anotações ou arquivos PDF (modelos de provas/avaliações) para a IA gerar perguntas de múltipla escolha personalizadas por nível de dificuldade.
*   **Tutor IA de Erros:** Ao errar uma questão, a IA gera na hora uma explicação dinâmica do porquê do erro e indica o que você precisa ler para melhorar.
*   **Enriquecimento Visual:** Busca automática de diagramas ilustrativos na Wikipédia/Wikimedia Commons ou geração de fluxos Mermaid.js nativos.

### ⚙️ 4. Hub de Estudo & Imersão
*   **Modo Foco Imersivo:** Timer Pomodoro integrado com player de sons ambientes (lo-fi, chuva, ruído branco) e widget incorporado do Spotify.
*   **Embeds de Conteúdo:** Assista a videoaulas do YouTube ou leia PDFs locais em um painel lateral integrado, lado a lado com seu documento de anotações.

### 📊 5. Relatórios & Integração GitHub
*   **Relatórios Periódicos:** Retrospectivas diárias, semanais e mensais resumidas automaticamente pela IA local.
*   **Exportador:** Compilação de notas e relatórios em PDF, Markdown, Slides de HTML ou Decks do Anki.
*   **GitHub Sync:** Sincronização de Issues, monitoramento de commits e PRs usando Tokens de Acesso Pessoal (PAT).

---

## 🔒 Privacidade em Primeiro Lugar (Local-First)

Toda a infraestrutura do SOW foi desenhada para rodar diretamente no cliente:
*   Seus dados são salvos localmente usando **IndexedDB** no seu próprio navegador.
*   Suas chaves de API da IA e Tokens do GitHub são salvos criptografados localmente.
*   O aplicativo funciona 100% offline e não possui servidores intermediários, garantindo total segurança do seu conhecimento e dados do Git.

---

## 🛠️ Tecnologias Utilizadas

*   **Frontend:** [Next.js](https://nextjs.org/) (App Router, Build Estática)
*   **Persistência:** [IndexedDB](https://developer.mozilla.org/pt-BR/docs/Web/API/IndexedDB_API) com abstração via [Dexie.js](https://dexie.org/)
*   **Arrastar e Soltar:** `@hello-pangea/dnd`
*   **Visualizações Nativas:** `mermaid` (fluxogramas) e `pdfjs-dist` (PDF Reader)
*   **Estilização:** CSS Vanilla com variáveis globais (Design Tokens)

---

## 🏃 Como Rodar o Projeto Localmente

### Pré-requisitos
*   [Node.js](https://nodejs.org/) instalado.

### Instalação
1.  Instale as dependências do projeto:
    ```bash
    npm install
    ```

2.  Inicie o servidor de desenvolvimento:
    ```bash
    npm run dev
    ```

3.  Abra o navegador em `http://localhost:3000`.

---

## 📄 Licença
Este projeto é de uso pessoal e privado.
