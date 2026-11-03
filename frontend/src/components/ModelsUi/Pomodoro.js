import React, { useState, useEffect, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Flame,
  Coffee,
  Search,
  Target,
  X,
  Sliders,
  Plus,
  Minus,
} from 'lucide-react';
import { apiFetch } from '../../utils/api.js';
import {
  getPomodoroState,
  startPomodoro,
  pausePomodoro,
  resetPomodoro,
  setPomodoroDuration,
  setPomodoroSelectedTask,
  clearCompletedNotice,
} from '../../utils/pomodoroManager.js';

export default function Pomodoro({ modelInstance, isDarkMode = false }) {
  const modelId = modelInstance?.id || 'default';
  const displayName = modelInstance?.name || 'Pomodoro';

  // Carrega estado persistido
  const [pomodoroState, setPomodoroState] = useState(() => getPomodoroState(modelId));

  // Modal para configurar tempo personalizado
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [customMinutesInput, setCustomMinutesInput] = useState(
    pomodoroState.initialMinutes || 25
  );

  // Busca tarefas para associar
  const [allTasks, setAllTasks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showTaskDropdown, setShowTaskDropdown] = useState(false);

  // Sincroniza estado com localStorage ao trocar de modelo ou montar
  useEffect(() => {
    const currentState = getPomodoroState(modelId);
    setPomodoroState(currentState);
    setCustomMinutesInput(currentState.initialMinutes || 25);
  }, [modelId]);

  // Listener para eventos em tempo real do timer (mesmo que venha do ticker global)
  useEffect(() => {
    const handleStateChanged = (e) => {
      if (e?.detail?.modelId === modelId && e?.detail?.state) {
        setPomodoroState(e.detail.state);
      }
    };

    const handleTick = (e) => {
      if (e?.detail?.modelId === modelId) {
        setPomodoroState((prev) => ({
          ...prev,
          remainingSeconds: e.detail.remainingSeconds,
          isRunning: e.detail.isRunning,
        }));
      }
    };

    const handleCompleted = (e) => {
      if (e?.detail?.modelId === modelId) {
        setPomodoroState(getPomodoroState(modelId));
      }
    };

    window.addEventListener('focusmod_pomodoro_state_changed', handleStateChanged);
    window.addEventListener('focusmod_pomodoro_tick', handleTick);
    window.addEventListener('focusmod_pomodoro_completed', handleCompleted);

    return () => {
      window.removeEventListener('focusmod_pomodoro_state_changed', handleStateChanged);
      window.removeEventListener('focusmod_pomodoro_tick', handleTick);
      window.removeEventListener('focusmod_pomodoro_completed', handleCompleted);
    };
  }, [modelId]);

  // Timer local para animação contínua quando a tela estiver visível e rodando
  useEffect(() => {
    let interval = null;
    if (pomodoroState.isRunning && pomodoroState.targetEndTime) {
      interval = setInterval(() => {
        const now = Date.now();
        const diff = Math.max(0, Math.round((pomodoroState.targetEndTime - now) / 1000));
        setPomodoroState((prev) => ({
          ...prev,
          remainingSeconds: diff,
        }));
      }, 500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [pomodoroState.isRunning, pomodoroState.targetEndTime]);

  // Busca tarefas do backend
  const fetchTasks = useCallback(async () => {
    try {
      const res = await apiFetch('/api/tasks');
      if (res.ok) {
        const data = await res.json();
        setAllTasks(data.tasks || []);
      }
    } catch (err) {
      console.error('Erro ao buscar tarefas para Pomodoro:', err);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    const handleTaskEvent = (e) => {
      fetchTasks();
      if (e?.detail?.id && e?.detail?.deleted) {
        if (pomodoroState.selectedTask?.id === e.detail.id) {
          setPomodoroSelectedTask(modelId, null);
        }
      }
    };
    window.addEventListener('focusmod_task_created', handleTaskEvent);
    window.addEventListener('focusmod_task_updated', handleTaskEvent);
    return () => {
      window.removeEventListener('focusmod_task_created', handleTaskEvent);
      window.removeEventListener('focusmod_task_updated', handleTaskEvent);
    };
  }, [fetchTasks, modelId, pomodoroState.selectedTask]);

  // Ações do usuário
  const toggleRunning = () => {
    if (pomodoroState.isRunning) {
      pausePomodoro(modelId);
    } else {
      startPomodoro(modelId);
    }
  };

  const handleReset = () => {
    resetPomodoro(modelId);
  };

  const handleSelectMode = (newMode, mins) => {
    setPomodoroDuration(modelId, mins, newMode);
  };

  const handleAdjustMinutes = (delta) => {
    const current = pomodoroState.initialMinutes || 25;
    const nextMins = Math.max(1, Math.min(180, current + delta));
    setPomodoroDuration(modelId, nextMins, pomodoroState.mode);
  };

  const handleSaveCustomMinutes = (e) => {
    e.preventDefault();
    const mins = parseInt(customMinutesInput, 10);
    if (!isNaN(mins) && mins >= 1 && mins <= 180) {
      setPomodoroDuration(modelId, mins, pomodoroState.mode);
      setIsCustomModalOpen(false);
    }
  };

  const handleSelectTask = (task) => {
    setPomodoroSelectedTask(modelId, task);
    setShowTaskDropdown(false);
    setSearchQuery('');
  };

  const handleClearTask = () => {
    setPomodoroSelectedTask(modelId, null);
  };

  const handleDismissNotice = () => {
    clearCompletedNotice(modelId);
  };

  const handleManualCompleteTask = async () => {
    if (!pomodoroState.selectedTask) return;
    const taskId = pomodoroState.selectedTask.id;
    try {
      await apiFetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ done: true }),
      });
      window.dispatchEvent(
        new CustomEvent('focusmod_task_updated', {
          detail: { id: taskId, done: true },
        })
      );
      setPomodoroSelectedTask(modelId, { ...pomodoroState.selectedTask, done: true });
    } catch (err) {
      console.error('Erro ao concluir tarefa no Pomodoro:', err);
    }
  };


  // Cálculos de tempo e progresso
  const totalSeconds = (pomodoroState.initialMinutes || 25) * 60;
  const remainingSeconds = Math.max(0, pomodoroState.remainingSeconds ?? totalSeconds);
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;

  const progressPercent =
    totalSeconds > 0
      ? Math.min(100, Math.max(0, ((totalSeconds - remainingSeconds) / totalSeconds) * 100))
      : 0;

  // Filtra tarefas pela busca
  const filteredTasks = allTasks.filter((t) =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      className={`w-full h-full flex-1 flex flex-col justify-between p-4 sm:p-6 lg:p-8 min-h-0 overflow-y-auto gap-3 transition-colors ${
        isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-[#ebf0f5] text-slate-800'
      }`}
    >
      {/* Aviso de conclusão de ciclo / descanso */}
      {pomodoroState.completedNotice && (
        <div
          className={`px-4 py-3 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-between shadow-md border ${
            isDarkMode
              ? 'bg-emerald-950/70 border-emerald-800 text-emerald-200'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
            <span>{pomodoroState.completedNotice}</span>
          </div>
          <button
            type="button"
            onClick={handleDismissNotice}
            className={`p-1 rounded-lg ${
              isDarkMode
                ? 'hover:bg-emerald-900 text-emerald-300'
                : 'hover:bg-emerald-100 text-emerald-700'
            }`}
          >
            ✕
          </button>
        </div>
      )}

      {/* Top Header: Tarefa Selecionada e Contador de Ciclos */}
      <div
        className={`border rounded-2xl p-4 shadow-xs space-y-3 transition-colors ${
          isDarkMode
            ? 'bg-slate-900 border-slate-800'
            : 'bg-[#f4f7fa] border-[#d3dce6]'
        }`}
      >
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Tarefa em Foco:
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold border ${
                isDarkMode
                  ? 'bg-slate-800 border-slate-700 text-slate-300'
                  : 'bg-[#e8edf2] border-[#d3dce6] text-slate-700'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              <span>
                {pomodoroState.cyclesCompleted || 0}{' '}
                {pomodoroState.cyclesCompleted === 1 ? 'ciclo concluído' : 'ciclos'}
              </span>
            </div>
          </div>
        </div>

        {/* Barra de Tarefa Selecionada ou Campo de Busca */}
        {pomodoroState.selectedTask ? (
          <div
            className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
              isDarkMode
                ? 'bg-emerald-950/30 border-emerald-800'
                : 'bg-emerald-50/70 border-emerald-200'
            }`}
          >
            <div className="flex items-center gap-2.5 truncate">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
              <div className="truncate">
                <p
                  className={`text-xs sm:text-sm font-bold truncate ${
                    pomodoroState.selectedTask.done
                      ? 'line-through text-slate-400'
                      : isDarkMode
                      ? 'text-emerald-100'
                      : 'text-emerald-950'
                  }`}
                >
                  {pomodoroState.selectedTask.name}
                </p>
                <p className="text-[10px] text-emerald-600">
                  {pomodoroState.selectedTask.done
                    ? 'Tarefa concluída!'
                    : 'Focando nesta tarefa (conclusão manual opcional)'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {!pomodoroState.selectedTask.done && (
                <button
                  type="button"
                  onClick={handleManualCompleteTask}
                  className="px-2.5 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600 shadow-2xs"
                  title="Marcar tarefa como concluída"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Concluir</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleClearTask}
                className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 shrink-0 transition-colors cursor-pointer ${
                  isDarkMode
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                    : 'bg-[#ffffff] hover:bg-slate-100 text-slate-700 border-[#d3dce6]'
                }`}
                title="Trocar tarefa"
              >
                <X className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Trocar</span>
              </button>
            </div>
          </div>
        ) : (

          <div className="relative">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onFocus={() => setShowTaskDropdown(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowTaskDropdown(true);
                }}
                placeholder={
                  allTasks.length > 0
                    ? 'Pesquisar e selecionar uma tarefa para focar...'
                    : 'Nenhuma tarefa cadastrada ainda. Adicione pelo botão (+)'
                }
                className={`w-full pl-9 pr-4 py-2.5 rounded-xl text-xs sm:text-sm outline-none border transition-colors ${
                  isDarkMode
                    ? 'bg-slate-950 border-slate-800 text-slate-100 placeholder-slate-500 focus:border-[#1d56af]'
                    : 'bg-[#e8edf2] border-[#d3dce6] text-slate-900 placeholder-slate-400 focus:border-[#1d56af] focus:bg-[#ffffff]'
                }`}
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            </div>

            {/* Dropdown de tarefas disponíveis */}
            {showTaskDropdown && (
              <div
                className={`absolute top-full left-0 right-0 mt-1.5 rounded-xl shadow-xl z-30 max-h-56 overflow-y-auto p-1.5 space-y-1 border ${
                  isDarkMode
                    ? 'bg-slate-900 border-slate-800 text-slate-100'
                    : 'bg-[#f4f7fa] border-[#d3dce6] text-slate-900'
                }`}
              >
                <div
                  className={`flex items-center justify-between px-2.5 py-1 text-[11px] border-b ${
                    isDarkMode ? 'border-slate-800 text-slate-400' : 'border-[#d3dce6] text-slate-500'
                  }`}
                >
                  <span>Tarefas Disponíveis</span>
                  <button
                    type="button"
                    onClick={() => setShowTaskDropdown(false)}
                    className="hover:underline cursor-pointer"
                  >
                    Fechar
                  </button>
                </div>

                {filteredTasks.length === 0 ? (
                  <div className="p-3 text-center text-xs text-slate-400">
                    Nenhuma tarefa pendente encontrada. Use o botão (+) para criar uma!
                  </div>
                ) : (
                  filteredTasks.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => handleSelectTask(t)}
                      className={`w-full p-2.5 rounded-lg text-left flex items-center justify-between text-xs transition-colors cursor-pointer ${
                        t.done
                          ? 'opacity-50 line-through text-slate-400'
                          : isDarkMode
                          ? 'hover:bg-slate-800 text-slate-100'
                          : 'hover:bg-[#e8edf2] text-slate-900'
                      }`}
                    >
                      <span className="truncate font-medium">{t.name}</span>
                      {t.done && <span className="text-[10px] text-emerald-500">Concluída</span>}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Seletor de Modos Predefinidos (Salvos e Mantidos) */}
      <div className="flex flex-col items-center gap-2 my-1">
        <div className="flex flex-wrap justify-center gap-2">
          {[
            { label: '15m (Rápido)', mins: 15, m: 'focus' },
            { label: '25m (Padrão)', mins: 25, m: 'focus' },
            { label: '45m (Profundo)', mins: 45, m: 'focus' },
            { label: 'Pausa 5m', mins: 5, m: 'shortBreak', icon: Coffee },
            { label: 'Pausa 15m', mins: 15, m: 'longBreak', icon: Coffee },
          ].map((preset) => {
            const isSelected =
              pomodoroState.mode === preset.m &&
              pomodoroState.initialMinutes === preset.mins;
            const IconComponent = preset.icon;

            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => handleSelectMode(preset.m, preset.mins)}
                className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
                  isSelected
                    ? 'bg-[#1d56af] text-white shadow-sm ring-2 ring-[#1d56af]/30'
                    : isDarkMode
                    ? 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-750'
                    : 'bg-[#f4f7fa] text-slate-700 border border-[#d3dce6] hover:bg-[#e8edf2]'
                }`}
              >
                {IconComponent && <IconComponent className="w-3.5 h-3.5" />}
                <span>{preset.label}</span>
              </button>
            );
          })}
        </div>

        {/* Ajuste Fino e Tempo Personalizado */}
        <div className="flex items-center gap-2 text-xs">
          <button
            type="button"
            disabled={pomodoroState.isRunning}
            onClick={() => handleAdjustMinutes(-5)}
            className="px-2.5 py-1 rounded-lg border flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-40 shadow-2xs font-semibold bg-white border-[#d3dce6] text-slate-700 hover:bg-[#e8edf2] dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
            title="Diminuir 5 minutos"
          >
            <Minus className="w-3 h-3" />
            <span>5m</span>
          </button>

          <button
            type="button"
            disabled={pomodoroState.isRunning}
            onClick={() => handleAdjustMinutes(5)}
            className="px-2.5 py-1 rounded-lg border flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-40 shadow-2xs font-semibold bg-white border-[#d3dce6] text-slate-700 hover:bg-[#e8edf2] dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
            title="Aumentar 5 minutos"
          >
            <Plus className="w-3 h-3" />
            <span>5m</span>
          </button>

          <button
            type="button"
            disabled={pomodoroState.isRunning}
            onClick={() => {
              setCustomMinutesInput(pomodoroState.initialMinutes || 25);
              setIsCustomModalOpen(true);
            }}
            className="px-3 py-1 rounded-lg border flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40 shadow-2xs font-semibold bg-[#e3edfa] border-[#a3c5ed] text-[#124286] hover:bg-[#d4e4f7] dark:bg-blue-950/70 dark:border-blue-800 dark:text-blue-200"
            title="Definir tempo em minutos exatos"
          >
            <Sliders className="w-3 h-3" />
            <span>Configurar tempo ({pomodoroState.initialMinutes}m)</span>
          </button>
        </div>
      </div>

      {/* Relógio Principal do Cronômetro */}
      <div className="relative w-52 h-52 sm:w-60 sm:h-60 md:w-64 md:h-64 mx-auto my-2 flex items-center justify-center">
        {/* Anel de fundo com borda proporcional */}
        <div
          className={`absolute inset-0 rounded-full border-4 shadow-xs transition-colors ${
            isDarkMode ? 'border-slate-800 bg-slate-900' : 'border-[#d3dce6] bg-[#f4f7fa]'
          }`}
        />

        <div className="relative z-10 text-center flex flex-col items-center px-4">
          <span
            className={`text-5xl sm:text-6xl font-mono font-bold tracking-tight ${
              isDarkMode ? 'text-white' : 'text-slate-900'
            }`}
          >
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </span>

          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 mt-2 flex items-center gap-1.5">
            {pomodoroState.isRunning ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>
                  {pomodoroState.mode === 'focus' ? 'Hiperfoco Ativo' : 'Tempo de Descanso'}
                </span>
              </>
            ) : (
              'Pronto para Começar'
            )}
          </span>

          {pomodoroState.selectedTask && (
            <span
              className={`text-xs truncate max-w-[200px] mt-1 font-medium ${
                isDarkMode ? 'text-slate-300' : 'text-slate-600'
              }`}
            >
              🎯 {pomodoroState.selectedTask.name}
            </span>
          )}

          <span className="text-[11px] text-slate-400 font-mono mt-1 font-semibold">
            {Math.round(progressPercent)}% decorrido
          </span>
        </div>
      </div>

      {/* Controles do Cronômetro */}
      <div className="flex items-center justify-center gap-3.5 my-2">
        <button
          type="button"
          onClick={toggleRunning}
          className={`px-8 sm:px-10 py-3 rounded-xl font-bold text-sm sm:text-base flex items-center gap-2.5 shadow-md transition-all transform active:scale-95 cursor-pointer ${
            pomodoroState.isRunning
              ? isDarkMode
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700'
                : 'bg-slate-200 hover:bg-slate-300 text-slate-800'
              : 'bg-[#1d56af] hover:bg-[#16438a] text-white'
          }`}
        >
          {pomodoroState.isRunning ? (
            <>
              <Pause className="w-4 h-4 fill-current" />
              <span>Pausar</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>Iniciar Foco</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={handleReset}
          className={`p-3 rounded-xl border transition-colors cursor-pointer shadow-xs ${
            isDarkMode
              ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
              : 'bg-[#f4f7fa] hover:bg-[#e8edf2] text-slate-700 border-[#d3dce6]'
          }`}
          title="Reiniciar para o tempo configurado"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Modal de Tempo Personalizado */}
      {isCustomModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-[2px] animate-in fade-in duration-150"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsCustomModalOpen(false);
          }}
        >
          <div
            className={`w-full max-w-sm rounded-2xl border p-5 shadow-2xl space-y-4 ${
              isDarkMode
                ? 'bg-slate-900 border-slate-800 text-slate-100'
                : 'bg-[#f4f7fa] border-[#d3dce6] text-slate-900'
            }`}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm sm:text-base flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#1d56af]" />
                <span>Configurar Tempo do Pomodoro</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsCustomModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Defina a duração desejada em minutos (entre 1 e 180 min). Esse valor será salvo e mantido mesmo ao navegar por outros modelos.
            </p>

            <form onSubmit={handleSaveCustomMinutes} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Minutos:
                </label>
                <input
                  type="number"
                  min="1"
                  max="180"
                  required
                  value={customMinutesInput}
                  onChange={(e) => setCustomMinutesInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-sm font-mono border border-[#d3dce6] focus:border-[#1d56af] focus:outline-none bg-white dark:bg-slate-950 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#d3dce6] dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCustomModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-xl border border-[#d3dce6] hover:bg-slate-200 dark:border-slate-700 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold rounded-xl bg-[#1d56af] hover:bg-[#16438a] text-white cursor-pointer shadow-xs"
                >
                  Salvar Tempo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
