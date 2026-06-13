'use client';

import { useEffect, useRef, useState } from 'react';
import { Paintbrush, Plus, X } from 'lucide-react';
import { db, type Task } from '@/db/dexie';
import './TaskCover.css';

/** 12 predefined solid colors — derived from theme semantic tokens
 *  (danger #F87171, warning #FCD34D, success #4ADE80, accent #00E5FF)
 *  plus hue variations of each family. */
const SOLID_COLORS: { name: string; value: string }[] = [
  { name: 'Red',    value: '#F87171' }, // --danger
  { name: 'Rose',   value: '#FB7185' },
  { name: 'Orange', value: '#FB923C' },
  { name: 'Amber',  value: '#FCD34D' }, // --warning
  { name: 'Lime',   value: '#A3E635' },
  { name: 'Green',  value: '#4ADE80' }, // --success
  { name: 'Teal',   value: '#2DD4BF' },
  { name: 'Cyan',   value: '#00E5FF' }, // --accent
  { name: 'Blue',   value: '#60A5FA' },
  { name: 'Indigo', value: '#818CF8' },
  { name: 'Purple', value: '#C084FC' },
  { name: 'Pink',   value: '#F472B6' }
];

/** 6 predefined gradients — each combines 2 colors from the palette above. */
const GRADIENTS: { name: string; value: string }[] = [
  { name: 'Sunset',  value: 'linear-gradient(135deg, #F87171 0%, #FCD34D 100%)' },
  { name: 'Forest',  value: 'linear-gradient(135deg, #FCD34D 0%, #4ADE80 100%)' },
  { name: 'Lagoon',  value: 'linear-gradient(135deg, #4ADE80 0%, #00E5FF 100%)' },
  { name: 'Deep',    value: 'linear-gradient(135deg, #00E5FF 0%, #818CF8 100%)' },
  { name: 'Orchid',  value: 'linear-gradient(135deg, #818CF8 0%, #F472B6 100%)' },
  { name: 'Flamingo', value: 'linear-gradient(135deg, #F472B6 0%, #F87171 100%)' }
];

export function TaskCover({ task }: { task: Task }) {
  const [showPalette, setShowPalette] = useState(false);
  const paletteRef = useRef<HTMLDivElement | null>(null);

  const hasCover = Boolean(task.coverColor || task.coverGradient);

  useEffect(() => {
    if (!showPalette) return;
    const handleMouseDown = (e: MouseEvent) => {
      if (paletteRef.current && !paletteRef.current.contains(e.target as Node)) {
        setShowPalette(false);
      }
    };
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [showPalette]);

  const setColor = async (color: string) => {
    if (!task.id) return;
    await db.tasks.update(task.id, { coverColor: color, coverGradient: undefined });
    setShowPalette(false);
  };

  const setGradient = async (gradient: string) => {
    if (!task.id) return;
    await db.tasks.update(task.id, { coverColor: undefined, coverGradient: gradient });
    setShowPalette(false);
  };

  const removeCover = async () => {
    if (!task.id) return;
    await db.tasks.update(task.id, { coverColor: undefined, coverGradient: undefined });
    setShowPalette(false);
  };

  return (
    <div className="task-cover-wrapper">
      <div
        className={`task-cover ${hasCover ? 'has-cover' : 'no-cover'}`}
        style={
          task.coverGradient
            ? { background: task.coverGradient }
            : task.coverColor
              ? { backgroundColor: task.coverColor }
              : undefined
        }
      >
        {hasCover ? (
          <button
            type="button"
            className="task-cover-btn change-cover-btn"
            onClick={() => setShowPalette(v => !v)}
          >
            <Paintbrush size={12} />
            Change cover
          </button>
        ) : (
          <button
            type="button"
            className="task-cover-btn add-cover-btn"
            onClick={() => setShowPalette(v => !v)}
          >
            <Plus size={12} />
            Add cover
          </button>
        )}
      </div>

      {showPalette && (
        <div className="cover-palette" ref={paletteRef}>
          <span className="cover-palette-label">Colors</span>
          <div className="cover-palette-grid">
            {SOLID_COLORS.map(c => (
              <button
                key={c.value}
                type="button"
                title={c.name}
                className={`cover-swatch ${task.coverColor === c.value ? 'selected' : ''}`}
                style={{ backgroundColor: c.value }}
                onClick={() => setColor(c.value)}
              />
            ))}
          </div>

          <span className="cover-palette-label">Gradients</span>
          <div className="cover-palette-grid gradients">
            {GRADIENTS.map(g => (
              <button
                key={g.value}
                type="button"
                title={g.name}
                className={`cover-swatch gradient ${task.coverGradient === g.value ? 'selected' : ''}`}
                style={{ background: g.value }}
                onClick={() => setGradient(g.value)}
              />
            ))}
          </div>

          {hasCover && (
            <button type="button" className="cover-remove-btn" onClick={removeCover}>
              <X size={12} />
              Remove cover
            </button>
          )}
        </div>
      )}
    </div>
  );
}
