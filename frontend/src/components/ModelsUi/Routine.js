import React, { useState } from 'react';
import { CheckCircle, Circle } from 'lucide-react';

export default function Routine() {
  const [agendaTasks, setAgendaTasks] = useState([ //TODO : Mudar para API real
    { id: '1', time: '08:30 - 09:30', title: 'Rotina Matinal & Hidratação', tag: 'Hábito', done: true },
    { id: '2', time: '09:45 - 11:00', title: 'Bloco de Hiperfoco Principal', tag: 'Foco Alto', done: false, current: true },
  ]);
  const [newAgendaTitle, setNewAgendaTitle] = useState('');
  const [newAgendaTime, setNewAgendaTime] = useState('');
  return (
    <div className="w-full max-w-xl bg-[#251818] p-4 sm:p-5 rounded-2xl border border-[#3D2B2B] shadow-lg flex flex-col gap-3">
      <div className="flex items-center justify-between border-b border-[#3D2B2B] pb-2">
        <h3 className="font-bold text-sm text-[#F5E6DA]">Linha do Tempo Visual do Dia</h3>
        <span className="text-[11px] text-[#A67C52] font-semibold">Hoje • Progresso suave</span>
      </div>

      <div className="space-y-1.5 max-h-52 overflow-hidden">
        {agendaTasks.map((t) => (
          <div
            key={t.id}
            className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 text-xs ${
              t.current
                ? 'bg-[#1E1414] border-[#800020] ring-1 ring-[#800020]'
                : t.done
                ? 'bg-[#1E1414]/50 border-[#3D2B2B] opacity-60'
                : 'bg-[#1E1414] border-[#3D2B2B]'
            }`}
          >
            <div className="flex items-center gap-2 truncate">
              <button
                type="button"
                onClick={() => {
                  setAgendaTasks(
                    agendaTasks.map((item) =>
                      item.id === t.id ? { ...item, done: !item.done } : item
                    )
                  );
                }}
                className="text-[#A67C52] hover:text-[#F5E6DA] cursor-pointer"
              >
                {t.done ? (
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Circle className="w-4 h-4" />
                )}
              </button>
              <div className="truncate">
                <p className={`font-semibold truncate ${t.done ? 'line-through text-[#6D5A5A]' : 'text-[#F5E6DA]'}`}>
                  {t.title}
                </p>
                <p className="text-[10px] text-[#A67C52]">{t.time}</p>
              </div>
            </div>
            <span className="text-[9px] px-1.5 py-0.5 rounded font-bold bg-[#3D2B2B] text-[#D1BFA5] shrink-0">
              {t.tag}
            </span>
          </div>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!newAgendaTitle.trim()) return;
          setAgendaTasks([
            ...agendaTasks,
            {
              id: String(Date.now()),
              title: newAgendaTitle.trim(),
              time: newAgendaTime || 'Horário livre',
              tag: 'Novo Bloco',
              done: false,
            }
          ]);
          setNewAgendaTitle('');
          setNewAgendaTime('');
        }}
        className="flex gap-1.5 pt-2 border-t border-[#3D2B2B]"
      >
        <input
          type="text"
          value={newAgendaTitle}
          onChange={(e) => setNewAgendaTitle(e.target.value)}
          placeholder="Novo bloco de tempo..."
          className="flex-1 bg-[#1E1414] border border-[#3D2B2B] rounded-lg px-2.5 py-1 text-xs text-[#F5E6DA] outline-none"
        />
        <input
          type="text"
          value={newAgendaTime}
          onChange={(e) => setNewAgendaTime(e.target.value)}
          placeholder="Horário (ex: 15:00)"
          className="w-28 bg-[#1E1414] border border-[#3D2B2B] rounded-lg px-2.5 py-1 text-xs text-[#F5E6DA] outline-none"
        />
        <button
          type="submit"
          className="px-3 py-1 rounded-lg bg-[#800020] hover:bg-[#A00028] text-[#F5E6DA] text-xs font-bold cursor-pointer"
        >
          Adicionar
        </button>
      </form>
    </div>
  )
}