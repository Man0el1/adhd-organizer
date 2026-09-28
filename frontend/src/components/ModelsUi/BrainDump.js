import React, { useState, useEffect } from 'react';

export default function BrainDump({}) {
  const [brainDumpInput, setBrainDumpInput] = useState(''); //TODO : Mudar para API real
  const [brainDumpList, setBrainDumpList] = useState([
    'Pesquisar regulação de dopamina',
    'Comprar lâmpada de luz amarelada',
    'Mandar confirmação para sexta-feira'
  ]);
  
  return (
    <div className="w-full max-w-lg bg-[#251818] p-5 rounded-2xl border border-[#3D2B2B] shadow-lg flex flex-col gap-3">
      <div>
        <h3 className="font-bold text-sm text-[#F5E6DA]">Descarrego Mental (Brain Dump)</h3>
        <p className="text-[11px] text-[#A67C52]">Esvazie a mente sem julgamento para evitar sobrecarga</p>
      </div>

      <div className="flex gap-1.5">
        <input
          type="text"
          value={brainDumpInput}
          onChange={(e) => setBrainDumpInput(e.target.value)}
          placeholder="Pensamento ou ideia intrusiva..."
          className="flex-1 bg-[#1E1414] border border-[#3D2B2B] rounded-lg px-2.5 py-1 text-xs text-[#F5E6DA] outline-none"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && brainDumpInput.trim()) {
              setBrainDumpList([...brainDumpList, brainDumpInput.trim()]);
              setBrainDumpInput('');
            }
          }}
        />
        <button
          type="button"
          onClick={() => {
            if (!brainDumpInput.trim()) return;
            setBrainDumpList([...brainDumpList, brainDumpInput.trim()]);
            setBrainDumpInput('');
          }}
          className="px-3 py-1 rounded-lg bg-[#800020] hover:bg-[#A00028] text-[#F5E6DA] text-xs font-bold cursor-pointer"
        >
          Guardar
        </button>
      </div>

      <div className="space-y-1 max-h-40 overflow-hidden">
        {brainDumpList.map((item, idx) => (
          <div
            key={idx}
            className="p-2 rounded-lg bg-[#1E1414] border border-[#3D2B2B] text-xs text-[#D1BFA5] flex items-center justify-between"
          >
            <span className="truncate">{item}</span>
            <button
              type="button"
              onClick={() => setBrainDumpList(brainDumpList.filter((_, i) => i !== idx))}
              className="text-[#6D5A5A] hover:text-red-400 p-0.5 cursor-pointer ml-1"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}