import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  CalendarDays,
  Loader2,
  Repeat,
  CheckCircle,
  Circle,
  Trash2,
  Pencil,
  Plus,
  Calendar as CalendarIcon,
  X,
  Check,
  Sparkles,
  SlidersHorizontal,
  ZoomIn,
  ZoomOut,
  Settings,
} from 'lucide-react';
import { apiFetch } from '../../utils/api.js';
import {
  formatDateToYMD,
  getTodayLocalStr,
  parseYMDToLocalDate,
  getUserTimezone,
  getTimezoneNowParts,
  addDaysToYMD,
} from '../../utils/date.js';
import TaskFormModal from '../task-form/TaskFormModal.jsx';
import ModelSettingsModal from './ModelSettingsModal.jsx';

const DEFAULT_HOUR_HEIGHT = 44; // altura padrão mais compacta (zoom out) para exibir mais horas simultaneamente
const ZOOM_LEVELS = [
  { label: 'Compacto', height: 34 },
  { label: 'Normal', height: 44 },
  { label: 'Amplo', height: 60 },
];
const START_HOUR = 0;  // início da linha do tempo às 00:00 (cobre todas as 24 horas)
const END_HOUR = 24;   // fim da linha do tempo às 24:00 (meia-noite)

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];
const WEEK_DAYS_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const WEEK_DAYS_TIIMO = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

/**
 * Converte string 'HH:MM' em minutos a partir da meia-noite
 */
function timeToMinutes(tStr) {
  if (!tStr) return null;
  const parts = tStr.split(':').map((v) => parseInt(v, 10));
  if (parts.length < 2 || isNaN(parts[0]) || isNaN(parts[1])) return null;
  return parts[0] * 60 + parts[1];
}

/**
 * Converte minutos a partir da meia-noite em 'HH:MM'
 */
function minutesToTime(mins) {
  if (mins === null || mins === undefined) return '09:00';
  const h = Math.floor(mins / 60) % 24;
  const m = mins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/**
 * Gera a lista de 7 dias da semana (Segunda a Domingo) contendo a data informada
 */
function getWeekDays(dateObj) {
  const d = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
  const dayOfWeek = d.getDay(); // 0 = Domingo, 1 = Segunda, ...
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(d);
  monday.setDate(d.getDate() + diffToMonday);

  const days = [];
  for (let i = 0; i < 7; i++) {
    const nextDay = new Date(monday);
    nextDay.setDate(monday.getDate() + i);
    days.push(nextDay);
  }
  return days;
}

/**
 * Algoritmo de empacotamento em colunas para eventos sobrepostos (estilo Tiimo/Google Calendar)
 * Evita sobreposição indevida dividindo a largura disponível em colunas proporcionais
 */
function layoutTimelineEvents(tasks, startHour = START_HOUR, hourHeight = DEFAULT_HOUR_HEIGHT) {
  const startOfDayMins = startHour * 60;
  const pixelsPerMin = hourHeight / 60;

  // Filtra tarefas que têm horário de início
  const timed = tasks
    .map((task) => {
      const sMins = timeToMinutes(task.startTime);
      if (sMins === null) return null;
      let eMins = timeToMinutes(task.endTime);
      if (eMins === null || eMins <= sMins) {
        eMins = sMins + 45; // Duração padrão de 45 minutos se não especificado
      }
      return {
        ...task,
        sMins,
        eMins,
      };
    })
    .filter(Boolean);

  if (timed.length === 0) return [];

  // Ordena por horário inicial; em caso de empate, o mais longo primeiro
  timed.sort((a, b) => a.sMins - b.sMins || (b.eMins - b.sMins) - (a.eMins - a.sMins));

  // Agrupa em clusters de eventos concorrentes
  const clusters = [];
  let currentCluster = [];
  let clusterEnd = -1;

  timed.forEach((item) => {
    if (currentCluster.length === 0) {
      currentCluster.push(item);
      clusterEnd = item.eMins;
    } else if (item.sMins < clusterEnd) {
      currentCluster.push(item);
      clusterEnd = Math.max(clusterEnd, item.eMins);
    } else {
      clusters.push(currentCluster);
      currentCluster = [item];
      clusterEnd = item.eMins;
    }
  });
  if (currentCluster.length > 0) {
    clusters.push(currentCluster);
  }

  // Atribui colunas (0, 1, 2, ...) para cada evento dentro de cada cluster
  const result = [];
  clusters.forEach((cluster) => {
    const columns = [];
    cluster.forEach((item) => {
      let placed = false;
      for (let c = 0; c < columns.length; c++) {
        const lastInCol = columns[c][columns[c].length - 1];
        if (item.sMins >= lastInCol.eMins) {
          columns[c].push(item);
          item.col = c;
          placed = true;
          break;
        }
      }
      if (!placed) {
        columns.push([item]);
        item.col = columns.length - 1;
      }
    });

    const totalCols = columns.length;
    cluster.forEach((item) => {
      const top = Math.max(0, (item.sMins - startOfDayMins) * pixelsPerMin);
      const rawHeight = (item.eMins - item.sMins) * pixelsPerMin;
      const minCardHeight = Math.max(24, Math.round(hourHeight * 0.62));
      const height = Math.max(minCardHeight, rawHeight);
      const widthPercent = 100 / totalCols;
      const leftPercent = item.col * widthPercent;

      result.push({
        task: item,
        top,
        height,
        leftPercent,
        widthPercent,
      });
    });
  });

  return result;
}

export default function Calendar({ modelInstance, isDarkMode = false }) {
  const modelId = modelInstance?.id || 'calendario';
  const modelType = modelInstance?.type || 'calendario';
  const displayName = modelInstance?.name || 'Calendário';

  const [userTz, setUserTz] = useState(() => getUserTimezone());

  // Data de referência de Hoje (YYYY-MM-DD no fuso horário do usuário)
  const [currentDateNow, setCurrentDateNow] = useState(() => new Date());
  const todayStr = useMemo(() => getTodayLocalStr(userTz), [userTz, currentDateNow]);

  // Data selecionada no calendário (dia atualmente visualizado na Linha do Tempo)
  const [selectedDateObj, setSelectedDateObj] = useState(() => {
    return parseYMDToLocalDate(getTodayLocalStr(getUserTimezone()));
  });

  // Formata a data selecionada como YYYY-MM-DD em horário local
  const selectedDayStr = useMemo(() => {
    return formatDateToYMD(selectedDateObj, userTz);
  }, [selectedDateObj, userTz]);

  // Verifica se a data selecionada é Hoje
  const isViewingToday = selectedDayStr === todayStr;
  
  // Mês atualmente visualizado no mini calendário
  const [navMonthDate, setNavMonthDate] = useState(() => {
    return parseYMDToLocalDate(getTodayLocalStr(getUserTimezone()));
  });

  // Modo de visualização: 'timeline' (Tiimo linha do tempo) ou 'month' (grade mensal)
  const [activeView, setActiveView] = useState('timeline');

  // Escala vertical (altura em pixels por hora) com persistência
  const [hourHeight, setHourHeight] = useState(() => {
    const saved = Number(localStorage.getItem('focusmod_calendar_hour_height'));
    return saved >= 28 && saved <= 90 ? saved : DEFAULT_HOUR_HEIGHT;
  });

  const handleChangeHourHeight = (newHeight) => {
    const clamped = Math.max(30, Math.min(76, newHeight));
    setHourHeight(clamped);
    try {
      localStorage.setItem('focusmod_calendar_hour_height', String(clamped));
    } catch {}
  };

  // Tarefas brutas carregadas do backend
  const [rawTasks, setRawTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Modal unificado para criar / editar evento
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [modalInitialDate, setModalInitialDate] = useState(todayStr);
  const [modalInitialStartTime, setModalInitialStartTime] = useState(null);
  const [modalInitialEndTime, setModalInitialEndTime] = useState(null);

  // Minuto atual para a linha "Agora" em tempo real no fuso configurado
  const [currentMinutesNow, setCurrentMinutesNow] = useState(() => {
    return getTimezoneNowParts(getUserTimezone()).minutesFromMidnight;
  });

  useEffect(() => {
    const updateTime = () => {
      const parts = getTimezoneNowParts(userTz);
      setCurrentDateNow(new Date());
      setCurrentMinutesNow(parts.minutesFromMidnight);
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, [userTz]);

  // Sincroniza quando o usuário altera o fuso horário no sistema
  useEffect(() => {
    const handleTzChanged = (e) => {
      if (e?.detail?.timezone) {
        setUserTz(e.detail.timezone);
        const parts = getTimezoneNowParts(e.detail.timezone);
        setCurrentMinutesNow(parts.minutesFromMidnight);
      }
    };
    window.addEventListener('focusmod_timezone_changed', handleTzChanged);
    return () => window.removeEventListener('focusmod_timezone_changed', handleTzChanged);
  }, []);

  const timelineScrollRef = React.useRef(null);

  useEffect(() => {
    if (activeView === 'timeline' && timelineScrollRef.current) {
      const scrollTargetHour = isViewingToday
        ? Math.max(0, Math.floor(currentMinutesNow / 60) - 1)
        : 7;
      timelineScrollRef.current.scrollTop = scrollTargetHour * hourHeight;
    }
  }, [selectedDayStr, activeView, hourHeight]);

  // Busca tarefas do backend
  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await apiFetch(
        `/api/tasks?modelId=${encodeURIComponent(modelId)}&modelType=${encodeURIComponent(modelType)}&today=${encodeURIComponent(todayStr)}`
      );
      if (res.ok) {
        const data = await res.json();
        setRawTasks(data.tasks || []);
      }
    } catch (err) {
      console.error('Erro ao buscar tarefas do calendário:', err);
    } finally {
      setIsLoading(false);
    }
  }, [modelId, modelType, todayStr]);

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

  // Helper para verificar se uma tarefa ocorre em uma data específica YYYY-MM-DD
  const isTaskOnDateStr = useCallback((task, dateStr) => {
    if (!task.date) return false;
    const taskDateOnly = String(task.date).split('T')[0];
    if (taskDateOnly === dateStr) return true;

    const rec = task.recurrence || 'none';
    if (rec === 'none') return false;

    const taskDate = parseYMDToLocalDate(taskDateOnly);
    const targetDate = parseYMDToLocalDate(dateStr);

    if (targetDate < taskDate) return false;

    if (rec === 'daily') return true;
    if (rec === 'weekly') return targetDate.getDay() === taskDate.getDay();
    if (rec === 'monthly') return targetDate.getDate() === taskDate.getDate();
    if (rec === 'yearly') {
      return (
        targetDate.getDate() === taskDate.getDate() &&
        targetDate.getMonth() === taskDate.getMonth()
      );
    }
    return false;
  }, []);

  // Helper para verificar se a tarefa está concluída na data informada
  const isTaskCompletedOnDate = useCallback((task, dateStr) => {
    if (task.recurrence && task.recurrence !== 'none') {
      return Array.isArray(task.completedDates) && task.completedDates.includes(dateStr);
    }
    return Boolean(task.done);
  }, []);

  // Tarefas da data atualmente selecionada
  const dayTasks = useMemo(() => {
    return rawTasks.filter((t) => isTaskOnDateStr(t, selectedDayStr));
  }, [rawTasks, selectedDayStr, isTaskOnDateStr]);

  // Separação entre eventos com horário marcado e eventos de "Dia Todo"
  const allDayTasks = useMemo(() => {
    return dayTasks.filter((t) => !t.startTime);
  }, [dayTasks]);

  const timedTasks = useMemo(() => {
    return dayTasks.filter((t) => Boolean(t.startTime));
  }, [dayTasks]);

  // Layout dos blocos na linha do tempo com cálculo de sobreposição
  const layoutedTimedTasks = useMemo(() => {
    return layoutTimelineEvents(timedTasks, START_HOUR, hourHeight);
  }, [timedTasks, hourHeight]);

  // Alterna conclusão da tarefa
  const handleToggleTask = async (task, e) => {
    if (e) e.stopPropagation();
    const isCompleted = isTaskCompletedOnDate(task, selectedDayStr);
    const newDone = !isCompleted;

    // Atualização otimista
    setRawTasks((prev) =>
      prev.map((t) => {
        if (t.id === task.id) {
          if (t.recurrence && t.recurrence !== 'none') {
            const prevCompleted = Array.isArray(t.completedDates) ? t.completedDates : [];
            const nextCompleted = newDone
              ? [...prevCompleted.filter((d) => d !== selectedDayStr), selectedDayStr]
              : prevCompleted.filter((d) => d !== selectedDayStr);
            return { ...t, completedDates: nextCompleted };
          }
          return { ...t, done: newDone };
        }
        return t;
      })
    );

    try {
      const res = await apiFetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ done: newDone, date: selectedDayStr }),
      });

      if (!res.ok) {
        fetchTasks();
      } else {
        window.dispatchEvent(
          new CustomEvent('focusmod_task_updated', {
            detail: { id: task.id, done: newDone, date: selectedDayStr },
          })
        );
      }
    } catch (err) {
      console.error('Erro ao alternar conclusão no calendário:', err);
      fetchTasks();
    }
  };

  // Exclui tarefa
  const handleDeleteTask = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      setRawTasks((prev) => prev.filter((t) => t.id !== id));
      const res = await apiFetch(`/api/tasks/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        fetchTasks();
        return;
      }
      window.dispatchEvent(new CustomEvent('focusmod_task_updated', { detail: { id, deleted: true } }));
    } catch (err) {
      console.error('Erro ao excluir tarefa:', err);
      fetchTasks();
    }
  };

  // Abre modal para criação com data/horário predefinidos
  const handleOpenCreateModal = (suggestedHour = null) => {
    setEditingTask(null);
    const validDate = selectedDayStr < todayStr ? todayStr : selectedDayStr;
    setModalInitialDate(validDate);
    if (suggestedHour !== null) {
      const hStr = String(suggestedHour).padStart(2, '0') + ':00';
      const endHStr = String(Math.min(23, suggestedHour + 1)).padStart(2, '0') + ':00';
      setModalInitialStartTime(hStr);
      setModalInitialEndTime(endHStr);
    } else {
      setModalInitialStartTime(null);
      setModalInitialEndTime(null);
    }
    setIsModalOpen(true);
  };

  // Abre modal para edição de tarefa existente
  const handleOpenEditModal = (task, e) => {
    if (e) e.stopPropagation();
    setEditingTask(task);
    setIsModalOpen(true);
  };

  // Navegação entre dias
  const handlePrevDay = () => {
    const prev = new Date(selectedDateObj);
    prev.setDate(selectedDateObj.getDate() - 1);
    setSelectedDateObj(prev);
    setNavMonthDate(prev);
  };

  const handleNextDay = () => {
    const next = new Date(selectedDateObj);
    next.setDate(selectedDateObj.getDate() + 1);
    setSelectedDateObj(next);
    setNavMonthDate(next);
  };

  const handleToday = () => {
    const todayYmd = getTodayLocalStr(userTz);
    const todayObj = parseYMDToLocalDate(todayYmd);
    const parts = getTimezoneNowParts(userTz);
    setCurrentDateNow(new Date());
    setCurrentMinutesNow(parts.minutesFromMidnight);
    setSelectedDateObj(todayObj);
    setNavMonthDate(todayObj);
  };
  const handleGoToday = handleToday;

  const handlePrevWeek = () => {
    const prev = new Date(selectedDateObj);
    prev.setDate(selectedDateObj.getDate() - 7);
    setSelectedDateObj(prev);
    setNavMonthDate(prev);
  };

  const handleNextWeek = () => {
    const next = new Date(selectedDateObj);
    next.setDate(selectedDateObj.getDate() + 7);
    setSelectedDateObj(next);
    setNavMonthDate(next);
  };


  // Dias da fita semanal (Tiimo week strip)
  const weekDays = useMemo(() => {
    return getWeekDays(selectedDateObj);
  }, [selectedDateObj]);

  // Dados do mês para o mini calendário
  const navYear = navMonthDate.getFullYear();
  const navMonth = navMonthDate.getMonth();
  const firstDayOfMonthIndex = new Date(navYear, navMonth, 1).getDay();
  const daysInNavMonth = new Date(navYear, navMonth + 1, 0).getDate();

  const handlePrevMonth = () => {
    setNavMonthDate(new Date(navYear, navMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setNavMonthDate(new Date(navYear, navMonth + 1, 1));
  };

  // Rótulo da data selecionada em português
  const selectedDateFormattedLong = useMemo(() => {
    return selectedDateObj.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }, [selectedDateObj]);

  const getRecurrenceLabel = (rec) => {
    switch (rec) {
      case 'daily':
        return 'Diária';
      case 'weekly':
        return 'Semanal';
      case 'monthly':
        return 'Mensal';
      case 'yearly':
        return 'Anual';
      default:
        return null;
    }
  };


  // Total de tarefas concluídas no dia
  const completedInDayCount = dayTasks.filter((t) => isTaskCompletedOnDate(t, selectedDayStr)).length;
  const progressPercent = dayTasks.length > 0 ? Math.round((completedInDayCount / dayTasks.length) * 100) : 0;

  // Gera lista de horas para a régua vertical (06:00 a 23:00)
  const hourMarkers = useMemo(() => {
    const list = [];
    for (let h = START_HOUR; h < END_HOUR; h++) {
      list.push(h);
    }
    return list;
  }, []);

  return (
    <div
      className={`w-full h-full flex-1 flex flex-col p-2.5 sm:p-4 lg:p-6 min-h-0 overflow-hidden transition-colors ${
        isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-[#ebf0f5] text-slate-800'
      }`}
    >
      <div className="w-full max-w-6xl mx-auto flex-1 flex flex-col min-h-0 gap-2 sm:gap-3 lg:gap-4">
      {/* Barra Superior de Cabeçalho e Controles */}
      <div
        className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3 border rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2 sm:py-2.5 shadow-xs shrink-0 transition-colors ${
          isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-[#f4f7fa] border-[#d3dce6]'
        }`}
      >
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 w-full sm:w-auto">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#1d56af] flex items-center justify-center text-white font-bold text-sm shadow-xs shrink-0">
            <CalendarDays className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div className="truncate flex-1 min-w-0">
            <h2
              className={`text-sm sm:text-base lg:text-lg font-bold leading-tight capitalize truncate ${
                isDarkMode ? 'text-slate-100' : 'text-slate-900'
              }`}
            >
              <span className="hidden sm:inline">{selectedDateFormattedLong}</span>
              <span className="sm:hidden">
                {selectedDateObj.toLocaleDateString('pt-BR', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                })}
              </span>
            </h2>
            <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium flex items-center gap-1.5 sm:gap-2 truncate">
              <span className="truncate">
                {activeView === 'timeline' ? 'Linha do tempo' : 'Visão Mensal'}
              </span>
              <span>•</span>
              <span className="text-[#1d56af] dark:text-blue-400 font-semibold truncate">
                {dayTasks.length} {dayTasks.length === 1 ? 'evento' : 'eventos'} ({progressPercent}% concluído)
              </span>
            </p>
          </div>
        </div>

        {/* Controles de Navegação */}
        <div className="flex items-center gap-1.5 sm:gap-2 justify-between sm:justify-end w-full sm:w-auto shrink-0">
          {/* Seletor de Modo: Timeline vs Grade Mensal */}
          <div
            className={`p-0.5 sm:p-1 rounded-xl border flex items-center text-xs font-semibold ${
              isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-[#e8edf2] border-[#d3dce6] text-slate-700'
            }`}
          >
            <button
              type="button"
              onClick={() => setActiveView('timeline')}
              className={`px-2 sm:px-3 py-1 rounded-lg transition-all cursor-pointer text-[11px] sm:text-xs ${
                activeView === 'timeline'
                  ? 'bg-[#1d56af] text-white shadow-xs font-bold'
                  : 'hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              <span className="hidden sm:inline">Linha do Tempo</span>
              <span className="sm:hidden">Linha</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveView('month')}
              className={`px-2 sm:px-3 py-1 rounded-lg transition-all cursor-pointer text-[11px] sm:text-xs ${
                activeView === 'month'
                  ? 'bg-[#1d56af] text-white shadow-xs font-bold'
                  : 'hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              Mês
            </button>
          </div>

          <button
            type="button"
            onClick={() => handleOpenCreateModal()}
            className="px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-[#1d56af] hover:bg-[#174690] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
            <span>Nova Tarefa</span>
          </button>

          <button
            type="button"
            onClick={() => setIsSettingsOpen(true)}
            title="Configurações do módulo"
            className={`p-1.5 sm:p-2 rounded-xl border transition-colors cursor-pointer shrink-0 ${
              isDarkMode
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                : 'bg-[#e8edf2] hover:bg-slate-200 text-slate-700 border-[#d3dce6]'
            }`}
          >
            <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          {/* Botões de navegação de data */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            <button
              type="button"
              onClick={handleToday}
              className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                isViewingToday
                  ? isDarkMode
                    ? 'bg-blue-950/70 border-blue-800 text-blue-300'
                    : 'bg-[#e3edfa] border-[#a3c5ed] text-[#124286]'
                  : isDarkMode
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                  : 'bg-[#ffffff] hover:bg-[#e8edf2] text-slate-700 border-[#d3dce6]'
              }`}
            >
              Hoje
            </button>
            <div
              className={`flex items-center gap-0.5 p-0.5 sm:p-1 rounded-xl border ${
                isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-[#e8edf2] border-[#d3dce6]'
              }`}
            >
              <button
                type="button"
                onClick={handlePrevDay}
                className={`p-1 rounded-lg transition-colors cursor-pointer ${
                  isDarkMode ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-[#f4f7fa] text-slate-700'
                }`}
                title="Dia anterior"
              >
                <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
              <button
                type="button"
                onClick={handleNextDay}
                className={`p-1 rounded-lg transition-colors cursor-pointer ${
                  isDarkMode ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-[#f4f7fa] text-slate-700'
                }`}
                title="Próximo dia"
              >
                <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>


      {/* Fita Semanal Interativa (Estilo Tiimo Week Strip) - Visível apenas no modo Linha do Tempo */}
      {activeView === 'timeline' && (
        <div
          className={`border rounded-xl px-1.5 sm:px-2.5 py-1 sm:py-1.5 shadow-xs shrink-0 transition-colors ${
            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-[#f4f7fa] border-[#d3dce6]'
          }`}
        >
          <div className="flex items-center gap-1 sm:gap-1.5">
            {/* Semana anterior */}
            <button
              type="button"
              onClick={handlePrevWeek}
              className={`p-1 rounded-md sm:rounded-lg border transition-colors cursor-pointer shrink-0 ${
                isDarkMode
                  ? 'hover:bg-slate-800 text-slate-400 border-slate-800'
                  : 'hover:bg-[#e8edf2] text-slate-600 border-[#d3dce6]'
              }`}
              title="Semana anterior"
            >
              <ChevronLeft className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </button>

            {/* 7 dias da semana */}
            <div className="grid grid-cols-7 gap-1 sm:gap-1.5 flex-1">
              {weekDays.map((dObj) => {
                const dStr = formatDateToYMD(dObj);
                const isSelected = dStr === selectedDayStr;
                const isToday = dStr === todayStr;

                // Tarefas deste dia
                const tasksOnThisDay = rawTasks.filter((t) => isTaskOnDateStr(t, dStr));
                const allDone =
                  tasksOnThisDay.length > 0 &&
                  tasksOnThisDay.every((t) => isTaskCompletedOnDate(t, dStr));

                const weekDayName = WEEK_DAYS_TIIMO[dObj.getDay() === 0 ? 6 : dObj.getDay() - 1];

                return (
                  <button
                    key={dStr}
                    type="button"
                    onClick={() => {
                      setSelectedDateObj(dObj);
                      setNavMonthDate(dObj);
                    }}
                    className={`py-0.5 sm:py-1 px-0.5 sm:px-1 rounded-lg sm:rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer relative border min-w-0 ${
                      isSelected
                        ? 'bg-[#1d56af] border-[#1d56af] text-white shadow-sm ring-2 ring-[#1d56af]/30'
                        : isToday
                        ? isDarkMode
                          ? 'bg-blue-950/40 border-blue-700 text-blue-300 font-bold'
                          : 'bg-[#e3edfa] border-[#a3c5ed] text-[#124286] font-bold'
                        : isDarkMode
                        ? 'bg-slate-800/60 border-slate-700/80 hover:bg-slate-800 text-slate-300'
                        : 'bg-[#ffffff] border-[#d3dce6] text-slate-700 hover:bg-[#e8edf2]'
                    }`}
                  >
                    <span
                      className={`text-[8px] sm:text-[9px] font-bold uppercase tracking-wider truncate ${
                        isSelected ? 'text-blue-100' : 'text-slate-400'
                      }`}
                    >
                      {weekDayName}
                    </span>
                    <span className="text-xs sm:text-[13px] md:text-sm font-extrabold mt-0.5 leading-none">
                      {dObj.getDate()}
                    </span>

                    {/* Marcador de densidade de tarefas do dia */}
                    <div className="flex items-center gap-0.5 mt-0.5 h-1">
                      {tasksOnThisDay.length > 0 && (
                        <span
                          className={`w-1 sm:w-1.5 h-1 sm:h-1.5 rounded-full ${
                            isSelected
                              ? 'bg-white'
                              : allDone
                              ? 'bg-emerald-500'
                              : 'bg-[#1d56af]'
                          }`}
                          title={`${tasksOnThisDay.length} tarefas`}
                        />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Próxima semana */}
            <button
              type="button"
              onClick={handleNextWeek}
              className={`p-1 rounded-md sm:rounded-lg border transition-colors cursor-pointer shrink-0 ${
                isDarkMode
                  ? 'hover:bg-slate-800 text-slate-400 border-slate-800'
                  : 'hover:bg-[#e8edf2] text-slate-600 border-[#d3dce6]'
              }`}
              title="Próxima semana"
            >
              <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </button>
          </div>
        </div>
      )}


      {/* Área Principal de Conteúdo: Linha do Tempo Tiimo (Centro/Direita) + Mini Calendário/Resumo (Esquerda) */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {activeView === 'timeline' ? (
          <div className="w-full h-full grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4 min-h-0 overflow-hidden">
            {/* Painel Lateral Esquerdo: Resumo do Dia (telas md, lg e xl) */}
            <div className="hidden md:flex md:col-span-5 lg:col-span-5 xl:col-span-5 flex-col gap-2.5 sm:gap-3 min-h-0 overflow-y-auto pr-1">
              {/* Card Resumo do Dia / Visão Geral Tiimo */}
              <div
                className={`border rounded-2xl p-4 sm:p-5 shadow-xs flex-1 flex flex-col min-h-0 transition-colors ${
                  isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-[#f4f7fa] border-[#d3dce6]'
                }`}
              >
                <div className="flex-1 flex flex-col min-h-0">
                  <div className="flex items-center justify-between border-b pb-3 mb-3.5 dark:border-slate-800 border-[#d3dce6] shrink-0">
                    <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#1d56af] dark:text-blue-400">
                      Progresso do Dia
                    </span>
                    <span className="text-xs font-bold text-slate-500 font-mono">
                      {completedInDayCount}/{dayTasks.length} concluídos ({progressPercent}%)
                    </span>
                  </div>

                  {/* Barra de Progresso Suave */}
                  <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden mb-5 shrink-0">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-300 rounded-full"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>

                  {/* Lista rápida de tarefas sem horário (Dia Todo) */}
                  <div className="flex-1 flex flex-col min-h-0">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider shrink-0">
                      Eventos do Dia Todo ({allDayTasks.length})
                    </span>
                    {allDayTasks.length === 0 ? (
                      <p className="text-xs text-slate-400 italic mt-2">Nenhum evento de dia todo.</p>
                    ) : (
                      <div className="space-y-2 mt-2.5 flex-1 overflow-y-auto pr-1 min-h-0">
                        {allDayTasks.map((t) => {
                          const isDone = isTaskCompletedOnDate(t, selectedDayStr);
                          return (
                            <div
                              key={t.id}
                              onClick={(e) => handleOpenEditModal(t, e)}
                              className={`p-2.5 rounded-xl border text-xs flex items-center justify-between gap-2.5 cursor-pointer transition-colors ${
                                isDone
                                  ? 'bg-slate-100 dark:bg-slate-900/60 opacity-70 line-through text-slate-400 border-transparent'
                                  : isDarkMode
                                  ? 'bg-slate-800 border-slate-700 text-slate-200 hover:border-slate-600'
                                  : 'bg-white border-[#d3dce6] text-slate-800 hover:border-[#a3c5ed]'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 truncate">
                                <button
                                  type="button"
                                  onClick={(e) => handleToggleTask(t, e)}
                                  className="shrink-0 cursor-pointer"
                                >
                                  {isDone ? (
                                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                                  ) : (
                                    <Circle className="w-4 h-4 text-slate-400 hover:text-[#1d56af]" />
                                  )}
                                </button>
                                <span className="truncate font-medium">{t.name}</span>
                              </div>
                              <button
                                type="button"
                                onClick={(e) => handleDeleteTask(t.id, e)}
                                className="text-slate-400 hover:text-rose-500 shrink-0 p-1"
                                title="Excluir"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Painel Principal da Linha do Tempo Vertical (Estilo Tiimo) */}
            <div
              className={`col-span-12 md:col-span-7 lg:col-span-7 xl:col-span-7 border rounded-xl sm:rounded-2xl shadow-xs flex flex-col min-h-0 overflow-hidden transition-colors ${
                isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-[#f4f7fa] border-[#d3dce6]'
              }`}
            >

              {/* Barra de Controle de Escala Vertical (Zoom da Linha do Tempo) */}
              <div
                className={`border-b px-3 sm:px-4 py-1.5 flex items-center justify-between gap-2 shrink-0 ${
                  isDarkMode ? 'border-slate-800 bg-slate-950/40' : 'border-[#d3dce6] bg-[#e8edf2]/60'
                }`}
              >
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#1d56af]" />
                  <span>Horários ({timedTasks.length})</span>
                </span>

                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-slate-400 font-semibold mr-1 hidden sm:inline">
                    Escala:
                  </span>
                  <button
                    type="button"
                    onClick={() => handleChangeHourHeight(hourHeight - 8)}
                    disabled={hourHeight <= 30}
                    title="Diminuir zoom (mostrar mais horas)"
                    className={`p-1 rounded-lg border transition-colors cursor-pointer disabled:opacity-40 ${
                      isDarkMode
                        ? 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                        : 'bg-white border-[#d3dce6] text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <ZoomOut className="w-3 h-3" />
                  </button>

                  <div
                    className={`flex items-center rounded-lg p-0.5 border text-[10px] font-bold ${
                      isDarkMode
                        ? 'bg-slate-900 border-slate-800 text-slate-300'
                        : 'bg-white border-[#d3dce6] text-slate-600'
                    }`}
                  >
                    {ZOOM_LEVELS.map((z) => {
                      const isCurrent = Math.abs(hourHeight - z.height) <= 4;
                      return (
                        <button
                          key={z.label}
                          type="button"
                          onClick={() => handleChangeHourHeight(z.height)}
                          className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                            isCurrent
                              ? 'bg-[#1d56af] text-white shadow-2xs'
                              : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          {z.label}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleChangeHourHeight(hourHeight + 8)}
                    disabled={hourHeight >= 76}
                    title="Aumentar zoom (expandir horas)"
                    className={`p-1 rounded-lg border transition-colors cursor-pointer disabled:opacity-40 ${
                      isDarkMode
                        ? 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                        : 'bg-white border-[#d3dce6] text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <ZoomIn className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Área Rolável da Linha do Tempo Vertical */}
              <div ref={timelineScrollRef} className="flex-1 overflow-y-auto relative min-h-0 select-none">
                {isLoading && rawTasks.length === 0 ? (
                  <div className="h-64 flex items-center justify-center text-slate-400 gap-2">
                    <Loader2 className="w-6 h-6 animate-spin text-[#1d56af]" />
                    <span className="text-xs">Carregando linha do tempo...</span>
                  </div>
                ) : (
                  <div
                    className="relative w-full"
                    style={{ height: `${hourMarkers.length * hourHeight}px` }}
                  >
                    {/* Linhas de Grade e Marcadores Horários */}
                    {hourMarkers.map((hour, idx) => {
                      const topPx = idx * hourHeight;
                      const timeStr = `${String(hour).padStart(2, '0')}:00`;

                      return (
                        <div
                          key={hour}
                          className="absolute left-0 right-0 flex items-start group"
                          style={{ top: `${topPx}px`, height: `${hourHeight}px` }}
                          onClick={() => handleOpenCreateModal(hour)}
                        >
                          {/* Coluna Lateral de Horário */}
                          <div className="w-11 sm:w-14 lg:w-16 pr-1.5 sm:pr-2.5 text-right shrink-0 -mt-2">
                            <span className="font-mono text-[10px] sm:text-[11px] font-semibold text-slate-400 group-hover:text-[#1d56af] transition-colors">
                              {timeStr}
                            </span>
                          </div>

                          {/* Linha Divisória de Hora */}
                          <div className="flex-1 h-full border-t border-slate-200 dark:border-slate-800/80 group-hover:bg-[#1d56af]/5 transition-colors relative cursor-pointer">
                            {/* Linha sutil de meia-hora (30 min) */}
                            <div className="absolute left-0 right-0 top-1/2 border-t border-dashed border-slate-200/50 dark:border-slate-800/40 pointer-events-none" />
                          </div>
                        </div>
                      );
                    })}

                    {/* Indicador em Tempo Real "Agora" (se visualizando o dia de hoje) */}
                    {isViewingToday && (() => {
                      const startMins = START_HOUR * 60;
                      const endMins = END_HOUR * 60;
                      if (currentMinutesNow >= startMins && currentMinutesNow <= endMins) {
                        const topPx = ((currentMinutesNow - startMins) / 60) * hourHeight;
                        const nowTimeStr = minutesToTime(currentMinutesNow);

                        return (
                          <div
                            className="absolute left-0 right-0 z-30 pointer-events-none flex items-center"
                            style={{ top: `${topPx}px` }}
                          >
                            <div className="w-11 sm:w-14 lg:w-16 pr-1.5 sm:pr-2 text-right shrink-0">
                              <span className="font-mono text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-rose-500 text-white shadow-xs">
                                {nowTimeStr}
                              </span>
                            </div>
                            <div className="flex-1 flex items-center relative">
                              <span className="w-2 h-2 rounded-full bg-rose-500 -ml-1 shadow-sm ring-2 ring-rose-400/40 animate-pulse" />
                              <div className="w-full border-t-2 border-rose-500/80 shadow-xs" />
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })()}

                    {/* Blocos de Tarefas / Eventos Posicionados */}
                    <div
                      className="absolute inset-y-0 left-11 sm:left-14 lg:left-16 right-1 sm:right-2 pointer-events-none"
                    >
                      {layoutedTimedTasks.map(({ task, top, height, leftPercent, widthPercent }) => {
                        const isDone = isTaskCompletedOnDate(task, selectedDayStr);
                        const recLabel = getRecurrenceLabel(task.recurrence);
                        const desc = task.description || task.notes;
                        const isCompactCard = height < 44;
                        const timeRangeStr = `${task.startTime?.slice(0, 5)} - ${task.endTime ? task.endTime.slice(0, 5) : minutesToTime((task.sMins || 0) + 45)}`;

                        return (
                          <div
                            key={task.id}
                            onClick={(e) => handleOpenEditModal(task, e)}
                            style={{
                              top: `${top}px`,
                              height: `${height}px`,
                              left: `${leftPercent}%`,
                              width: `calc(${widthPercent}% - 4px)`,
                            }}
                            className={`absolute z-20 pointer-events-auto rounded-lg sm:rounded-xl px-1.5 sm:px-2.5 ${
                              isCompactCard ? 'py-0.5' : 'py-1 sm:py-1.5'
                            } flex flex-col justify-center border shadow-xs transition-all cursor-pointer group hover:shadow-md hover:z-25 ${
                              isDone
                                ? isDarkMode
                                  ? 'bg-slate-900/80 border-slate-800 opacity-75'
                                  : 'bg-[#f4f7fa] border-[#d3dce6] opacity-80'
                                : isDarkMode
                                ? 'bg-slate-800/90 border-[#1d56af]/60 hover:border-[#1d56af]'
                                : 'bg-white border-[#b9cee2] hover:border-[#1d56af]'
                            }`}
                          >
                            {/* Borda decorativa lateral esquerda estilo Tiimo */}
                            <div
                              className={`absolute left-0 top-1 bottom-1 w-1 rounded-r-full ${
                                isDone
                                  ? 'bg-emerald-500'
                                  : task.recurrence !== 'none'
                                  ? 'bg-indigo-500'
                                  : 'bg-[#1d56af]'
                              }`}
                            />

                            {/* Conteúdo do Bloco */}
                            <div className="pl-1.5 flex-1 min-w-0 flex flex-col justify-center overflow-hidden">
                              <div className="flex items-center justify-between gap-1 min-w-0">
                                <div className="flex items-center gap-1.5 truncate flex-1 min-w-0">
                                  <h4
                                    className={`text-[11px] sm:text-xs font-bold truncate leading-tight ${
                                      isDone
                                        ? 'line-through text-slate-400 dark:text-slate-500'
                                        : isDarkMode
                                        ? 'text-slate-100'
                                        : 'text-slate-900'
                                    }`}
                                  >
                                    {task.name}
                                  </h4>

                                  {isCompactCard && (
                                    <span className="font-mono text-[9px] sm:text-[10px] font-semibold text-[#1d56af] dark:text-blue-400 shrink-0">
                                      {timeRangeStr}
                                    </span>
                                  )}

                                  {recLabel && !isCompactCard && (
                                    <span
                                      className={`text-[9px] font-semibold px-1 py-0.2 rounded border hidden sm:inline-flex items-center gap-0.5 shrink-0 ${
                                        isDarkMode
                                          ? 'bg-slate-900 border-slate-700 text-slate-300'
                                          : 'bg-[#e8edf2] border-[#d3dce6] text-slate-600'
                                      }`}
                                    >
                                      <Repeat className="w-2.5 h-2.5" />
                                      <span>{recLabel}</span>
                                    </span>
                                  )}
                                </div>

                                {/* Botões de Ação Rápida */}
                                <div className="flex items-center gap-0.5 shrink-0">
                                  <button
                                    type="button"
                                    onClick={(e) => handleToggleTask(task, e)}
                                    className="p-0.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 transition-colors"
                                    title={isDone ? 'Marcar como pendente' : 'Marcar como concluído'}
                                  >
                                    {isDone ? (
                                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500/20" />
                                    ) : (
                                      <Circle className="w-3.5 h-3.5 text-slate-400 hover:text-[#1d56af]" />
                                    )}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => handleDeleteTask(task.id, e)}
                                    className="p-0.5 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/50 text-slate-400 hover:text-rose-600 transition-colors"
                                    title="Excluir evento"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>

                              {/* Horário na segunda linha quando o bloco não for compacto */}
                              {!isCompactCard && (
                                <div className="flex items-center gap-1 font-mono text-[9px] sm:text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                                  <Clock className="w-2.5 h-2.5 text-[#1d56af] shrink-0" />
                                  <span className="truncate">{timeRangeStr}</span>
                                </div>
                              )}

                              {/* Descrição em blocos mais altos */}
                              {desc && height >= 56 && (
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1 italic mt-0.5">
                                  {desc}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Visão Mensal Completa (Grade do Mês) sem scroll */
          <div
            className={`w-full h-full border rounded-xl sm:rounded-2xl p-2.5 sm:p-4 flex flex-col min-h-0 overflow-hidden shadow-xs transition-colors ${
              isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-[#f4f7fa] border-[#d3dce6]'
            }`}
          >
            {/* Cabeçalho do mês */}
            <div className="flex items-center justify-between border-b pb-2 mb-2 dark:border-slate-800 border-[#d3dce6] shrink-0">
              <div className="flex items-center gap-2 sm:gap-3">
                <h3 className="text-sm sm:text-base lg:text-lg font-bold">
                  {MONTH_NAMES[navMonth]} {navYear}
                </h3>
                <button
                  type="button"
                  onClick={handleToday}
                  className="text-xs text-[#1d56af] dark:text-blue-400 font-bold hover:underline cursor-pointer"
                >
                  Ir para Hoje
                </button>
              </div>
              <div className="flex items-center gap-1 sm:gap-1.5">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="p-1 sm:p-1.5 rounded-lg border hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                  title="Mês anterior"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="p-1 sm:p-1.5 rounded-lg border hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                  title="Próximo mês"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Dias da semana */}
            <div className="grid grid-cols-7 mb-1.5 pb-1 border-b dark:border-slate-800 border-[#d3dce6] shrink-0">
              {WEEK_DAYS_SHORT.map((day, idx) => (
                <div
                  key={day}
                  className={`text-center text-[10px] sm:text-xs font-bold uppercase tracking-wider ${
                    idx === 0 || idx === 6
                      ? 'text-[#1d56af]'
                      : isDarkMode
                      ? 'text-slate-400'
                      : 'text-slate-500'
                  }`}
                >
                  <span className="hidden sm:inline">{day}</span>
                  <span className="sm:hidden">{day[0]}</span>
                </div>
              ))}
            </div>

            {/* Grade de dias do mês - Ocupa 100% da altura restante sem necessidade de scroll */}
            <div
              className="flex-1 min-h-0 grid grid-cols-7 gap-1 sm:gap-1.5"
              style={{
                gridTemplateRows: `repeat(${Math.ceil((firstDayOfMonthIndex + daysInNavMonth) / 7)}, minmax(0, 1fr))`
              }}
            >
              {Array.from({ length: firstDayOfMonthIndex }).map((_, idx) => (
                <div key={`empty-${idx}`} className="h-full min-h-0 w-full rounded-lg sm:rounded-xl bg-transparent" />
              ))}

              {Array.from({ length: daysInNavMonth }).map((_, idx) => {
                const dayNumber = idx + 1;
                const cellDateStr = `${navYear}-${String(navMonth + 1).padStart(2, '0')}-${String(dayNumber).padStart(2, '0')}`;
                const isSelected = cellDateStr === selectedDayStr;
                const isToday = cellDateStr === todayStr;

                const tasksOnCell = rawTasks.filter((t) => isTaskOnDateStr(t, cellDateStr));
                const allDone =
                  tasksOnCell.length > 0 &&
                  tasksOnCell.every((t) => isTaskCompletedOnDate(t, cellDateStr));

                return (
                  <button
                    key={dayNumber}
                    type="button"
                    onClick={() => {
                      const dt = new Date(navYear, navMonth, dayNumber);
                      setSelectedDateObj(dt);
                      setActiveView('timeline'); // Ao clicar no dia, abre a linha do tempo daquele dia
                    }}
                    className={`h-full min-h-0 w-full rounded-lg sm:rounded-xl p-1 sm:p-1.5 flex flex-col justify-between items-start transition-all cursor-pointer relative border min-w-0 ${
                      isSelected
                        ? 'bg-[#1d56af] border-[#1d56af] text-white shadow-sm ring-2 ring-[#1d56af]/30'
                        : isToday
                        ? isDarkMode
                          ? 'bg-blue-950/40 border-blue-700 text-blue-300 font-bold'
                          : 'bg-[#e3edfa] border-[#a3c5ed] text-[#124286] font-bold'
                        : isDarkMode
                        ? 'bg-slate-800/60 border-slate-700/80 hover:bg-slate-800 text-slate-300'
                        : 'bg-[#ffffff] border-[#dce3ea] text-slate-700 hover:bg-[#e9edf2]'
                    }`}
                  >
                    <div className="w-full flex items-center justify-between leading-none">
                      <span className="text-[11px] sm:text-xs md:text-sm font-bold">{dayNumber}</span>
                      {tasksOnCell.length > 0 && (
                        <span
                          className={`text-[8px] sm:text-[9px] font-bold px-1 py-0.2 rounded-full ${
                            isSelected
                              ? 'bg-white/25 text-white'
                              : allDone
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-[#1d56af]/10 text-[#1d56af] dark:bg-blue-900/40 dark:text-blue-300'
                          }`}
                        >
                          {tasksOnCell.length}
                        </span>
                      )}
                    </div>

                    {tasksOnCell.length > 0 && (
                      <div className="w-full flex items-center gap-1 overflow-hidden mt-auto">
                        <span
                          className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full shrink-0 ${
                            isSelected
                              ? 'bg-white'
                              : allDone
                              ? 'bg-emerald-500'
                              : 'bg-[#1d56af]'
                          }`}
                        />
                        <span
                          className={`text-[10px] truncate hidden md:inline text-left leading-none ${
                            isSelected
                              ? 'text-blue-100'
                              : allDone
                              ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                              : isDarkMode
                              ? 'text-slate-400'
                              : 'text-slate-600'
                          }`}
                        >
                          {tasksOnCell[0].name}
                        </span>
                      </div>
                    )}
                  </button>
                );
              })}

              {/* Células vazias finais para completar a grade sem alterar o tamanho das linhas */}
              {Array.from({
                length:
                  Math.ceil((firstDayOfMonthIndex + daysInNavMonth) / 7) * 7 -
                  (firstDayOfMonthIndex + daysInNavMonth)
              }).map((_, idx) => (
                <div key={`empty-end-${idx}`} className="h-full min-h-0 w-full rounded-lg sm:rounded-xl bg-transparent" />
              ))}
            </div>
          </div>
        )}
      </div>

      </div>

      {/* Modal Unificado de Criação e Edição (TaskFormModal) */}
      <ModelSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        modelName={displayName}
        isDarkMode={isDarkMode}
      />

      <TaskFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onTaskSaved={() => {
          fetchTasks();
          setIsModalOpen(false);
        }}
        initialModelId={modelId}
        availableModels={[modelInstance]}
        lockModel={true}
        initialDate={modalInitialDate}
        initialStartTime={modalInitialStartTime}
        initialEndTime={modalInitialEndTime}
        editingTask={editingTask}
        isDarkMode={isDarkMode}
      />
    </div>
  );
}
