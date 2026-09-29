import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Trash2, Clock, AlertCircle } from 'lucide-react';

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date().getDate());
  const [showAddModal, setShowAddModal] = useState(false);
  
  const [events, setEvents] = useState([
    { id: 'ev-1', day: 8, month: currentDate.getMonth(), year: currentDate.getFullYear(), title: 'Consulta Médica & Checagem', time: '14:30', tag: 'Saúde', isCritical: false },
    { id: 'ev-2', day: 15, month: currentDate.getMonth(), year: currentDate.getFullYear(), title: 'Entrega Projeto & Relatório', time: '18:00', tag: 'Prazo', isCritical: true },
    { id: 'ev-3', day: 22, month: currentDate.getMonth(), year: currentDate.getFullYear(), title: 'Contas, Faturas & Assinaturas', time: '10:00', tag: 'Finanças', isCritical: false },
    { id: 'ev-4', day: 28, month: currentDate.getMonth(), year: currentDate.getFullYear(), title: 'Revisão de Metas e Hábitos', time: '16:00', tag: 'Foco', isCritical: false },
  ]);

  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventTime, setNewEventTime] = useState('10:00');
  const [newEventTag, setNewEventTag] = useState('Prazo');
  const [newEventIsCritical, setNewEventIsCritical] = useState(false);

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  const weekDaysShort = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

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
    <div className="w-full h-full flex-1 flex flex-col justify-between bg-[#1E1414] p-4 sm:p-6 lg:p-8 min-h-0 overflow-y-auto gap-3.5">
      {/* Top Bar: Controls directly at top (Title removed for maximum space) */}
      <div className="flex items-center justify-between pb-1 gap-2">
        <div className="flex items-center bg-[#251818] border border-[#3D2B2B] rounded-xl p-0.5 shadow-sm">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-1.5 rounded-lg hover:bg-[#3D2B2B] text-[#D1BFA5] hover:text-[#F5E6DA] cursor-pointer transition-colors"
            title="Mês Anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs sm:text-sm font-bold text-[#F5E6DA] px-3">
            {months[currentMonth]} {currentYear}
          </span>
          <button
            type="button"
            onClick={handleNextMonth}
            className="p-1.5 rounded-lg hover:bg-[#3D2B2B] text-[#D1BFA5] hover:text-[#F5E6DA] cursor-pointer transition-colors"
            title="Próximo Mês"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <button
          type="button"
          onClick={handleToday}
          className="px-3.5 py-1.5 rounded-xl bg-[#251818] hover:bg-[#3D2B2B] border border-[#3D2B2B] text-xs font-semibold text-[#D1BFA5] hover:text-[#F5E6DA] transition-colors cursor-pointer shadow-sm"
        >
          Hoje
        </button>
      </div>

      {/* Spacious Grid & Sidebar: Uses full width and height */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-0">
        {/* Month matrix: 7 cols */}
        <div className="lg:col-span-7 bg-[#251818] border border-[#3D2B2B] rounded-2xl p-3 sm:p-4 flex flex-col justify-between shadow-sm">
          <div className="grid grid-cols-7 gap-1 text-center text-xs mb-1.5">
            {weekDaysShort.map((d, i) => (
              <div key={i} className="text-[#A67C52] font-bold py-1 uppercase tracking-wider text-[11px]">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1.5 flex-1">
            {[...Array(firstDayIndex)].map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[44px] sm:min-h-[50px] rounded-lg bg-transparent opacity-10" />
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
                  className={`min-h-[44px] sm:min-h-[50px] rounded-xl p-1.5 flex flex-col justify-between items-center transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#800020] text-[#F5E6DA] shadow font-bold ring-2 ring-[#A67C52]'
                      : isToday
                      ? 'bg-[#1E1414] text-[#F5E6DA] border border-[#A67C52]'
                      : 'text-[#D1BFA5] hover:bg-[#1E1414]'
                  }`}
                >
                  <span className={`text-xs leading-none font-medium ${isToday && !isSelected ? 'text-[#A67C52]' : ''}`}>
                    {day}
                  </span>

                  {dayEvents.length > 0 && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          hasCritical ? 'bg-amber-400' : 'bg-[#A67C52]'
                        }`}
                      ></span>
                      {dayEvents.length > 1 && (
                        <span className="text-[10px] text-[#F5E6DA]/70 font-mono">
                          +{dayEvents.length - 1}
                        </span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Day Events: 5 cols */}
        <div className="lg:col-span-5 bg-[#251818] border border-[#3D2B2B] rounded-2xl p-3 sm:p-4 flex flex-col justify-between shadow-sm">
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between border-b border-[#3D2B2B] pb-2 mb-2">
              <div>
                <span className="font-bold text-xs sm:text-sm text-[#F5E6DA]">
                  Dia {selectedDate} de {months[currentMonth]}
                </span>
                <p className="text-[10px] text-[#A67C52]">Lembretes marcados</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="px-2.5 py-1 rounded-lg bg-[#800020] hover:bg-[#A00028] text-[#F5E6DA] text-xs font-semibold flex items-center gap-1 cursor-pointer shadow transition-all"
              >
                <Plus className="w-3 h-3" />
                <span>+ Novo</span>
              </button>
            </div>

            <div className="space-y-1.5 flex-1 overflow-y-auto pr-0.5">
              {selectedDayEvents.length === 0 ? (
                <div className="py-12 text-center text-xs text-[#6D5A5A] space-y-0.5">
                  <p className="font-medium text-[#D1BFA5]">Nenhum lembrete para hoje.</p>
                  <p className="text-[10px] text-[#A67C52]">Dia calmo e livre de cobranças!</p>
                </div>
              ) : (
                selectedDayEvents.map((ev) => (
                  <div
                    key={ev.id}
                    className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 shadow-sm ${
                      ev.isCritical
                        ? 'bg-[#1E1414] border-[#800020]'
                        : 'bg-[#1E1414] border-[#3D2B2B]'
                    }`}
                  >
                    <div className="truncate flex-1">
                      <p className="font-semibold text-xs sm:text-sm text-[#F5E6DA] truncate">
                        {ev.title}
                      </p>
                      <p className="text-[10px] text-[#A67C52] flex items-center gap-1 mt-0.5">
                        <Clock className="w-2.5 h-2.5" />
                        <span>{ev.time}</span>
                        <span>•</span>
                        <span className="px-1.5 py-0.2 rounded bg-[#251818] text-[#D1BFA5] text-[9px] font-semibold">{ev.tag}</span>
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteEvent(ev.id)}
                      className="text-[#6D5A5A] hover:text-red-400 p-1 rounded hover:bg-[#251818] transition-colors cursor-pointer"
                      title="Excluir"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-2 border-t border-[#3D2B2B] text-xs text-[#A67C52] font-medium flex items-center justify-between">
            <span>Total de lembretes:</span>
            <span className="font-mono text-xs text-[#F5E6DA] bg-[#1E1414] px-2 py-0.5 rounded border border-[#3D2B2B]">{events.length}</span>
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
