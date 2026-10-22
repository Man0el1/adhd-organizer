import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Plus,
  CalendarDays,
  Calendar as CalendarIcon,
  Brain,
  Check,
  AlertCircle,
  CheckCircle2,
  Repeat,
  AlignLeft,
} from 'lucide-react';

const FALLBACK_SELECTABLE_MODELS = [
  {
    id: 'routine',
    name: 'Agenda Visual',
    shortName: 'Agenda Visual',
    type: 'routine',
    icon: CalendarIcon,
    iconColor: 'text-[#A67C52]',
    hint: 'Aparece nos blocos de tempo do dia',
  },
  {
    id: 'calendario',
    name: 'Calendário',
    shortName: 'Calendário',
    type: 'calendario',
    icon: CalendarDays,
    iconColor: 'text-[#800020]',
    hint: 'Aparece no grid mensal e visão de prazos',
  },
  {
    id: 'brain-dump',
    name: 'Brain Dump',
    shortName: 'Brain Dump',
    type: 'brain-dump',
    icon: Brain,
    iconColor: 'text-violet-400',
    hint: 'Aparece na lista de captura mental rápida',
  },
];

// Adiciona minutos a um horário no formato HH:MM
export function addMinutesToTime(timeStr, minutesToAdd = 1) {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':').map((v) => parseInt(v, 10));
  if (isNaN(h) || isNaN(m)) return timeStr;

  let totalMins = h * 60 + m + minutesToAdd;
  if (totalMins >= 24 * 60) {
    totalMins = 23 * 60 + 59;
  }
  const newH = String(Math.floor(totalMins / 60)).padStart(2, '0');
  const newM = String(totalMins % 60).padStart(2, '0');
  return `${newH}:${newM}`;
}

export default function FullScreenOverlay({
  isOpen,
  onClose,
  onTaskCreated,
  availableModels = [],
}) {
  // Constrói lista de modelos selecionáveis a partir das instâncias configuradas pelo usuário
  const selectableModels = useMemo(() => {
    if (availableModels && availableModels.length > 0) {
      // Pomodoro não recebe tarefas diretamente
      const filtered = availableModels.filter((m) => m.type !== 'pomodoro');
      if (filtered.length > 0) {
        return filtered.map((m) => {
          let icon = CalendarIcon;
          let iconColor = 'text-[#A67C52]';
          let hint = 'Blocos de tempo diários';

          if (m.type === 'calendario') {
            icon = CalendarDays;
            iconColor = 'text-[#800020]';
            hint = 'Grade de prazos e datas';
          } else if (m.type === 'brain-dump') {
            icon = Brain;
            iconColor = 'text-violet-400';
            hint = 'Anotação rápida';
          }

          return {
            id: m.id,
            name: m.name,
            type: m.type,
            icon,
            iconColor,
            hint,
          };
        });
      }
    }
    return FALLBACK_SELECTABLE_MODELS;
  }, [availableModels]);

  // Task basic fields
  const [taskName, setTaskName] = useState('');
  const [description, setDescription] = useState('');

  // Selected models — starts with all selectable models selected by default
  const [selectedModelIds, setSelectedModelIds] = useState([]);

  // Scheduling (Date, Start Time, End Time)
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const [date, setDate] = useState(todayStr);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');

  // Recurrence
  const [recurrence, setRecurrence] = useState('none');

  // Feedback
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Ajusta automaticamente o término quando o inicial for posterior ou igual
  const handleStartTimeChange = (val) => {
    setStartTime(val);
    if (val && endTime && val >= endTime) {
      setEndTime(addMinutesToTime(val, 1));
    }
  };

  const handleEndTimeChange = (val) => {
    if (startTime && val && startTime >= val) {
      setEndTime(addMinutesToTime(startTime, 1));
    } else {
      setEndTime(val);
    }
  };

  // Quando abre o overlay, reseta os campos e seleciona todos os modelos disponíveis
  useEffect(() => {
    if (isOpen) {
      setSelectedModelIds(selectableModels.map((m) => m.id));
      setErrorMsg('');
      setSuccessMsg('');
      setDate(new Date().toISOString().split('T')[0]);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [isOpen, selectableModels]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const toggleModelSelection = (modelId) => {
    if (selectedModelIds.includes(modelId)) {
      setSelectedModelIds(selectedModelIds.filter((id) => id !== modelId));
    } else {
      setSelectedModelIds([...selectedModelIds, modelId]);
    }
  };

  const hasCalendar = selectedModelIds.some((id) => {
    if (id === 'calendario' || id.includes('calendario')) return true;
    const match = selectableModels.find((m) => m.id === id);
    return match?.type === 'calendario';
  });

  const hasRoutine = selectedModelIds.some((id) => {
    if (id === 'routine' || id.includes('routine')) return true;
    const match = selectableModels.find((m) => m.id === id);
    return match?.type === 'routine';
  });

  const isStartTimeRequired = hasRoutine;
  const isDateRequired = hasCalendar || hasRoutine;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!taskName.trim()) {
      setErrorMsg('Por favor, informe o nome da tarefa.');
      return;
    }

    if (selectedModelIds.length === 0) {
      setErrorMsg('Selecione pelo menos um modelo para vincular a tarefa.');
      return;
    }

    if (isDateRequired && !date) {
      setErrorMsg('A data é obrigatória para os modelos selecionados.');
      return;
    }

    if (isStartTimeRequired && !startTime) {
      setErrorMsg('O horário de início é obrigatório quando a Agenda Visual está selecionada.');
      return;
    }

    // Regra: se horário inicial for depois ou igual ao final, ajusta para inicial + 1 minuto
    let finalEndTime = endTime;
    if (startTime && endTime && startTime >= endTime) {
      finalEndTime = addMinutesToTime(startTime, 1);
      setEndTime(finalEndTime);
    }

    setIsLoading(true);

    const payload = {
      name: taskName.trim(),
      description: description.trim(),
      notes: description.trim(),
      modelIds: selectedModelIds,
      date: isDateRequired ? date : null,
      startTime: startTime || null,
      endTime: finalEndTime || null,
      recurrence: recurrence || 'none',
    };

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Falha ao salvar tarefa no backend');
      }

      const data = await response.json();
      setSuccessMsg(`Tarefa "${data.task.name}" salva com sucesso!`);

      // Dispatch global event for instant reactive update across all tabs
      window.dispatchEvent(
        new CustomEvent('focusmod_task_created', { detail: data.task })
      );

      if (onTaskCreated) {
        onTaskCreated(data.task);
      }

      setTimeout(() => {
        setTaskName('');
        setDescription('');
        setSuccessMsg('');
        onClose();
      }, 700);
    } catch (err) {
      setErrorMsg(err.message || 'Erro de conexão com o backend.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Semi-transparent backdrop — background is still visible behind with blur */}
      <div
        className="fixed inset-0 bg-black/55 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Right Lateral Slide-over Panel covering full vertical height */}
      <div className="relative z-50 w-full sm:w-[480px] h-full bg-[#251818] border-l border-[#3D2B2B] shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-300">
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-[#3D2B2B] bg-[#1E1414] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#800020] text-[#F5E6DA] flex items-center justify-center font-bold shadow">
              <Plus className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-[#F5E6DA] leading-tight">
                Nova Tarefa
              </h2>
              <p className="text-[11px] text-[#A67C52] leading-tight">
                Sincronizada diretamente com o backend
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-[#A67C52] hover:text-[#F5E6DA] hover:bg-[#251818] transition-colors cursor-pointer"
            title="Fechar (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 min-h-0 text-[#F5E6DA]"
        >
          {/* Feedback Banners */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-950/80 border border-red-700/60 text-red-200 text-xs flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-600/70 text-emerald-200 text-xs flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Passo 1: Seleção de Modelos / Instâncias */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-[#A67C52] uppercase tracking-wider">
                1. Em quais modelos adicionar? <span className="text-red-400">*</span>
              </label>
              <span className="text-[10px] text-[#A67C52] font-mono">
                {selectedModelIds.length} selecionado(s)
              </span>
            </div>
            <p className="text-[11px] text-[#A67C52]/90 leading-tight">
              Todos começam selecionados. Desmarque caso não queira que a tarefa apareça naquele modelo:
            </p>

            <div className="grid grid-cols-1 gap-2 pt-1 max-h-48 overflow-y-auto pr-1">
              {selectableModels.map((mod) => {
                const Icon = mod.icon;
                const isChecked = selectedModelIds.includes(mod.id);

                return (
                  <button
                    key={mod.id}
                    type="button"
                    onClick={() => toggleModelSelection(mod.id)}
                    className={`px-3.5 py-2.5 rounded-xl border text-left cursor-pointer transition-all flex items-center justify-between gap-3 ${
                      isChecked
                        ? 'bg-[#2D1F1F] border-[#800020] text-[#F5E6DA] shadow-sm ring-1 ring-[#800020]/50'
                        : 'bg-[#1A1010] border-[#3D2B2B] text-[#6D5A5A] hover:border-[#6D5A5A]'
                    }`}
                  >
                    <div className="flex items-center gap-3 truncate">
                      <Icon className={`w-4 h-4 ${isChecked ? mod.iconColor : 'text-[#6D5A5A]'}`} />
                      <div className="truncate">
                        <p className="text-xs font-bold leading-tight truncate">{mod.name}</p>
                        <p className="text-[10px] text-[#A67C52] leading-tight mt-0.5 truncate">{mod.hint}</p>
                      </div>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                        isChecked
                          ? 'bg-[#800020] border-[#800020] text-[#F5E6DA]'
                          : 'border-[#4D3838] bg-transparent'
                      }`}
                    >
                      {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Passo 2: Nome da Tarefa */}
          <div className="space-y-1.5">
            <label htmlFor="task-name-input" className="block text-xs font-bold text-[#A67C52] uppercase tracking-wider">
              2. Nome da Tarefa <span className="text-red-400">*</span>
            </label>
            <input
              id="task-name-input"
              type="text"
              required
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              placeholder="Ex: Entregar relatório de química, Revisar capítulo 4..."
              className="w-full bg-[#1E1414] border border-[#3D2B2B] focus:border-[#800020] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-[#F5E6DA] placeholder-[#6D5A5A] outline-none shadow-sm transition-colors"
              autoFocus
            />
          </div>

          {/* Passo 3: Descrição Opcional */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#A67C52] uppercase tracking-wider flex items-center gap-1.5">
              <AlignLeft className="w-3.5 h-3.5 text-[#A67C52]" />
              3. Descrição / Observações <span className="text-[#6D5A5A] font-normal text-[11px]">(Opcional)</span>
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Adicione orientações, links ou detalhes adicionais da tarefa..."
              className="w-full bg-[#1E1414] border border-[#3D2B2B] focus:border-[#800020] rounded-xl p-3 text-xs sm:text-sm text-[#F5E6DA] placeholder-[#6D5A5A] outline-none resize-none transition-colors"
            />
          </div>

          {/* Passo 4: Agendamento & Prazos */}
          {(hasCalendar || hasRoutine) && (
            <div className="space-y-3.5 p-4 rounded-2xl bg-[#1E1414]/90 border border-[#3D2B2B]">
              <div className="flex items-center justify-between border-b border-[#3D2B2B] pb-2">
                <span className="text-xs font-bold text-[#F5E6DA] flex items-center gap-1.5">
                  <CalendarDays className="w-4 h-4 text-[#A67C52]" />
                  4. Agendamento & Prazos
                </span>
                <span className="text-[10px] text-[#A67C52] bg-[#2D1F1F] px-2 py-0.5 rounded-md border border-[#3D2B2B]">
                  Compartilhado entre abas
                </span>
              </div>

              {/* Data */}
              <div>
                <label className="block text-xs font-semibold text-[#D1BFA5] mb-1">
                  Data {isDateRequired && <span className="text-red-400">*</span>}
                </label>
                <input
                  type="date"
                  required={isDateRequired}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-[#251818] border border-[#3D2B2B] focus:border-[#800020] rounded-xl px-3 py-2 text-xs sm:text-sm text-[#F5E6DA] outline-none"
                />
              </div>

              {/* Horários: Início e Fim */}
              <div className="space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#D1BFA5] mb-1">
                      Horário Inicial{' '}
                      {isStartTimeRequired ? (
                        <span className="text-red-400 font-bold">* (Obrigatório para Rotina)</span>
                      ) : (
                        <span className="text-[#6D5A5A] text-[11px]">(Opcional)</span>
                      )}
                    </label>
                    <input
                      type="time"
                      required={isStartTimeRequired}
                      value={startTime}
                      onChange={(e) => handleStartTimeChange(e.target.value)}
                      className={`w-full bg-[#251818] border rounded-xl px-3 py-2 text-xs sm:text-sm text-[#F5E6DA] outline-none ${
                        isStartTimeRequired
                          ? 'border-[#800020]'
                          : 'border-[#3D2B2B] focus:border-[#800020]'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#D1BFA5] mb-1">
                      Horário de Término <span className="text-[#6D5A5A] text-[11px]">(Opcional)</span>
                    </label>
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => handleEndTimeChange(e.target.value)}
                      className="w-full bg-[#251818] border border-[#3D2B2B] focus:border-[#800020] rounded-xl px-3 py-2 text-xs sm:text-sm text-[#F5E6DA] outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Recorrência */}
              <div className="pt-2 border-t border-[#3D2B2B]/60">
                <label className="text-xs font-semibold text-[#D1BFA5] mb-1.5 flex items-center gap-1.5">
                  <Repeat className="w-3.5 h-3.5 text-[#A67C52]" />
                  Repetição da Tarefa
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {[
                    { id: 'none', label: 'Não se repete' },
                    { id: 'daily', label: 'Diariamente' },
                    { id: 'weekly', label: 'Semanalmente' },
                    { id: 'monthly', label: 'Mensalmente' },
                    { id: 'yearly', label: 'Anualmente' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setRecurrence(opt.id)}
                      className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium text-center transition-colors cursor-pointer ${
                        recurrence === opt.id
                          ? 'bg-[#800020] border-[#800020] text-[#F5E6DA] font-bold shadow'
                          : 'bg-[#251818] border-[#3D2B2B] text-[#D1BFA5] hover:bg-[#2D1F1F]'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Drawer Footer */}
          <div className="pt-4 border-t border-[#3D2B2B] flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2.5 rounded-xl bg-[#1E1414] hover:bg-[#2D1F1F] text-[#D1BFA5] hover:text-[#F5E6DA] text-xs font-semibold transition-colors cursor-pointer border border-[#3D2B2B]"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isLoading || selectedModelIds.length === 0}
              className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl bg-[#800020] hover:bg-[#A00028] disabled:opacity-40 disabled:cursor-not-allowed text-[#F5E6DA] text-xs sm:text-sm font-bold transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <span>Salvando no Backend...</span>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Criar Tarefa</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
