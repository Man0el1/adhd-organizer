import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Sun,
  Sunset,
  Moon,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Edit2,
  Clock,
} from 'lucide-react';
import { apiFetch } from '../../utils/api.js';
import { getTodayLocalStr } from '../../utils/date.js';
import TaskFormModal from '../task-form/TaskFormModal.jsx';

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

const PERIOD_CONFIG = [
  {
    id: 'morning',
    title: 'Manhã',
    icon: Sun,
    colorText: 'text-amber-500',
    colorBg: 'bg-amber-100 dark:bg-amber-950/60',
    badgeBorder: 'border-amber-200 dark:border-amber-800/60',
  },
  {
    id: 'afternoon',
    title: 'Tarde',
    icon: Sunset,
    colorText: 'text-orange-500',
    colorBg: 'bg-orange-100 dark:bg-orange-950/60',
    badgeBorder: 'border-orange-200 dark:border-orange-800/60',
  },
  {
    id: 'night',
    title: 'Noite',
    icon: Moon,
    colorText: 'text-indigo-500',
    colorBg: 'bg-indigo-100 dark:bg-indigo-950/60',
    badgeBorder: 'border-indigo-200 dark:border-indigo-800/60',
  },
];

export default function DailyRoutines({ modelInstance, isDarkMode = false }) {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [modalPeriod, setModalPeriod] = useState('morning');

  const todayStr = useMemo(() => getTodayLocalStr(), []);
  const [selectedDate, setSelectedDate] = useState(todayStr);

  const modelId = modelInstance?.id || 'daily-routines';
  const modelType = modelInstance?.type || 'daily-routines';
  const displayName = modelInstance?.name || 'Rotinas Diárias';

  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await apiFetch(
        `/api/tasks?modelId=${encodeURIComponent(modelId)}&modelType=${encodeURIComponent(modelType)}&targetDate=${encodeURIComponent(selectedDate)}`
      );
      if (res.ok) {
        const data = await res.json();
        setTasks(data.tasks || []);
      }
    } catch (err) {
      console.error('Erro ao buscar rotinas:', err);
    } finally {
      setIsLoading(false);
    }
  }, [modelId, modelType, selectedDate]);

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

  const handlePrevDay = () => {
    const d = parseDate(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(formatDate(d));
  };

  const handleNextDay = () => {
    const d = parseDate(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(formatDate(d));
  };

  const handleGoToday = () => {
    setSelectedDate(todayStr);
  };

  const handleToggleTask = async (task) => {
    const completedList = task.completedDates || [];
    const isCompleted = completedList.includes(selectedDate);
    const nextCompleted = isCompleted
      ? completedList.filter((d) => d !== selectedDate)
      : [...completedList, selectedDate];

    // Otimista
    setTasks((prev) =>
      prev.map((t) =>
        t.id === task.id
          ? { ...t, done: !isCompleted, completedDates: nextCompleted }
          : t
      )
    );

    try {
      const res = await apiFetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: selectedDate,
          done: !isCompleted,
        }),
      });

      if (!res.ok) {
        fetchTasks();
      } else {
        window.dispatchEvent(
          new CustomEvent('focusmod_task_updated', {
            detail: { id: task.id, date: selectedDate, done: !isCompleted },
          })
        );
      }
    } catch (err) {
      console.error('Erro ao alternar atividade da rotina:', err);
      fetchTasks();
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      await apiFetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
      window.dispatchEvent(
        new CustomEvent('focusmod_task_updated', { detail: { id: taskId, deleted: true } })
      );
    } catch (err) {
      console.error('Erro ao excluir atividade:', err);
      fetchTasks();
    }
  };

  // Agrupa tarefas por período
  const groupedTasks = useMemo(() => {
    const groups = {
      morning: [],
      afternoon: [],
      night: [],
    };

    tasks.forEach((t) => {
      const p = t.dailyRoutine?.period || 'morning';
      if (groups[p]) {
        groups[p].push(t);
      } else {
        groups.morning.push(t);
      }
    });

    return groups;
  }, [tasks]);

  const totalCount = tasks.length;
  const completedCount = useMemo(() => {
    return tasks.filter((t) => (t.completedDates || []).includes(selectedDate)).length;
  }, [tasks, selectedDate]);

  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Formata exibição amigável da data
  const dateLabel = useMemo(() => {
    if (selectedDate === todayStr) return 'Hoje';
    const d = parseDate(selectedDate);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return `${day}/${month}`;
  }, [selectedDate, todayStr]);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Top Header */}
      <div
        className={`px-4 sm:px-6 py-3.5 border-b flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shrink-0 ${
          isDarkMode ? 'border-slate-800 bg-slate-900/50' : 'border-[#d3dce6] bg-white'
        }`}
      >
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100">
              {displayName}
            </h1>
            <p className="text-xs text-slate-500">
              {completedCount} de {totalCount} atividades concluídas ({progressPercent}%)
            </p>
          </div>
        </div>

        {/* Controles de Navegação da Data & Botão Novo */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-0.5 border border-slate-200 dark:border-slate-700">
            <button
              onClick={handlePrevDay}
              title="Dia anterior"
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleGoToday}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                selectedDate === todayStr
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700'
              }`}
            >
              {dateLabel}
            </button>
            <button
              onClick={handleNextDay}
              title="Próximo dia"
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => {
              setEditingTask(null);
              setModalPeriod('morning');
              setIsModalOpen(true);
            }}
            className="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Atividade</span>
          </button>
        </div>
      </div>

      {/* Barra de Progresso Global */}
      {totalCount > 0 && (
        <div className="px-4 sm:px-6 pt-3 shrink-0">
          <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Conteúdo: 3 Períodos */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
        {isLoading && tasks.length === 0 ? (
          <div className="flex items-center justify-center py-16 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            <span>Carregando rotinas...</span>
          </div>
        ) : (
          PERIOD_CONFIG.map((period) => {
            const Icon = period.icon;
            const periodTasks = groupedTasks[period.id] || [];
            const periodDoneCount = periodTasks.filter((t) =>
              (t.completedDates || []).includes(selectedDate)
            ).length;

            return (
              <div
                key={period.id}
                className={`rounded-2xl border transition-colors ${
                  isDarkMode
                    ? 'bg-slate-900/60 border-slate-800'
                    : 'bg-white border-[#d3dce6]'
                }`}
              >
                {/* Header do Período */}
                <div className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-xl ${period.colorBg} ${period.colorText}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                        {period.title}
                      </h2>
                      <span className="text-[11px] text-slate-500 font-medium">
                        {periodDoneCount} de {periodTasks.length} concluídas
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setEditingTask(null);
                      setModalPeriod(period.id);
                      setIsModalOpen(true);
                    }}
                    className="p-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Adicionar</span>
                  </button>
                </div>

                {/* Lista de Atividades do Período */}
                <div className="p-2 sm:p-3 space-y-1.5">
                  {periodTasks.length === 0 ? (
                    <div className="text-center py-6 text-xs text-slate-400">
                      Nenhuma atividade para a {period.title.toLowerCase()}.
                    </div>
                  ) : (
                    periodTasks.map((task) => {
                      const isDone = (task.completedDates || []).includes(selectedDate);
                      return (
                        <div
                          key={task.id}
                          className={`group p-2.5 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                            isDone
                              ? isDarkMode
                                ? 'bg-slate-950/40 border-slate-800/60 opacity-60'
                                : 'bg-slate-50/70 border-slate-200/60 opacity-60'
                              : isDarkMode
                              ? 'bg-slate-900 border-slate-800/80 hover:border-slate-700'
                              : 'bg-white border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <button
                              type="button"
                              onClick={() => handleToggleTask(task)}
                              className="text-slate-400 hover:text-emerald-500 transition-colors cursor-pointer shrink-0"
                            >
                              {isDone ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-100 dark:fill-emerald-950" />
                              ) : (
                                <Circle className="w-4 h-4" />
                              )}
                            </button>

                            <div className="min-w-0">
                              <span
                                className={`text-xs sm:text-sm font-semibold block truncate ${
                                  isDone
                                    ? 'line-through text-slate-400 dark:text-slate-500'
                                    : 'text-slate-800 dark:text-slate-100'
                                }`}
                              >
                                {task.name}
                              </span>
                              {task.description && (
                                <span className="text-[11px] text-slate-400 truncate block">
                                  {task.description}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => {
                                setEditingTask(task);
                                setModalPeriod(period.id);
                                setIsModalOpen(true);
                              }}
                              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md cursor-pointer"
                              title="Editar"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteTask(task.id)}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded-md cursor-pointer"
                              title="Excluir"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Unificado */}
      <TaskFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTask(null);
        }}
        initialModelId={modelId}
        initialPeriod={modalPeriod}
        editingTask={editingTask}
        isDarkMode={isDarkMode}
        onTaskSaved={fetchTasks}
      />
    </div>
  );
}
