import React from 'react';
import { Flame } from 'lucide-react';

const WEEKDAYS_LABELS = [
  { day: 0, label: 'D', full: 'Dom' },
  { day: 1, label: 'S', full: 'Seg' },
  { day: 2, label: 'T', full: 'Ter' },
  { day: 3, label: 'Q', full: 'Qua' },
  { day: 4, label: 'Q', full: 'Qui' },
  { day: 5, label: 'S', full: 'Sex' },
  { day: 6, label: 'S', full: 'Sáb' },
];

const COLOR_PRESETS = [
  { value: '#10b981', label: 'Esmeralda', bg: 'bg-emerald-500' },
  { value: '#3b82f6', label: 'Azul', bg: 'bg-blue-500' },
  { value: '#8b5cf6', label: 'Roxo', bg: 'bg-purple-500' },
  { value: '#f59e0b', label: 'Âmbar', bg: 'bg-amber-500' },
  { value: '#ec4899', label: 'Rosa', bg: 'bg-pink-500' },
];

export default function HabitFields({
  frequency = 'daily',
  onFrequencyChange,
  targetDays = [0, 1, 2, 3, 4, 5, 6],
  onTargetDaysChange,
  color = '#10b981',
  onColorChange,
  isDarkMode = false,
}) {
  const handleToggleDay = (dayIndex) => {
    let next;
    if (targetDays.includes(dayIndex)) {
      if (targetDays.length === 1) return; // Mínimo 1 dia
      next = targetDays.filter((d) => d !== dayIndex);
    } else {
      next = [...targetDays, dayIndex].sort();
    }
    onTargetDaysChange(next);
  };

  const handleSelectFrequency = (freq) => {
    onFrequencyChange(freq);
    if (freq === 'daily') {
      onTargetDaysChange([0, 1, 2, 3, 4, 5, 6]);
    } else if (freq === 'weekdays') {
      onTargetDaysChange([1, 2, 3, 4, 5]);
    }
  };

  return (
    <div
      className={`p-3.5 rounded-2xl border space-y-3 transition-colors ${
        isDarkMode
          ? 'bg-slate-950/60 border-slate-800'
          : 'bg-[#edf2f7] border-[#d3dce6]'
      }`}
    >
      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200">
        <Flame className="w-3.5 h-3.5 text-emerald-600" />
        <span>Configuração do Hábito</span>
      </div>

      {/* Frequência */}
      <div className="space-y-1">
        <label className="text-[11px] font-semibold text-slate-500">Frequência</label>
        <div className="grid grid-cols-3 gap-1 bg-white/60 dark:bg-slate-900/60 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => handleSelectFrequency('daily')}
            className={`py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              frequency === 'daily'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            Todos os dias
          </button>
          <button
            type="button"
            onClick={() => handleSelectFrequency('weekdays')}
            className={`py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              frequency === 'weekdays'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            Dias úteis
          </button>
          <button
            type="button"
            onClick={() => handleSelectFrequency('custom')}
            className={`py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              frequency === 'custom'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            Personalizado
          </button>
        </div>
      </div>

      {/* Seleção de Dias Alvo */}
      <div className="space-y-1">
        <label className="text-[11px] font-semibold text-slate-500">Dias da Semana</label>
        <div className="flex items-center justify-between gap-1">
          {WEEKDAYS_LABELS.map(({ day, label, full }) => {
            const isSelected = targetDays.includes(day);
            return (
              <button
                key={day}
                type="button"
                onClick={() => handleToggleDay(day)}
                title={full}
                className={`w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center border ${
                  isSelected
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : isDarkMode
                    ? 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                    : 'bg-white border-slate-200 text-slate-500 hover:text-slate-900'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Cor do Hábito */}
      <div className="space-y-1">
        <label className="text-[11px] font-semibold text-slate-500">Cor do Marcador</label>
        <div className="flex items-center gap-2">
          {COLOR_PRESETS.map((p) => {
            const isSelected = color === p.value;
            return (
              <button
                key={p.value}
                type="button"
                onClick={() => onColorChange(p.value)}
                title={p.label}
                className={`w-6 h-6 rounded-full transition-transform cursor-pointer ${p.bg} ${
                  isSelected ? 'ring-2 ring-offset-2 ring-emerald-500 scale-110' : 'opacity-80 hover:opacity-100'
                }`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
