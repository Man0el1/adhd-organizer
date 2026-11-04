import React, { useState, useEffect, useCallback } from 'react';
import {
  ListChecks,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  Loader2,
  ChevronDown,
  ChevronUp,
  Settings,
} from 'lucide-react';
import { apiFetch } from '../../utils/api.js';
import TaskFormModal from '../task-form/TaskFormModal.jsx';
import ModelSettingsModal from './ModelSettingsModal.jsx';

export default function Microtasks({ modelInstance, isDarkMode = false }) {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newSubtaskInputs, setNewSubtaskInputs] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [expandedTasks, setExpandedTasks] = useState({});

  const modelId = modelInstance?.id || 'microtasks';
  const modelType = modelInstance?.type || 'microtasks';
  const displayName = modelInstance?.name || 'Microtarefas';

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
      console.error('Erro ao buscar microtarefas:', err);
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

  const handleToggleSubtask = async (taskId, subtask) => {
    const newDone = !subtask.done;
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        const updatedSubtasks = (t.subtasks || []).map((st) =>
          st.id === subtask.id || st.id_subtask === subtask.id_subtask
            ? { ...st, done: newDone }
            : st
        );
        return { ...t, subtasks: updatedSubtasks };
      })
    );

    try {
      const subtaskId = subtask.id_subtask || subtask.id;
      const res = await apiFetch(`/api/tasks/subtasks/${subtaskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ done: newDone }),
      });
      if (!res.ok) {
        fetchTasks();
      }
    } catch (err) {
      console.error('Erro ao atualizar subtarefa:', err);
      fetchTasks();
    }
  };

  const handleAddSubtask = async (taskId) => {
    const title = (newSubtaskInputs[taskId] || '').trim();
    if (!title) return;

    try {
      setNewSubtaskInputs((prev) => ({ ...prev, [taskId]: '' }));
      const res = await apiFetch(`/api/tasks/${taskId}/subtasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      });
      if (res.ok) {
        const data = await res.json();
        const createdSt = data.subtask;
        setTasks((prev) =>
          prev.map((t) => {
            if (t.id !== taskId) return t;
            return {
              ...t,
              subtasks: [...(t.subtasks || []), createdSt],
            };
          })
        );
      } else {
        fetchTasks();
      }
    } catch (err) {
      console.error('Erro ao adicionar subtarefa:', err);
      fetchTasks();
    }
  };

  const handleDeleteSubtask = async (taskId, subtask) => {
    const subtaskId = subtask.id_subtask || subtask.id;
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        return {
          ...t,
          subtasks: (t.subtasks || []).filter(
            (st) => st.id !== subtask.id && st.id_subtask !== subtask.id_subtask
          ),
        };
      })
    );

    try {
      await apiFetch(`/api/tasks/subtasks/${subtaskId}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Erro ao excluir subtarefa:', err);
      fetchTasks();
    }
  };

  const toggleExpanded = (taskId) => {
    setExpandedTasks((prev) => ({
      ...prev,
      [taskId]: prev[taskId] === undefined ? false : !prev[taskId],
    }));
  };

  return (
    <div
      className={`w-full h-full flex-1 flex flex-col p-4 sm:p-6 lg:p-8 min-h-0 overflow-hidden transition-colors ${
        isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-[#ebf0f5] text-slate-800'
      }`}
    >
      <div className="w-full max-w-5xl mx-auto flex-1 flex flex-col min-h-0 gap-4">
        {/* Header */}
        <div
          className={`flex items-center justify-between gap-3 border rounded-2xl px-5 py-3 shadow-xs shrink-0 transition-colors ${
            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-[#f4f7fa] border-[#d3dce6]'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
              <ListChecks className="w-5 h-5 stroke-[2.2]" />
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
              onClick={() => setIsModalOpen(true)}
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

        {/* Lista de Tarefas */}
        <div className="flex-1 overflow-y-auto pr-1 min-h-0">
          {isLoading && tasks.length === 0 ? (
            <div className="flex items-center justify-center py-16 gap-2 text-slate-400">
              <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
              <span className="text-xs font-semibold">Carregando microtarefas...</span>
            </div>
          ) : tasks.length === 0 ? (
            <div
              className={`flex flex-col items-center justify-center py-16 px-4 border border-dashed rounded-2xl text-center ${
                isDarkMode
                  ? 'border-slate-800 bg-slate-900/40 text-slate-400'
                  : 'border-[#d3dce6] bg-[#f4f7fa]/60 text-slate-500'
              }`}
            >
              <ListChecks className="w-10 h-10 text-slate-400 mb-2 stroke-1" />
              <p className="text-sm font-semibold">Nenhuma microtarefa cadastrada.</p>
              <p className="text-xs text-slate-400 mt-1">
                Divida tarefas em etapas menores para facilitar a execução.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 content-start items-start">
              {tasks.map((task) => {
                const hasSubtasks = Array.isArray(task.subtasks) && task.subtasks.length > 0;
                const completedCount = hasSubtasks
                  ? task.subtasks.filter((st) => st.done).length
                  : 0;
                const totalCount = hasSubtasks ? task.subtasks.length : 0;
                const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
                const isExpanded = expandedTasks[task.id] !== false;

                return (
                  <div
                    key={task.id}
                    className={`border rounded-xl p-3 sm:p-3.5 shadow-xs transition-all ${
                      isDarkMode
                        ? 'bg-slate-900/90 border-slate-800'
                        : 'bg-[#f4f7fa] border-[#d3dce6]'
                    } ${task.done ? 'opacity-70' : ''}`}
                  >
                    {/* Linha Principal da Tarefa */}
                    <div className="flex items-start justify-between gap-2.5">
                      <div className="flex items-start gap-2 flex-1 min-w-0">
                        <button
                          type="button"
                          onClick={() => handleToggleTask(task)}
                          className="mt-0.5 text-slate-400 hover:text-emerald-600 cursor-pointer shrink-0 transition-colors"
                          title={task.done ? 'Marcar pendente' : 'Marcar concluída'}
                        >
                          {task.done ? (
                            <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 fill-emerald-100 dark:fill-emerald-950" />
                          ) : (
                            <Circle className="w-4 h-4 sm:w-5 sm:h-5 hover:stroke-emerald-500" />
                          )}
                        </button>

                        <div className="flex-1 min-w-0">
                          <h3
                            className={`text-xs sm:text-sm font-bold leading-snug break-words ${
                              task.done
                                ? 'line-through text-slate-400'
                                : isDarkMode
                                ? 'text-slate-100'
                                : 'text-slate-800'
                            }`}
                          >
                            {task.name}
                          </h3>
                          {task.description && (
                            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                              {task.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {hasSubtasks && (
                          <button
                            type="button"
                            onClick={() => toggleExpanded(task.id)}
                            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer transition-colors"
                            title={isExpanded ? 'Recolher subtarefas' : 'Expandir subtarefas'}
                          >
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeleteTask(task.id)}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-600 cursor-pointer transition-colors"
                          title="Excluir tarefa"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Barra de Progresso (exibida apenas quando houver subtarefas) */}
                    {hasSubtasks && (
                      <div className="mt-2.5 pt-2 border-t border-slate-200 dark:border-slate-800/80">
                        <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500 mb-1">
                          <span>Progresso</span>
                          <span>
                            {completedCount}/{totalCount} ({pct}%)
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Lista de Subtarefas e Campo Rápido */}
                    {isExpanded && (
                      <div className="mt-2.5 space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800/60">
                        {hasSubtasks && (
                          <div className="space-y-1">
                            {task.subtasks.map((st) => (
                              <div
                                key={st.id || st.id_subtask}
                                className={`flex items-center justify-between gap-2 px-2 py-1 rounded-lg border text-xs transition-colors ${
                                  isDarkMode
                                    ? 'bg-slate-950/40 border-slate-800/80'
                                    : 'bg-white border-[#e2e8f0]'
                                }`}
                              >
                                <button
                                  type="button"
                                  onClick={() => handleToggleSubtask(task.id, st)}
                                  className="flex items-center gap-1.5 flex-1 text-left cursor-pointer min-w-0"
                                >
                                  {st.done ? (
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                  ) : (
                                    <Circle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                  )}
                                  <span
                                    className={`truncate text-[11px] sm:text-xs ${
                                      st.done
                                        ? 'line-through text-slate-400'
                                        : isDarkMode
                                        ? 'text-slate-200 font-medium'
                                        : 'text-slate-700 font-medium'
                                    }`}
                                  >
                                    {st.title}
                                  </span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleDeleteSubtask(task.id, st)}
                                  className="text-slate-300 hover:text-rose-500 cursor-pointer p-0.5 shrink-0"
                                  title="Excluir subtarefa"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Input rápido para adicionar subtarefa */}
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            handleAddSubtask(task.id);
                          }}
                          className="flex items-center gap-1.5 pt-0.5"
                        >
                          <input
                            type="text"
                            value={newSubtaskInputs[task.id] || ''}
                            onChange={(e) =>
                              setNewSubtaskInputs((prev) => ({ ...prev, [task.id]: e.target.value }))
                            }
                            placeholder="Adicionar subtarefa..."
                            className={`flex-1 px-2.5 py-1 text-xs rounded-lg border transition-colors focus:outline-hidden focus:ring-1 focus:ring-[#1d56af] ${
                              isDarkMode
                                ? 'bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-600'
                                : 'bg-white border-[#d3dce6] text-slate-800 placeholder:text-slate-400'
                            }`}
                          />
                          <button
                            type="submit"
                            disabled={!(newSubtaskInputs[task.id] || '').trim()}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Adicionar</span>
                          </button>
                        </form>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal para criar tarefa no modelo Microtarefas */}
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
        onTaskCreated={() => fetchTasks()}
        onTaskSaved={() => fetchTasks()}
        lockModel={true}
        isDarkMode={isDarkMode}
      />
    </div>
  );
}
