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

const PERIOD_CONFIG = [
  {
    id: 'morning',
    title: 'Manhã',
    icon: Sun,
    colorText: 'text-amber-500',
    colorBg: 'bg-amber-500/10',
    badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
  },
  {
    id: 'afternoon',
    title: 'Tarde',
    icon: Sunset,
    colorText: 'text-orange-500',
    colorBg: 'bg-orange-500/10',
    badgeClass: 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300',
  },
  {
    id: 'night',
    title: 'Noite',
    icon: Moon,
    colorText: 'text-indigo-500',
    colorBg: 'bg-indigo-500/10',
    badgeClass: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300',
  },
];

export default function DailyRoutines({ modelInstance, isDarkMode = false }) {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
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
    <div
      className={`w-full h-full flex-1 flex flex-col p-4 sm:p-6 lg:p-8 min-h-0 overflow-hidden transition-colors ${
        isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-[#ebf0f5] text-slate-800'
      }`}
    >
      <div className="w-full max-w-7xl mx-auto flex-1 flex flex-col min-h-0 gap-4">
        {/* Header em Card Arredondado (igual ao Kanban) */}
        <div
          className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 border rounded-2xl px-5 py-3 shadow-xs shrink-0 transition-colors ${
            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-[#f4f7fa] border-[#d3dce6]'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Clock className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h1 className={`text-base sm:text-lg font-bold leading-tight ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>{displayName}</h1>
              <p className="text-xs text-slate-400">
                {completedCount} de {totalCount} atividades concluídas ({progressPercent}%)
              </p>
            </div>
          </div>

          {/* Controles de Navegação da Data & Botão Novo */}
          <div className="flex items-center gap-2.5 self-end sm:self-auto flex-wrap">
            {totalCount > 0 && (
              <div
                className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl border ${
                  isDarkMode
                    ? 'bg-slate-950 border-slate-800'
                    : 'bg-[#e8edf2] border-[#d3dce6]'
                }`}
              >
                <div
                  className={`w-20 h-2 rounded-full overflow-hidden ${
                    isDarkMode ? 'bg-slate-800' : 'bg-slate-300/70'
                  }`}
                >
                  <div
                    className="bg-emerald-500 h-full transition-all duration-300 rounded-full"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {progressPercent}%
                </span>
              </div>
            )}

            <div
              className={`flex items-center rounded-xl p-0.5 border ${
                isDarkMode
                  ? 'bg-slate-950 border-slate-800'
                  : 'bg-[#e8edf2] border-[#d3dce6]'
              }`}
            >
              <button
                type="button"
                onClick={handlePrevDay}
                title="Dia anterior"
                className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleGoToday}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                  selectedDate === todayStr
                    ? 'bg-[#1d56af] text-white shadow-xs'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800'
                }`}
              >
                {dateLabel}
              </button>
              <button
                type="button"
                onClick={handleNextDay}
                title="Próximo dia"
                className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setEditingTask(null);
                setModalPeriod('morning');
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

        {/* Grid de 3 Colunas Verticais (Manhã, Tarde, Noite) estilo Kanban */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 min-h-0 overflow-y-auto md:overflow-hidden pr-0.5">
          {PERIOD_CONFIG.map((period) => {
            const Icon = period.icon;
            const periodTasks = groupedTasks[period.id] || [];
            const periodDoneCount = periodTasks.filter((t) =>
              (t.completedDates || []).includes(selectedDate)
            ).length;

            return (
              <div
                key={period.id}
                className={`flex flex-col border rounded-2xl p-3 sm:p-3.5 shadow-xs min-h-[300px] md:min-h-0 overflow-hidden transition-colors ${
                  isDarkMode
                    ? 'bg-slate-900/70 border-slate-800'
                    : 'bg-[#f4f7fa] border-[#d3dce6]'
                }`}
              >
                {/* Header da Coluna */}
                <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-200 dark:border-slate-800 shrink-0">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg ${period.colorBg} ${period.colorText}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                      {period.title}
                    </span>
                    <span
                      className={`px-1.5 py-0.5 text-[10px] font-bold rounded-full ${period.badgeClass}`}
                    >
                      {periodDoneCount}/{periodTasks.length}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setEditingTask(null);
                      setModalPeriod(period.id);
                      setIsModalOpen(true);
                    }}
                    className="p-1 rounded-lg text-slate-400 hover:text-[#1d56af] hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    title={`Adicionar em ${period.title}`}
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>
                </div>

                {/* Cartões da Coluna */}
                <div className="flex-1 overflow-y-auto space-y-2.5 pr-0.5 min-h-0">
                  {isLoading && tasks.length === 0 ? (
                    <div className="flex items-center justify-center py-8 text-slate-400 gap-1.5">
                      <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                      <span className="text-xs">Carregando...</span>
                    </div>
                  ) : periodTasks.length === 0 ? (
                    <div
                      className={`flex items-center justify-center py-8 border border-dashed rounded-xl text-center text-xs ${
                        isDarkMode
                          ? 'border-slate-800 text-slate-600'
                          : 'border-slate-200 text-slate-400'
                      }`}
                    >
                      Nenhuma atividade para a {period.title.toLowerCase()}
                    </div>
                  ) : (
                    periodTasks.map((task) => {
                      const isDone = (task.completedDates || []).includes(selectedDate);
                      return (
                        <div
                          key={task.id}
                          className={`group border rounded-xl p-3 shadow-xs transition-all space-y-1.5 ${
                            isDone
                              ? isDarkMode
                                ? 'bg-slate-950/40 border-slate-800/60 opacity-65'
                                : 'bg-white/60 border-[#e2e8f0] opacity-65'
                              : isDarkMode
                              ? 'bg-slate-950/80 border-slate-800 text-slate-200 hover:border-slate-700'
                              : 'bg-white border-[#e2e8f0] text-slate-800 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-start gap-2 min-w-0 flex-1">
                              <button
                                type="button"
                                onClick={() => handleToggleTask(task)}
                                className="mt-0.5 text-slate-400 hover:text-emerald-500 transition-colors cursor-pointer shrink-0"
                              >
                                {isDone ? (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-100 dark:fill-emerald-950" />
                                ) : (
                                  <Circle className="w-4 h-4" />
                                )}
                              </button>

                              <div className="min-w-0 flex-1">
                                <h4
                                  className={`text-xs font-bold leading-snug break-words ${
                                    isDone
                                      ? 'line-through text-slate-400 dark:text-slate-500'
                                      : 'text-slate-800 dark:text-slate-100'
                                  }`}
                                >
                                  {task.name}
                                </h4>
                                {task.description && (
                                  <p className="text-[11px] text-slate-400 dark:text-slate-500 line-clamp-2 mt-0.5">
                                    {task.description}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingTask(task);
                                  setModalPeriod(period.id);
                                  setIsModalOpen(true);
                                }}
                                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md cursor-pointer"
                                title="Editar"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteTask(task.id)}
                                className="p-1 text-slate-400 hover:text-rose-500 rounded-md cursor-pointer"
                                title="Excluir"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
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
        initialPeriod={modalPeriod}
        editingTask={editingTask}
        isDarkMode={isDarkMode}
        onTaskSaved={fetchTasks}
        onTaskCreated={fetchTasks}
      />
    </div>
  );
}
