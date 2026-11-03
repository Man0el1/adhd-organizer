import React from 'react';
import { Sun, Sunset, Moon, Clock } from 'lucide-react';

const PERIODS = [
  { id: 'morning', label: 'Manhã', icon: Sun, color: 'text-amber-500', activeBg: 'bg-amber-500' },
  { id: 'afternoon', label: 'Tarde', icon: Sunset, color: 'text-orange-500', activeBg: 'bg-orange-500' },
  { id: 'night', label: 'Noite', icon: Moon, color: 'text-indigo-500', activeBg: 'bg-indigo-600' },
];

export default function DailyRoutineFields({
  period = 'morning',
  onPeriodChange,
  isDarkMode = false,
}) {
  return (
    <div
      className={`p-3.5 rounded-2xl border space-y-3 transition-colors ${
        isDarkMode
          ? 'bg-slate-950/60 border-slate-800'
          : 'bg-[#edf2f7] border-[#d3dce6]'
      }`}
    >
      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200">
        <Clock className="w-3.5 h-3.5 text-blue-600" />
        <span>Período da Rotina</span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {PERIODS.map((p) => {
          const Icon = p.icon;
          const isSelected = period === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onPeriodChange(p.id)}
              className={`py-2 px-3 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                isSelected
                  ? `${p.activeBg} text-white border-transparent shadow-xs font-bold`
                  : isDarkMode
                  ? 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : p.color}`} />
              <span className="text-xs">{p.label}</span>
            </button>
          );
        })}
      </div>

      <p className="text-[11px] text-slate-500 dark:text-slate-400">
        As atividades são organizadas pelo período do dia e podem ser concluídas diariamente.
      </p>
    </div>
  );
}
