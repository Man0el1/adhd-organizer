import React, { useState, useEffect, useCallback } from 'react';
import {
  Grid2X2,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  Loader2,
  ArrowRightLeft,
  Settings,
} from 'lucide-react';
import { apiFetch } from '../../utils/api.js';
import TaskFormModal from '../task-form/TaskFormModal.jsx';
import ModelSettingsModal from './ModelSettingsModal.jsx';

const QUADRANTS = [
  {
    id: 'q1',
    title: '1. Fazer Primeiro',
    subtitle: 'Urgente & Importante',
    urgency: true,
    importance: true,
    badgeColor: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300',
    borderColor: 'border-rose-200 dark:border-rose-900/60',
  },
  {
    id: 'q2',
    title: '2. Agendar',
    subtitle: 'Importante & Não Urgente',
    urgency: false,
    importance: true,
    badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
    borderColor: 'border-blue-200 dark:border-blue-900/60',
  },
  {
    id: 'q3',
    title: '3. Delegar',
    subtitle: 'Urgente & Não Importante',
    urgency: true,
    importance: false,
    badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
    borderColor: 'border-amber-200 dark:border-amber-900/60',
  },
  {
    id: 'q4',
    title: '4. Eliminar / Esperar',
    subtitle: 'Não Urgente & Não Importante',
    urgency: false,
    importance: false,
    badgeColor: 'bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-300',
    borderColor: 'border-slate-200 dark:border-slate-800',
  },
];

export default function PriorityMatrix({ modelInstance, isDarkMode = false }) {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const modelId = modelInstance?.id || 'priority-matrix';
  const modelType = modelInstance?.type || 'priority-matrix';
  const displayName = modelInstance?.name || 'Matriz de Prioridades';

  const [modalInitialUrgency, setModalInitialUrgency] = useState(true);
  const [modalInitialImportance, setModalInitialImportance] = useState(true);

  const openAddModal = (urg = true, imp = true) => {
    setModalInitialUrgency(urg);
    setModalInitialImportance(imp);
    setIsModalOpen(true);
  };

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
      console.error('Erro ao buscar tarefas da Matriz:', err);
    } finally {
      setIsLoading(false);
    }
  }, [modelId, modelType]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    const handleTaskEvent = () => fetchTasks();
    window.addEventListener('focusmod_task_created', handleTaskEvent);
    window.addEventListener('focusmod_task_updated', handleTaskEvent);
    return () => {
      window.removeEventListener('focusmod_task_created', handleTaskEvent);
      window.removeEventListener('focusmod_task_updated', handleTaskEvent);
    };
  }, [fetchTasks]);

  const handleToggleTask = async (task) => {
    const newDone = !task.done;
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, done: newDone } : t))
    );

    try {
      const res = await apiFetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ done: newDone }),
      });
      if (!res.ok) {
        fetchTasks();
      } else {
        window.dispatchEvent(
          new CustomEvent('focusmod_task_updated', {
            detail: { id: task.id, done: newDone },
          })
        );
      }
    } catch (err) {
      console.error('Erro ao alternar status da tarefa:', err);
      fetchTasks();
    }
  };

  const handleSetPriority = async (task, urgency, importance) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === task.id
          ? { ...t, matrix: { ...(t.matrix || {}), urgency, importance } }
          : t
      )
    );

    try {
      const res = await apiFetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urgency, importance }),
      });
      if (!res.ok) {
        fetchTasks();
      } else {
        window.dispatchEvent(
          new CustomEvent('focusmod_task_updated', {
            detail: { id: task.id, urgency, importance },
          })
        );
      }
    } catch (err) {
      console.error('Erro ao atualizar prioridade da tarefa:', err);
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
      console.error('Erro ao excluir tarefa:', err);
      fetchTasks();
    }
  };

  return (
    <div
      className={`w-full h-full flex-1 flex flex-col p-4 sm:p-6 lg:p-8 min-h-0 overflow-hidden transition-colors ${
        isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-[#ebf0f5] text-slate-800'
      }`}
    >
      <div className="w-full max-w-6xl mx-auto flex-1 flex flex-col min-h-0 gap-4">
        {/* Header */}
        <div
          className={`flex items-center justify-between gap-3 border rounded-2xl px-5 py-3 shadow-xs shrink-0 transition-colors ${
            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-[#f4f7fa] border-[#d3dce6]'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-violet-500/10 text-violet-600">
              <Grid2X2 className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h1 className={`text-base sm:text-lg font-bold leading-tight ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>{displayName}</h1>
              <p className="text-xs text-slate-400">
                {tasks.filter((t) => !t.done).length} pendente(s)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => openAddModal(true, true)}
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

        {/* Grid 2x2 dos 4 Quadrantes */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 min-h-0 overflow-y-auto md:overflow-hidden pr-0.5">
          {QUADRANTS.map((quad) => {
            const quadTasks = tasks.filter((t) => {
              const urg = t.matrix?.urgency !== undefined ? Boolean(t.matrix.urgency) : true;
              const imp = t.matrix?.importance !== undefined ? Boolean(t.matrix.importance) : true;
              return urg === quad.urgency && imp === quad.importance;
            });

            return (
              <div
                key={quad.id}
                className={`flex flex-col border rounded-2xl p-3 sm:p-3.5 shadow-xs min-h-[250px] md:min-h-0 overflow-hidden transition-colors ${
                  isDarkMode
                    ? 'bg-slate-900/70 border-slate-800'
                    : 'bg-[#f4f7fa] border-[#d3dce6]'
                }`}
              >
                {/* Header do Quadrante */}
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200 dark:border-slate-800 shrink-0">
                  <div>
                    <h3 className={`text-xs font-bold ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>
                      {quad.title}
                    </h3>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {quad.subtitle}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${quad.badgeColor}`}>
                      {quadTasks.length}
                    </span>
                    <button
                      type="button"
                      onClick={() => openAddModal(quad.urgency, quad.importance)}
                      className="p-1 rounded-lg text-slate-400 hover:text-[#1d56af] hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      title={`Adicionar em ${quad.title}`}
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    </button>
                  </div>
                </div>

                {/* Lista de Cartões do Quadrante */}
                <div className="flex-1 overflow-y-auto space-y-2 pr-0.5 min-h-0">
                  {isLoading && tasks.length === 0 ? (
                    <div className="flex items-center justify-center py-6 text-slate-400 gap-1.5">
                      <Loader2 className="w-4 h-4 animate-spin text-violet-600" />
                      <span className="text-xs">Carregando...</span>
                    </div>
                  ) : quadTasks.length === 0 ? (
                    <div
                      className={`flex items-center justify-center py-6 border border-dashed rounded-xl text-center text-xs ${
                        isDarkMode
                          ? 'border-slate-800 text-slate-600'
                          : 'border-slate-200 text-slate-400'
                      }`}
                    >
                      Nenhuma tarefa neste quadrante
                    </div>
                  ) : (
                    quadTasks.map((task) => (
                      <div
                        key={task.id}
                        className={`border rounded-xl p-2.5 shadow-xs transition-all space-y-1.5 ${
                          isDarkMode
                            ? 'bg-slate-950/80 border-slate-800 text-slate-200'
                            : 'bg-white border-[#e2e8f0] text-slate-800'
                        } ${task.done ? 'opacity-70' : ''}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2 flex-1 min-w-0">
                            <button
                              type="button"
                              onClick={() => handleToggleTask(task)}
                              className="mt-0.5 text-slate-400 hover:text-violet-600 cursor-pointer shrink-0 transition-colors"
                            >
                              {task.done ? (
                                <CheckCircle2 className="w-4 h-4 text-violet-600" />
                              ) : (
                                <Circle className="w-4 h-4" />
                              )}
                            </button>

                            <div className="flex-1 min-w-0">
                              <h4
                                className={`text-xs font-bold leading-snug break-words ${
                                  task.done ? 'line-through text-slate-400' : ''
                                }`}
                              >
                                {task.name}
                              </h4>
                              {task.description && (
                                <p className="text-[11px] text-slate-400 dark:text-slate-500 line-clamp-1 mt-0.5">
                                  {task.description}
                                </p>
                              )}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleDeleteTask(task.id)}
                            className="text-slate-300 hover:text-rose-500 cursor-pointer p-0.5 shrink-0 transition-colors"
                            title="Excluir tarefa"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Seletor rápido de Quadrante */}
                        <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800/80 text-[10px] text-slate-400">
                          <span className="flex items-center gap-1">
                            <ArrowRightLeft className="w-2.5 h-2.5" />
                            Mover:
                          </span>
                          <div className="flex items-center gap-1">
                            {QUADRANTS.filter((q) => q.id !== quad.id).map((targetQ) => (
                              <button
                                key={targetQ.id}
                                type="button"
                                onClick={() =>
                                  handleSetPriority(task, targetQ.urgency, targetQ.importance)
                                }
                                className="px-1.5 py-0.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-slate-500 dark:text-slate-300 cursor-pointer"
                                title={targetQ.title}
                              >
                                {targetQ.id.toUpperCase()}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal para criar tarefa na Matriz */}
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
        initialUrgency={modalInitialUrgency}
        initialImportance={modalInitialImportance}
        availableModels={[modelInstance]}
        onTaskCreated={() => fetchTasks()}
        onTaskSaved={() => fetchTasks()}
        lockModel={true}
        isDarkMode={isDarkMode}
      />
    </div>
  );
}
