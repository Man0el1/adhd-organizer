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
  Plus,
  Settings,
} from 'lucide-react';
import { apiFetch } from '../../utils/api.js';
import {
  getTodayLocalStr,
  addDaysToYMD,
  getUserTimezone,
  formatDateDisplay,
} from '../../utils/date.js';
import TaskFormModal from '../task-form/TaskFormModal.jsx';
import ModelSettingsModal from './ModelSettingsModal.jsx';

export default function Routine({ modelInstance, isDarkMode = false }) {
  const [agendaTasks, setAgendaTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const displayName = modelInstance?.name || 'Agenda Visual';

  const modelId = modelInstance?.id || 'routine';
  const modelType = modelInstance?.type || 'routine';

  const [userTz, setUserTz] = useState(() => getUserTimezone());

  // Today string reference (YYYY-MM-DD no fuso horário do usuário)
  const todayStr = useMemo(() => getTodayLocalStr(userTz), [userTz]);

  // Currently viewed date in Agenda Visual
  const [viewDate, setViewDate] = useState(() => getTodayLocalStr(getUserTimezone()));

  const isViewingToday = viewDate === todayStr;

  // Format date for title (ex: "Quarta-feira, 21 de Outubro de 2026")
  const formattedDateTitle = useMemo(() => {
    return formatDateDisplay(viewDate, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }, [viewDate]);

  // Navigate through days (sem problemas de conversão para UTC)
  const handlePrevDay = () => {
    setViewDate((prev) => addDaysToYMD(prev, -1));
  };

  const handleNextDay = () => {
    setViewDate((prev) => addDaysToYMD(prev, 1));
  };

  const handleGoToday = () => {
    setViewDate(getTodayLocalStr(userTz));
  };

  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await apiFetch(
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
    const handleTzChange = (e) => {
      if (e?.detail?.timezone) {
        setUserTz(e.detail.timezone);
        setViewDate(getTodayLocalStr(e.detail.timezone));
      }
    };
    window.addEventListener('focusmod_timezone_changed', handleTzChange);
    return () => window.removeEventListener('focusmod_timezone_changed', handleTzChange);
  }, []);

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

      const res = await apiFetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ done: !task.done, date: viewDate }),
      });

      if (!res.ok) {
        fetchTasks();
      } else {
        window.dispatchEvent(
          new CustomEvent('focusmod_task_updated', {
            detail: { id: task.id, done: !task.done, date: viewDate },
          })
        );
      }

    } catch (err) {
      console.error('Erro ao alternar status da tarefa:', err);
      fetchTasks();
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      setAgendaTasks((prev) => prev.filter((t) => t.id !== id));
      await apiFetch(`/api/tasks/${id}`, { method: 'DELETE' });
      window.dispatchEvent(new CustomEvent('focusmod_task_updated', { detail: { id, deleted: true } }));
    } catch (err) {
      console.error('Erro ao excluir tarefa:', err);
      fetchTasks();
    }
  };

  const completedCount = agendaTasks.filter((t) => t.done).length;
  const overdueCount = agendaTasks.filter((t) => t.isOverdue && !t.done).length;
  const progressPercent =
    agendaTasks.length > 0 ? Math.round((completedCount / agendaTasks.length) * 100) : 0;

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
    <div
      className={`w-full h-full flex-1 flex flex-col p-4 sm:p-6 lg:p-8 min-h-0 overflow-hidden transition-colors ${
        isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-[#ebf0f5] text-slate-800'
      }`}
    >
      <div className="w-full max-w-5xl mx-auto flex-1 flex flex-col min-h-0 gap-4">
        {/* Top Header Panel */}
        <div
          className={`flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border rounded-2xl px-5 py-3 shadow-xs shrink-0 transition-colors ${
            isDarkMode
              ? 'bg-slate-900 border-slate-800'
              : 'bg-[#f4f7fa] border-[#d3dce6]'
          }`}
        >
          <div className="flex items-center gap-3">
            {/* Day Navigation Controls */}
            <div
              className={`flex items-center gap-1 p-1 rounded-xl border ${
                isDarkMode
                  ? 'bg-slate-950 border-slate-800 text-slate-300'
                  : 'bg-[#e8edf2] border-[#d3dce6] text-slate-700'
              }`}
            >
              <button
                type="button"
                onClick={handlePrevDay}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  isDarkMode
                    ? 'hover:bg-slate-800 hover:text-white'
                    : 'hover:bg-[#f4f7fa] hover:text-slate-900'
                }`}
                title="Dia anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNextDay}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  isDarkMode
                    ? 'hover:bg-slate-800 hover:text-white'
                    : 'hover:bg-[#f4f7fa] hover:text-slate-900'
                }`}
                title="Próximo dia"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2
                  className={`text-sm sm:text-base font-bold capitalize leading-tight ${
                    isDarkMode ? 'text-slate-100' : 'text-slate-900'
                  }`}
                >
                  {formattedDateTitle}
                </h2>
                {isViewingToday ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#1d56af] text-white shadow-xs">
                    Hoje
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleGoToday}
                    className="text-[10px] text-[#1d56af] hover:text-[#16438a] font-semibold underline cursor-pointer"
                  >
                    Ir para Hoje
                  </button>
                )}
              </div>
              <p className="text-[11px] text-slate-500 leading-tight">
                Linha do tempo diária com progresso em tempo real
              </p>
            </div>
          </div>

          {/* Progress & Overdue Indicators + Add Button */}
          <div className="flex items-center gap-2.5 self-end sm:self-auto flex-wrap">
            {overdueCount > 0 && isViewingToday && (
              <div
                className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold shadow-xs ${
                  isDarkMode
                    ? 'bg-amber-950/60 border border-amber-800/80 text-amber-300'
                    : 'bg-amber-50 border border-amber-200 text-amber-800'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                <span>
                  {overdueCount} pendência{overdueCount > 1 ? 's' : ''} anterior
                </span>
              </div>
            )}

            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${
                isDarkMode
                  ? 'bg-slate-950 border-slate-800'
                  : 'bg-[#e8edf2] border-[#d3dce6]'
              }`}
            >
              <span className={`text-xs ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                Progresso:{' '}
                <strong className={`font-mono ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  {completedCount}/{agendaTasks.length}
                </strong>
              </span>
              <div
                className={`w-16 h-2 rounded-full overflow-hidden border ${
                  isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-300/60 border-slate-300'
                }`}
              >
                <div
                  className="bg-[#1d56af] h-full transition-all duration-300 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="text-xs font-mono font-bold text-[#1d56af]">
                {progressPercent}%
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-[#1d56af] hover:bg-[#174690] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Nova Tarefa</span>
            </button>
            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              title="Configurações do módulo"
              className={`p-2 rounded-xl border transition-colors cursor-pointer shrink-0 ${
                isDarkMode
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                  : 'bg-[#e8edf2] hover:bg-slate-200 text-slate-700 border-[#d3dce6]'
              }`}
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Task Timeline List */}
        <div className="flex-1 overflow-y-auto pr-1 min-h-0">
          {isLoading && agendaTasks.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center py-16 text-center text-slate-400 gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-[#1d56af]" />
              <p className="text-xs">Carregando linha do tempo do dia...</p>
            </div>
          ) : agendaTasks.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center py-16 text-center text-slate-400 space-y-2">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto border ${
                  isDarkMode
                    ? 'bg-slate-900 border-slate-800 text-[#7ba5d4]'
                    : 'bg-[#f4f7fa] border-[#d3dce6] text-[#1d56af] shadow-xs'
                }`}
              >
                <CalendarIcon className="w-6 h-6" />
              </div>
              <p className={`text-sm font-semibold ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                Nenhum bloco de rotina programado para este dia.
              </p>
              <p className="text-xs text-slate-400 max-w-sm">
                Use o botão "+ Nova Tarefa" no topo ou o botão circular (+) para adicionar uma nova tarefa à sua agenda visual!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 content-start items-start">
              {agendaTasks.map((t) => {
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
                    className={`p-3 sm:p-3.5 rounded-xl border text-xs sm:text-sm flex items-start justify-between gap-2.5 transition-all shadow-xs ${
                      t.isOverdue
                        ? isDarkMode
                          ? 'bg-amber-950/30 border-amber-800/80 hover:border-amber-700'
                          : 'bg-amber-50/70 border-amber-300 hover:border-amber-400'
                        : t.done
                        ? isDarkMode
                          ? 'bg-slate-900/40 border-slate-800/60 opacity-65'
                          : 'bg-[#e8edf2]/80 border-[#d3dce6]/80 opacity-65'
                        : isDarkMode
                        ? 'bg-slate-900 border-slate-800 hover:border-slate-700'
                        : 'bg-[#fcfdfd] border-[#d3dce6] hover:border-[#a3c5ed]'
                    }`}
                  >
                    <div className="flex items-start gap-2.5 min-w-0 flex-1">
                      <button
                        type="button"
                        onClick={() => handleToggleTask(t)}
                        className="cursor-pointer transition-colors p-0.5 shrink-0 mt-0.5"
                        title={t.done ? 'Marcar como pendente' : 'Marcar como concluída'}
                      >
                        {t.done ? (
                          <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500" />
                        ) : (
                          <Circle
                            className={`w-4 h-4 sm:w-5 sm:h-5 transition-colors ${
                              isDarkMode
                                ? 'text-slate-600 hover:text-blue-400'
                                : 'text-slate-400 hover:text-[#1d56af]'
                            }`}
                          />
                        )}
                      </button>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p
                            className={`font-semibold text-xs sm:text-sm truncate ${
                              t.done
                                ? 'line-through text-slate-400'
                                : isDarkMode
                                ? 'text-slate-100'
                                : 'text-slate-900'
                            }`}
                          >
                            {t.name}
                          </p>

                          {/* Alert badge if overdue from previous days */}
                          {t.isOverdue && (
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-1 shrink-0 ${
                                isDarkMode
                                  ? 'bg-amber-950/80 border border-amber-800 text-amber-300'
                                  : 'bg-amber-100 border border-amber-300 text-amber-800'
                              }`}
                            >
                              <AlertTriangle className="w-3 h-3 text-amber-500" />
                              De dias anteriores ({t.date})
                            </span>
                          )}

                          {/* Recurrence badge */}
                          {recurrenceLabel && (
                            <span
                              className={`text-[10px] font-medium px-1.5 py-0.5 rounded-md flex items-center gap-1 shrink-0 border ${
                                isDarkMode
                                  ? 'bg-slate-800 border-slate-700 text-slate-300'
                                  : 'bg-[#e8edf2] border-[#d3dce6] text-slate-600'
                              }`}
                            >
                              <Repeat className="w-2.5 h-2.5" />
                              {recurrenceLabel}
                            </span>
                          )}
                        </div>

                        {/* Description if present */}
                        {t.description && (
                          <p
                            className={`text-xs mt-1 line-clamp-2 ${
                              isDarkMode ? 'text-slate-400' : 'text-slate-600'
                            }`}
                          >
                            {t.description}
                          </p>
                        )}

                        <div className="flex items-center gap-1.5 mt-1.5 text-xs">
                          {/* Soft blue time tag */}
                          <span
                            className={`inline-flex items-center gap-1 font-mono text-[10px] sm:text-[11px] px-1.5 py-0.5 rounded-md border font-medium ${
                              isDarkMode
                                ? 'bg-blue-950/50 text-blue-300 border-blue-900'
                                : 'bg-[#e3edfa] text-[#124286] border-[#a3c5ed]'
                            }`}
                          >
                            <Clock className="w-2.5 h-2.5" />
                            <span>{timeDisplay}</span>
                          </span>

                          {t.date && !t.isOverdue && (
                            <span
                              className={`text-[10px] sm:text-[11px] px-1.5 py-0.5 rounded-md border ${
                                isDarkMode
                                  ? 'bg-slate-800 border-slate-700 text-slate-400'
                                  : 'bg-[#e8edf2] border-[#d3dce6] text-slate-600'
                              }`}
                            >
                              {t.date}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteTask(t.id)}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer shrink-0 ${
                        isDarkMode
                          ? 'text-slate-500 hover:text-rose-400 hover:bg-slate-800'
                          : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                      }`}
                      title="Excluir tarefa"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal para criar tarefa diretamente na Agenda Visual */}
      <ModelSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        modelName={displayName}
        isDarkMode={isDarkMode}
      />

      <TaskFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialModelId={modelId}
        availableModels={[modelInstance]}
        initialDate={viewDate}
        onTaskCreated={() => fetchTasks()}
        onTaskSaved={() => fetchTasks()}
        lockModel={true}
        isDarkMode={isDarkMode}
      />
    </div>
  );
}
