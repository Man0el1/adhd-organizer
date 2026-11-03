import React from 'react';
import { Plus, Trash2, ListChecks } from 'lucide-react';

export default function MicrotasksFields({
  subtasks = [],
  onSubtasksChange,
  isDarkMode = false,
}) {
  const handleAddSubtask = () => {
    onSubtasksChange([...subtasks, { title: '', done: false }]);
  };

  const handleRemoveSubtask = (index) => {
    onSubtasksChange(subtasks.filter((_, i) => i !== index));
  };

  const handleTitleChange = (index, value) => {
    const updated = [...subtasks];
    updated[index] = { ...updated[index], title: value };
    onSubtasksChange(updated);
  };

  return (
    <div
      className={`p-3.5 rounded-2xl border space-y-3 transition-colors ${
        isDarkMode
          ? 'bg-slate-950/60 border-slate-800'
          : 'bg-[#edf2f7] border-[#d3dce6]'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200">
          <ListChecks className="w-3.5 h-3.5 text-emerald-600" />
          <span>Subtarefas (Opcional)</span>
        </div>
        <button
          type="button"
          onClick={handleAddSubtask}
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#1d56af] hover:text-[#174690] cursor-pointer"
        >
          <Plus className="w-3 h-3 stroke-[2.5]" />
          Adicionar
        </button>
      </div>

      {subtasks.length === 0 ? (
        <div
          className={`text-center py-2 text-xs rounded-xl border border-dashed ${
            isDarkMode
              ? 'border-slate-800 text-slate-500 bg-slate-900/40'
              : 'border-slate-300 text-slate-500 bg-white/60'
          }`}
        >
          Nenhuma subtarefa inicial adicionada.
        </div>
      ) : (
        <div className="space-y-1.5">
          {subtasks.map((st, idx) => (
            <div key={idx} className="flex items-center gap-1.5">
              <span className="text-[11px] font-mono text-slate-400 w-4 text-center shrink-0">
                {idx + 1}.
              </span>
              <input
                type="text"
                value={st.title || ''}
                onChange={(e) => handleTitleChange(idx, e.target.value)}
                placeholder={`Subtarefa ${idx + 1}`}
                className={`flex-1 px-2.5 py-1.5 text-xs rounded-xl border transition-colors focus:outline-hidden focus:ring-1 focus:ring-[#1d56af] ${
                  isDarkMode
                    ? 'bg-slate-900 border-slate-700 text-slate-100 placeholder:text-slate-600'
                    : 'bg-white border-[#d3dce6] text-slate-800 placeholder:text-slate-400'
                }`}
              />
              <button
                type="button"
                onClick={() => handleRemoveSubtask(idx)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 transition-colors cursor-pointer shrink-0"
                title="Remover subtarefa"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
