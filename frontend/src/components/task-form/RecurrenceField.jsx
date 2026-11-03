import React from 'react';
import { Repeat } from 'lucide-react';

export default function RecurrenceField({
  value = 'none',
  onChange,
  disabled = false,
  isDarkMode = false,
  label = 'Repetição:',
}) {
  return (
    <div
      className={`pt-2 border-t flex items-center justify-between gap-2 ${
        isDarkMode ? 'border-slate-800' : 'border-[#d3dce6]'
      }`}
    >
      <label className="text-[11px] font-semibold text-slate-500 flex items-center gap-1.5 shrink-0">
        <Repeat className="w-3.5 h-3.5 text-[#1d56af]" />
        {label}
      </label>
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={`rounded-lg px-2.5 py-1 text-xs outline-none border cursor-pointer transition-colors ${
          isDarkMode
            ? 'bg-slate-900 border-slate-700 text-white focus:border-[#1d56af]'
            : 'bg-white border-[#d3dce6] text-slate-900 focus:border-[#1d56af] shadow-xs'
        }`}
      >
        <option value="none">Não se repete</option>
        <option value="daily">Diariamente</option>
        <option value="weekly">Semanalmente</option>
        <option value="monthly">Mensalmente</option>
        <option value="yearly">Anualmente</option>
      </select>
    </div>
  );
}
