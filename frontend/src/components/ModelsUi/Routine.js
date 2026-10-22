import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  CheckCircle,
  Circle,
  Clock,
  Trash2,
  Calendar as CalendarIcon,
  Loader2,
  AlertTriangle,
  Repeat,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export default function Routine({ modelInstance }) {
  const [agendaTasks, setAgendaTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const modelId = modelInstance?.id || 'routine';
  const modelType = modelInstance?.type || 'routine';
  const displayName = modelInstance?.name || 'Agenda Visual';

  // Today string reference (YYYY-MM-DD)
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Currently viewed date in Agenda Visual
  const [viewDate, setViewDate] = useState(todayStr);

  const isViewingToday = viewDate === todayStr;

  // Format date for title (ex: "Quarta-feira, 21 de Outubro")
  const formattedDateTitle = useMemo(() => {
    const [y, m, d] = viewDate.split('-').map((v) => parseInt(v, 10));
    const dt = new Date(y, m - 1, d);
    return dt.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }, [viewDate]);

  // Navigate through days
  const handlePrevDay = () => {
    const [y, m, d] = viewDate.split('-').map((v) => parseInt(v, 10));
    const prev = new Date(y, m - 1, d - 1);
    setViewDate(prev.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const [y, m, d] = viewDate.split('-').map((v) => parseInt(v, 10));
    const next = new Date(y, m - 1, d + 1);
    setViewDate(next.toISOString().split('T')[0]);
  };

  const handleGoToday = () => {
    setViewDate(todayStr);
  };

  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/tasks?modelId=${encodeURIComponent(modelId)}&modelType=${encodeURIComponent(
          modelType
        )}&targetDate=${encodeURIComponent(viewDate)}&today=${encodeURIComponent(todayStr)}`
      );
      if (res.ok) {
        const data = await res.json();
        setAgendaTasks(data.tasks || []);
      }
    } catch (err) {
      console.error('Erro ao buscar tarefas da rotina:', err);
    } finally {
      setIsLoading(false);
    }
  }, [viewDate, todayStr, modelId, modelType]);

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

  const handleToggleTask = async (task) => {
    try {
      setAgendaTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, done: !t.done } : t))
      );

      const res = await fetch(`/api/tasks/${task.id}/toggle`, {
        method: 'PATCH',
      });
      if (res.ok) {
        window.dispatchEvent(new CustomEvent('focusmod_task_updated', { detail: task }));
      }
    } catch (err) {
      console.error('Erro ao alternar status da tarefa:', err);
      fetchTasks();
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      setAgendaTasks((prev) => prev.filter((t) => t.id !== id));
      await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
      // Notify all other models so task is deleted from everywhere
      window.dispatchEvent(
        new CustomEvent('focusmod_task_updated', { detail: { id, deleted: true } })
      );
    } catch (err) {
      console.error('Erro ao deletar tarefa:', err);
      fetchTasks();
    }
  };

  const completedCount = agendaTasks.filter((t) => t.done).length;
  const progressPercent =
    agendaTasks.length > 0 ? Math.round((completedCount / agendaTasks.length) * 100) : 0;

  const overdueCount = agendaTasks.filter((t) => t.isOverdue).length;

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
    <div className="w-full h-full flex-1 flex flex-col justify-between bg-[#1E1414] p-4 sm:p-6 lg:p-8 min-h-0 overflow-hidden gap-4 select-none">
      {/* Top Header / Day Navigation & Progress */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#251818] border border-[#3D2B2B] rounded-2xl px-5 py-3 shadow-sm shrink-0">
        {/* Day Navigation Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-[#1E1414] p-1 rounded-xl border border-[#3D2B2B]">
            <button
              type="button"
              onClick={handlePrevDay}
              className="p-1.5 rounded-lg hover:bg-[#2D1F1F] text-[#D1BFA5] hover:text-[#F5E6DA] transition-colors cursor-pointer"
              title="Dia anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNextDay}
              className="p-1.5 rounded-lg hover:bg-[#2D1F1F] text-[#D1BFA5] hover:text-[#F5E6DA] transition-colors cursor-pointer"
              title="Próximo dia"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-[#F5E6DA] capitalize leading-tight">
                {formattedDateTitle}
              </h2>
              {isViewingToday ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#800020] text-[#F5E6DA] shadow-sm">
                  Hoje
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleGoToday}
                  className="text-[10px] text-[#A67C52] hover:text-[#F5E6DA] underline cursor-pointer"
                >
                  Ir para Hoje
                </button>
              )}
            </div>
            <p className="text-[11px] text-[#A67C52] leading-tight">
              Linha do tempo diária com progresso em tempo real
            </p>
          </div>
        </div>

        {/* Progress & Overdue Indicators */}
        <div className="flex items-center gap-2.5 self-end sm:self-auto">
          {overdueCount > 0 && isViewingToday && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-950/60 border border-amber-600/70 text-amber-200 text-xs font-semibold shadow-sm">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>
                {overdueCount} pendência{overdueCount > 1 ? 's' : ''} anterior
              </span>
            </div>
          )}

          <div className="flex items-center gap-2 bg-[#1E1414] px-3 py-1.5 rounded-xl border border-[#3D2B2B]">
            <span className="text-xs text-[#D1BFA5]">
              Progresso:{' '}
              <strong className="text-[#F5E6DA] font-mono">
                {completedCount}/{agendaTasks.length}
              </strong>
            </span>
            <div className="w-16 bg-[#251818] h-2 rounded-full overflow-hidden border border-[#3D2B2B]">
              <div
                className="bg-gradient-to-r from-[#800020] to-[#A67C52] h-full transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-xs font-mono font-bold text-[#A67C52]">
              {progressPercent}%
            </span>
          </div>
        </div>
      </div>

      {/* Task Timeline List */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 min-h-0">
        {isLoading && agendaTasks.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center py-16 text-center text-[#A67C52] gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-[#800020]" />
            <p className="text-xs">Carregando linha do tempo do dia...</p>
          </div>
        ) : agendaTasks.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center py-16 text-center text-[#6D5A5A] space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-[#251818] border border-[#3D2B2B] flex items-center justify-center text-[#A67C52] mx-auto shadow-inner">
              <CalendarIcon className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-[#D1BFA5]">
              Nenhum bloco de rotina programado para este dia.
            </p>
            <p className="text-xs text-[#A67C52] max-w-sm">
              Clique no botão circular vermelho (+) no canto inferior direito para adicionar uma nova tarefa à sua agenda visual!
            </p>
          </div>
        ) : (
          agendaTasks.map((t) => {
            const timeDisplay =
              t.startTime && t.endTime
                ? `${t.startTime} - ${t.endTime}`
                : t.startTime
                ? `${t.startTime} em diante`
                : 'Horário flexível';

            const recurrenceLabel = getRecurrenceLabel(t.recurrence);

            return (
              <div
                key={t.id}
                className={`p-4 rounded-2xl border flex items-center justify-between gap-3 transition-all shadow-sm ${
                  t.isOverdue
                    ? 'bg-amber-950/20 border-amber-600/70 hover:border-amber-500 ring-1 ring-amber-600/30'
                    : t.done
                    ? 'bg-[#251818]/50 border-[#3D2B2B] opacity-60'
                    : 'bg-[#251818] border-[#3D2B2B] hover:border-[#800020]/60'
                }`}
              >
                <div className="flex items-start gap-3.5 truncate flex-1">
                  <button
                    type="button"
                    onClick={() => handleToggleTask(t)}
                    className="text-[#A67C52] hover:text-[#F5E6DA] cursor-pointer transition-colors p-0.5 shrink-0 mt-0.5"
                    title={t.done ? 'Marcar como pendente' : 'Marcar como concluída'}
                  >
                    {t.done ? (
                      <CheckCircle className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <Circle className="w-5 h-5 text-[#9E8A78]" />
                    )}
                  </button>

                  <div className="truncate flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p
                        className={`font-semibold text-sm truncate ${
                          t.done ? 'line-through text-[#6D5A5A]' : 'text-[#F5E6DA]'
                        }`}
                      >
                        {t.name}
                      </p>

                      {/* Alert badge if overdue from previous days */}
                      {t.isOverdue && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-900/60 border border-amber-600/60 text-amber-300 flex items-center gap-1 shrink-0">
                          <AlertTriangle className="w-3 h-3 text-amber-400" />
                          De dias anteriores ({t.date})
                        </span>
                      )}

                      {/* Recurrence badge */}
                      {recurrenceLabel && (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-[#1E1414] border border-[#3D2B2B] text-[#A67C52] flex items-center gap-1 shrink-0">
                          <Repeat className="w-3 h-3" />
                          {recurrenceLabel}
                        </span>
                      )}
                    </div>

                    {/* Description if present */}
                    {t.description && (
                      <p className="text-xs text-[#D1BFA5] mt-1 line-clamp-2 italic">
                        {t.description}
                      </p>
                    )}

                    <div className="flex items-center gap-2.5 mt-1.5 text-xs text-[#A67C52]">
                      <span className="flex items-center gap-1 font-mono">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{timeDisplay}</span>
                      </span>
                      {t.date && !t.isOverdue && (
                        <span className="text-[11px] text-[#D1BFA5] bg-[#1E1414] px-2 py-0.5 rounded border border-[#3D2B2B]">
                          {t.date}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-center">
                  <button
                    type="button"
                    onClick={() => handleDeleteTask(t.id)}
                    className="p-1.5 rounded-lg text-[#6D5A5A] hover:text-red-400 hover:bg-[#1E1414] transition-colors cursor-pointer"
                    title="Excluir tarefa de todos os modelos"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
