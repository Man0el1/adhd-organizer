import React, { useState, useEffect, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Flame,
  Coffee,
  Search,
  Check,
  Target,
  X
} from 'lucide-react';

export default function Pomodoro({ modelInstance }) {
  const displayName = modelInstance?.name || 'Pomodoro';
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [initialMinutes, setInitialMinutes] = useState(25);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState('focus'); // 'focus' | 'shortBreak' | 'longBreak'
  const [cyclesCompleted, setCyclesCompleted] = useState(0);

  // Selected task to work on
  const [allTasks, setAllTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showTaskDropdown, setShowTaskDropdown] = useState(false);
  const [completedNotice, setCompletedNotice] = useState('');

  // Fetch all tasks from backend
  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch('/api/tasks');
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
        setSelectedTask((prev) => (prev?.id === e.detail.id ? null : prev));
      }
    };
    window.addEventListener('focusmod_task_created', handleTaskEvent);
    window.addEventListener('focusmod_task_updated', handleTaskEvent);
    return () => {
      window.removeEventListener('focusmod_task_created', handleTaskEvent);
      window.removeEventListener('focusmod_task_updated', handleTaskEvent);
    };
  }, [fetchTasks]);

  // Handle timer countdown
  useEffect(() => {
    let timer = null;
    if (isRunning) {
      timer = setInterval(() => {
        if (seconds > 0) {
          setSeconds((s) => s - 1);
        } else if (minutes > 0) {
          setMinutes((m) => m - 1);
          setSeconds(59);
        } else {
          // Timer finished!
          setIsRunning(false);

          if (mode === 'focus') {
            setCyclesCompleted((prev) => prev + 1);

            // AUTOMATIC TASK COMPLETION:
            // When pomodoro finishes in focus mode, automatically complete the selected task in backend
            if (selectedTask) {
              fetch(`/api/tasks/${selectedTask.id}/complete`, { method: 'PATCH' })
                .then(() => {
                  window.dispatchEvent(
                    new CustomEvent('focusmod_task_updated', {
                      detail: { id: selectedTask.id, done: true },
                    })
                  );
                })
                .catch((err) => console.error('Erro ao concluir tarefa automaticamente:', err));

              setCompletedNotice(
                `🎉 Pomodoro finalizado! A tarefa "${selectedTask.name}" foi marcada como concluída!`
              );
              setTimeout(() => setCompletedNotice(''), 6000);
            }

            setMode('shortBreak');
            setMinutes(5);
            setInitialMinutes(5);
            setSeconds(0);
          } else {
            setMode('focus');
            setMinutes(25);
            setInitialMinutes(25);
            setSeconds(0);
          }
        }
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRunning, minutes, seconds, mode, selectedTask]);

  const handleSelectMode = (newMode, mins) => {
    setIsRunning(false);
    setMode(newMode);
    setMinutes(mins);
    setInitialMinutes(mins);
    setSeconds(0);
  };

  const handleReset = () => {
    setIsRunning(false);
    setMinutes(initialMinutes);
    setSeconds(0);
  };

  const toggleRunning = () => {
    setIsRunning(!isRunning);
  };

  const totalSeconds = initialMinutes * 60;
  const remainingSeconds = minutes * 60 + seconds;
  const progressPercent =
    totalSeconds > 0
      ? Math.min(100, Math.max(0, ((totalSeconds - remainingSeconds) / totalSeconds) * 100))
      : 0;

  // Filter tasks by search query
  const filteredTasks = allTasks.filter((t) =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full h-full flex-1 flex flex-col justify-between bg-[#1E1414] p-4 sm:p-6 lg:p-8 min-h-0 overflow-y-auto gap-3">
      {/* Auto-completion banner */}
      {completedNotice && (
        <div className="bg-emerald-950/80 border border-emerald-600/70 text-emerald-200 px-4 py-3 rounded-2xl text-xs sm:text-sm font-semibold flex items-center justify-between shadow-xl animate-in fade-in slide-in-from-top">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{completedNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setCompletedNotice('')}
            className="p-1 hover:bg-emerald-900 rounded-lg text-emerald-300"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top Header: Select / Search Task */}
      <div className="bg-[#251818] border border-[#3D2B2B] rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-[#A67C52]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#A67C52]">
              Tarefa em Foco:
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-[#1E1414] border border-[#3D2B2B] text-[#D1BFA5]">
              <Flame className="w-3.5 h-3.5 text-[#A67C52]" />
              <span>{cyclesCompleted} {cyclesCompleted === 1 ? 'ciclo concluído' : 'ciclos'}</span>
            </div>
          </div>
        </div>

        {/* Selected Task Bar or Search Box */}
        {selectedTask ? (
          <div className="p-3 rounded-xl bg-[#1E1414] border border-[#800020] flex items-center justify-between gap-3 shadow-inner">
            <div className="flex items-center gap-2.5 truncate">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0 animate-pulse" />
              <div className="truncate">
                <p className="text-xs sm:text-sm font-bold text-[#F5E6DA] truncate">
                  {selectedTask.name}
                </p>
                <p className="text-[10px] text-[#A67C52]">
                  Será marcada como concluída automaticamente ao término do tempo!
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedTask(null)}
              className="p-1.5 rounded-lg bg-[#251818] hover:bg-[#800020] text-[#D1BFA5] hover:text-[#F5E6DA] transition-colors cursor-pointer text-xs flex items-center gap-1 shrink-0"
              title="Trocar tarefa"
            >
              <X className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Trocar</span>
            </button>
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
                className="w-full pl-9 pr-4 py-2.5 bg-[#1E1414] border border-[#3D2B2B] focus:border-[#800020] rounded-xl text-xs sm:text-sm text-[#F5E6DA] placeholder-[#6D5A5A] outline-none shadow-sm"
              />
              <Search className="w-4 h-4 text-[#A67C52] absolute left-3 top-3 pointer-events-none" />
            </div>

            {/* Dropdown list of tasks */}
            {showTaskDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-[#251818] border border-[#3D2B2B] rounded-xl shadow-2xl z-30 max-h-56 overflow-y-auto p-1.5 space-y-1">
                <div className="flex items-center justify-between px-2.5 py-1 text-[11px] text-[#A67C52] border-b border-[#3D2B2B]">
                  <span>Tarefas Disponíveis</span>
                  <button
                    type="button"
                    onClick={() => setShowTaskDropdown(false)}
                    className="hover:text-[#F5E6DA]"
                  >
                    Fechar
                  </button>
                </div>

                {filteredTasks.length === 0 ? (
                  <div className="p-3 text-center text-xs text-[#6D5A5A]">
                    Nenhuma tarefa pendente encontrada. Use o botão (+) para criar uma!
                  </div>
                ) : (
                  filteredTasks.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        setSelectedTask(t);
                        setShowTaskDropdown(false);
                        setSearchQuery('');
                      }}
                      className={`w-full p-2.5 rounded-lg text-left flex items-center justify-between text-xs transition-colors cursor-pointer ${
                        t.done
                          ? 'opacity-50 line-through text-[#6D5A5A] hover:bg-[#1E1414]'
                          : 'text-[#F5E6DA] hover:bg-[#800020] hover:text-[#F5E6DA]'
                      }`}
                    >
                      <span className="truncate font-medium">{t.name}</span>
                      {t.done && <span className="text-[10px] text-emerald-400">Concluída</span>}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Preset Modes */}
      <div className="flex flex-wrap justify-center gap-2 my-1">
        {[
          { label: '15m (Rápido)', mins: 15, m: 'focus' },
          { label: '25m (Padrão)', mins: 25, m: 'focus' },
          { label: '45m (Profundo)', mins: 45, m: 'focus' },
          { label: 'Pausa 5m', mins: 5, m: 'shortBreak', icon: Coffee },
          { label: 'Pausa 15m', mins: 15, m: 'longBreak', icon: Coffee },
        ].map((preset) => {
          const isSelected = mode === preset.m && initialMinutes === preset.mins;
          const IconComponent = preset.icon;
          return (
            <button
              key={preset.label}
              type="button"
              onClick={() => handleSelectMode(preset.m, preset.mins)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm ${
                isSelected
                  ? preset.m === 'focus'
                    ? 'bg-[#800020] text-[#F5E6DA] shadow-md ring-2 ring-[#800020]'
                    : 'bg-[#A67C52] text-[#1E1414] shadow-md ring-2 ring-[#A67C52]'
                  : 'bg-[#251818] text-[#D1BFA5] border border-[#3D2B2B] hover:bg-[#322020]'
              }`}
            >
              {IconComponent && <IconComponent className="w-3.5 h-3.5" />}
              <span>{preset.label}</span>
            </button>
          );
        })}
      </div>

      {/* Clock Circle */}
      <div className="relative w-52 h-52 sm:w-60 sm:h-60 md:w-64 md:h-64 mx-auto my-2 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full border-4 border-[#3D2B2B] bg-[#251818] shadow-inner" />
        {isRunning && (
          <div className="absolute inset-0 rounded-full bg-[#800020]/25 blur-lg animate-pulse" />
        )}

        <div className="relative z-10 text-center flex flex-col items-center px-4">
          <span className="text-5xl sm:text-6xl font-mono font-bold tracking-tight text-[#F5E6DA]">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-[#A67C52] mt-2 flex items-center gap-1.5">
            {isRunning ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>{mode === 'focus' ? 'Hiperfoco Ativo' : 'Tempo de Descanso'}</span>
              </>
            ) : (
              'Pronto para Começar'
            )}
          </span>
          {selectedTask && (
            <span className="text-xs text-[#D1BFA5] truncate max-w-[200px] mt-1 font-medium">
              🎯 {selectedTask.name}
            </span>
          )}
          <span className="text-[11px] text-[#A67C52] font-mono mt-1 font-semibold">
            {Math.round(progressPercent)}% decorrido
          </span>
        </div>
      </div>

      {/* Timer Controls */}
      <div className="flex items-center justify-center gap-3.5 my-2">
        <button
          type="button"
          onClick={toggleRunning}
          className={`px-8 sm:px-10 py-3 rounded-xl font-bold text-sm sm:text-base flex items-center gap-2.5 shadow-lg transition-all transform active:scale-95 cursor-pointer ${
            isRunning
              ? 'bg-[#3D2B2B] hover:bg-[#4D3838] text-[#F5E6DA]'
              : 'bg-[#800020] hover:bg-[#A00028] text-[#F5E6DA]'
          }`}
        >
          {isRunning ? (
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
          className="p-3 rounded-xl bg-[#251818] hover:bg-[#322020] text-[#D1BFA5] hover:text-[#F5E6DA] border border-[#3D2B2B] transition-colors cursor-pointer shadow-md"
          title="Reiniciar Cronômetro"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
