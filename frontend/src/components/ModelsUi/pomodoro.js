import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Clock, Sparkles, CheckCircle2, Flame, Coffee } from 'lucide-react';

export default function Pomodoro() {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [initialMinutes, setInitialMinutes] = useState(25);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState('focus'); // 'focus' | 'shortBreak' | 'longBreak'
  const [cyclesCompleted, setCyclesCompleted] = useState(0);
  const [focusIntention, setFocusIntention] = useState('');
  const [isEditingIntention, setIsEditingIntention] = useState(false);

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
          setIsRunning(false);
          if (mode === 'focus') {
            setCyclesCompleted((prev) => prev + 1);
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
  }, [isRunning, minutes, seconds, mode]);

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
  const progressPercent = totalSeconds > 0 ? Math.min(100, Math.max(0, ((totalSeconds - remainingSeconds) / totalSeconds) * 100)) : 0;

  return (
    <div className="w-full h-full flex-1 flex flex-col justify-between bg-[#1E1414] p-4 sm:p-6 lg:p-8 min-h-0 overflow-y-auto">
      {/* Top Bar: Intention + Cycle count (Title removed for maximum workspace) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="bg-[#251818] border border-[#3D2B2B] rounded-xl px-4 py-2.5 flex items-center justify-between gap-3 text-xs sm:text-sm flex-1 shadow-sm">
          <div className="flex items-center gap-2 truncate flex-1">
            <span className="text-[#A67C52] font-semibold shrink-0 flex items-center gap-1.5 text-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#A67C52]" /> Foco Atual:
            </span>
            {isEditingIntention ? (
              <input
                type="text"
                value={focusIntention}
                onChange={(e) => setFocusIntention(e.target.value)}
                placeholder="Ex: Escrever rascunho do relatório..."
                className="bg-transparent border-none text-[#F5E6DA] text-xs sm:text-sm outline-none w-full placeholder-[#6D5A5A]"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') setIsEditingIntention(false);
                }}
              />
            ) : (
              <span className="text-[#F5E6DA] truncate italic text-xs sm:text-sm">
                {focusIntention || 'Clique para definir o objetivo deste bloco'}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => setIsEditingIntention(!isEditingIntention)}
            className="text-xs text-[#A67C52] hover:text-[#F5E6DA] underline cursor-pointer shrink-0 font-medium"
          >
            {isEditingIntention ? 'Salvar' : focusIntention ? 'Alterar' : '+ Definir'}
          </button>
        </div>

        <div className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-[#251818] border border-[#3D2B2B] text-[#D1BFA5] shrink-0 shadow-sm">
          <Flame className="w-4 h-4 text-[#A67C52]" />
          <span>{cyclesCompleted} {cyclesCompleted === 1 ? 'ciclo concluído' : 'ciclos concluídos'}</span>
        </div>
      </div>

      {/* Interval preset selectors */}
      <div className="flex flex-wrap justify-center gap-2 my-2">
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

      {/* Balanced Circular Display */}
      <div className="relative w-52 h-52 sm:w-60 sm:h-60 md:w-64 md:h-64 mx-auto my-3 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full border-4 border-[#3D2B2B] bg-[#251818] shadow-inner"></div>
        {isRunning && (
          <div className="absolute inset-0 rounded-full bg-[#800020]/25 blur-lg animate-pulse"></div>
        )}

        <div className="relative z-10 text-center flex flex-col items-center">
          <span className="text-5xl sm:text-6xl font-mono font-bold tracking-tight text-[#F5E6DA]">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-[#A67C52] mt-2 flex items-center gap-1.5">
            {isRunning ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                <span>{mode === 'focus' ? 'Hiperfoco Ativo' : 'Tempo de Descanso'}</span>
              </>
            ) : (
              'Pronto para Começar'
            )}
          </span>
          <span className="text-xs text-[#D1BFA5] font-mono mt-1 font-semibold">
            {Math.round(progressPercent)}% decorrido
          </span>
        </div>
      </div>

      {/* Action Controls */}
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

      {/* ADHD Tip Bar */}
      <div className="bg-[#251818]/90 border border-[#3D2B2B] rounded-xl px-4 py-2 text-xs text-[#D1BFA5] flex items-center gap-2">
        <CheckCircle2 className="w-3.5 h-3.5 text-[#A67C52] shrink-0" />
        <p className="truncate">
          <strong className="text-[#F5E6DA]">Dica TDAH:</strong> Começar é a parte mais difícil. 15 minutos são suficientes para vencer a inércia.
        </p>
      </div>
    </div>
  );
}
