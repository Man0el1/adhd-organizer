import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Flame,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Check,
  Loader2,
  Edit2,
  Settings,
} from 'lucide-react';
import { apiFetch } from '../../utils/api.js';
import { getTodayLocalStr } from '../../utils/date.js';
import TaskFormModal from '../task-form/TaskFormModal.jsx';
import ModelSettingsModal from './ModelSettingsModal.jsx';

function parseDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Retorna os 7 dias da semana contendo a data base (iniciando no Domingo)
function getWeekDays(baseDateStr) {
  const base = parseDate(baseDateStr);
  const dayOfWeek = base.getDay(); // 0 = Domingo
  const start = new Date(base);
  start.setDate(base.getDate() - dayOfWeek);

  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    days.push(formatDate(d));
  }
  return days;
}

const WEEK_NAMES = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

// Calcula sequência consecutiva atual (streak)
function calculateStreak(completedDates = [], todayStr) {
  if (!completedDates || completedDates.length === 0) return 0;
  const set = new Set(completedDates);
  let streak = 0;
  let curr = parseDate(todayStr);

  // Se não foi concluído hoje, checa a partir de ontem
  const todayCompleted = set.has(todayStr);
  if (!todayCompleted) {
    curr.setDate(curr.getDate() - 1);
  }

  while (true) {
    const str = formatDate(curr);
    if (set.has(str)) {
      streak++;
      curr.setDate(curr.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

export default function HabitTracker({ modelInstance, isDarkMode = false }) {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const todayStr = useMemo(() => getTodayLocalStr(), []);
  const [selectedDate, setSelectedDate] = useState(todayStr);

  const modelId = modelInstance?.id || 'habits';
  const modelType = modelInstance?.type || 'habits';
  const displayName = modelInstance?.name || 'Rastreador de Hábitos';

  const weekDays = useMemo(() => getWeekDays(selectedDate), [selectedDate]);

  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await apiFetch(
        `/api/tasks?modelId=${encodeURIComponent(modelId)}&modelType=${encodeURIComponent(modelType)}`
      );
      if (res.ok) {
        const data = await res.json();
        setTasks(data.tasks || []);
      }
    } catch (err) {
      console.error('Erro ao buscar hábitos:', err);
    } finally {
      setIsLoading(false);
    }
  }, [modelId, modelType]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    const handleEvent = () => fetchTasks();
    window.addEventListener('focusmod_task_created', handleEvent);
    window.addEventListener('focusmod_task_updated', handleEvent);
    return () => {
      window.removeEventListener('focusmod_task_created', handleEvent);
      window.removeEventListener('focusmod_task_updated', handleEvent);
    };
  }, [fetchTasks]);

  const handlePrevWeek = () => {
    const d = parseDate(selectedDate);
    d.setDate(d.getDate() - 7);
    setSelectedDate(formatDate(d));
  };

  const handleNextWeek = () => {
    const d = parseDate(selectedDate);
    d.setDate(d.getDate() + 7);
    setSelectedDate(formatDate(d));
  };

  const handleGoToday = () => {
    setSelectedDate(todayStr);
  };

  const handleToggleDay = async (task, dateStr) => {
    const completedList = task.completedDates || [];
    const isCompleted = completedList.includes(dateStr);
    const nextCompleted = isCompleted
      ? completedList.filter((d) => d !== dateStr)
      : [...completedList, dateStr];

    // Otimista
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, completedDates: nextCompleted } : t))
    );

    try {
      const res = await apiFetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: dateStr,
          done: !isCompleted,
        }),
      });

      if (!res.ok) {
        fetchTasks();
      } else {
        window.dispatchEvent(
          new CustomEvent('focusmod_task_updated', {
            detail: { id: task.id, date: dateStr, done: !isCompleted },
          })
        );
      }
    } catch (err) {
      console.error('Erro ao alternar hábito:', err);
      fetchTasks();
    }
  };

  const handleDeleteHabit = async (taskId) => {
    try {
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      await apiFetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
      window.dispatchEvent(
        new CustomEvent('focusmod_task_updated', { detail: { id: taskId, deleted: true } })
      );
    } catch (err) {
      console.error('Erro ao excluir hábito:', err);
      fetchTasks();
    }
  };

  return (
    <div
      className={`w-full h-full flex-1 flex flex-col p-4 sm:p-6 lg:p-8 min-h-0 overflow-hidden transition-colors ${
        isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-[#ebf0f5] text-slate-800'
      }`}
    >
      <div className="w-full max-w-5xl mx-auto flex-1 flex flex-col min-h-0 gap-4">
        {/* Top Header */}
        <div
          className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 border rounded-2xl px-5 py-3 shadow-xs shrink-0 transition-colors ${
            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-[#f4f7fa] border-[#d3dce6]'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Flame className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h1 className={`text-base sm:text-lg font-bold leading-tight ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>{displayName}</h1>
              <p className="text-xs text-slate-400">
                {tasks.length} {tasks.length === 1 ? 'hábito cadastrado' : 'hábitos cadastrados'}
              </p>
            </div>
          </div>

          {/* Controles de Navegação da Semana & Botão Novo */}
          <div className="flex items-center gap-2.5 self-end sm:self-auto">
            <div
              className={`flex items-center rounded-xl p-0.5 border ${
                isDarkMode
                  ? 'bg-slate-950 border-slate-800'
                  : 'bg-[#e8edf2] border-[#d3dce6]'
              }`}
            >
              <button
                type="button"
                onClick={handlePrevWeek}
                title="Semana anterior"
                className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleGoToday}
                className="px-2.5 py-1 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                Hoje
              </button>
              <button
                type="button"
                onClick={handleNextWeek}
                title="Próxima semana"
                className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setEditingTask(null);
                setIsModalOpen(true);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-[#1d56af] hover:bg-[#174690] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Nova Tarefa</span>
            </button>
            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              title="Configurações do módulo"
              className={`p-1.5 rounded-xl border transition-colors cursor-pointer shrink-0 ${
                isDarkMode
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                  : 'bg-[#e8edf2] hover:bg-slate-200 text-slate-700 border-[#d3dce6]'
              }`}
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Conteúdo Principal */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 min-h-0">
          {isLoading && tasks.length === 0 ? (
            <div className="flex items-center justify-center py-16 text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              <span>Carregando hábitos...</span>
            </div>
          ) : tasks.length === 0 ? (
            <div
              className={`text-center py-16 px-4 rounded-2xl border border-dashed ${
                isDarkMode
                  ? 'border-slate-800 bg-slate-900/40 text-slate-400'
                  : 'border-[#d3dce6] bg-[#f4f7fa]/60 text-slate-500'
              }`}
            >
              <Flame className="w-10 h-10 mx-auto text-emerald-500 mb-2 opacity-80" />
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-1">
                Nenhum hábito cadastrado
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
                Crie hábitos para registrar sua frequência diária e acompanhar sua consistência.
              </p>
              <button
                type="button"
                onClick={() => {
                  setEditingTask(null);
                  setIsModalOpen(true);
                }}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-[#1d56af] hover:bg-[#174690] transition-colors shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar primeiro hábito</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Cabeçalho da Grade de Dias */}
              <div
                className={`p-3 rounded-2xl border flex items-center justify-between gap-4 shadow-xs ${
                  isDarkMode ? 'bg-slate-900/70 border-slate-800' : 'bg-[#f4f7fa] border-[#d3dce6]'
                }`}
              >
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-2 w-1/3 max-w-[260px] min-w-[140px]">
                  Hábito
                </div>

                <div className="flex-1 max-w-md flex items-center justify-between gap-1.5 sm:gap-2">
                  {weekDays.map((dStr) => {
                    const dObj = parseDate(dStr);
                    const isToday = dStr === todayStr;
                    const dayName = WEEK_NAMES[dObj.getDay()];
                    const dayNum = dObj.getDate();

                    return (
                      <div
                        key={dStr}
                        className={`flex flex-col items-center justify-center w-9 sm:w-11 py-1 rounded-xl transition-colors ${
                          isToday
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 font-bold ring-1 ring-emerald-500/30'
                            : 'text-slate-500'
                        }`}
                      >
                        <span className="text-[10px] font-semibold uppercase">{dayName}</span>
                        <span className="text-xs font-bold">{dayNum}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="w-20 text-center text-xs font-bold text-slate-500 uppercase tracking-wider hidden sm:block">
                  Sequência
                </div>
              </div>

              {/* Lista de Hábitos */}
              {tasks.map((task) => {
                const completedDates = task.completedDates || [];
                const streak = calculateStreak(completedDates, todayStr);
                const habitColor = task.habit?.color || '#10b981';
                const targetDays = task.habit?.target_days || [0, 1, 2, 3, 4, 5, 6];

                return (
                  <div
                    key={task.id}
                    className={`group p-3 sm:p-4 rounded-2xl border transition-all shadow-xs flex items-center justify-between gap-4 ${
                      isDarkMode
                        ? 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                        : 'bg-[#f4f7fa] border-[#d3dce6] hover:border-slate-300'
                    }`}
                  >
                    {/* Nome e Ações */}
                    <div className="w-1/3 max-w-[260px] min-w-[140px] flex items-center gap-2.5">
                      <span
                        className="w-2.5 h-8 rounded-full shrink-0"
                        style={{ backgroundColor: habitColor }}
                      />
                      <div className="min-w-0 flex-1">
                        <div className={`text-xs sm:text-sm font-bold truncate ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>
                          {task.name}
                        </div>
                        {task.description && (
                          <div className="text-[11px] text-slate-500 truncate">
                            {task.description}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingTask(task);
                            setIsModalOpen(true);
                          }}
                          className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md cursor-pointer"
                          title="Editar"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteHabit(task.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded-md cursor-pointer"
                          title="Excluir"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Círculos da Semana */}
                    <div className="flex-1 max-w-md flex items-center justify-between gap-1.5 sm:gap-2">
                      {weekDays.map((dStr) => {
                        const dObj = parseDate(dStr);
                        const dayIdx = dObj.getDay();
                        const isTarget = targetDays.includes(dayIdx);
                        const isDone = completedDates.includes(dStr);
                        const isToday = dStr === todayStr;

                        return (
                          <button
                            key={dStr}
                            type="button"
                            onClick={() => handleToggleDay(task, dStr)}
                            title={`${task.name} - ${dStr} (${isDone ? 'Concluído' : 'Pendente'})`}
                            className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                              isDone
                                ? 'text-white shadow-xs scale-105'
                                : isToday
                                ? isDarkMode
                                  ? 'bg-slate-800 border-2 border-emerald-500/50 hover:border-emerald-500'
                                  : 'bg-white border-2 border-emerald-500/50 hover:border-emerald-500'
                                : isTarget
                                ? isDarkMode
                                  ? 'bg-slate-800/60 border border-slate-700/60 hover:bg-slate-800'
                                  : 'bg-white border border-[#d3dce6] hover:bg-slate-100'
                                : isDarkMode
                                ? 'bg-slate-900 border border-slate-800/40 opacity-40 hover:opacity-80'
                                : 'bg-slate-50 border border-slate-200/50 opacity-40 hover:opacity-80'
                            }`}
                            style={isDone ? { backgroundColor: habitColor } : {}}
                          >
                            {isDone ? (
                              <Check className="w-4 h-4 stroke-[3]" />
                            ) : (
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  isToday ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'
                                }`}
                              />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Sequência (Streak) */}
                    <div className="w-20 flex items-center justify-center shrink-0">
                      <span
                        className={`px-2 py-1 rounded-xl text-xs font-bold flex items-center gap-1 ${
                          streak > 0
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400'
                            : 'bg-slate-200/70 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                      >
                        <Flame className={`w-3.5 h-3.5 ${streak > 0 ? 'text-amber-500 fill-amber-500' : ''}`} />
                        <span>{streak}d</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal Unificado */}
      <ModelSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        modelName={displayName}
        isDarkMode={isDarkMode}
      />

      <TaskFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTask(null);
        }}
        initialModelId={modelId}
        availableModels={[modelInstance]}
        lockModel={true}
        editingTask={editingTask}
        isDarkMode={isDarkMode}
        onTaskSaved={fetchTasks}
        onTaskCreated={fetchTasks}
      />
    </div>
  );
}
