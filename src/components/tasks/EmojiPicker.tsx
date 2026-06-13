'use client';

import { useEffect, useRef, useState } from 'react';
import { Smile, X } from 'lucide-react';
import { db, type Task } from '@/db/dexie';
import './EmojiPicker.css';

interface EmojiEntry {
  char: string;
  keywords: string;
}

interface EmojiCategory {
  name: string;
  emojis: EmojiEntry[];
}

/** ~80 common emojis grouped by category. Native implementation — no external library. */
const EMOJI_CATEGORIES: EmojiCategory[] = [
  {
    name: 'Trabalho',
    emojis: [
      { char: '💼', keywords: 'trabalho maleta business briefcase' },
      { char: '📁', keywords: 'pasta folder arquivo' },
      { char: '📊', keywords: 'grafico chart dados relatorio' },
      { char: '📈', keywords: 'crescimento grafico aumento progresso' },
      { char: '📅', keywords: 'calendario data agenda' },
      { char: '📌', keywords: 'pin fixar alfinete importante' },
      { char: '✅', keywords: 'check feito concluido done' },
      { char: '📝', keywords: 'nota memo escrever anotacao' },
      { char: '🗂️', keywords: 'organizar fichario arquivos' },
      { char: '⏰', keywords: 'alarme relogio prazo deadline' },
      { char: '💰', keywords: 'dinheiro money financas pagamento' },
      { char: '🤝', keywords: 'acordo parceria reuniao handshake' },
      { char: '📞', keywords: 'telefone ligacao call' },
      { char: '✉️', keywords: 'email carta mensagem' }
    ]
  },
  {
    name: 'Estudo',
    emojis: [
      { char: '📚', keywords: 'livros estudo leitura biblioteca' },
      { char: '📖', keywords: 'livro aberto leitura ler' },
      { char: '✏️', keywords: 'lapis escrever desenhar' },
      { char: '🎓', keywords: 'formatura graduacao diploma faculdade' },
      { char: '🧠', keywords: 'cerebro memoria inteligencia aprender' },
      { char: '🔬', keywords: 'microscopio ciencia pesquisa laboratorio' },
      { char: '🧪', keywords: 'quimica experimento tubo ensaio' },
      { char: '📐', keywords: 'regua matematica geometria' },
      { char: '🌍', keywords: 'mundo geografia terra globo' },
      { char: '🗣️', keywords: 'falar idioma lingua conversacao' },
      { char: '🎯', keywords: 'alvo meta objetivo foco' },
      { char: '💡', keywords: 'ideia lampada insight' },
      { char: '🃏', keywords: 'flashcard carta baralho revisao' },
      { char: '⏳', keywords: 'ampulheta tempo pomodoro prazo' }
    ]
  },
  {
    name: 'Saúde',
    emojis: [
      { char: '💪', keywords: 'musculo forca treino academia' },
      { char: '🏃', keywords: 'correr corrida exercicio cardio' },
      { char: '🧘', keywords: 'meditacao yoga calma mindfulness' },
      { char: '🏋️', keywords: 'academia peso musculacao treino' },
      { char: '🚴', keywords: 'bicicleta ciclismo pedalar' },
      { char: '🏊', keywords: 'natacao nadar piscina' },
      { char: '🥗', keywords: 'salada comida saudavel dieta nutricao' },
      { char: '💧', keywords: 'agua hidratacao gota' },
      { char: '😴', keywords: 'dormir sono descanso' },
      { char: '❤️', keywords: 'coracao saude amor cardio' },
      { char: '🩺', keywords: 'medico consulta estetoscopio' },
      { char: '💊', keywords: 'remedio pilula medicamento vitamina' },
      { char: '🦷', keywords: 'dente dentista' },
      { char: '🍎', keywords: 'maca fruta saudavel' }
    ]
  },
  {
    name: 'Tech',
    emojis: [
      { char: '💻', keywords: 'laptop computador codigo programar' },
      { char: '🖥️', keywords: 'desktop computador monitor' },
      { char: '⌨️', keywords: 'teclado digitar' },
      { char: '🖱️', keywords: 'mouse clique' },
      { char: '📱', keywords: 'celular smartphone mobile' },
      { char: '🤖', keywords: 'robo ia inteligencia artificial bot' },
      { char: '⚙️', keywords: 'engrenagem config configuracao settings' },
      { char: '🔧', keywords: 'ferramenta chave manutencao fix' },
      { char: '🐛', keywords: 'bug inseto erro debug' },
      { char: '🚀', keywords: 'foguete deploy lancamento launch' },
      { char: '🔌', keywords: 'plugin tomada conexao integracao' },
      { char: '💾', keywords: 'disquete salvar save backup' },
      { char: '🗄️', keywords: 'banco dados database servidor' },
      { char: '🌐', keywords: 'web internet rede site' }
    ]
  },
  {
    name: 'Natureza',
    emojis: [
      { char: '🌱', keywords: 'broto planta crescimento inicio' },
      { char: '🌿', keywords: 'folha erva planta verde' },
      { char: '🌳', keywords: 'arvore floresta natureza' },
      { char: '🌸', keywords: 'flor cerejeira primavera' },
      { char: '🌻', keywords: 'girassol flor amarelo' },
      { char: '🌵', keywords: 'cacto deserto planta' },
      { char: '🍀', keywords: 'trevo sorte verde' },
      { char: '🌙', keywords: 'lua noite' },
      { char: '☀️', keywords: 'sol dia claro' },
      { char: '⛰️', keywords: 'montanha trilha escalada' },
      { char: '🌊', keywords: 'onda mar oceano praia' },
      { char: '🔥', keywords: 'fogo chama streak quente' },
      { char: '❄️', keywords: 'neve frio inverno floco' },
      { char: '🦋', keywords: 'borboleta inseto transformacao' }
    ]
  },
  {
    name: 'Símbolos',
    emojis: [
      { char: '⭐', keywords: 'estrela favorito destaque star' },
      { char: '✨', keywords: 'brilho sparkles magia novo' },
      { char: '⚡', keywords: 'raio energia rapido eletrico' },
      { char: '🏆', keywords: 'trofeu vitoria premio conquista' },
      { char: '🎉', keywords: 'festa celebracao confete parabens' },
      { char: '🚩', keywords: 'bandeira flag marco alerta' },
      { char: '❗', keywords: 'exclamacao importante urgente atencao' },
      { char: '❓', keywords: 'pergunta duvida interrogacao' },
      { char: '🔒', keywords: 'cadeado bloqueado seguranca privado' },
      { char: '🔑', keywords: 'chave acesso senha key' },
      { char: '♻️', keywords: 'reciclar repetir ciclo recorrente' },
      { char: '➕', keywords: 'mais adicionar plus soma' },
      { char: '🔔', keywords: 'sino notificacao lembrete alerta' },
      { char: '🏁', keywords: 'bandeira chegada fim finalizar meta' }
    ]
  }
];

export function EmojiPicker({
  onSelect,
  onRemove,
  onClose,
  showRemove = false
}: {
  onSelect: (emoji: string) => void;
  onRemove?: () => void;
  onClose: () => void;
  showRemove?: boolean;
}) {
  const [search, setSearch] = useState('');
  const pickerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [onClose]);

  const q = search.trim().toLowerCase();
  const filtered = EMOJI_CATEGORIES
    .map(cat => ({
      ...cat,
      emojis: q
        ? cat.emojis.filter(
            e => e.keywords.includes(q) || cat.name.toLowerCase().includes(q)
          )
        : cat.emojis
    }))
    .filter(cat => cat.emojis.length > 0);

  return (
    <div className="emoji-picker" ref={pickerRef}>
      <input
        type="text"
        className="emoji-picker-search"
        placeholder="Buscar emoji..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        autoFocus
      />

      <div className="emoji-picker-body">
        {filtered.length === 0 && (
          <p className="emoji-picker-empty">Nenhum emoji encontrado</p>
        )}
        {filtered.map(cat => (
          <div key={cat.name} className="emoji-picker-category">
            <span className="emoji-picker-category-label">{cat.name}</span>
            <div className="emoji-picker-grid">
              {cat.emojis.map(e => (
                <button
                  key={e.char}
                  type="button"
                  className="emoji-picker-item"
                  title={e.keywords.split(' ')[0]}
                  onClick={() => onSelect(e.char)}
                >
                  {e.char}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {showRemove && onRemove && (
        <button type="button" className="emoji-picker-remove" onClick={onRemove}>
          <X size={12} />
          Remover icone
        </button>
      )}
    </div>
  );
}

export function TaskEmojiIcon({ task }: { task: Task }) {
  const [pickerOpen, setPickerOpen] = useState(false);

  const selectEmoji = async (emoji: string) => {
    if (!task.id) return;
    await db.tasks.update(task.id, { taskIcon: emoji });
    setPickerOpen(false);
  };

  const removeEmoji = async () => {
    if (!task.id) return;
    await db.tasks.update(task.id, { taskIcon: undefined });
    setPickerOpen(false);
  };

  return (
    <div className="task-emoji-wrapper">
      <button
        type="button"
        className={`task-emoji-trigger ${task.taskIcon ? 'has-icon' : ''}`}
        title={task.taskIcon ? 'Alterar icone' : 'Adicionar icone'}
        onClick={() => setPickerOpen(v => !v)}
      >
        {task.taskIcon ? (
          <span className="task-emoji-char">{task.taskIcon}</span>
        ) : (
          <Smile size={18} className="task-emoji-placeholder" />
        )}
      </button>

      {pickerOpen && (
        <EmojiPicker
          onSelect={selectEmoji}
          onRemove={removeEmoji}
          onClose={() => setPickerOpen(false)}
          showRemove={Boolean(task.taskIcon)}
        />
      )}
    </div>
  );
}
