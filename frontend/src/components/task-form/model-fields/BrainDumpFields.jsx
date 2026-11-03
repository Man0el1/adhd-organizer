import React from 'react';
import { Brain, Lightbulb } from 'lucide-react';

export default function BrainDumpFields({ isDarkMode = false }) {
  return (
    <div
      className={`p-3 rounded-xl border transition-colors flex items-start gap-2.5 ${
        isDarkMode
          ? 'bg-slate-950/60 border-slate-800 text-slate-300'
          : 'bg-amber-50/70 border-amber-200/80 text-amber-900'
      }`}
    >
      <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
        <Lightbulb className="w-3.5 h-3.5" />
      </div>
      <div className="text-xs space-y-0.5">
        <p className="font-bold text-[11px] uppercase tracking-wider text-amber-700 dark:text-amber-400">
          Modo Descarga Mental Livre
        </p>
        <p className="text-[11px] opacity-80 leading-relaxed">
          Esta tarefa não exige datas nem horários. Ela será salva diretamente no seu Brain Dump para você liberar espaço na mente.
        </p>
      </div>
    </div>
  );
}
