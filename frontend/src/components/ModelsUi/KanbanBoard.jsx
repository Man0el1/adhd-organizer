import React, { useState, useEffect, useCallback } from 'react';
import {
  Columns,
  Plus,
  Trash2,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Circle,
  Loader2,
} from 'lucide-react';
import { apiFetch } from '../../utils/api.js';
import TaskFormModal from '../task-form/TaskFormModal.jsx';

const COLUMNS = [
  { id: 'todo', label: 'A Fazer', color: 'border-slate-300 dark:border-slate-700' },
  { id: 'in_progress', label: 'Em Progresso', color: 'border-indigo-400 dark:border-indigo-700' },
  { id: 'done', label: 'Concluído', color: 'border-emerald-400 dark:border-emerald-700' },
];

export default function KanbanBoard({ modelInstance, isDarkMode = false }) {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalInitialColumn, setModalInitialColumn] = useState('todo');

  const modelId = modelInstance?.id || 'kanban';
  const modelType = modelInstance?.type || 'kanban';
  const displayName = modelInstance?.name || 'Kanban';

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
      console.error('Erro ao buscar tarefas do Kanban:', err);
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

  const handleMoveColumn = async (task, targetCol) => {
    const targetDone = targetCol === 'done';
    setTasks((prev) =>
      prev.map((t) =>
        t.id === task.id
          ? {
              ...t,
              done: targetDone,
              kanban: { ...(t.kanban || {}), column_id: targetCol },
            }
          : t
      )
    );

    try {
      const res = await apiFetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          column_id: targetCol,
          done: targetDone,
        }),
      });

      if (!res.ok) {
        fetchTasks();
      } else {
        window.dispatchEvent(
          new CustomEvent('focusmod_task_updated', {
            detail: { id: task.id, column_id: targetCol, done: targetDone },
          })
        );
      }
    } catch (err) {
      console.error('Erro ao mover tarefa no Kanban:', err);
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

  const openAddModal = (columnId) => {
    setModalInitialColumn(columnId);
    setIsModalOpen(true);
  };

  return (
    <div
      className={`w-full h-full flex-1 flex flex-col justify-between p-4 sm:p-6 lg:p-8 min-h-0 overflow-hidden gap-4 transition-colors ${
        isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-[#ebf0f5] text-slate-800'
      }`}
    >
      {/* Header */}
      <div
        className={`flex items-center justify-between gap-3 border rounded-2xl px-5 py-3 shadow-xs shrink-0 transition-colors ${
          isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-[#f4f7fa] border-[#d3dce6]'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600">
            <Columns className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold leading-tight">{displayName}</h1>
            <p className="text-xs text-slate-400">
              {tasks.filter((t) => !t.done).length} pendente(s)
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => openAddModal('todo')}
          className="px-3.5 py-1.5 rounded-xl bg-[#1d56af] hover:bg-[#174690] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Nova Tarefa</span>
        </button>
      </div>

      {/* Grid de 3 Colunas */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 min-h-0 overflow-y-auto md:overflow-hidden pr-0.5">
        {COLUMNS.map((col) => {
          const colTasks = tasks.filter((t) => {
            const currentCol = t.kanban?.column_id || (t.done ? 'done' : 'todo');
            return currentCol === col.id;
          });

          return (
            <div
              key={col.id}
              className={`flex flex-col border rounded-2xl p-3 sm:p-3.5 shadow-xs min-h-[320px] md:min-h-0 overflow-hidden transition-colors ${
                isDarkMode
                  ? 'bg-slate-900/70 border-slate-800'
                  : 'bg-[#f4f7fa] border-[#d3dce6]'
              }`}
            >
              {/* Header da Coluna */}
              <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-200 dark:border-slate-800 shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                    {col.label}
                  </span>
                  <span
                    className={`px-1.5 py-0.5 text-[10px] font-bold rounded-full ${
                      col.id === 'done'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : col.id === 'in_progress'
                        ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                        : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    {colTasks.length}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => openAddModal(col.id)}
                  className="p-1 rounded-lg text-slate-400 hover:text-[#1d56af] hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  title={`Adicionar em ${col.label}`}
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
              </div>

              {/* Cartões da Coluna */}
              <div className="flex-1 overflow-y-auto space-y-2.5 pr-0.5 min-h-0">
                {isLoading && tasks.length === 0 ? (
                  <div className="flex items-center justify-center py-8 text-slate-400 gap-1.5">
                    <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                    <span className="text-xs">Carregando...</span>
                  </div>
                ) : colTasks.length === 0 ? (
                  <div
                    className={`flex items-center justify-center py-8 border border-dashed rounded-xl text-center text-xs ${
                      isDarkMode
                        ? 'border-slate-800 text-slate-600'
                        : 'border-slate-200 text-slate-400'
                    }`}
                  >
                    Vazio
                  </div>
                ) : (
                  colTasks.map((task) => (
                    <div
                      key={task.id}
                      className={`border rounded-xl p-3 shadow-xs transition-all space-y-2 ${
                        isDarkMode
                          ? 'bg-slate-950/80 border-slate-800 text-slate-200'
                          : 'bg-white border-[#e2e8f0] text-slate-800'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4
                          className={`text-xs font-bold leading-snug break-words ${
                            task.done ? 'line-through text-slate-400' : ''
                          }`}
                        >
                          {task.name}
                        </h4>
                        <button
                          type="button"
                          onClick={() => handleDeleteTask(task.id)}
                          className="text-slate-300 hover:text-rose-500 cursor-pointer p-0.5 shrink-0 transition-colors"
                          title="Excluir tarefa"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>

                      {task.description && (
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 line-clamp-2">
                          {task.description}
                        </p>
                      )}

                      {/* Ações de movimentação */}
                      <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800/80 text-[10px]">
                        {col.id === 'todo' && (
                          <div className="flex items-center justify-end w-full">
                            <button
                              type="button"
                              onClick={() => handleMoveColumn(task, 'in_progress')}
                              className="inline-flex items-center gap-1 font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                            >
                              <span>Em Progresso</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                        )}

                        {col.id === 'in_progress' && (
                          <div className="flex items-center justify-between w-full">
                            <button
                              type="button"
                              onClick={() => handleMoveColumn(task, 'todo')}
                              className="inline-flex items-center gap-1 font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
                            >
                              <ArrowLeft className="w-3 h-3" />
                              <span>A Fazer</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveColumn(task, 'done')}
                              className="inline-flex items-center gap-1 font-semibold text-emerald-600 hover:text-emerald-800 cursor-pointer"
                            >
                              <span>Concluído</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                        )}

                        {col.id === 'done' && (
                          <div className="flex items-center justify-start w-full">
                            <button
                              type="button"
                              onClick={() => handleMoveColumn(task, 'in_progress')}
                              className="inline-flex items-center gap-1 font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                            >
                              <ArrowLeft className="w-3 h-3" />
                              <span>Retornar a Progresso</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal para criar tarefa no Kanban com coluna selecionada */}
      <TaskFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialModelId={modelId}
        initialColumnId={modalInitialColumn}
        availableModels={[modelInstance]}
        onTaskCreated={() => fetchTasks()}
        onTaskSaved={() => fetchTasks()}
        lockModel={true}
        isDarkMode={isDarkMode}
      />
    </div>
  );
}
