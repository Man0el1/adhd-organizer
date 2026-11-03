import React, { useState, useEffect, useCallback } from 'react';
import { Trash2, Brain, Loader2, CheckCircle, Circle } from 'lucide-react';
import { apiFetch } from '../../utils/api.js';

export default function BrainDump({ modelInstance, isDarkMode = false }) {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const modelId = modelInstance?.id || 'brain-dump';
  const modelType = modelInstance?.type || 'brain-dump';
  const displayName = modelInstance?.name || 'Brain Dump';

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
      console.error('Erro ao buscar brain dump:', err);
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
      console.error('Erro ao alternar status do item:', err);
      fetchTasks();
    }
  };

  const handleRemove = async (id) => {
    try {
      setTasks((prev) => prev.filter((t) => t.id !== id));
      await apiFetch(`/api/tasks/${id}`, { method: 'DELETE' });
      window.dispatchEvent(new CustomEvent('focusmod_task_updated', { detail: { id, deleted: true } }));
    } catch (err) {
      console.error('Erro ao remover item:', err);
      fetchTasks();
    }
  };

  const pendingCount = tasks.filter((t) => !t.done).length;

  return (
    <div
      className={`w-full h-full flex-1 flex flex-col justify-between p-4 sm:p-6 lg:p-8 min-h-0 overflow-hidden gap-4 transition-colors ${
        isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-[#ebf0f5] text-slate-800'
      }`}
    >
      {/* Top Header */}
      <div
        className={`flex items-center justify-between gap-3 border rounded-2xl px-5 py-3 shadow-xs shrink-0 transition-colors ${
          isDarkMode
            ? 'bg-slate-900 border-slate-800'
            : 'bg-[#f4f7fa] border-[#d3dce6]'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center text-white shadow-xs">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2
              className={`text-base sm:text-lg font-bold ${
                isDarkMode ? 'text-slate-100' : 'text-slate-900'
              }`}
            >
              Brain Dump
            </h2>
            <p className="text-[11px] text-slate-500">
              Ideias, pensamentos e descargas mentais rápidas
            </p>
          </div>
        </div>

        <span
          className={`text-xs font-semibold px-3 py-1.5 rounded-xl border shadow-xs font-mono ${
            isDarkMode
              ? 'bg-slate-800 border-slate-700 text-slate-300'
              : 'bg-[#e8edf2] border-[#d3dce6] text-slate-700'
          }`}
        >
          {pendingCount} pendentes / {tasks.length} total
        </span>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 min-h-0">
        {isLoading && tasks.length === 0 ? (
          <div className="h-full flex items-center justify-center py-16 text-slate-400 gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
            <p className="text-xs">Carregando anotações...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center py-16 text-center space-y-2">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto border ${
                isDarkMode
                  ? 'bg-slate-900 border-slate-800 text-amber-400'
                  : 'bg-[#f4f7fa] border-[#d3dce6] text-amber-600 shadow-xs'
              }`}
            >
              <Brain className="w-6 h-6" />
            </div>
            <p className={`text-sm font-semibold ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
              Sua mente está livre de pendências!
            </p>
            <p className="text-xs text-slate-400 max-w-sm">
              Use o botão circular (+) no canto inferior direito para adicionar anotações e descarregar pensamentos soltos.
            </p>
          </div>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className={`p-4 rounded-xl border text-xs sm:text-sm flex items-center justify-between gap-3 transition-colors shadow-xs group ${
                task.done
                  ? isDarkMode
                    ? 'bg-slate-900/60 border-slate-800 opacity-75'
                    : 'bg-[#f4f7fa] border-[#d3dce6] opacity-80'
                  : isDarkMode
                  ? 'bg-slate-900 border-slate-800 hover:border-amber-700/60 text-slate-100'
                  : 'bg-[#ffffff] border-[#d3dce6] hover:border-amber-400 text-slate-800'
              }`}
            >
              <button
                type="button"
                onClick={() => handleToggleTask(task)}
                className="shrink-0 transition-transform active:scale-90 cursor-pointer"
                title={task.done ? 'Marcar como pendente' : 'Marcar como concluído'}
              >
                {task.done ? (
                  <CheckCircle className="w-5 h-5 text-amber-500 fill-amber-500/10" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-400 hover:text-amber-500" />
                )}
              </button>

              <div className="truncate flex-1">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      task.done ? 'bg-slate-400' : 'bg-amber-500'
                    }`}
                  />
                  <p
                    className={`font-semibold truncate ${
                      task.done
                        ? 'line-through text-slate-400 dark:text-slate-500'
                        : isDarkMode
                        ? 'text-slate-100'
                        : 'text-slate-900'
                    }`}
                  >
                    {task.name}
                  </p>
                </div>
                {task.notes && (
                  <p
                    className={`text-xs mt-1 pl-4.5 line-clamp-2 ${
                      task.done
                        ? 'line-through text-slate-400/70'
                        : isDarkMode
                        ? 'text-slate-400'
                        : 'text-slate-600'
                    }`}
                  >
                    {task.notes}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => handleRemove(task.id)}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer shrink-0 ${
                  isDarkMode
                    ? 'text-slate-500 hover:text-rose-400 hover:bg-slate-800'
                    : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                }`}
                title="Remover anotação"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}


