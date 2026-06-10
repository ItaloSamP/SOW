# SOW (Study & Work Operating System) - Documentação Mestre

Este documento serve como a **"Bíblia do Projeto"**. Ele concentra absolutamente todas as definições, arquitetura, fluxos e funcionalidades idealizadas para o **SOW**.

---

## 1. Visão Geral (O que é o SOW?)
O **SOW** é um ecossistema definitivo para centralizar produtividade, estudos e trabalho em um único ambiente. A ideia central é que o usuário "faça tudo" no SOW — desde gerenciar listas, tomar notas, gerar flashcards e até assistir vídeos e visualizar PDFs — sem precisar navegar para outros apps e corromper o estado de *Deep Work*. 

**Filosofia:** Fluidez extrema, interfaces vivas, drag-and-drop onipresente, interações ricas e um foco absoluto em *Local-First* (rápido, sem delay de rede).

---

## 2. Princípios de Design & Estética
- **Dark Premium:** Interface predominantemente escura com paletas cuidadosamente ajustadas de cinza escuro, chumbo e grafite.
- **Micro-interações:** Uso agressivo de *hover effects*, transições, glassmorphism sutil e micro-animações para um app que parece "vivo".
- **O que NÃO terá:** Cores primárias estouradas, genéricas ou temas puxados para o roxo/violeta. 
- **Fontes & Detalhes:** `Inter` para legibilidade global e `Fira Code` para dados e códigos. Acentos de cor controlados (ex: Cyan para marcações críticas) e sombras elegantes.

---

## 3. Arquitetura e Stack Tecnológico
- **Framework:** **Next.js 16** (App Router).
- **Banco de Dados / Persistência:** **IndexedDB via Dexie.js**. Os dados vivem no navegador do usuário, garantindo inicialização instantânea e suporte offline-first completo.
- **Estilização:** **Vanilla CSS** customizado. Sem frameworks como Tailwind para garantir flexibilidade e controle microscópico de pixels e animações.
- **Autenticação:** **Firebase Auth** (E-mail/Google), como porta de entrada. Após o login, a sessão persiste e o funcionamento offline é retomado.
- **Manipulação:** `@hello-pangea/dnd` para Kanban e drag-and-drop.

---

## 4. Recursos e Funcionalidades Core

### 4.1. Workspaces Universais
Divisão lógica de ambientes (Estudos, Trabalho, Pessoal). O menu lateral (Sidebar) e todo o contexto da tela alteram estado e atalhos globais de acordo com o ambiente selecionado.

### 4.2. Gestão de Tarefas Dinâmicas (Kanban e Listas)
- Um hub fluído com *drag-and-drop*.
- Calendário interativo: passar o mouse (hover) em uma data mostra pop-ups e *tooltips* detalhados sobre as tarefas e progressos sem precisar sair da tela.

### 4.3. Ecossistema de Estudo (Split-Screen e Links Wiki)
- **Editor Notion-style:** Permite `/` commands, post-its virtuais nas telas, e criação de links do tipo `[[Tarefa]]` para vincular documentos ou contextos idênticos.
- **Interação de Split-Screen / Barra Lateral:** Se uma tarefa cita outra que tem um mesmo contexto, você clica nela e o SOW abre em tela dividida ou lateral. Você pode assistir a uma aula em um player (YouTube/PDF embutido de um lado) enquanto lê o relatório da tarefa do outro lado. 

### 4.4. Flashcards Evolutivos e Tutoria de IA
- **Algoritmo SM2 Local:** Repetição espaçada nativa baseada no progresso do usuário.
- **Parâmetros de Geração IA:** Dificuldade ajustável e intenção direcionada ("Foco na Prova", "Revisão Rápida", etc).
- **Tutor de Erros Dinâmico:** Se o usuário erra um flashcard, uma IA local (API) não só explica o erro, mas utiliza web-scraping rápido (ex: Wikimedia Commons) para trazer **imagens na hora** ou gerar fluxogramas (Mermaid) mostrando visualmente o porquê daquele erro.

### 4.5. O "Compilador" Mágico
Não basta apenas tomar notas. O usuário pode selecionar tarefas e resumos e usar o "Compilador de Documentos" do SOW para fundir essas notas gerando:
- Apostilas PDF polidas.
- Slides/Apresentações HTML automáticas.
- Exportação para Decks de Anki (`.apkg` / `CSV`).
- **Tons da IA:** "Refinar tudo usando a técnica de Feynman" ou "Tornar texto estritamente acadêmico".

### 4.6. Relatórios & Tracking
- **Hub de Analytics:** Emissão de retrospectivas Diárias, Semanais e Mensais guiadas por resumos automáticos gerados por IA.
- **Sincronização com GitHub:** (Exclusivo para devs/Work) Conecta a conta do GitHub via token PAT local e correlaciona *Issues* resolvidas ou *Commits* ao progresso de trabalho no SOW.

---

## 5. Estratégia de Desenvolvimento (Fases)

1. **Fase 1:** Fundação, Autenticação, Design System, Tabelas IndexedDB, Sidebar Reativa. *(Concluído)*
2. **Fase 2:** Desenvolvimento do Motor de Gestão de Tarefas, Kanban, Board Drag-and-Drop, Calendário com pre-views.
3. **Fase 3:** Notion-style Editor, Split-Screen (side-by-side view para PDF/Videos e Tasks relacionadas), Links no estilo Wiki `[[ ]]`.
4. **Fase 4:** Motor SM2 Flashcards, Tutor IA Visual (com Scraping de Imagens e diagramas Mermaid embutidos na correção).
5. **Fase 5:** O Compilador de PDFs/Slides e a geração automática de relatórios, incluindo a pipeline de sync com o Github.

---

## Anexo: Histórico e Visão Original (Log do Brainstorming)

Para garantir que a essência original nunca se perca durante o desenvolvimento, este anexo registra cronologicamente as ideias e requisitos exatos definidos nas nossas primeiras conversas de ideação do projeto:

1. **A Base:** *"quero criar um todolist, me ajude a abragir/abordar mais fundo essa ideia, quero um todolist bem funcional e completo"*
2. **Arquitetura & Heatmap:** *"Opção A; Local-First; todos esse citados, porém quero mais funcionalidades, quero ambientes personalizados para cada task, quero um heatmap tmb junto com esses gráficos estatísticas, me ajude a pensar em mais funcionalidades para deixar ele mais completo; Next..."*
3. **Imersão, Spotify e Notion-style:** *"Gostaria tmb q tivesse um histórico de tarefas, aonde eu posso reabrir uma tarefa, ou só analisar tarefas qu foram fechadas tmb; Sobre o modo imersivo, gostaria de poder linkar com meu spotify para poder escutar minhas músicas enquanto executo as tarefas; Para as tarefas tmb, eu quero poder deixar anotações, como se fosse rascunhos interativos; Gostaria tmb de poder ter interação com algum chat/IA para poder amplificar a margem dos meus estudos; (...) 2 - Tipo Notion; 3 - Tom escuro, preto, cinza essas cores mais sóbrias pra deixar com cara de um ambiente mais sério"*
4. **Dinâmica dos Flashcards e Relatórios:** *"na parte dos flashcards, quero eles bem dinâmicos, com imagens por exemplo, mostrando trechos de códigos, fluxos e essas coisas; Vamos poder tmb separar as tarefas por ambientes, tipo estudos, trabalho, desenvolvimento pessoal, aonde vou ter cada ambiente individual com suas peculiaridades, podendo anexar links, documentos, com os chats individuais de cada 1; Quero q seja um ambiente bem dinâmico, aonde eu possa ter controle, fluidez, arrastar as coisas, manipular com facilidade; Quero tmb poder agendar coisas a serem feitas, ter uma aba de relatórios diários, semanais e mensais aonde eu possa detalhar, ou pedir para a IA detalhar tudo q foi feito;"*
5. **Enriquecimento Visual:** *"no caso os flashcards com imagens, serão gerados ou reutilizados, e recriados atráves de scrap, com alguma API ou lib para isso, para melhora-los mais ainda"*
6. **O Ecossistema Definitivo (Exportação e Navegação Interligada):** *"teremos a opção de exportar, baixar ou compartilhar tmb, nossos documentos, poderemos transformar tudo em documentos, como nossas tarefas, estudos, relatórios, fluxos e etc, gerando com IA, usando a para melhorar oq seria esse documento; Teremos tmb interações entre tarefas, através de fluxos, caso uma tarefa se link com alguma outra tendo o msm contexto ou conteudo, tendo essa interação, puxanod uma a outra para auxiliar e deixar maiss dinâmica, melhorando essa navegação, reaproveitando dados existents; Teremos nesse nosso ambiente, atalhos para nossos principais ambientes de estudo, podendo cada um adicionar seus princpais, a ideia é q nesse ambiente possamos fazer tudo, ñ ter q ficar saindo e navegando para outros, o foco será nele, para ñ termos q sair dele para estudar"*
7. **Navegação de Foco:** *"1 - O usuário vai poder escolher, split ou lateral; 2 - os 2; 3 - Sim, gosto; Pronto, todos ideias discutidas, pegue tudo q definimos para nosso projeto nessa conversa, leia tudo q eu pedi e q aprovamos juntos, e pode ir pro planejamento"*
