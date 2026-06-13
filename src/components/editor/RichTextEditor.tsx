'use client';

import { useEffect, useRef, useState } from 'react';
import { useEditor, useEditorState, EditorContent, type Editor } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight';
import { TaskList, TaskItem } from '@tiptap/extension-list';
import { Placeholder } from '@tiptap/extensions';
import { createLowlight, common } from 'lowlight';
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Link as LinkIcon,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  ListTodo,
  SquareCode,
  TextQuote,
  Minus,
} from 'lucide-react';
import { db, type Task } from '@/db/dexie';
import './RichTextEditor.css';

const lowlight = createLowlight(common);

const SAVE_DEBOUNCE_MS = 800;

/* ── Slash command menu ─────────────────────────────────── */

interface SlashItem {
  title: string;
  keywords: string;
  icon: React.ReactNode;
  run: (editor: Editor, range: { from: number; to: number }) => void;
}

const SLASH_ITEMS: SlashItem[] = [
  {
    title: 'Heading 1',
    keywords: 'heading 1 h1 title',
    icon: <Heading1 size={15} />,
    run: (editor, range) =>
      editor.chain().focus().deleteRange(range).setHeading({ level: 1 }).run(),
  },
  {
    title: 'Heading 2',
    keywords: 'heading 2 h2 subtitle',
    icon: <Heading2 size={15} />,
    run: (editor, range) =>
      editor.chain().focus().deleteRange(range).setHeading({ level: 2 }).run(),
  },
  {
    title: 'Bullet List',
    keywords: 'bullet list unordered ul',
    icon: <List size={15} />,
    run: (editor, range) =>
      editor.chain().focus().deleteRange(range).toggleBulletList().run(),
  },
  {
    title: 'Numbered List',
    keywords: 'numbered list ordered ol',
    icon: <ListOrdered size={15} />,
    run: (editor, range) =>
      editor.chain().focus().deleteRange(range).toggleOrderedList().run(),
  },
  {
    title: 'To-do List',
    keywords: 'todo task checklist to-do list check',
    icon: <ListTodo size={15} />,
    run: (editor, range) =>
      editor.chain().focus().deleteRange(range).toggleTaskList().run(),
  },
  {
    title: 'Code Block',
    keywords: 'code block snippet pre',
    icon: <SquareCode size={15} />,
    run: (editor, range) =>
      editor.chain().focus().deleteRange(range).setCodeBlock().run(),
  },
  {
    title: 'Blockquote',
    keywords: 'blockquote quote citation',
    icon: <TextQuote size={15} />,
    run: (editor, range) =>
      editor.chain().focus().deleteRange(range).toggleBlockquote().run(),
  },
  {
    title: 'Divider',
    keywords: 'divider horizontal rule separator hr',
    icon: <Minus size={15} />,
    run: (editor, range) =>
      editor.chain().focus().deleteRange(range).setHorizontalRule().run(),
  },
];

interface SlashState {
  range: { from: number; to: number };
  items: SlashItem[];
  position: { top: number; left: number };
}

/** Detect a "/query" sequence directly before the caret. */
function detectSlash(editor: Editor): SlashState | null {
  const { state, view } = editor;
  const { $from, empty } = state.selection;
  if (!empty) return null;
  if (!$from.parent.isTextblock || $from.parent.type.name === 'codeBlock') return null;

  const textBefore = $from.parent.textBetween(0, $from.parentOffset, undefined, '￼');
  const match = /(?:^|\s)\/([a-zA-Z0-9-]*)$/.exec(textBefore);
  if (!match) return null;

  const query = match[1].toLowerCase();
  const items = SLASH_ITEMS.filter((item) => item.keywords.includes(query));
  if (items.length === 0) return null;

  const from = $from.pos - query.length - 1;
  const coords = view.coordsAtPos(from);
  return {
    range: { from, to: $from.pos },
    items,
    position: {
      top: coords.bottom + 4,
      left: Math.min(coords.left, window.innerWidth - 220),
    },
  };
}

/* ── "[[" task link menu ────────────────────────────────── */

interface TaskLinkState {
  range: { from: number; to: number };
  query: string;
  position: { top: number; left: number };
}

/** Detect a "[[query" sequence directly before the caret. */
function detectTaskLink(editor: Editor): TaskLinkState | null {
  const { state, view } = editor;
  const { $from, empty } = state.selection;
  if (!empty) return null;
  if (!$from.parent.isTextblock || $from.parent.type.name === 'codeBlock') return null;

  const textBefore = $from.parent.textBetween(0, $from.parentOffset, undefined, '￼');
  const match = /\[\[([^[\]]*)$/.exec(textBefore);
  if (!match) return null;

  const query = match[1];
  const from = $from.pos - query.length - 2;
  const coords = view.coordsAtPos(from);
  return {
    range: { from, to: $from.pos },
    query,
    position: {
      top: coords.bottom + 4,
      left: Math.min(coords.left, window.innerWidth - 260),
    },
  };
}

const TASK_LINK_PREFIX = 'task://';
const TASK_LINK_RESULTS_CAP = 8;

/* ── Content helpers ────────────────────────────────────── */

/** Build a TipTap doc from legacy plain-text description. */
function docFromPlainText(text?: string): object {
  const lines = (text ?? '').split('\n');
  return {
    type: 'doc',
    content: lines.map((line) =>
      line
        ? { type: 'paragraph', content: [{ type: 'text', text: line }] }
        : { type: 'paragraph' }
    ),
  };
}

function initialContent(content?: object, fallbackText?: string): object {
  return content ?? docFromPlainText(fallbackText);
}

/* ── Component ──────────────────────────────────────────── */

export function RichTextEditor({
  content,
  fallbackText,
  onSave,
  taskId,
  onNavigateTask,
}: {
  content?: object;
  fallbackText?: string;
  onSave: (json: object, plainText: string) => void;
  /** Current task id — used to update `relatedTaskIds` and exclude self from "[[" results. */
  taskId?: number;
  /** Called when the user clicks a `task://` link inside the editor. */
  onNavigateTask?: (id: number) => void;
}) {
  const [slash, setSlash] = useState<SlashState | null>(null);
  const [slashIndex, setSlashIndex] = useState(0);
  const [taskLink, setTaskLink] = useState<TaskLinkState | null>(null);
  const [taskLinkItems, setTaskLinkItems] = useState<Task[]>([]);
  const [taskLinkIndex, setTaskLinkIndex] = useState(0);

  // Refs so the stable editorProps/onUpdate closures see current values.
  const slashRef = useRef<SlashState | null>(null);
  const slashIndexRef = useRef(0);
  const taskLinkRef = useRef<TaskLinkState | null>(null);
  const taskLinkItemsRef = useRef<Task[]>([]);
  const taskLinkIndexRef = useRef(0);
  const taskIdRef = useRef(taskId);
  const onNavigateTaskRef = useRef(onNavigateTask);
  const onSaveRef = useRef(onSave);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const lastEmittedRef = useRef<string | null>(null);
  const contentPropRef = useRef<object | undefined>(content);

  useEffect(() => {
    onSaveRef.current = onSave;
  }, [onSave]);

  useEffect(() => {
    taskIdRef.current = taskId;
  }, [taskId]);

  useEffect(() => {
    onNavigateTaskRef.current = onNavigateTask;
  }, [onNavigateTask]);

  const updateSlash = (next: SlashState | null) => {
    slashRef.current = next;
    setSlash(next);
    slashIndexRef.current = 0;
    setSlashIndex(0);
  };

  const moveSlashIndex = (delta: number) => {
    const open = slashRef.current;
    if (!open) return;
    const next =
      (slashIndexRef.current + delta + open.items.length) % open.items.length;
    slashIndexRef.current = next;
    setSlashIndex(next);
  };

  const updateTaskLink = (next: TaskLinkState | null) => {
    taskLinkRef.current = next;
    setTaskLink(next);
    taskLinkIndexRef.current = 0;
    setTaskLinkIndex(0);
    if (!next) {
      taskLinkItemsRef.current = [];
      setTaskLinkItems([]);
    }
  };

  const moveTaskLinkIndex = (delta: number) => {
    const count = taskLinkItemsRef.current.length;
    if (count === 0) return;
    const next = (taskLinkIndexRef.current + delta + count) % count;
    taskLinkIndexRef.current = next;
    setTaskLinkIndex(next);
  };

  // Fetch matching tasks whenever the "[[" query changes.
  useEffect(() => {
    if (!taskLink) return;
    let cancelled = false;
    const q = taskLink.query.toLowerCase();
    db.tasks.toArray().then((all) => {
      if (cancelled || taskLinkRef.current !== taskLink) return;
      const items = all
        .filter(
          (t) =>
            t.id !== undefined &&
            t.id !== taskIdRef.current &&
            t.title.toLowerCase().includes(q)
        )
        .slice(0, TASK_LINK_RESULTS_CAP);
      taskLinkItemsRef.current = items;
      setTaskLinkItems(items);
      if (taskLinkIndexRef.current >= items.length) {
        taskLinkIndexRef.current = 0;
        setTaskLinkIndex(0);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [taskLink]);

  const insertTaskLink = (task: Task, range: { from: number; to: number }) => {
    const ed = editorRef.current;
    if (!ed || task.id === undefined) return;
    const linkedId = task.id;
    ed.chain()
      .focus()
      .deleteRange(range)
      .insertContent([
        {
          type: 'text',
          text: task.title,
          marks: [{ type: 'link', attrs: { href: `${TASK_LINK_PREFIX}${linkedId}` } }],
        },
        { type: 'text', text: ' ' },
      ])
      .run();
    updateTaskLink(null);

    const currentId = taskIdRef.current;
    if (currentId === undefined) return;
    db.tasks.get(currentId).then((current) => {
      if (!current) return;
      const existing = current.relatedTaskIds ?? [];
      if (existing.includes(linkedId)) return;
      db.tasks.update(currentId, { relatedTaskIds: [...existing, linkedId] });
    });
  };

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        codeBlock: false, // replaced by CodeBlockLowlight
        heading: { levels: [1, 2, 3] },
        link: { openOnClick: false, protocols: ['task'] },
      }),
      CodeBlockLowlight.configure({ lowlight }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Placeholder.configure({
        placeholder: 'Escreva algo... digite / para comandos',
      }),
    ],
    content: initialContent(content, fallbackText),
    editorProps: {
      attributes: { class: 'rte-content' },
      handleKeyDown: (_view, event) => {
        const linkOpen = taskLinkRef.current;
        if (linkOpen) {
          switch (event.key) {
            case 'ArrowDown':
              moveTaskLinkIndex(1);
              return true;
            case 'ArrowUp':
              moveTaskLinkIndex(-1);
              return true;
            case 'Enter': {
              const item = taskLinkItemsRef.current[taskLinkIndexRef.current];
              if (item) {
                insertTaskLink(item, linkOpen.range);
                return true;
              }
              return false;
            }
            case 'Escape':
              updateTaskLink(null);
              return true;
            default:
              return false;
          }
        }
        const open = slashRef.current;
        if (!open) return false;
        switch (event.key) {
          case 'ArrowDown':
            moveSlashIndex(1);
            return true;
          case 'ArrowUp':
            moveSlashIndex(-1);
            return true;
          case 'Enter': {
            const item = open.items[slashIndexRef.current];
            if (item && editorRef.current) {
              item.run(editorRef.current, open.range);
              updateSlash(null);
            }
            return true;
          }
          case 'Escape':
            updateSlash(null);
            return true;
          default:
            return false;
        }
      },
      handleClick: (_view, _pos, event) => {
        const target = event.target as HTMLElement | null;
        const anchor = target?.closest?.(`a[href^="${TASK_LINK_PREFIX}"]`);
        if (!anchor) return false;
        const id = Number(anchor.getAttribute('href')?.slice(TASK_LINK_PREFIX.length));
        if (!Number.isFinite(id)) return false;
        event.preventDefault();
        onNavigateTaskRef.current?.(id);
        return true;
      },
    },
    onUpdate: ({ editor }) => {
      updateSlash(detectSlash(editor));
      updateTaskLink(detectTaskLink(editor));
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => {
        const json = editor.getJSON();
        lastEmittedRef.current = JSON.stringify(json);
        onSaveRef.current(json, editor.getText());
      }, SAVE_DEBOUNCE_MS);
    },
    onSelectionUpdate: ({ editor }) => {
      updateSlash(detectSlash(editor));
    },
    onBlur: () => {
      updateSlash(null);
    },
  });

  const editorRef = useRef<Editor | null>(null);
  useEffect(() => {
    editorRef.current = editor;
  }, [editor]);

  // Reset content when the `content` prop points to a different task.
  // Skips the echo of our own debounced save (same JSON coming back).
  useEffect(() => {
    if (!editor || content === contentPropRef.current) return;
    contentPropRef.current = content;
    const incoming = content ? JSON.stringify(content) : null;
    if (incoming !== null && incoming === lastEmittedRef.current) return;
    clearTimeout(saveTimerRef.current);
    lastEmittedRef.current = incoming;
    updateSlash(null);
    editor.commands.setContent(initialContent(content, fallbackText), {
      emitUpdate: false,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content, editor]);

  // Flush nothing on unmount, just cancel the pending save timer.
  useEffect(() => () => clearTimeout(saveTimerRef.current), []);

  const marks = useEditorState({
    editor,
    selector: ({ editor }) =>
      editor
        ? {
            bold: editor.isActive('bold'),
            italic: editor.isActive('italic'),
            strike: editor.isActive('strike'),
            code: editor.isActive('code'),
            link: editor.isActive('link'),
          }
        : null,
  });

  if (!editor) return null;

  const toggleLink = () => {
    if (editor.isActive('link')) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    const url = window.prompt('Link URL');
    if (!url) return;
    editor
      .chain()
      .focus()
      .extendMarkRange('link')
      .setLink({ href: url })
      .run();
  };

  return (
    <div className="rte">
      <BubbleMenu
        editor={editor}
        pluginKey="rte-bubble-menu"
        shouldShow={({ editor, state }) =>
          !state.selection.empty && !editor.isActive('codeBlock')
        }
        className="rte-bubble"
      >
        <button
          type="button"
          className={`rte-bubble-btn${marks?.bold ? ' is-active' : ''}`}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().toggleBold().run()}
          title="Bold"
          aria-label="Bold"
        >
          <Bold size={14} />
        </button>
        <button
          type="button"
          className={`rte-bubble-btn${marks?.italic ? ' is-active' : ''}`}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          title="Italic"
          aria-label="Italic"
        >
          <Italic size={14} />
        </button>
        <button
          type="button"
          className={`rte-bubble-btn${marks?.strike ? ' is-active' : ''}`}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          title="Strikethrough"
          aria-label="Strikethrough"
        >
          <Strikethrough size={14} />
        </button>
        <button
          type="button"
          className={`rte-bubble-btn${marks?.code ? ' is-active' : ''}`}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().toggleCode().run()}
          title="Inline code"
          aria-label="Inline code"
        >
          <Code size={14} />
        </button>
        <span className="rte-bubble-sep" />
        <button
          type="button"
          className={`rte-bubble-btn${marks?.link ? ' is-active' : ''}`}
          onMouseDown={(e) => e.preventDefault()}
          onClick={toggleLink}
          title="Link"
          aria-label="Link"
        >
          <LinkIcon size={14} />
        </button>
      </BubbleMenu>

      <EditorContent editor={editor} />

      {taskLink && taskLinkItems.length > 0 && (
        <div
          className="rte-slash rte-task-link"
          style={{ top: taskLink.position.top, left: taskLink.position.left }}
          role="listbox"
          aria-label="Link to task"
        >
          {taskLinkItems.map((t, i) => (
            <button
              key={t.id}
              type="button"
              role="option"
              aria-selected={i === taskLinkIndex}
              className={`rte-slash-item${i === taskLinkIndex ? ' is-selected' : ''}`}
              onMouseDown={(e) => e.preventDefault()}
              onMouseEnter={() => {
                taskLinkIndexRef.current = i;
                setTaskLinkIndex(i);
              }}
              onClick={() => insertTaskLink(t, taskLink.range)}
            >
              <span className="rte-slash-icon">{t.taskIcon ?? '🔗'}</span>
              {t.title}
            </button>
          ))}
        </div>
      )}

      {slash && (
        <div
          className="rte-slash"
          style={{ top: slash.position.top, left: slash.position.left }}
          role="listbox"
          aria-label="Insert block"
        >
          {slash.items.map((item, i) => (
            <button
              key={item.title}
              type="button"
              role="option"
              aria-selected={i === slashIndex}
              className={`rte-slash-item${i === slashIndex ? ' is-selected' : ''}`}
              onMouseDown={(e) => e.preventDefault()}
              onMouseEnter={() => {
                slashIndexRef.current = i;
                setSlashIndex(i);
              }}
              onClick={() => {
                item.run(editor, slash.range);
                updateSlash(null);
              }}
            >
              <span className="rte-slash-icon">{item.icon}</span>
              {item.title}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
