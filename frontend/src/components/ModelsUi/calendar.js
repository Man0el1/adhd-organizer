import React, { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Trash2, Clock, AlertCircle } from 'lucide-react';

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date().getDate());
  const [showAddModal, setShowAddModal] = useState(false);
  
  const [events, setEvents] = useState([
    { id: 'ev-1', day: 8, month: currentDate.getMonth(), year: currentDate.getFullYear(), title: 'Consulta Médica', time: '14:30', tag: 'Saúde', isCritical: false },
    { id: 'ev-2', day: 15, month: currentDate.getMonth(), year: currentDate.getFullYear(), title: 'Entrega Projeto', time: '18:00', tag: 'Prazo', isCritical: true },
    { id: 'ev-3', day: 22, month: currentDate.getMonth(), year: currentDate.getFullYear(), title: 'Contas & Assinaturas', time: '10:00', tag: 'Finanças', isCritical: false },
    { id: 'ev-4', day: 28, month: currentDate.getMonth(), year: currentDate.getFullYear(), title: 'Revisão de Metas', time: '16:00', tag: 'Foco', isCritical: false },
  ]);

  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventTime, setNewEventTime] = useState('10:00');
  const [newEventTag, setNewEventTag] = useState('Prazo');
  const [newEventIsCritical, setNewEventIsCritical] = useState(false);

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
  const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const handleToday = () => {
    const now = new Date();
    setCurrentDate(now);
    setSelectedDate(now.getDate());
  };

  const handleAddEvent = (e) => {
    e.preventDefault();
    if (!newEventTitle.trim()) return;
    const newEv = {
      id: `ev-${Date.now()}`,
      day: selectedDate,
      month: currentMonth,
      year: currentYear,
      title: newEventTitle.trim(),
      time: newEventTime,
      tag: newEventTag,
      isCritical: newEventIsCritical,
    };
    setEvents([...events, newEv]);
    setNewEventTitle('');
    setShowAddModal(false);
  };

  const handleDeleteEvent = (id) => {
    setEvents(events.filter(e => e.id !== id));
  };

  const selectedDayEvents = events.filter(
    (ev) => ev.day === selectedDate && ev.month === currentMonth && ev.year === currentYear
  );

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col justify-center">
      <div className="bg-[#251818] border border-[#3D2B2B] rounded-2xl p-4 shadow-lg flex flex-col gap-3">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-[#3D2B2B] pb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#800020]/30 border border-[#800020] flex items-center justify-center text-[#F5E6DA]">
              <CalendarIcon className="w-4 h-4 text-[#A67C52]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#F5E6DA] leading-tight">popo hahah</h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleToday}
              className="px-2.5 py-1 rounded-lg bg-[#1E1414] hover:bg-[#3D2B2B] border border-[#3D2B2B] text-[11px] font-semibold text-[#D1BFA5] transition-colors cursor-pointer"
            >
              Hoje
            </button>
            <div className="flex items-center bg-[#1E1414] border border-[#3D2B2B] rounded-lg p-0.5">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1 rounded hover:bg-[#3D2B2B] text-[#D1BFA5] hover:text-[#F5E6DA] cursor-pointer"
                title="Mês Anterior"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="text-xs font-bold text-[#F5E6DA] px-2.5">
                {months[currentMonth]} {currentYear}
              </span>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1 rounded hover:bg-[#3D2B2B] text-[#D1BFA5] hover:text-[#F5E6DA] cursor-pointer"
                title="Próximo Mês"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Compact Grid & Sidebar */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {/* 3 Cols: Month matrix */}
          <div className="md:col-span-3 bg-[#1E1414] border border-[#3D2B2B] rounded-xl p-3">
            <div className="grid grid-cols-7 gap-1 text-center text-[11px] mb-1">
              {weekDays.map((d, i) => (
                <div key={i} className="text-[#A67C52] font-bold py-0.5">
                  {d}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {[...Array(firstDayIndex)].map((_, i) => (
                <div key={`empty-${i}`} className="h-8 rounded-lg bg-transparent opacity-20" />
              ))}

              {[...Array(daysInCurrentMonth)].map((_, i) => {
                const day = i + 1;
                const isSelected = day === selectedDate;
                const isToday =
                  day === new Date().getDate() &&
                  currentMonth === new Date().getMonth() &&
                  currentYear === new Date().getFullYear();
                
                const dayEvents = events.filter(
                  (ev) => ev.day === day && ev.month === currentMonth && ev.year === currentYear
                );
                const hasCritical = dayEvents.some((ev) => ev.isCritical);

                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => setSelectedDate(day)}
                    className={`h-8 rounded-lg p-0.5 flex flex-col justify-between items-center transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#800020] text-[#F5E6DA] shadow font-bold ring-1 ring-[#A67C52]'
                        : isToday
                        ? 'bg-[#3D2B2B] text-[#F5E6DA] border border-[#A67C52]'
                        : 'text-[#D1BFA5] hover:bg-[#251818]'
                    }`}
                  >
                    <span className={`text-[11px] leading-none ${isToday && !isSelected ? 'text-[#A67C52]' : ''}`}>
                      {day}
                    </span>

                    {dayEvents.length > 0 && (
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          hasCritical ? 'bg-amber-400' : 'bg-[#A67C52]'
                        }`}
                      ></span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2 Cols: Selected Day Events */}
          <div className="md:col-span-2 bg-[#1E1414] border border-[#3D2B2B] rounded-xl p-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-[#3D2B2B] pb-2 mb-2">
                <span className="font-bold text-xs text-[#F5E6DA]">
                  Dia {selectedDate} de {months[currentMonth]}
                </span>
                <button
                  type="button"
                  onClick={() => setShowAddModal(true)}
                  className="px-2 py-0.5 rounded-md bg-[#800020] hover:bg-[#A00028] text-[#F5E6DA] text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Novo</span>
                </button>
              </div>

              <div className="space-y-1.5 max-h-48 overflow-hidden">
                {selectedDayEvents.length === 0 ? (
                  <div className="py-6 text-center text-[11px] text-[#6D5A5A]">
                    <p>Sem lembretes neste dia.</p>
                    <p className="text-[10px] text-[#A67C52] mt-0.5">Espaço livre e calmo!</p>
                  </div>
                ) : (
                  selectedDayEvents.slice(0, 3).map((ev) => (
                    <div
                      key={ev.id}
                      className={`p-2 rounded-lg border flex items-center justify-between gap-1.5 ${
                        ev.isCritical
                          ? 'bg-[#251818] border-[#800020]'
                          : 'bg-[#251818] border-[#3D2B2B]'
                      }`}
                    >
                      <div className="truncate">
                        <p className="font-semibold text-xs text-[#F5E6DA] truncate">
                          {ev.title}
                        </p>
                        <p className="text-[10px] text-[#A67C52] flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          <span>{ev.time}</span>
                          <span>•</span>
                          <span>{ev.tag}</span>
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteEvent(ev.id)}
                        className="text-[#6D5A5A] hover:text-red-400 p-0.5 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="pt-2 border-t border-[#3D2B2B] text-[10px] text-[#A67C52] truncate">
              {events.length} lembrete(s) cadastrado(s) no total.
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Adicionar Lembrete */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#251818] border border-[#3D2B2B] rounded-2xl p-5 shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-[#3D2B2B] pb-2">
              <h3 className="font-bold text-sm text-[#F5E6DA]">
                Novo Lembrete (Dia {selectedDate})
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-[#D1BFA5] hover:text-[#F5E6DA] text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddEvent} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#D1BFA5] mb-1">
                  Título
                </label>
                <input
                  type="text"
                  required
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  placeholder="Ex: Entrega, consulta..."
                  className="w-full bg-[#1E1414] border border-[#3D2B2B] focus:border-[#800020] rounded-lg px-2.5 py-1.5 text-xs text-[#F5E6DA] placeholder-[#6D5A5A] outline-none"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-[#D1BFA5] mb-1">
                    Horário
                  </label>
                  <input
                    type="time"
                    value={newEventTime}
                    onChange={(e) => setNewEventTime(e.target.value)}
                    className="w-full bg-[#1E1414] border border-[#3D2B2B] rounded-lg px-2 py-1 text-xs text-[#F5E6DA] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#D1BFA5] mb-1">
                    Categoria
                  </label>
                  <select
                    value={newEventTag}
                    onChange={(e) => setNewEventTag(e.target.value)}
                    className="w-full bg-[#1E1414] border border-[#3D2B2B] rounded-lg px-2 py-1 text-xs text-[#F5E6DA] outline-none"
                  >
                    <option value="Prazo">Prazo</option>
                    <option value="Saúde">Saúde</option>
                    <option value="Compromisso">Compromisso</option>
                    <option value="Rotina">Rotina</option>
                    <option value="Finanças">Finanças</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <input
                  type="checkbox"
                  id="criticalCheck"
                  checked={newEventIsCritical}
                  onChange={(e) => setNewEventIsCritical(e.target.checked)}
                  className="rounded accent-[#800020] w-3.5 h-3.5 cursor-pointer"
                />
                <label htmlFor="criticalCheck" className="text-[11px] text-[#D1BFA5] cursor-pointer flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 text-amber-400" />
                  <span>Prazo crítico (destaque dourado)</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#3D2B2B]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-[#1E1414] text-[#D1BFA5] text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#800020] hover:bg-[#A00028] text-[#F5E6DA] text-xs font-bold transition-all shadow-md"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
