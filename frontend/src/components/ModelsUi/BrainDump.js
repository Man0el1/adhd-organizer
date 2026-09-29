import React, { useState } from 'react';
import { Plus, Trash2, Sparkles, CheckCircle2 } from 'lucide-react';

export default function BrainDump() {
  const [brainDumpInput, setBrainDumpInput] = useState('');
  const [brainDumpList, setBrainDumpList] = useState([
    'Pesquisar regulação e suplementação de dopamina com médico',
    'Comprar lâmpada de luz amarelada anti-fadiga para a mesa',
    'Mandar confirmação da reunião para sexta-feira às 14h',
    'Ideia de projeto: organizar pastas por contexto e não por urgência',
    'Lembrar de abastecer a garrafa de água antes do próximo bloco de foco'
  ]);

  const handleAdd = (e) => {
    if (e) e.preventDefault();
    if (!brainDumpInput.trim()) return;
    setBrainDumpList([brainDumpInput.trim(), ...brainDumpList]);
    setBrainDumpInput('');
  };

  const handleRemove = (idx) => {
    setBrainDumpList(brainDumpList.filter((_, i) => i !== idx));
  };

  const handleClearAll = () => {
    if (brainDumpList.length === 0) return;
    setBrainDumpList([]);
  };

  return (
    <div className="w-full h-full flex-1 flex flex-col justify-between bg-[#1E1414] p-4 sm:p-6 lg:p-8 min-h-0 overflow-hidden gap-3">
      {/* Top Bar: Input + Counter (Title removed for maximum space) */}
      <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">
        <form onSubmit={handleAdd} className="flex-1 flex gap-2">
          <input
            type="text"
            value={brainDumpInput}
            onChange={(e) => setBrainDumpInput(e.target.value)}
            placeholder="Pensamento intrusivo, ideia rápida ou pendência súbita..."
            className="flex-1 bg-[#251818] border border-[#3D2B2B] focus:border-[#800020] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-[#F5E6DA] placeholder-[#6D5A5A] outline-none shadow-sm"
          />
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-[#800020] hover:bg-[#A00028] text-[#F5E6DA] text-xs sm:text-sm font-bold cursor-pointer transition-all shadow flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Guardar</span>
          </button>
        </form>

        <div className="flex items-center justify-between sm:justify-end gap-2.5 shrink-0">
          <span className="text-xs font-semibold text-[#D1BFA5] bg-[#251818] px-3 py-2 rounded-xl border border-[#3D2B2B] shadow-sm">
            {brainDumpList.length} pensamentos
          </span>
          {brainDumpList.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="text-xs text-[#A67C52] hover:text-red-300 underline cursor-pointer font-medium px-1"
            >
              Limpar
            </button>
          )}
        </div>
      </div>

      {/* Thoughts List: Full space */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-0">
        {brainDumpList.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center py-12 text-center space-y-1.5">
            <div className="w-12 h-12 rounded-2xl bg-[#251818] border border-[#3D2B2B] flex items-center justify-center text-[#A67C52]">
              <Sparkles className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-[#D1BFA5]">Sua mente está livre de pendências!</p>
            <p className="text-xs text-[#A67C52] max-w-sm">
              Sempre que surgir uma ideia ou preocupação durante uma tarefa, guarde aqui para não desviar sua atenção.
            </p>
          </div>
        ) : (
          brainDumpList.map((item, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-[#251818] border border-[#3D2B2B] hover:border-[#A67C52]/40 text-xs sm:text-sm text-[#F5E6DA] flex items-center justify-between gap-3 transition-colors shadow-sm group"
            >
              <div className="flex items-center gap-2.5 truncate">
                <span className="w-2 h-2 rounded-full bg-violet-400 shrink-0"></span>
                <span className="truncate">{item}</span>
              </div>
              <button
                type="button"
                onClick={() => handleRemove(idx)}
                className="text-[#6D5A5A] hover:text-red-400 p-1 rounded hover:bg-[#1E1414] transition-colors cursor-pointer shrink-0"
                title="Concluir e remover"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* ADHD Tip */}
      <div className="bg-[#251818]/90 border border-[#3D2B2B] rounded-xl px-3.5 py-2 text-xs text-[#D1BFA5] flex items-center gap-2">
        <CheckCircle2 className="w-3.5 h-3.5 text-[#A67C52] shrink-0" />
        <p className="truncate">
          <strong className="text-[#F5E6DA]">Dica Neurodivergente:</strong> Anotar pensamentos intrusivos reduz a ansiedade de esquecimento sem desviar o hiperfoco.
        </p>
      </div>
    </div>
  );
}
