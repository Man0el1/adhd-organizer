import React from 'react';
import { AlignLeft } from 'lucide-react';

export default function CommonFields({
  name,
  onNameChange,
  description,
  onDescriptionChange,
  isDarkMode = false,
  autoFocus = true,
  namePlaceholder = 'Ex: Entregar relatório de química...',
  descPlaceholder = 'Orientações ou detalhes adicionais...',
}) {
  return (
    <div className="space-y-3">
      {/* Nome / Título da Tarefa */}
      <div className="space-y-1">
        <label
          htmlFor="task-common-name"
          className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider"
        >
          Nome da Tarefa <span className="text-rose-500">*</span>
        </label>
        <input
          id="task-common-name"
          type="text"
          required
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder={namePlaceholder}
          autoFocus={autoFocus}
          className={`w-full rounded-xl px-3 py-2 text-xs sm:text-sm outline-none border transition-colors ${
            isDarkMode
              ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500 focus:border-[#1d56af]'
              : 'bg-white border-[#d3dce6] text-slate-900 placeholder-slate-400 focus:border-[#1d56af] shadow-xs'
          }`}
        />
      </div>

      {/* Descrição Opcional */}
      <div className="space-y-1">
        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
          <AlignLeft className="w-3.5 h-3.5" />
          Descrição <span className="text-slate-400 font-normal text-[10px]">(Opcional)</span>
        </label>
        <textarea
          rows={2}
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder={descPlaceholder}
          className={`w-full rounded-xl px-3 py-1.5 text-xs outline-none resize-none border transition-colors ${
            isDarkMode
              ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500 focus:border-[#1d56af]'
              : 'bg-white border-[#d3dce6] text-slate-900 placeholder-slate-400 focus:border-[#1d56af] shadow-xs'
          }`}
        />
      </div>
    </div>
  );
}
