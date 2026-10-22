import React, { useState, useEffect, useCallback } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Trash2,
  Clock,
  CalendarDays,
  Loader2,
  Repeat,
  AlignLeft,
} from 'lucide-react';

export default function Calendar({ modelInstance }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date().getDate());
  const [rawTasks, setRawTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const modelId = modelInstance?.id || 'calendario';
  const modelType = modelInstance?.type || 'calendario';
  const displayName = modelInstance?.name || 'Calendário';

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  const weekDaysShort = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
  const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // Fetch tasks for calendar model from backend
  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/tasks?modelId=${encodeURIComponent(modelId)}&modelType=${encodeURIComponent(modelType)}`
      );
      if (res.ok) {
        const data = await res.json();
        setRawTasks(data.tasks || []);
      }
    } catch (err) {
      console.error('Erro ao buscar eventos do calendário:', err);
    } finally {
      setIsLoading(false);
    }
  }, [modelId, modelType]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    const handleTaskEvent = () => {
      fetchTasks();
    };

    window.addEventListener('focusmod_task_created', handleTaskEvent);
    window.addEventListener('focusmod_task_updated', handleTaskEvent);
    return () => {
      window.removeEventListener('focusmod_task_created', handleTaskEvent);
      window.removeEventListener('focusmod_task_updated', handleTaskEvent);
    };
  }, [fetchTasks]);

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

  const handleDeleteEvent = async (id) => {
    try {
      setRawTasks((prev) => prev.filter((ev) => ev.id !== id));
      await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
      // Notify all other models so task is deleted from everywhere
      window.dispatchEvent(new CustomEvent('focusmod_task_updated', { detail: { id, deleted: true } }));
    } catch (err) {
      console.error('Erro ao excluir evento:', err);
      fetchTasks();
    }
  };

  // Helper to determine if a task matches a specific day of the current month
  const isTaskOnDate = (task, year, month, day) => {
    if (!task.date) return false;
    const taskParts = task.date.split('-');
    if (taskParts.length !== 3) return false;
    const tYear = parseInt(taskParts[0], 10);
    const tMonth = parseInt(taskParts[1], 10) - 1;
    const tDay = parseInt(taskParts[2], 10);

    const targetDate = new Date(year, month, day);
    const taskDate = new Date(tYear, tMonth, tDay);

    if (targetDate < taskDate) return false;

    const rec = task.recurrence || 'none';
    if (rec === 'none') {
      return tYear === year && tMonth === month && tDay === day;
    }
    if (rec === 'daily') {
      return true;
    }
    if (rec === 'weekly') {
      return targetDate.getDay() === taskDate.getDay();
    }
    if (rec === 'monthly') {
      return tDay === day;
    }
    if (rec === 'yearly') {
      return tMonth === month && tDay === day;
    }
    return false;
  };

  // Events on the currently selected day
  const selectedDayTasks = rawTasks.filter((task) =>
    isTaskOnDate(task, currentYear, currentMonth, selectedDate)
  );

  const getRecurrenceLabel = (rec) => {
    switch (rec) {
      case 'daily':
        return 'Diária';
      case 'weekly':
        return 'Semanal';
      case 'monthly':
        return 'Mensal';
      case 'yearly':
        return 'Anual';
      default:
        return null;
    }
  };

  return (
    <div className="w-full h-full flex-1 flex flex-col justify-between bg-[#1E1414] p-4 sm:p-6 lg:p-8 min-h-0 overflow-hidden gap-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#251818] border border-[#3D2B2B] rounded-2xl px-5 py-3 shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#800020] flex items-center justify-center text-[#F5E6DA] font-bold text-sm shadow">
            <CalendarDays className="w-5 h-5 text-[#F5E6DA]" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#F5E6DA]">
              {months[currentMonth]} {currentYear}
            </h2>
            <p className="text-[11px] text-[#A67C52]">
              Visão de prazos e eventos com suporte a recorrência e horários de término
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={handleToday}
            className="px-3 py-1.5 rounded-xl bg-[#1E1414] hover:bg-[#2D1F1F] text-[#D1BFA5] hover:text-[#F5E6DA] text-xs font-semibold border border-[#3D2B2B] transition-colors cursor-pointer"
          >
            Hoje
          </button>
          <div className="flex items-center gap-1 bg-[#1E1414] p-1 rounded-xl border border-[#3D2B2B]">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1 rounded-lg hover:bg-[#2D1F1F] text-[#D1BFA5] hover:text-[#F5E6DA] transition-colors cursor-pointer"
              title="Mês anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1 rounded-lg hover:bg-[#2D1F1F] text-[#D1BFA5] hover:text-[#F5E6DA] transition-colors cursor-pointer"
              title="Próximo mês"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Calendar Grid (Left) + Selected Day Event List (Right) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-0 overflow-hidden">
        {/* Calendar Grid */}
        <div className="lg:col-span-8 bg-[#251818] border border-[#3D2B2B] rounded-2xl p-4 sm:p-5 flex flex-col justify-between overflow-y-auto shadow-sm">
          <div>
            {/* Week days header */}
            <div className="grid grid-cols-7 mb-2 border-b border-[#3D2B2B] pb-2">
              {weekDaysShort.map((day, idx) => (
                <div
                  key={day}
                  className={`text-center text-xs font-bold uppercase tracking-wider ${
                    idx === 0 || idx === 6 ? 'text-[#800020]' : 'text-[#A67C52]'
                  }`}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
              {/* Empty padding cells for first week */}
              {Array.from({ length: firstDayIndex }).map((_, idx) => (
                <div key={`empty-${idx}`} className="h-10 sm:h-12 rounded-xl bg-transparent" />
              ))}

              {/* Day cells */}
              {Array.from({ length: daysInCurrentMonth }).map((_, idx) => {
                const dayNumber = idx + 1;
                const isSelected = selectedDate === dayNumber;
                const isToday =
                  new Date().getDate() === dayNumber &&
                  new Date().getMonth() === currentMonth &&
                  new Date().getFullYear() === currentYear;

                const dayTasks = rawTasks.filter((t) =>
                  isTaskOnDate(t, currentYear, currentMonth, dayNumber)
                );

                return (
                  <button
                    key={dayNumber}
                    type="button"
                    onClick={() => setSelectedDate(dayNumber)}
                    className={`h-11 sm:h-13 rounded-xl p-1.5 flex flex-col justify-between items-start transition-all cursor-pointer relative border ${
                      isSelected
                        ? 'bg-[#800020] border-[#A67C52] text-[#F5E6DA] shadow-md ring-2 ring-[#800020]/40'
                        : isToday
                        ? 'bg-[#1E1414] border-[#800020] text-[#F5E6DA]'
                        : 'bg-[#1E1414] border-[#3D2B2B] hover:bg-[#2D1F1F] text-[#D1BFA5]'
                    }`}
                  >
                    <span
                      className={`text-xs font-bold ${
                        isSelected
                          ? 'text-[#F5E6DA]'
                          : isToday
                          ? 'text-[#A67C52]'
                          : 'text-[#D1BFA5]'
                      }`}
                    >
                      {dayNumber}
                    </span>

                    {/* Task Indicators */}
                    {dayTasks.length > 0 && (
                      <div className="w-full flex items-center gap-1 overflow-hidden">
                        <span className="w-2 h-2 rounded-full bg-[#A67C52] shrink-0" />
                        <span className="text-[10px] font-mono truncate hidden sm:inline text-left text-[#F5E6DA]">
                          {dayTasks.length === 1 ? dayTasks[0].name : `${dayTasks.length} tarefas`}
                        </span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Selected Day Event Details (Right side) */}
        <div className="lg:col-span-4 bg-[#251818] border border-[#3D2B2B] rounded-2xl p-4 sm:p-5 flex flex-col justify-between overflow-hidden shadow-sm">
          <div className="flex-1 flex flex-col overflow-hidden min-h-0">
            <div className="border-b border-[#3D2B2B] pb-3 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#A67C52]">
                Prazos do Dia
              </span>
              <h3 className="text-base font-bold text-[#F5E6DA]">
                {selectedDate} de {months[currentMonth]}
              </h3>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-0">
              {isLoading && rawTasks.length === 0 ? (
                <div className="h-full flex items-center justify-center py-10 text-[#A67C52]">
                  <Loader2 className="w-5 h-5 animate-spin" />
                </div>
              ) : selectedDayTasks.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center py-10 text-center text-[#6D5A5A] space-y-1">
                  <p className="text-xs text-[#D1BFA5]">Nenhum prazo agendado para este dia.</p>
                  <p className="text-[11px] text-[#A67C52]">
                    Use o botão (+) no canto inferior direito para adicionar uma tarefa com data.
                  </p>
                </div>
              ) : (
                selectedDayTasks.map((t) => {
                  const timeDisplay =
                    t.startTime && t.endTime
                      ? `${t.startTime} - ${t.endTime}`
                      : t.startTime
                      ? t.startTime
                      : 'Dia todo';

                  const recLabel = getRecurrenceLabel(t.recurrence);
                  const desc = t.description || t.notes;

                  return (
                    <div
                      key={t.id}
                      className="p-3.5 rounded-xl bg-[#1E1414] border border-[#3D2B2B] hover:border-[#800020]/50 flex items-start justify-between gap-2.5 shadow-sm transition-colors"
                    >
                      <div className="truncate flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="font-semibold text-xs sm:text-sm text-[#F5E6DA] truncate">
                            {t.name}
                          </p>
                          {recLabel && (
                            <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-[#251818] text-[#A67C52] border border-[#3D2B2B] flex items-center gap-0.5">
                              <Repeat className="w-2.5 h-2.5" /> {recLabel}
                            </span>
                          )}
                        </div>

                        {/* Start and End Time */}
                        <p className="text-[11px] text-[#A67C52] flex items-center gap-1 font-mono mt-1">
                          <Clock className="w-3 h-3" />
                          <span>{timeDisplay}</span>
                        </p>

                        {/* Description */}
                        {desc && (
                          <p className="text-[11px] text-[#D1BFA5] mt-1.5 line-clamp-2 italic bg-[#251818] p-1.5 rounded-lg border border-[#3D2B2B]/60">
                            {desc}
                          </p>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteEvent(t.id)}
                        className="text-[#6D5A5A] hover:text-red-400 p-1.5 rounded-lg hover:bg-[#251818] transition-colors cursor-pointer shrink-0 mt-0.5"
                        title="Excluir tarefa de todos os modelos"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-[#3D2B2B] text-xs text-[#A67C52] font-medium flex items-center justify-between shrink-0">
            <span>Tarefas neste dia:</span>
            <span className="font-mono text-xs text-[#F5E6DA] bg-[#1E1414] px-2.5 py-0.5 rounded-lg border border-[#3D2B2B]">
              {selectedDayTasks.length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
