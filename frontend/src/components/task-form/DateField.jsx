import React from 'react';
import { Calendar } from 'lucide-react';

export default function DateField({
  value,
  onChange,
  label = 'Data',
  required = false,
  isDarkMode = false,
  min = '',
  max = '',
  className = '',
}) {
  return (
    <div className={`space-y-1 ${className}`}>
      <label className="block text-[11px] font-semibold text-slate-500 mb-1 truncate flex items-center gap-1.5">
        <Calendar className="w-3.5 h-3.5 text-[#1d56af]" />
        <span>{label}</span>
        {required && <span className="text-rose-500 font-bold">*</span>}
      </label>
      <input
        type="date"
        required={required}
        value={value || ''}
        min={min}
        max={max}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full rounded-lg px-2.5 py-1.5 text-xs outline-none border transition-colors ${
          isDarkMode
            ? 'bg-slate-900 border-slate-700 text-white focus:border-[#1d56af]'
            : 'bg-white border-[#d3dce6] text-slate-900 focus:border-[#1d56af] shadow-xs'
        }`}
      />
    </div>
  );
}
