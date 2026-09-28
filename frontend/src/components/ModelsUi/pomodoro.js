import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Clock, Sparkles, CheckCircle2, Flame, Coffee } from 'lucide-react';

export default function Pomodoro({ title = 'Pomodoro Adaptativo' }) {
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
    <div className="w-full max-w-xl mx-auto flex flex-col justify-center gap-3">
      {/* Compact Header */}
      <div className="bg-[#251818] border border-[#3D2B2B] rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col gap-3">
        <div className="flex items-center justify-between border-b border-[#3D2B2B] pb-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#800020]/30 border border-[#800020] flex items-center justify-center text-[#F5E6DA]">
              <Clock className="w-4 h-4 text-[#A67C52]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#F5E6DA] leading-tight">{title}</h2>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#3D2B2B] text-[#D1BFA5]">
            <Flame className="w-3.5 h-3.5 text-[#A67C52]" />
            <span>{cyclesCompleted} ciclos</span>
          </div>
        </div>

        {/* Intention bar */}
        <div className="bg-[#1E1414] border border-[#3D2B2B] rounded-xl px-3 py-1.5 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 truncate">
            <span className="text-[#A67C52] font-semibold shrink-0 flex items-center gap-1 text-[11px]">
              <Sparkles className="w-3 h-3" /> Foco:
            </span>
            {isEditingIntention ? (
              <input
                type="text"
                value={focusIntention}
                onChange={(e) => setFocusIntention(e.target.value)}
                placeholder="Ex: Escrever rascunho do texto..."
                className="bg-transparent border-none text-[#F5E6DA] text-xs outline-none w-full"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') setIsEditingIntention(false);
                }}
              />
            ) : (
              <span className="text-[#F5E6DA] truncate italic text-xs">
                {focusIntention || 'Clique para definir objetivo do ciclo'}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => setIsEditingIntention(!isEditingIntention)}
            className="text-[10px] text-[#A67C52] hover:text-[#F5E6DA] underline cursor-pointer shrink-0 font-medium"
          >
            {isEditingIntention ? 'Salvar' : focusIntention ? 'Trocar' : '+ Definir'}
          </button>
        </div>

        {/* Interval preset selectors */}
        <div className="flex flex-wrap justify-center gap-1.5">
          {[
            { label: '15m', mins: 15, m: 'focus' },
            { label: '25m (Padrão)', mins: 25, m: 'focus' },
            { label: '45m', mins: 45, m: 'focus' },
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
                className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                  isSelected
                    ? preset.m === 'focus'
                      ? 'bg-[#800020] text-[#F5E6DA] shadow-md ring-1 ring-[#800020]'
                      : 'bg-[#A67C52] text-[#1E1414] shadow-md ring-1 ring-[#A67C52]'
                    : 'bg-[#1E1414] text-[#D1BFA5] border border-[#3D2B2B] hover:bg-[#2D1F1F]'
                }`}
              >
                {IconComponent && <IconComponent className="w-3 h-3" />}
                <span>{preset.label}</span>
              </button>
            );
          })}
        </div>

        {/* Compact Circular Display */}
        <div className="relative w-36 h-36 sm:w-40 sm:h-40 mx-auto my-1 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-4 border-[#3D2B2B] bg-[#1E1414]"></div>
          {isRunning && (
            <div className="absolute inset-0 rounded-full bg-[#800020]/20 blur-md animate-pulse"></div>
          )}

          <div className="relative z-10 text-center flex flex-col items-center">
            <span className="text-3xl sm:text-4xl font-mono font-bold tracking-tight text-[#F5E6DA]">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#A67C52] mt-1 flex items-center gap-1">
              {isRunning ? (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                  {mode === 'focus' ? 'Hiperfoco' : 'Pausa'}
                </>
              ) : (
                'Pronto'
              )}
            </span>
            <span className="text-[10px] text-[#6D5A5A] font-mono">
              {Math.round(progressPercent)}%
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={toggleRunning}
            className={`px-6 py-2 rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg transition-all transform active:scale-95 cursor-pointer ${
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
            className="p-2 rounded-xl bg-[#1E1414] hover:bg-[#2D1F1F] text-[#D1BFA5] hover:text-[#F5E6DA] border border-[#3D2B2B] transition-colors cursor-pointer"
            title="Reiniciar Cronômetro"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Compact ADHD Tip Bar */}
      <div className="bg-[#251818]/80 border border-[#3D2B2B] rounded-xl px-3 py-1.5 text-[11px] text-[#D1BFA5] flex items-center gap-2">
        <CheckCircle2 className="w-3.5 h-3.5 text-[#A67C52] shrink-0" />
        <p className="truncate">
          <strong className="text-[#F5E6DA]">Dica TDAH:</strong> 15 minutos são suficientes para superar a inércia e ativar a dopamina.
        </p>
      </div>
    </div>
  );
}
