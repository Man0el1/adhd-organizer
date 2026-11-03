import React from 'react';
import { Columns } from 'lucide-react';

const COLUMNS = [
  { id: 'todo', label: 'A Fazer' },
  { id: 'in_progress', label: 'Em Progresso' },
  { id: 'done', label: 'Concluído' },
];

export default function KanbanFields({
  columnId = 'todo',
  onColumnChange,
  isDarkMode = false,
}) {
  return (
    <div
      className={`p-3.5 rounded-2xl border space-y-2.5 transition-colors ${
        isDarkMode
          ? 'bg-slate-950/60 border-slate-800'
          : 'bg-[#edf2f7] border-[#d3dce6]'
      }`}
    >
      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200">
        <Columns className="w-3.5 h-3.5 text-indigo-600" />
        <span>Coluna Inicial</span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {COLUMNS.map((col) => {
          const isSelected = columnId === col.id;
          return (
            <button
              key={col.id}
              type="button"
              onClick={() => onColumnChange(col.id)}
              className={`py-2 px-2 rounded-xl text-xs font-semibold border text-center transition-all cursor-pointer ${
                isSelected
                  ? isDarkMode
                    ? 'bg-indigo-950/70 border-indigo-700 text-indigo-200 ring-1 ring-indigo-600/40'
                    : 'bg-[#e0e7ff] border-[#818cf8] text-[#312e81] ring-1 ring-[#4f46e5]/25'
                  : isDarkMode
                  ? 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600'
                  : 'bg-white border-[#d3dce6] text-slate-600 hover:border-[#b9cee2]'
              }`}
            >
              {col.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
