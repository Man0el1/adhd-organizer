import React, { useState, useEffect, useCallback } from 'react';
import { Trash2, Sparkles, Brain, Loader2 } from 'lucide-react';

export default function BrainDump({ modelInstance }) {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const modelId = modelInstance?.id || 'brain-dump';
  const modelType = modelInstance?.type || 'brain-dump';
  const displayName = modelInstance?.name || 'Brain Dump';

  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(
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

  const handleRemove = async (id) => {
    try {
      setTasks((prev) => prev.filter((t) => t.id !== id));
      await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
      window.dispatchEvent(new CustomEvent('focusmod_task_updated', { detail: { id } }));
    } catch (err) {
      console.error('Erro ao remover item:', err);
      fetchTasks();
    }
  };

  return (
    <div className="w-full h-full flex-1 flex flex-col justify-between bg-[#1E1414] p-4 sm:p-6 lg:p-8 min-h-0 overflow-hidden gap-4">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-3 bg-[#251818] border border-[#3D2B2B] rounded-2xl px-5 py-3 shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-violet-900/40 border border-violet-700/50 flex items-center justify-center text-violet-300 shadow">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#F5E6DA]">Brain Dump</h2>
            <p className="text-[11px] text-[#A67C52]">
              Ideias, pensamentos e descargas mentais sincronizadas pelo backend
            </p>
          </div>
        </div>

        <span className="text-xs font-semibold text-[#D1BFA5] bg-[#1E1414] px-3 py-1.5 rounded-xl border border-[#3D2B2B] shadow-sm font-mono">
          {tasks.length} pensamentos
        </span>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 min-h-0">
        {isLoading && tasks.length === 0 ? (
          <div className="h-full flex items-center justify-center py-16 text-[#A67C52] gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-violet-400" />
            <p className="text-xs">Carregando anotações...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center py-16 text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-[#251818] border border-[#3D2B2B] flex items-center justify-center text-violet-400 shadow-inner">
              <Sparkles className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-[#D1BFA5]">Sua mente está livre de pendências!</p>
            <p className="text-xs text-[#A67C52] max-w-sm">
              Use o botão (+) no canto inferior direito para adicionar tarefas com anotações e descarregar pensamentos soltos.
            </p>
          </div>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className="p-4 rounded-2xl bg-[#251818] border border-[#3D2B2B] hover:border-violet-600/40 text-xs sm:text-sm text-[#F5E6DA] flex items-center justify-between gap-3 transition-colors shadow-sm group"
            >
              <div className="truncate flex-1">
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-violet-400 shrink-0" />
                  <p className="font-semibold truncate text-[#F5E6DA]">{task.name}</p>
                </div>
                {task.notes && (
                  <p className="text-xs text-[#D1BFA5] mt-1 pl-4.5 line-clamp-2">
                    {task.notes}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => handleRemove(task.id)}
                className="text-[#6D5A5A] hover:text-red-400 p-1.5 rounded-lg hover:bg-[#1E1414] transition-colors cursor-pointer shrink-0"
                title="Concluir e remover"
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
