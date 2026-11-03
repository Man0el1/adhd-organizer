import React from 'react';
import { Grid2X2 } from 'lucide-react';

export default function MatrixFields({
  urgency = true,
  onUrgencyChange,
  importance = true,
  onImportanceChange,
  isDarkMode = false,
}) {
  let quadrantLabel = '';
  let quadrantColor = '';

  if (urgency && importance) {
    quadrantLabel = 'Q1: Fazer Primeiro (Urgente & Importante)';
    quadrantColor = isDarkMode ? 'text-rose-400 bg-rose-950/40 border-rose-800' : 'text-rose-700 bg-rose-50 border-rose-200';
  } else if (!urgency && importance) {
    quadrantLabel = 'Q2: Agendar (Importante & Não Urgente)';
    quadrantColor = isDarkMode ? 'text-blue-400 bg-blue-950/40 border-blue-800' : 'text-blue-700 bg-blue-50 border-blue-200';
  } else if (urgency && !importance) {
    quadrantLabel = 'Q3: Delegar (Urgente & Não Importante)';
    quadrantColor = isDarkMode ? 'text-amber-400 bg-amber-950/40 border-amber-800' : 'text-amber-700 bg-amber-50 border-amber-200';
  } else {
    quadrantLabel = 'Q4: Esperar / Eliminar (Não Urgente & Não Importante)';
    quadrantColor = isDarkMode ? 'text-slate-400 bg-slate-800/60 border-slate-700' : 'text-slate-600 bg-slate-100 border-slate-200';
  }

  return (
    <div
      className={`p-3.5 rounded-2xl border space-y-3 transition-colors ${
        isDarkMode
          ? 'bg-slate-950/60 border-slate-800'
          : 'bg-[#edf2f7] border-[#d3dce6]'
      }`}
    >
      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200">
        <Grid2X2 className="w-3.5 h-3.5 text-violet-600" />
        <span>Prioridade (Matriz de Eisenhower)</span>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {/* Urgência */}
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-slate-500">Urgência</label>
          <div className="grid grid-cols-2 gap-1 bg-white/60 dark:bg-slate-900/60 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => onUrgencyChange(true)}
              className={`py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                urgency
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              Urgente
            </button>
            <button
              type="button"
              onClick={() => onUrgencyChange(false)}
              className={`py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                !urgency
                  ? isDarkMode ? 'bg-slate-800 text-white shadow-xs' : 'bg-white text-slate-800 border border-slate-200 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              Não
            </button>
          </div>
        </div>

        {/* Importância */}
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-slate-500">Importância</label>
          <div className="grid grid-cols-2 gap-1 bg-white/60 dark:bg-slate-900/60 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => onImportanceChange(true)}
              className={`py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                importance
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              Importante
            </button>
            <button
              type="button"
              onClick={() => onImportanceChange(false)}
              className={`py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                !importance
                  ? isDarkMode ? 'bg-slate-800 text-white shadow-xs' : 'bg-white text-slate-800 border border-slate-200 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              Não
            </button>
          </div>
        </div>
      </div>

      {/* Quadrante Resultante */}
      <div className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-semibold text-center ${quadrantColor}`}>
        {quadrantLabel}
      </div>
    </div>
  );
}
