import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  X,
  Plus,
  Edit2,
  CalendarDays,
  Calendar as CalendarIcon,
  Brain,
  ListChecks,
  Columns,
  Grid2X2,
  Flame,
  Sun,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ChevronDown,
  Check,
} from 'lucide-react';
import { apiFetch } from '../../utils/api.js';
import { getTodayLocalStr } from '../../utils/date.js';
import CommonFields from './CommonFields.jsx';
import CalendarFields from './model-fields/CalendarFields.jsx';
import VisualAgendaFields from './model-fields/VisualAgendaFields.jsx';
import MicrotasksFields from './model-fields/MicrotasksFields.jsx';
import KanbanFields from './model-fields/KanbanFields.jsx';
import MatrixFields from './model-fields/MatrixFields.jsx';
import HabitFields from './model-fields/HabitFields.jsx';
import DailyRoutineFields from './model-fields/DailyRoutineFields.jsx';

export function getCurrentHHMM() {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

export function getDefaultStartAndEndTime() {
  const now = new Date();
  const totalNowMins = now.getHours() * 60 + now.getMinutes();
  // Próximo múltiplo de 10 minutos (pelo menos +5 min à frente do minuto atual)
  let startMins = Math.ceil((totalNowMins + 5) / 10) * 10;
  if (startMins >= 24 * 60) {
    startMins = 23 * 60 + 50;
  }
  const endMins = Math.min(23 * 60 + 59, startMins + 60);

  const startH = String(Math.floor(startMins / 60)).padStart(2, '0');
  const startM = String(startMins % 60).padStart(2, '0');
  const endH = String(Math.floor(endMins / 60)).padStart(2, '0');
  const endM = String(endMins % 60).padStart(2, '0');

  return {
    startTime: `${startH}:${startM}`,
    endTime: `${endH}:${endM}`,
  };
}

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
  {
    id: 'microtasks',
    name: 'Microtarefas',
    shortName: 'Microtarefas',
    type: 'microtasks',
    icon: ListChecks,
    iconColor: 'text-emerald-600',
    hint: 'Divisão em subtarefas',
  },
  {
    id: 'kanban',
    name: 'Kanban',
    shortName: 'Kanban',
    type: 'kanban',
    icon: Columns,
    iconColor: 'text-indigo-600',
    hint: 'Quadro em 3 colunas',
  },
  {
    id: 'priority-matrix',
    name: 'Matriz de Prioridades',
    shortName: 'Matriz',
    type: 'priority-matrix',
    icon: Grid2X2,
    iconColor: 'text-violet-600',
    hint: 'Importância e urgência',
  },
  {
    id: 'habits',
    name: 'Rastreador de Hábitos',
    shortName: 'Hábitos',
    type: 'habits',
    icon: Flame,
    iconColor: 'text-emerald-500',
    hint: 'Hábitos e frequência',
  },
  {
    id: 'daily-routines',
    name: 'Rotinas Diárias',
    shortName: 'Rotinas',
    type: 'daily-routines',
    icon: Sun,
    iconColor: 'text-amber-500',
    hint: 'Manhã, tarde e noite',
  },
];

export function normalizeModelType(model) {
  if (!model) return 'routine';
  if (typeof model === 'string') {
    const s = model.toLowerCase();
    if (s.includes('habit') || s.includes('hábito')) return 'habits';
    if (s.includes('daily') || s.includes('rotina') || s.includes('daily-routine')) return 'daily-routines';
    if (s.includes('micro')) return 'microtasks';
    if (s.includes('kanban')) return 'kanban';
    if (s.includes('matriz') || s.includes('priorit') || s.includes('matrix')) return 'priority-matrix';
    if (s.includes('brain')) return 'brain-dump';
    if (s.includes('cal')) return 'calendario';
    if (s.includes('pomo')) return 'pomodoro';
    if (s.includes('routine') || s.includes('agenda')) return 'routine';
    return s;
  }
  const typeStr = String(model.type || '').toLowerCase();
  const nameStr = String(model.name || '').toLowerCase();
  const idStr = String(model.id || '').toLowerCase();

  if (typeStr === 'habits' || nameStr.includes('hábito') || idStr.includes('habit')) return 'habits';
  if (typeStr === 'daily-routines' || nameStr.includes('rotina') || idStr.includes('daily')) return 'daily-routines';
  if (typeStr === 'microtasks' || nameStr.includes('micro') || idStr.includes('micro')) return 'microtasks';
  if (typeStr === 'kanban' || nameStr.includes('kanban') || idStr.includes('kanban')) return 'kanban';
  if (typeStr === 'priority-matrix' || nameStr.includes('matriz') || idStr.includes('matrix') || typeStr.includes('priorit')) return 'priority-matrix';
  if (typeStr === 'brain-dump' || nameStr.includes('brain') || idStr.includes('brain')) return 'brain-dump';
  if (typeStr === 'calendario' || nameStr.includes('cal') || idStr.includes('cal')) return 'calendario';
  if (typeStr === 'pomodoro' || nameStr.includes('pomo') || idStr.includes('pomo')) return 'pomodoro';
  if (typeStr === 'routine' || nameStr.includes('agenda') || idStr.includes('routine')) return 'routine';

  return typeStr || 'routine';
}

export default function TaskFormModal({
  isOpen,
  onClose,
  onTaskSaved,
  onTaskCreated,
  availableModels = [],
  initialModelId = null,
  initialDate = null,
  initialStartTime = null,
  initialEndTime = null,
  initialColumnId = 'todo',
  initialUrgency = true,
  initialImportance = true,
  initialPeriod = 'morning',
  lockModel = false,
  editingTask = null,
  isDarkMode = false,
}) {
  const selectableModels = useMemo(() => {
    if (availableModels && availableModels.length > 0) {
      const filtered = availableModels.filter((m) => m.type !== 'pomodoro');
      if (filtered.length > 0) {
        return filtered.map((m) => {
          const type = normalizeModelType(m);
          let icon = CalendarIcon;
          let iconColor = 'text-blue-600';
          let hint = 'Blocos de tempo diários';

          if (type === 'calendario') {
            icon = CalendarDays;
            iconColor = 'text-indigo-600';
            hint = 'Grade de prazos e datas';
          } else if (type === 'brain-dump') {
            icon = Brain;
            iconColor = 'text-amber-600';
            hint = 'Anotação rápida';
          } else if (type === 'microtasks') {
            icon = ListChecks;
            iconColor = 'text-emerald-600';
            hint = 'Divisão em subtarefas';
          } else if (type === 'kanban') {
            icon = Columns;
            iconColor = 'text-indigo-600';
            hint = 'Quadro em 3 colunas';
          } else if (type === 'priority-matrix') {
            icon = Grid2X2;
            iconColor = 'text-violet-600';
            hint = 'Importância e urgência';
          } else if (type === 'habits') {
            icon = Flame;
            iconColor = 'text-emerald-500';
            hint = 'Hábitos e frequência';
          } else if (type === 'daily-routines') {
            icon = Sun;
            iconColor = 'text-amber-500';
            hint = 'Manhã, tarde e noite';
          }

          return {
            id: String(m.id),
            name: m.name,
            type,
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
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const [taskName, setTaskName] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(() => getTodayLocalStr());
  const [hasTime, setHasTime] = useState(true);
  const [startTime, setStartTime] = useState(() => getDefaultStartAndEndTime().startTime);
  const [endTime, setEndTime] = useState(() => getDefaultStartAndEndTime().endTime);
  const [recurrence, setRecurrence] = useState('none');

  // Novos campos específicos
  const [subtasks, setSubtasks] = useState([]);
  const [columnId, setColumnId] = useState('todo');
  const [urgency, setUrgency] = useState(true);
  const [importance, setImportance] = useState(true);
  const [frequency, setFrequency] = useState('daily');
  const [targetDays, setTargetDays] = useState([0, 1, 2, 3, 4, 5, 6]);
  const [color, setColor] = useState('#10b981');
  const [period, setPeriod] = useState('morning');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Rastreia se o modal acabou de abrir para evitar resets indesejados ao alternar modelos
  const prevIsOpenRef = useRef(false);

  useEffect(() => {
    const wasOpen = prevIsOpenRef.current;
    prevIsOpenRef.current = isOpen;

    // Inicializa o formulário APENAS quando o modal abre (transição de false para true)
    if (!wasOpen && isOpen) {
      setErrorMsg('');
      setSuccessMsg('');
      setIsModelDropdownOpen(false);

      const todayStr = getTodayLocalStr();
      const defaultTimes = getDefaultStartAndEndTime();
      const nowHHMM = getCurrentHHMM();

      if (editingTask) {
        // Modo Edição: inicializa com os dados da tarefa existente
        const existingDate = editingTask.date || editingTask.startDate || todayStr;
        setTaskName(editingTask.name || '');
        setDescription(editingTask.description || editingTask.notes || '');
        setDate(existingDate < todayStr ? todayStr : existingDate);
        setHasTime(Boolean(editingTask.startTime));
        setStartTime(editingTask.startTime || defaultTimes.startTime);
        setEndTime(editingTask.endTime || defaultTimes.endTime);
        setRecurrence(editingTask.recurrence || 'none');

        // Campos específicos
        setSubtasks(
          Array.isArray(editingTask.subtasks)
            ? editingTask.subtasks.map((st) => ({ title: st.title, done: Boolean(st.done) }))
            : []
        );
        setColumnId(editingTask.kanban?.column_id || (editingTask.done ? 'done' : 'todo'));
        setUrgency(editingTask.matrix?.urgency !== undefined ? Boolean(editingTask.matrix.urgency) : true);
        setImportance(editingTask.matrix?.importance !== undefined ? Boolean(editingTask.matrix.importance) : true);
        setFrequency(editingTask.habit?.frequency || 'daily');
        setTargetDays(Array.isArray(editingTask.habit?.target_days) ? editingTask.habit.target_days : [0, 1, 2, 3, 4, 5, 6]);
        setColor(editingTask.habit?.color || '#10b981');
        setPeriod(editingTask.dailyRoutine?.period || 'morning');

        const matchingModel = selectableModels.find(
          (m) =>
            String(m.id) === String(editingTask.modelId) ||
            m.type === editingTask.modelId ||
            normalizeModelType(m) === normalizeModelType(editingTask.modelId)
        );
        setSelectedModelId(matchingModel ? String(matchingModel.id) : String(selectableModels[0]?.id || ''));
      } else {
        // Modo Criação: garante que a data nunca comece antes do dia atual
        const resolvedDate = initialDate && initialDate >= todayStr ? initialDate : todayStr;
        const isTodaySelected = resolvedDate === todayStr;

        // Se foi sugerido um horário, usa-o apenas se não estiver no passado no dia de hoje
        const validSuggestedStart =
          initialStartTime && (!isTodaySelected || initialStartTime >= nowHHMM)
            ? initialStartTime
            : defaultTimes.startTime;

        const validSuggestedEnd =
          initialEndTime && initialEndTime > validSuggestedStart
            ? initialEndTime
            : defaultTimes.endTime;

        setTaskName('');
        setDescription('');
        setDate(resolvedDate);
        setHasTime(true);
        setStartTime(validSuggestedStart);
        setEndTime(validSuggestedEnd);
        setRecurrence('none');

        setSubtasks([]);
        setColumnId(initialColumnId || 'todo');
        setUrgency(initialUrgency !== undefined ? Boolean(initialUrgency) : true);
        setImportance(initialImportance !== undefined ? Boolean(initialImportance) : true);
        setFrequency('daily');
        setTargetDays([0, 1, 2, 3, 4, 5, 6]);
        setColor('#10b981');
        setPeriod(initialPeriod || 'morning');

        // Se initialModelId foi fornecido e existe nos modelos, usa-o; caso contrário o primeiro
        const foundInitial = selectableModels.find(
          (m) =>
            String(m.id) === String(initialModelId) ||
            m.type === String(initialModelId) ||
            normalizeModelType(m) === normalizeModelType(initialModelId)
        );
        setSelectedModelId(foundInitial ? String(foundInitial.id) : String(selectableModels[0]?.id || ''));
      }

      document.body.style.overflow = 'hidden';
    } else if (!isOpen) {
      document.body.style.overflow = 'auto';
    }
  }, [
    isOpen,
    editingTask,
    initialModelId,
    initialDate,
    initialStartTime,
    initialEndTime,
    initialColumnId,
    initialUrgency,
    initialImportance,
    initialPeriod,
    selectableModels,
  ]);

  // Fecha o dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsModelDropdownOpen(false);
      }
    };
    if (isModelDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isModelDropdownOpen]);

  // Tecla Escape para fechar
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        if (isModelDropdownOpen) {
          setIsModelDropdownOpen(false);
        } else {
          onClose();
        }
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isModelDropdownOpen, onClose]);

  // Modelo atualmente selecionado
  const selectedModel = useMemo(() => {
    if (selectedModelId) {
      const found = selectableModels.find((m) => String(m.id) === String(selectedModelId));
      if (found) return found;
    }
    if (initialModelId) {
      const found = selectableModels.find(
        (m) =>
          String(m.id) === String(initialModelId) ||
          m.type === String(initialModelId) ||
          normalizeModelType(m) === normalizeModelType(initialModelId)
      );
      if (found) return found;
    }
    return selectableModels[0] || FALLBACK_SELECTABLE_MODELS[0];
  }, [selectableModels, selectedModelId, initialModelId]);

  const activeModelType = normalizeModelType(selectedModel);
  const SelectedIcon = selectedModel?.icon || CalendarIcon;

  const todayStr = getTodayLocalStr();
  const minTimeForSelectedDate = date === todayStr ? getCurrentHHMM() : '';

  const handleDateChange = (newDate) => {
    setErrorMsg('');
    setDate(newDate);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!taskName.trim()) {
      setErrorMsg('Informe o nome da tarefa.');
      return;
    }

    const currentTodayStr = getTodayLocalStr();
    const currentNowHHMM = getCurrentHHMM();

    if (activeModelType === 'routine' || activeModelType === 'calendario') {
      if (!date) {
        setErrorMsg('Informe a data da tarefa.');
        return;
      }

      if (date < currentTodayStr) {
        setErrorMsg('Não é permitido agendar uma tarefa para uma data anterior ao dia atual.');
        return;
      }
    }

    if (activeModelType === 'routine' && (!startTime || !hasTime)) {
      setErrorMsg('A Agenda Visual requer um horário de início para organizar sua rotina.');
      return;
    }

    if (
      (activeModelType === 'routine' || (activeModelType === 'calendario' && hasTime)) &&
      startTime
    ) {
      if (date === currentTodayStr && startTime < currentNowHHMM) {
        setErrorMsg(
          `Para tarefas no dia de hoje, o horário de início não pode ser anterior ao horário atual (${currentNowHHMM}).`
        );
        return;
      }

      if (endTime && endTime < startTime) {
        setErrorMsg('O horário de término não pode ser anterior ao horário de início.');
        return;
      }
    }

    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const payload = {
        name: taskName.trim(),
        description: description.trim(),
        notes: description.trim(),
      };

      if (activeModelType === 'calendario') {
        payload.date = date;
        payload.startTime = hasTime ? startTime : null;
        payload.endTime = hasTime ? endTime : null;
        payload.recurrence = recurrence;
      } else if (activeModelType === 'routine') {
        payload.date = date;
        payload.startTime = startTime;
        payload.endTime = endTime;
        payload.recurrence = recurrence;
      } else if (activeModelType === 'kanban') {
        payload.date = null;
        payload.startTime = null;
        payload.endTime = null;
        payload.recurrence = 'none';
        payload.column_id = columnId;
      } else if (activeModelType === 'priority-matrix') {
        payload.date = null;
        payload.startTime = null;
        payload.endTime = null;
        payload.recurrence = 'none';
        payload.urgency = urgency;
        payload.importance = importance;
      } else if (activeModelType === 'microtasks') {
        payload.date = null;
        payload.startTime = null;
        payload.endTime = null;
        payload.recurrence = 'none';
        payload.subtasks = subtasks.filter((st) => st.title && st.title.trim());
      } else if (activeModelType === 'habits') {
        payload.date = null;
        payload.startTime = null;
        payload.endTime = null;
        payload.recurrence = 'none';
        payload.frequency = frequency;
        payload.target_days = targetDays;
        payload.color = color;
      } else if (activeModelType === 'daily-routines') {
        payload.date = null;
        payload.startTime = null;
        payload.endTime = null;
        payload.recurrence = 'none';
        payload.period = period;
      } else {
        // Brain Dump: sem agendamento
        payload.date = null;
        payload.startTime = null;
        payload.endTime = null;
        payload.recurrence = 'none';
      }

      let res;
      if (editingTask) {
        // Atualização via PUT
        res = await apiFetch(`/api/tasks/${editingTask.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        // Criação via POST
        const targetModelId = selectedModelId || selectedModel?.id || activeModelType;
        payload.modelId = targetModelId;
        payload.modelIds = [targetModelId];
        res = await apiFetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Erro ao processar solicitação no servidor.');
      }

      const responseData = await res.json().catch(() => ({}));
      const savedTask = responseData.task || { id: editingTask?.id || 'temp', ...payload };

      if (editingTask) {
        window.dispatchEvent(
          new CustomEvent('focusmod_task_updated', {
            detail: { id: editingTask.id, task: savedTask },
          })
        );
      } else {
        window.dispatchEvent(
          new CustomEvent('focusmod_task_created', {
            detail: { task: savedTask },
          })
        );
      }

      if (onTaskSaved) {
        onTaskSaved(savedTask);
      }
      if (onTaskCreated && !editingTask) {
        onTaskCreated(savedTask);
      }

      setSuccessMsg(editingTask ? 'Tarefa atualizada com sucesso!' : 'Tarefa criada com sucesso!');
      setTimeout(() => {
        onClose();
      }, 350);

    } catch (err) {
      console.error('Erro ao salvar tarefa:', err);
      setErrorMsg(err.message || 'Não foi possível salvar a tarefa.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Painel Lateral / Modal */}
      <div
        className={`relative z-50 w-full sm:w-[440px] md:w-[480px] h-full border-l shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-200 transition-colors ${
          isDarkMode
            ? 'bg-slate-900 border-slate-800 text-slate-100'
            : 'bg-[#f4f7fa] border-[#d3dce6] text-slate-900'
        }`}
      >
        {/* Top Header */}
        <div
          className={`px-4 py-3 border-b flex items-center justify-between shrink-0 ${
            isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-[#e8edf2] border-[#d3dce6]'
          }`}
        >
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#1d56af] text-white flex items-center justify-center font-bold shadow-xs">
              {editingTask ? (
                <Edit2 className="w-3.5 h-3.5 stroke-[2.5]" />
              ) : (
                <Plus className="w-4 h-4 stroke-[2.5]" />
              )}
            </div>
            <h2
              className={`text-sm sm:text-base font-bold leading-tight ${
                isDarkMode ? 'text-slate-100' : 'text-slate-900'
              }`}
            >
              {editingTask ? 'Editar Tarefa' : 'Nova Tarefa'}
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
          className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 min-h-0 flex flex-col justify-between"
        >
          <div className="space-y-4">
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

            {/* Seletor de Modelo em formato Dropdown */}
            {!editingTask && !lockModel && (
              <div className="space-y-1.5" ref={dropdownRef}>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Módulo de Destino <span className="text-rose-500">*</span>
                </label>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsModelDropdownOpen((prev) => !prev)}
                    className={`w-full px-3 py-2.5 rounded-xl border text-left cursor-pointer transition-all flex items-center justify-between gap-2.5 ${
                      isModelDropdownOpen
                        ? isDarkMode
                          ? 'bg-slate-800 border-blue-600 ring-2 ring-blue-500/20 text-slate-100'
                          : 'bg-white border-[#1d56af] ring-2 ring-[#1d56af]/15 text-slate-900'
                        : isDarkMode
                        ? 'bg-slate-800/90 border-slate-700 hover:border-slate-600 text-slate-100'
                        : 'bg-white border-[#d3dce6] hover:border-[#b9cee2] text-slate-800 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          isDarkMode
                            ? 'bg-slate-900 border border-slate-700'
                            : 'bg-[#f4f7fa] border border-[#e2e8f0]'
                        }`}
                      >
                        <SelectedIcon className={`w-4 h-4 ${selectedModel?.iconColor || 'text-[#1d56af]'}`} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-bold truncate leading-tight">
                          {selectedModel?.name || 'Selecione um módulo'}
                        </p>
                        {selectedModel?.hint && (
                          <p className="text-[11px] text-slate-400 truncate mt-0.5">
                            {selectedModel.hint}
                          </p>
                        )}
                      </div>
                    </div>

                    <ChevronDown
                      className={`w-4 h-4 shrink-0 text-slate-400 transition-transform duration-200 ${
                        isModelDropdownOpen ? 'rotate-180 text-[#1d56af]' : ''
                      }`}
                    />
                  </button>

                  {isModelDropdownOpen && (
                    <div
                      className={`absolute left-0 right-0 z-30 mt-1.5 rounded-xl border shadow-xl max-h-64 overflow-y-auto p-1.5 space-y-0.5 animate-in fade-in zoom-in-95 duration-150 ${
                        isDarkMode
                          ? 'bg-slate-900 border-slate-700 text-slate-100'
                          : 'bg-white border-[#d3dce6] text-slate-800'
                      }`}
                    >
                      {selectableModels.map((mod) => {
                        const Icon = mod.icon;
                        const isSelected = String(selectedModel?.id) === String(mod.id);

                        return (
                          <button
                            key={mod.id}
                            type="button"
                            onClick={() => {
                              setSelectedModelId(String(mod.id));
                              setIsModelDropdownOpen(false);
                            }}
                            className={`w-full px-2.5 py-2 rounded-lg text-left cursor-pointer transition-colors flex items-center justify-between gap-2 ${
                              isSelected
                                ? isDarkMode
                                  ? 'bg-blue-950/70 text-blue-100'
                                  : 'bg-[#e3edfa] text-[#124286]'
                                : isDarkMode
                                ? 'hover:bg-slate-800 text-slate-300'
                                : 'hover:bg-[#f4f7fa] text-slate-700'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div
                                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                                  isSelected
                                    ? isDarkMode
                                      ? 'bg-blue-900/60'
                                      : 'bg-white shadow-2xs'
                                    : isDarkMode
                                    ? 'bg-slate-800'
                                    : 'bg-[#f4f7fa]'
                                }`}
                              >
                                <Icon className={`w-3.5 h-3.5 ${mod.iconColor}`} />
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-bold truncate leading-tight">
                                  {mod.name}
                                </p>
                                <p
                                  className={`text-[10px] truncate ${
                                    isSelected
                                      ? isDarkMode
                                        ? 'text-blue-300/80'
                                        : 'text-[#1d56af]/80'
                                      : 'text-slate-400'
                                  }`}
                                >
                                  {mod.hint}
                                </p>
                              </div>
                            </div>

                            {isSelected && (
                              <Check className="w-4 h-4 shrink-0 text-[#1d56af]" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Campos Comuns (Nome e Descrição) */}
            <CommonFields
              name={taskName}
              onNameChange={setTaskName}
              description={description}
              onDescriptionChange={setDescription}
              isDarkMode={isDarkMode}
              autoFocus={!editingTask}
            />

            {/* Campos Específicos por Modelo */}
            {activeModelType === 'calendario' && (
              <CalendarFields
                date={date}
                onDateChange={handleDateChange}
                startTime={startTime}
                endTime={endTime}
                onStartTimeChange={(val) => {
                  setErrorMsg('');
                  setStartTime(val);
                }}
                onEndTimeChange={(val) => {
                  setErrorMsg('');
                  setEndTime(val);
                }}
                hasTime={hasTime}
                onToggleHasTime={setHasTime}
                recurrence={recurrence}
                onRecurrenceChange={setRecurrence}
                minDate={todayStr}
                minTime={minTimeForSelectedDate}
                isDarkMode={isDarkMode}
              />
            )}

            {activeModelType === 'routine' && (
              <VisualAgendaFields
                date={date}
                onDateChange={handleDateChange}
                startTime={startTime}
                endTime={endTime}
                onStartTimeChange={(val) => {
                  setErrorMsg('');
                  setStartTime(val);
                }}
                onEndTimeChange={(val) => {
                  setErrorMsg('');
                  setEndTime(val);
                }}
                recurrence={recurrence}
                onRecurrenceChange={setRecurrence}
                minDate={todayStr}
                minTime={minTimeForSelectedDate}
                isDarkMode={isDarkMode}
              />
            )}

            {activeModelType === 'microtasks' && (
              <MicrotasksFields
                subtasks={subtasks}
                onSubtasksChange={setSubtasks}
                isDarkMode={isDarkMode}
              />
            )}

            {activeModelType === 'kanban' && (
              <KanbanFields
                columnId={columnId}
                onColumnChange={setColumnId}
                isDarkMode={isDarkMode}
              />
            )}

            {activeModelType === 'priority-matrix' && (
              <MatrixFields
                urgency={urgency}
                onUrgencyChange={setUrgency}
                importance={importance}
                onImportanceChange={setImportance}
                isDarkMode={isDarkMode}
              />
            )}

            {activeModelType === 'habits' && (
              <HabitFields
                frequency={frequency}
                onFrequencyChange={setFrequency}
                targetDays={targetDays}
                onTargetDaysChange={setTargetDays}
                color={color}
                onColorChange={setColor}
                isDarkMode={isDarkMode}
              />
            )}

            {activeModelType === 'daily-routines' && (
              <DailyRoutineFields
                period={period}
                onPeriodChange={setPeriod}
                isDarkMode={isDarkMode}
              />
            )}
          </div>

          {/* Bottom Actions */}
          <div
            className={`pt-3 border-t flex items-center justify-end gap-2 shrink-0 ${
              isDarkMode ? 'border-slate-800' : 'border-[#d3dce6]'
            }`}
          >
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                isDarkMode
                  ? 'border-slate-800 text-slate-300 hover:bg-slate-800'
                  : 'border-[#d3dce6] text-slate-600 hover:bg-white hover:text-slate-900'
              }`}
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isLoading || !taskName.trim()}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#1d56af] hover:bg-[#174690] transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Salvando...</span>
                </>
              ) : (
                <>
                  {editingTask ? <Edit2 className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                  <span>{editingTask ? 'Salvar Alterações' : 'Criar Tarefa'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
