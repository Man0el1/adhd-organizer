import React, { useState } from 'react';
import { CheckCircle, Circle, Clock, Plus, Trash2 } from 'lucide-react';

export default function Routine() {
  const [agendaTasks, setAgendaTasks] = useState([
    { id: '1', time: '08:30 - 09:30', title: 'Rotina Matinal & Hidratação Consciente', tag: 'Hábito', done: true },
    { id: '2', time: '09:45 - 11:00', title: 'Bloco de Hiperfoco na Atividade Principal', tag: 'Foco Alto', done: false, current: true },
    { id: '3', time: '11:15 - 12:00', title: 'Pausa para Caminhada & Lanche Leve', tag: 'Recarga', done: false },
    { id: '4', time: '14:00 - 15:30', title: 'Revisão de Pendências & E-mails', tag: 'Rotina', done: false },
  ]);
  const [newAgendaTitle, setNewAgendaTitle] = useState('');
  const [newAgendaTime, setNewAgendaTime] = useState('');
  const [newAgendaTag, setNewAgendaTag] = useState('Foco Alto');

  const completedCount = agendaTasks.filter(t => t.done).length;
  const progressPercent = agendaTasks.length > 0 ? Math.round((completedCount / agendaTasks.length) * 100) : 0;

  const handleDeleteTask = (id) => {
    setAgendaTasks(agendaTasks.filter(t => t.id !== id));
  };

  return (
    <div className="w-full h-full flex-1 flex flex-col justify-between bg-[#1E1414] p-4 sm:p-6 lg:p-8 min-h-0 overflow-hidden gap-3">
      <div className="flex items-center justify-between gap-3 bg-[#251818] border border-[#3D2B2B] rounded-xl px-4 py-2.5 shadow-sm">
        <div className="flex items-center gap-3 flex-1">
          <span className="text-xs font-semibold text-[#D1BFA5]">
            Progresso de Hoje: <strong className="text-[#F5E6DA] font-mono">{completedCount}/{agendaTasks.length} blocos</strong>
          </span>
          <div className="flex-1 bg-[#1E1414] h-2 rounded-full overflow-hidden border border-[#3D2B2B]">
            <div
              className="bg-gradient-to-r from-[#800020] to-[#A67C52] h-full transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>

        <div className="text-xs font-mono font-bold text-[#A67C52] bg-[#1E1414] px-2.5 py-0.5 rounded-lg border border-[#3D2B2B]">
          {progressPercent}%
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-0">
        {agendaTasks.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center py-12 text-center text-[#6D5A5A] space-y-1">
            <p className="text-sm font-semibold text-[#D1BFA5]">Nenhum bloco de rotina adicionado ainda.</p>
            <p className="text-xs text-[#A67C52]">Adicione seu primeiro bloco no formulário abaixo!</p>
          </div>
        ) : (
          agendaTasks.map((t) => (
            <div
              key={t.id}
              className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 transition-all shadow-sm ${
                t.current
                  ? 'bg-[#251818] border-[#800020] ring-1 ring-[#800020]'
                  : t.done
                  ? 'bg-[#251818]/50 border-[#3D2B2B] opacity-60'
                  : 'bg-[#251818] border-[#3D2B2B] hover:border-[#A67C52]/50'
              }`}
            >
              <div className="flex items-center gap-3 truncate flex-1">
                <button
                  type="button"
                  onClick={() => {
                    setAgendaTasks(
                      agendaTasks.map((item) =>
                        item.id === t.id ? { ...item, done: !item.done } : item
                      )
                    );
                  }}
                  className="text-[#A67C52] hover:text-[#F5E6DA] cursor-pointer transition-colors p-0.5"
                >
                  {t.done ? (
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <Circle className="w-5 h-5 text-[#9E8A78]" />
                  )}
                </button>
                <div className="truncate">
                  <p className={`font-semibold text-sm truncate ${t.done ? 'line-through text-[#6D5A5A]' : 'text-[#F5E6DA]'}`}>
                    {t.title}
                  </p>
                  <p className="text-xs text-[#A67C52] flex items-center gap-1 font-mono mt-0.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{t.time}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className={`text-xs px-2.5 py-0.5 rounded-lg font-bold shrink-0 border ${
                  t.current
                    ? 'bg-[#800020] text-[#F5E6DA] border-[#800020]'
                    : 'bg-[#1E1414] text-[#D1BFA5] border-[#3D2B2B]'
                }`}>
                  {t.tag}
                </span>

                <button
                  type="button"
                  onClick={() => handleDeleteTask(t.id)}
                  className="p-1 rounded text-[#6D5A5A] hover:text-red-400 hover:bg-[#1E1414] transition-colors cursor-pointer"
                  title="Remover bloco"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
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
              time: newAgendaTime || 'Horário flexível',
              tag: newAgendaTag || 'Rotina',
              done: false,
            }
          ]);
          setNewAgendaTitle('');
          setNewAgendaTime('');
        }}
        className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-[#3D2B2B]"
      >
        <input
          type="text"
          value={newAgendaTitle}
          onChange={(e) => setNewAgendaTitle(e.target.value)}
          placeholder="Nome do próximo bloco de foco..."
          className="flex-1 bg-[#251818] border border-[#3D2B2B] focus:border-[#800020] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#F5E6DA] placeholder-[#6D5A5A] outline-none"
        />
        <input
          type="text"
          value={newAgendaTime}
          onChange={(e) => setNewAgendaTime(e.target.value)}
          placeholder="Horário (ex: 15:00 - 16:00)"
          className="sm:w-44 bg-[#251818] border border-[#3D2B2B] focus:border-[#800020] rounded-xl px-3 py-2.5 text-xs sm:text-sm text-[#F5E6DA] placeholder-[#6D5A5A] outline-none"
        />
        <select
          value={newAgendaTag}
          onChange={(e) => setNewAgendaTag(e.target.value)}
          className="bg-[#251818] border border-[#3D2B2B] rounded-xl px-3 py-2.5 text-xs sm:text-sm text-[#F5E6DA] outline-none cursor-pointer"
        >
          <option value="Foco Alto">Foco Alto</option>
          <option value="Hábito">Hábito</option>
          <option value="Recarga">Recarga</option>
          <option value="Rotina">Rotina</option>
        </select>
        <button
          type="submit"
          className="px-5 py-2.5 rounded-xl bg-[#800020] hover:bg-[#A00028] text-[#F5E6DA] text-xs sm:text-sm font-bold cursor-pointer transition-all shadow flex items-center justify-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Adicionar</span>
        </button>
      </form>
    </div>
  );
}
