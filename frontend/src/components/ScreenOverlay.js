import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Plus,
  CalendarDays,
  Calendar as CalendarIcon,
  Brain,
  AlertCircle,
  CheckCircle2,
  Repeat,
  AlignLeft,
} from 'lucide-react';
import { apiFetch } from '../utils/api.js';
import { getTodayLocalStr } from '../utils/date.js';

const FALLBACK_SELECTABLE_MODELS = [
  {
    id: 'routine',
    name: 'Agenda Visual',
    shortName: 'Agenda Visual',
    type: 'routine',
    icon: CalendarIcon,
    iconColor: 'text-blue-600',
    hint: 'Blocos de tempo diários',
  },
  {
    id: 'calendario',
    name: 'Calendário',
    shortName: 'Calendário',
    type: 'calendario',
    icon: CalendarDays,
    iconColor: 'text-indigo-600',
    hint: 'Grade de prazos e datas',
  },
  {
    id: 'brain-dump',
    name: 'Brain Dump',
    shortName: 'Brain Dump',
    type: 'brain-dump',
    icon: Brain,
    iconColor: 'text-amber-600',
    hint: 'Anotação rápida',
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
  initialModelId = null,
  isDarkMode = false,
}) {
  // Constrói lista de modelos selecionáveis a partir das instâncias configuradas pelo usuário
  const selectableModels = useMemo(() => {
    if (availableModels && availableModels.length > 0) {
      // Pomodoro não recebe tarefas diretamente
      const filtered = availableModels.filter((m) => m.type !== 'pomodoro');
      if (filtered.length > 0) {
        return filtered.map((m) => {
          let icon = CalendarIcon;
          let iconColor = 'text-blue-600';
          let hint = 'Blocos de tempo diários';

          if (m.type === 'calendario') {
            icon = CalendarDays;
            iconColor = 'text-indigo-600';
            hint = 'Grade de prazos e datas';
          } else if (m.type === 'brain-dump') {
            icon = Brain;
            iconColor = 'text-amber-600';
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

  const [selectedModelId, setSelectedModelId] = useState('');
  const [taskName, setTaskName] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(() => getTodayLocalStr());
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('09:00');
  const [recurrence, setRecurrence] = useState('none');

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

  // Quando abre o overlay, reseta os campos e seleciona o modelo único inicial
  useEffect(() => {
    if (isOpen) {
      const defaultId =
        (initialModelId && selectableModels.some((m) => m.id === initialModelId)
          ? initialModelId
          : selectableModels[0]?.id) || '';
      setSelectedModelId(defaultId);
      setErrorMsg('');
      setSuccessMsg('');
      setDate(getTodayLocalStr());
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [isOpen, selectableModels, initialModelId]);

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

  const selectedModel =
    selectableModels.find((m) => m.id === selectedModelId) || selectableModels[0];

  const isCalendar =
    selectedModel?.type === 'calendario' ||
    (typeof selectedModel?.id === 'string' && selectedModel.id.includes('calendario'));

  const isRoutine =
    selectedModel?.type === 'routine' ||
    (typeof selectedModel?.id === 'string' && selectedModel.id.includes('routine'));

  const isStartTimeRequired = isRoutine;
  const isDateRequired = isCalendar || isRoutine;
  const showScheduleSection = isCalendar || isRoutine;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!taskName.trim()) {
      setErrorMsg('Por favor, informe o nome da tarefa.');
      return;
    }

    if (!selectedModelId) {
      setErrorMsg('Selecione o modelo ao qual a tarefa pertence.');
      return;
    }

    if (isDateRequired && !date) {
      setErrorMsg('A data é obrigatória para o modelo selecionado.');
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

    const hasTime = (isRoutine || isCalendar) && Boolean(startTime);
    const payload = {
      name: taskName.trim(),
      description: description.trim(),
      date: isDateRequired ? date : null,
      startTime: hasTime ? startTime : null,
      endTime: hasTime && finalEndTime ? finalEndTime : null,
      recurrence: isCalendar || isRoutine ? recurrence : 'none',
      modelId: selectedModelId,
      modelType: selectedModel?.type || 'routine',
      notes: selectedModel?.type === 'brain-dump' ? description.trim() : null,
    };

    try {
      const res = await apiFetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Erro ao salvar a tarefa no backend');
      }

      const data = await res.json();
      setSuccessMsg('Tarefa criada com sucesso!');

      // Notify window so all active models refresh immediately
      window.dispatchEvent(
        new CustomEvent('focusmod_task_created', { detail: data.task })
      );

      if (onTaskCreated) {
        onTaskCreated(data.task);
      }

      setTimeout(() => {
        setTaskName('');
        setDescription('');
        onClose();
      }, 500);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Falha na conexão com o servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Semi-transparent backdrop */}
      <div
        className="fixed inset-0 bg-black/40 transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Right Lateral Slide-over Panel */}
      <div
        className={`relative z-50 w-full sm:w-[500px] md:w-[560px] h-full border-l shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-200 transition-colors ${
          isDarkMode
            ? 'bg-slate-900 border-slate-800 text-slate-100'
            : 'bg-[#f4f7fa] border-[#d3dce6] text-slate-900'
        }`}
      >
        {/* Top Header */}
        <div
          className={`px-4 py-3 border-b flex items-center justify-between shrink-0 ${
            isDarkMode
              ? 'bg-slate-950 border-slate-800'
              : 'bg-[#e8edf2] border-[#d3dce6]'
          }`}
        >
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#1d56af] text-white flex items-center justify-center font-bold shadow-xs">
              <Plus className="w-4 h-4 stroke-[2.5]" />
            </div>
            <h2 className="text-sm sm:text-base font-bold leading-tight">
              Nova Tarefa
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isDarkMode
                ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                : 'text-slate-400 hover:text-slate-700 hover:bg-[#e8edf2]'
            }`}
            title="Fechar (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 min-h-0 flex flex-col justify-between"
        >
          <div className="space-y-3">
            {/* Feedback Banners */}
            {errorMsg && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Passo 1: Seleção de Modelo Único */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Modelo da Tarefa <span className="text-rose-500">*</span>
                </label>
                <span className="text-[10px] text-[#1d56af] font-semibold truncate max-w-[200px]">
                  {selectedModel?.name || 'Selecione um'}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {selectableModels.map((mod) => {
                  const Icon = mod.icon;
                  const isSelected = selectedModelId === mod.id;

                  return (
                    <button
                      key={mod.id}
                      type="button"
                      onClick={() => setSelectedModelId(mod.id)}
                      className={`px-2.5 py-2 rounded-xl border text-left cursor-pointer transition-all flex items-center justify-between gap-1.5 ${
                        isSelected
                          ? isDarkMode
                            ? 'bg-blue-950/70 border-blue-700 text-blue-100 ring-1 ring-blue-600/40 shadow-xs'
                            : 'bg-[#e3edfa] border-[#a3c5ed] text-[#124286] ring-1 ring-[#1d56af]/25 shadow-xs'
                          : isDarkMode
                          ? 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                          : 'bg-[#ffffff] border-[#d3dce6] text-slate-600 hover:border-[#b9cee2]'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <Icon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? mod.iconColor : 'text-slate-400'}`} />
                        <span className="text-xs font-semibold truncate">{mod.name}</span>
                      </div>

                      <div
                        className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                          isSelected
                            ? 'border-[#1d56af] bg-[#1d56af]'
                            : isDarkMode
                            ? 'border-slate-600 bg-transparent'
                            : 'border-slate-300 bg-transparent'
                        }`}
                      >
                        {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Passo 2: Nome da Tarefa */}
            <div className="space-y-1">
              <label htmlFor="task-name-input" className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Nome da Tarefa <span className="text-rose-500">*</span>
              </label>
              <input
                id="task-name-input"
                type="text"
                required
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                placeholder="Ex: Entregar relatório de química..."
                className={`w-full rounded-xl px-3 py-2 text-xs sm:text-sm outline-none border transition-colors ${
                  isDarkMode
                    ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500 focus:border-[#1d56af]'
                    : 'bg-[#ffffff] border-[#d3dce6] text-slate-900 placeholder-slate-400 focus:border-[#1d56af] shadow-xs'
                }`}
                autoFocus
              />
            </div>

            {/* Passo 3: Descrição Opcional */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <AlignLeft className="w-3.5 h-3.5" />
                Descrição <span className="text-slate-400 font-normal text-[10px]">(Opcional)</span>
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Orientações ou detalhes adicionais..."
                className={`w-full rounded-xl px-3 py-1.5 text-xs outline-none resize-none border transition-colors ${
                  isDarkMode
                    ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500 focus:border-[#1d56af]'
                    : 'bg-[#ffffff] border-[#d3dce6] text-slate-900 placeholder-slate-400 focus:border-[#1d56af] shadow-xs'
                }`}
              />
            </div>

            {/* Passo 4: Agendamento & Prazos */}
            {showScheduleSection && (
              <div
                className={`space-y-2 p-3 rounded-xl border ${
                  isDarkMode
                    ? 'bg-slate-950 border-slate-800'
                    : 'bg-[#e8edf2] border-[#d3dce6]'
                }`}
              >
                <div
                  className={`text-[11px] font-bold flex items-center gap-1.5 border-b pb-1.5 ${
                    isDarkMode ? 'border-slate-800 text-slate-200' : 'border-[#d3dce6] text-slate-700'
                  }`}
                >
                  <CalendarDays className="w-3.5 h-3.5 text-[#1d56af]" />
                  Agendamento & Prazos
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1 truncate">
                      Data {isDateRequired && <span className="text-rose-500">*</span>}
                    </label>
                    <input
                      type="date"
                      required={isDateRequired}
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className={`w-full rounded-lg px-2.5 py-1.5 text-xs outline-none border ${
                        isDarkMode
                          ? 'bg-slate-900 border-slate-700 text-white focus:border-[#1d56af]'
                          : 'bg-[#ffffff] border-[#d3dce6] text-slate-900 focus:border-[#1d56af]'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1 truncate">
                      Início {isStartTimeRequired && <span className="text-rose-500 font-bold">*</span>}
                    </label>
                    <input
                      type="time"
                      required={isStartTimeRequired}
                      value={startTime}
                      onChange={(e) => handleStartTimeChange(e.target.value)}
                      className={`w-full rounded-lg px-2.5 py-1.5 text-xs outline-none border ${
                        isStartTimeRequired
                          ? 'border-[#1d56af]'
                          : isDarkMode
                          ? 'border-slate-700 focus:border-[#1d56af]'
                          : 'border-[#d3dce6] focus:border-[#1d56af]'
                      } ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-[#ffffff] text-slate-900'}`}
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1 truncate">
                      Término <span className="text-slate-400 text-[10px]">(Opcional)</span>
                    </label>
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => handleEndTimeChange(e.target.value)}
                      className={`w-full rounded-lg px-2.5 py-1.5 text-xs outline-none border ${
                        isDarkMode
                          ? 'bg-slate-900 border-slate-700 text-white focus:border-[#1d56af]'
                          : 'bg-[#ffffff] border-[#d3dce6] text-slate-900 focus:border-[#1d56af]'
                      }`}
                    />
                  </div>
                </div>

                {/* Recorrência */}
                <div
                  className={`pt-2 border-t flex items-center justify-between gap-2 ${
                    isDarkMode ? 'border-slate-800' : 'border-[#d3dce6]'
                  }`}
                >
                  <label className="text-[11px] font-semibold text-slate-500 flex items-center gap-1.5 shrink-0">
                    <Repeat className="w-3.5 h-3.5 text-[#1d56af]" />
                    Repetição:
                  </label>
                  <select
                    value={recurrence}
                    onChange={(e) => setRecurrence(e.target.value)}
                    className={`rounded-lg px-2.5 py-1 text-xs outline-none border cursor-pointer ${
                      isDarkMode
                        ? 'bg-slate-900 border-slate-700 text-white focus:border-[#1d56af]'
                        : 'bg-[#ffffff] border-[#d3dce6] text-slate-900 focus:border-[#1d56af]'
                    }`}
                  >
                    <option value="none">Não se repete</option>
                    <option value="daily">Diariamente</option>
                    <option value="weekly">Semanalmente</option>
                    <option value="monthly">Mensalmente</option>
                    <option value="yearly">Anualmente</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Drawer Footer */}
          <div
            className={`pt-3 border-t flex items-center justify-between gap-3 shrink-0 ${
              isDarkMode ? 'border-slate-800' : 'border-[#d3dce6]'
            }`}
          >
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer border ${
                isDarkMode
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                  : 'bg-[#e8edf2] hover:bg-[#dde4ec] text-slate-700 border-[#d3dce6]'
              }`}
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isLoading || !selectedModelId}
              className="px-5 py-2 rounded-xl bg-[#1d56af] hover:bg-[#16438a] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-semibold transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
            >
              {isLoading ? (
                <span>Salvando...</span>
              ) : (
                <>
                  <Plus className="w-4 h-4 stroke-[3]" />
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
