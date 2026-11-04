import React, { useState, useEffect, useCallback } from 'react';
import Pomodoro from '../components/ModelsUi/Pomodoro.js';
import Calendar from '../components/ModelsUi/Calendar.js';
import Routine from '../components/ModelsUi/Routine.js';
import BrainDump from '../components/ModelsUi/BrainDump.js';
import Microtasks from '../components/ModelsUi/Microtasks.jsx';
import KanbanBoard from '../components/ModelsUi/KanbanBoard.jsx';
import PriorityMatrix from '../components/ModelsUi/PriorityMatrix.jsx';
import HabitTracker from '../components/ModelsUi/HabitTracker.jsx';
import DailyRoutines from '../components/ModelsUi/DailyRoutines.jsx';
import FullScreenOverlay from '../components/ScreenOverlay.js';
import AddModelModal from '../components/AddModelModal.js';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../utils/api.js';
import {
  getTodayLocalStr,
  getUserTimezone,
  setUserTimezone,
  getDetectedBrowserTimezone,
} from '../utils/date.js';
import { initGlobalPomodoroTicker } from '../utils/pomodoroManager.js';
import {
  Clock,
  CalendarDays,
  Hourglass,
  Brain,
  ListChecks,
  Columns,
  Grid2X2,
  Flame,
  Plus,
  LogOut,
  Layers,
  Trash2,
  Pencil,
  Loader2,
  Sun,
  Moon,
  Sparkles,
} from 'lucide-react';

export const MODEL_TEMPLATES = [
  {
    type: 'routine',
    defaultName: 'Agenda Visual',
    icon: Clock,
    color: 'text-[#1d56af]',
  },
  {
    type: 'calendario',
    defaultName: 'Calendário',
    icon: CalendarDays,
    color: 'text-indigo-600',
  },
  {
    type: 'pomodoro',
    defaultName: 'Pomodoro',
    icon: Hourglass,
    color: 'text-emerald-600',
  },
  {
    type: 'brain-dump',
    defaultName: 'Brain Dump',
    icon: Brain,
    color: 'text-amber-600',
  },
  {
    type: 'microtasks',
    defaultName: 'Microtarefas',
    icon: ListChecks,
    color: 'text-emerald-600',
  },
  {
    type: 'kanban',
    defaultName: 'Kanban',
    icon: Columns,
    color: 'text-indigo-600',
  },
  {
    type: 'priority-matrix',
    defaultName: 'Matriz de Prioridades',
    icon: Grid2X2,
    color: 'text-violet-600',
  },
  {
    type: 'habits',
    defaultName: 'Rastreador de Hábitos',
    icon: Flame,
    color: 'text-emerald-500',
  },
  {
    type: 'daily-routines',
    defaultName: 'Rotinas Diárias',
    icon: Sun,
    color: 'text-amber-500',
  },
];

const DEFAULT_MODELS = [
  { id: 'mod-routine-1', type: 'routine', name: 'Agenda Visual' },
  { id: 'mod-calendario-1', type: 'calendario', name: 'Calendário' },
  { id: 'mod-pomodoro-1', type: 'pomodoro', name: 'Pomodoro' },
  { id: 'mod-braindump-1', type: 'brain-dump', name: 'Brain Dump' },
  { id: 'mod-microtasks-1', type: 'microtasks', name: 'Microtarefas' },
  { id: 'mod-kanban-1', type: 'kanban', name: 'Kanban' },
  { id: 'mod-matrix-1', type: 'priority-matrix', name: 'Matriz de Prioridades' },
  { id: 'mod-habits-1', type: 'habits', name: 'Rastreador de Hábitos' },
  { id: 'mod-dailyroutines-1', type: 'daily-routines', name: 'Rotinas Diárias' },
];

function getInfoFromToken() {
  const token = localStorage.getItem('token');
  if (!token) return 'Usuário';

  try {
    const payloadBase64 = token.split('.')[1];
    const decodedPayload = JSON.parse(atob(payloadBase64));
    return decodedPayload.username || decodedPayload.email?.split('@')[0];
  } catch {
    return 'Usuário';
  }
}

export function getNextWindowsName(baseName, currentModels, currentId = null) {
  const existingNames = currentModels
    .filter((m) => (currentId ? m.id !== currentId : true))
    .map((m) => (m.name || '').trim());

  if (!existingNames.includes(baseName)) {
    return baseName;
  }

  let counter = 2;
  while (existingNames.includes(`${baseName} (${counter})`)) {
    counter++;
  }
  return `${baseName} (${counter})`;
}

export function getModelIcon(type) {
  switch (type) {
    case 'calendario':
      return CalendarDays;
    case 'pomodoro':
      return Hourglass;
    case 'brain-dump':
      return Brain;
    case 'microtasks':
      return ListChecks;
    case 'kanban':
      return Columns;
    case 'priority-matrix':
      return Grid2X2;
    case 'habits':
      return Flame;
    case 'daily-routines':
      return Sun;
    case 'routine':
    default:
      return Clock;
  }
}

export default function Main() {
  const navigate = useNavigate();

  // Verifica se o token existe: caso não exista, redireciona para /login
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  // Modo Escuro persistido no localStorage (padrão: false / claro)
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('focusmod_theme');
    return saved === 'dark';
  });

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      localStorage.setItem('focusmod_theme', next ? 'dark' : 'light');
      return next;
    });
  };

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const [userModels, setUserModels] = useState(DEFAULT_MODELS);
  const [isLoadingModels, setIsLoadingModels] = useState(true);
  const [activeModelId, setActiveModelId] = useState(DEFAULT_MODELS[0].id);
  const [todayCounts, setTodayCounts] = useState({});

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [editingModelId, setEditingModelId] = useState(null);
  const [editingNameValue, setEditingNameValue] = useState('');

  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [currentTimezone] = useState(() => getDetectedBrowserTimezone());
  const [toastMessage, setToastMessage] = useState('');
  const [pomodoroTickers, setPomodoroTickers] = useState({});

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 4000);
  };

  // Inicializa o ticker em segundo plano do Pomodoro para continuar rodando
  // mesmo que o usuário navegue entre a Agenda Visual, Calendário ou Brain Dump
  useEffect(() => {
    initGlobalPomodoroTicker();

    const handlePomodoroTick = (e) => {
      if (e?.detail?.modelId) {
        setPomodoroTickers((prev) => ({
          ...prev,
          [e.detail.modelId]: e.detail,
        }));
      }
    };

    const handlePomodoroStateChanged = (e) => {
      if (e?.detail?.modelId) {
        setPomodoroTickers((prev) => ({
          ...prev,
          [e.detail.modelId]: {
            modelId: e.detail.modelId,
            remainingSeconds: e.detail.state.remainingSeconds,
            isRunning: e.detail.state.isRunning,
          },
        }));
      }
    };

    const handlePomodoroCompleted = (e) => {
      if (e?.detail?.notice) {
        showToast(e.detail.notice);
      }
    };

    window.addEventListener('focusmod_pomodoro_tick', handlePomodoroTick);
    window.addEventListener('focusmod_pomodoro_state_changed', handlePomodoroStateChanged);
    window.addEventListener('focusmod_pomodoro_completed', handlePomodoroCompleted);

    return () => {
      window.removeEventListener('focusmod_pomodoro_tick', handlePomodoroTick);
      window.removeEventListener('focusmod_pomodoro_state_changed', handlePomodoroStateChanged);
      window.removeEventListener('focusmod_pomodoro_completed', handlePomodoroCompleted);
    };
  }, []);

  const fetchUserModels = useCallback(async () => {
    try {
      const res = await apiFetch('/api/user/models');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.models) && data.models.length > 0) {
          setUserModels(data.models);
          setActiveModelId((curr) => {
            const exists = data.models.some((m) => m.id === curr);
            return exists ? curr : data.models[0].id;
          });
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingModels(false);
    }
  }, []);

  const fetchTodayCounts = useCallback(async () => {
    try {
      const tz = getUserTimezone();
      const todayStr = getTodayLocalStr(tz);
      const res = await apiFetch(`/api/tasks/today-counts?today=${todayStr}&timezone=${encodeURIComponent(tz)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.counts) {
          setTodayCounts(data.counts);
        }
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  // Sincroniza sempre o fuso horário detectado pelo navegador com o perfil no backend
  const syncProfileTimezone = useCallback(async () => {
    try {
      const detected = getDetectedBrowserTimezone();
      setUserTimezone(detected);
      await apiFetch('/api/user/timezone', {
        method: 'PATCH',
        body: JSON.stringify({ timezone: detected }),
      });
    } catch (err) {
      console.warn('Aviso ao sincronizar fuso horário:', err);
    }
  }, []);

  useEffect(() => {
    fetchUserModels();
    fetchTodayCounts();
    syncProfileTimezone();
  }, [fetchUserModels, fetchTodayCounts, syncProfileTimezone]);

  useEffect(() => {
    const handleTaskEvent = () => {
      fetchTodayCounts();
    };
    window.addEventListener('focusmod_task_created', handleTaskEvent);
    window.addEventListener('focusmod_task_updated', handleTaskEvent);
    return () => {
      window.removeEventListener('focusmod_task_created', handleTaskEvent);
      window.removeEventListener('focusmod_task_updated', handleTaskEvent);
    };
  }, [fetchTodayCounts]);

  const persistModelsToBackend = async (newModelsList, successMessage = '', keepActiveIndex = null) => {
    try {
      const res = await apiFetch('/api/user/models', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ models: newModelsList }),
      });
      if (res.ok) {
        const data = await res.json();
        const savedList = data.models || newModelsList;
        setUserModels(savedList);
        if (keepActiveIndex !== null && savedList[keepActiveIndex]) {
          setActiveModelId(savedList[keepActiveIndex].id);
        } else {
          setActiveModelId((curr) => {
            const exists = savedList.some((m) => m.id === curr);
            if (exists) return curr;
            const currModel = newModelsList.find((m) => m.id === curr);
            if (currModel) {
              const matched = savedList.find(
                (m) => m.name === currModel.name && m.type === currModel.type
              );
              if (matched) return matched.id;
            }
            return savedList[0]?.id || curr;
          });
        }
        if (successMessage) {
          showToast(successMessage);
        }
      }
    } catch (err) {
      console.error(err);
      showToast('Erro ao sincronizar modelos com o servidor.');
    }
  };

  const handleDirectAddModel = async (template) => {
    setIsAddModalOpen(false);

    const baseName = template.defaultName || template.name || 'Modelo';
    const uniqueName = getNextWindowsName(baseName, userModels);
    const newInstance = {
      id: `mod-${template.type}-${Date.now()}`,
      type: template.type,
      name: uniqueName,
    };

    const updated = [...userModels, newInstance];
    setUserModels(updated);
    setActiveModelId(newInstance.id);

    await persistModelsToBackend(
      updated,
      `Modelo "${uniqueName}" adicionado e salvo!`,
      updated.length - 1
    );
  };

  const handleStartRename = (model, e) => {
    e.stopPropagation();
    setEditingModelId(model.id);
    setEditingNameValue(model.name);
  };

  const handleFinishRename = async (modelId) => {
    if (!editingModelId) return;

    const target = userModels.find((m) => m.id === modelId);
    if (!target) {
      setEditingModelId(null);
      return;
    }

    const tpl = MODEL_TEMPLATES.find((t) => t.type === target.type) || MODEL_TEMPLATES[0];
    const rawName = editingNameValue.trim() || tpl.defaultName;
    const finalName = getNextWindowsName(rawName, userModels, modelId);

    const updated = userModels.map((m) =>
      m.id === modelId ? { ...m, name: finalName } : m
    );

    setUserModels(updated);
    setEditingModelId(null);

    await persistModelsToBackend(updated, `Nome "${finalName}" salvo!`);
  };

  const handleRemoveModel = async (modelId, e) => {
    e.stopPropagation();
    if (userModels.length <= 1) {
      showToast('Mantenha pelo menos um modelo na barra lateral.');
      return;
    }

    const updated = userModels.filter((m) => m.id !== modelId);
    setUserModels(updated);

    if (activeModelId === modelId) {
      setActiveModelId(updated[0].id);
    }

    await persistModelsToBackend(updated, 'Modelo removido e salvo no backend!');
  };

  const handleDragStart = (e, index) => {
    if (editingModelId) return;
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = async (e, targetIndex) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const updated = [...userModels];
    const [moved] = updated.splice(draggedIndex, 1);
    updated.splice(targetIndex, 0, moved);

    setUserModels(updated);
    setDraggedIndex(null);
    setDragOverIndex(null);

    await persistModelsToBackend(updated, 'Ordem dos modelos salva no backend!');
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleTaskCreated = (newTask) => {
    showToast(`Tarefa "${newTask.name}" criada e sincronizada!`);
    fetchTodayCounts();
  };

  const logout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const currentUserName = getInfoFromToken();
  const activeModel =
    userModels.find((m) => m.id === activeModelId) || userModels[0] || DEFAULT_MODELS[0];

  return (
    <div
      className={`flex flex-col h-screen w-screen overflow-hidden select-none font-sans transition-colors duration-200 ${
        isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-[#ebf0f5] text-slate-800'
      }`}
    >
      {/* Top Header */}
      <header
        className={`h-14 border-b px-4 sm:px-6 flex items-center justify-between shrink-0 z-20 transition-colors ${
          isDarkMode
            ? 'bg-slate-900 border-slate-800 shadow-sm'
            : 'bg-[#f4f7fa] border-[#d3dce6] shadow-xs'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#1d56af] flex items-center justify-center font-bold text-base text-white shadow-xs">
            F
          </div>
          <div>
            <h1
              className={`font-bold text-base sm:text-lg leading-tight tracking-tight ${
                isDarkMode ? 'text-slate-100' : 'text-slate-900'
              }`}
            >
              FocusMod
            </h1>
          </div>
        </div>

        {/* User name, Dark Mode toggle, and Logout */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* User badge */}
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs sm:text-sm font-medium ${
              isDarkMode
                ? 'bg-slate-800 border-slate-700 text-slate-200'
                : 'bg-[#e8edf2] border-[#d3dce6] text-slate-700'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="truncate max-w-[120px] sm:max-w-[180px] font-medium">
              {currentUserName}
            </span>
          </div>

          {/* Dark Mode / Light Mode Toggle Button */}
          <button
            type="button"
            onClick={toggleDarkMode}
            title={isDarkMode ? 'Alternar tema (Claro)' : 'Alternar tema (Escuro)'}
            aria-label={isDarkMode ? 'Alternar para modo claro' : 'Alternar para modo escuro'}
            className={`p-2 rounded-xl border transition-colors cursor-pointer ${
              isDarkMode
                ? 'bg-slate-800 hover:bg-slate-700 text-amber-300 border-slate-700'
                : 'bg-[#e8edf2] hover:bg-[#dde4ec] text-slate-700 border-[#d3dce6]'
            }`}
          >
            {isDarkMode ? (
              <Sun className="w-4 h-4 text-amber-400 shrink-0" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600 shrink-0" />
            )}
          </button>

          {/* Logout button */}
          <button
            type="button"
            onClick={logout}
            title="Sair da conta"
            className={`p-2 rounded-xl transition-colors cursor-pointer text-xs border ${
              isDarkMode
                ? 'bg-slate-800 hover:bg-rose-950/60 text-slate-300 hover:text-rose-300 border-slate-700 hover:border-rose-800'
                : 'bg-[#e8edf2] hover:bg-rose-50 text-slate-600 hover:text-rose-600 border-[#d3dce6] hover:border-rose-200'
            }`}
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Layout Area */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
        {/* Sidebar */}
        <aside
          className={`w-full md:w-64 lg:w-72 border-r flex flex-col justify-between shrink-0 overflow-hidden min-h-0 transition-colors ${
            isDarkMode
              ? 'bg-slate-900 border-slate-800'
              : 'bg-[#f4f7fa] border-[#d3dce6]'
          }`}
        >
          <div className="flex-1 flex flex-col overflow-hidden min-h-0 p-3 sm:p-4">
            <div
              className={`pb-2.5 mb-3 border-b flex items-center justify-between shrink-0 relative ${
                isDarkMode ? 'border-slate-800' : 'border-[#d3dce6]'
              }`}
            >
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                MODELOS
              </span>

              <button
                type="button"
                onClick={() => setIsAddModalOpen(true)}
                title="Adicionar novo modelo"
                className={`px-2.5 py-1 rounded-xl border text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 transition-colors ${
                  isDarkMode
                    ? 'bg-blue-950/60 hover:bg-blue-900/60 text-blue-300 border-blue-800/80'
                    : 'bg-[#e3edfa] hover:bg-[#d4e4f7] text-[#124286] border-[#a3c5ed]'
                }`}
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>Adicionar</span>
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto space-y-1.5 pr-0.5 min-h-0">
              {isLoadingModels && userModels.length === 0 ? (
                <div className="flex items-center justify-center py-8 text-slate-400 gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-[#1d56af]" />
                  <span className="text-xs">Carregando modelos...</span>
                </div>
              ) : (
                userModels.map((model, index) => {
                  const Icon = getModelIcon(model.type);
                  const isActive = activeModelId === model.id;
                  const isBeingDragged = draggedIndex === index;
                  const isOver = dragOverIndex === index;
                  const todayCount = todayCounts[model.id] || 0;
                  const hasTasksForToday = model.type !== 'pomodoro' && todayCount > 0;

                  return (
                    <div
                      key={model.id}
                      draggable={editingModelId !== model.id}
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDrop={(e) => handleDrop(e, index)}
                      onDragEnd={handleDragEnd}
                      onClick={() => {
                        if (editingModelId !== model.id) {
                          setActiveModelId(model.id);
                        }
                      }}
                      className={`group relative w-full px-2.5 py-2.5 rounded-xl border transition-all flex items-center gap-2 cursor-pointer shadow-xs select-none ${
                        isBeingDragged ? 'opacity-30 border-dashed border-[#1d56af]' : ''
                      } ${
                        isOver && !isBeingDragged
                          ? isDarkMode
                            ? 'border-blue-500 ring-2 ring-blue-500/30 bg-slate-800'
                            : 'border-[#1d56af] ring-2 ring-[#1d56af]/20 bg-[#e3edfa]/60'
                          : ''
                      } ${
                        isActive
                          ? isDarkMode
                            ? 'bg-blue-950/70 border-blue-700 text-blue-100 shadow-xs ring-1 ring-blue-600/40 font-semibold'
                            : 'bg-[#e3edfa] border-[#a3c5ed] text-[#124286] shadow-xs ring-1 ring-[#1d56af]/25 font-semibold'
                          : isDarkMode
                          ? 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:bg-slate-800 hover:text-white'
                          : 'bg-[#ffffff]/80 border-[#d3dce6] text-slate-700 hover:bg-[#e9edf2] hover:text-slate-900 hover:border-[#b9cee2]'
                      }`}
                    >
                      <div
                        className={`cursor-grab active:cursor-grabbing p-1 -ml-1 shrink-0 touch-none flex flex-col justify-center items-center gap-[3px] transition-colors ${
                          isDarkMode
                            ? 'text-slate-500 hover:text-slate-300'
                            : 'text-slate-300 hover:text-slate-500'
                        }`}
                        title="Arrastar para reordenar"
                      >
                        <span className="w-3.5 h-[2px] bg-current rounded-full" />
                        <span className="w-3.5 h-[2px] bg-current rounded-full" />
                        <span className="w-3.5 h-[2px] bg-current rounded-full" />
                      </div>

                      <div
                        className={`p-1.5 rounded-lg shrink-0 transition-colors ${
                          isActive
                            ? 'bg-[#1d56af] text-white'
                            : isDarkMode
                            ? 'bg-slate-700 text-slate-300 group-hover:text-white'
                            : 'bg-[#e8edf2] text-slate-600 group-hover:text-slate-900'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>

                      <div className="flex-1 min-w-0 pr-1">
                        {editingModelId === model.id ? (
                          <input
                            type="text"
                            autoFocus
                            value={editingNameValue}
                            onChange={(e) => setEditingNameValue(e.target.value)}
                            onBlur={() => handleFinishRename(model.id)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleFinishRename(model.id);
                              if (e.key === 'Escape') setEditingModelId(null);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className={`w-full rounded-lg px-2 py-0.5 text-xs outline-none border ${
                              isDarkMode
                                ? 'bg-slate-950 border-blue-500 text-white'
                                : 'bg-white border-[#1d56af] text-slate-900'
                            }`}
                          />
                        ) : (
                          <div
                            onDoubleClick={(e) => handleStartRename(model, e)}
                            className="font-medium text-xs sm:text-sm truncate cursor-pointer"
                            title="Clique duas vezes ou use o lápis para renomear"
                          >
                            {model.name}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {editingModelId !== model.id && (
                          <button
                            type="button"
                            onClick={(e) => handleStartRename(model, e)}
                            title="Renomear modelo"
                            className={`opacity-0 group-hover:opacity-100 p-1 rounded-md transition-opacity cursor-pointer ${
                              isDarkMode
                                ? 'text-slate-400 hover:text-white hover:bg-slate-700'
                                : 'text-slate-400 hover:text-slate-700 hover:bg-slate-200/60'
                            }`}
                          >
                            <Pencil className="w-3 h-3" />
                          </button>
                        )}

                        {userModels.length > 1 && editingModelId !== model.id && (
                          <button
                            type="button"
                            onClick={(e) => handleRemoveModel(model.id, e)}
                            title="Excluir este modelo"
                            className={`opacity-0 group-hover:opacity-100 p-1 rounded-md transition-opacity cursor-pointer ${
                              isDarkMode
                                ? 'text-slate-400 hover:text-rose-400 hover:bg-slate-700'
                                : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                            }`}
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}

                        {/* Indicador de Pomodoro rodando em segundo plano */}
                        {model.type === 'pomodoro' && pomodoroTickers[model.id]?.isRunning && (
                          <div
                            className="flex items-center gap-1.5 px-1.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-mono text-[10px] font-bold shrink-0"
                            title="Pomodoro em andamento"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                            <span>
                              {String(Math.floor((pomodoroTickers[model.id].remainingSeconds || 0) / 60)).padStart(2, '0')}:
                              {String((pomodoroTickers[model.id].remainingSeconds || 0) % 60).padStart(2, '0')}
                            </span>
                          </div>
                        )}

                        {hasTasksForToday && (
                          <div
                            className="flex items-center gap-1.5 shrink-0 pl-0.5"
                            title={`${todayCount} tarefa(s) para hoje`}
                          >
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#528fd8] opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#1d56af]"></span>
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </nav>
          </div>
        </aside>

        {/* Central Content Area */}
        <main
          className={`flex-1 p-0 flex flex-col overflow-hidden min-h-0 transition-colors ${
            isDarkMode ? 'bg-slate-950' : 'bg-[#ebf0f5]'
          }`}
        >
          <div className="w-full h-full flex-1 flex flex-col min-h-0">
            {activeModel?.type === 'routine' && (
              <Routine modelInstance={activeModel} isDarkMode={isDarkMode} />
            )}
            {activeModel?.type === 'calendario' && (
              <Calendar modelInstance={activeModel} isDarkMode={isDarkMode} />
            )}
            {activeModel?.type === 'pomodoro' && (
              <Pomodoro modelInstance={activeModel} isDarkMode={isDarkMode} />
            )}
            {activeModel?.type === 'brain-dump' && (
              <BrainDump modelInstance={activeModel} isDarkMode={isDarkMode} />
            )}
            {activeModel?.type === 'microtasks' && (
              <Microtasks modelInstance={activeModel} isDarkMode={isDarkMode} />
            )}
            {activeModel?.type === 'kanban' && (
              <KanbanBoard modelInstance={activeModel} isDarkMode={isDarkMode} />
            )}
            {activeModel?.type === 'priority-matrix' && (
              <PriorityMatrix modelInstance={activeModel} isDarkMode={isDarkMode} />
            )}
            {activeModel?.type === 'habits' && (
              <HabitTracker modelInstance={activeModel} isDarkMode={isDarkMode} />
            )}
            {activeModel?.type === 'daily-routines' && (
              <DailyRoutines modelInstance={activeModel} isDarkMode={isDarkMode} />
            )}
          </div>
        </main>
      </div>

      {/* Floating AI & Add Task Buttons */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 flex items-center gap-3">
        {/* Botão de IA (Sem função por enquanto) */}
        <button
          type="button"
          className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-500 hover:from-indigo-500 hover:via-blue-500 hover:to-cyan-400 text-white shadow-xl flex items-center justify-center transition-all transform hover:scale-105 active:scale-95 cursor-pointer ring-4 ring-indigo-500/20"
          title="Assistente de Inteligência Artificial"
        >
          <Sparkles className="w-6 h-6" />
        </button>

        {/* Floating Add Task Button (+) */}
        <button
          type="button"
          onClick={() => setIsOverlayOpen(true)}
          className="w-12 h-12 rounded-full bg-[#1d56af] hover:bg-[#16438a] text-white shadow-xl flex items-center justify-center transition-all transform hover:scale-105 active:scale-95 cursor-pointer ring-4 ring-[#1d56af]/25"
          title="Adicionar nova tarefa (+)"
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
        </button>
      </div>

      {/* Full Screen Slide-over / Modal for Adding Tasks */}
      <FullScreenOverlay
        isOpen={isOverlayOpen}
        onClose={() => setIsOverlayOpen(false)}
        onTaskCreated={handleTaskCreated}
        availableModels={userModels}
        initialModelId={activeModelId}
        isDarkMode={isDarkMode}
      />

      {/* Add Model Instance Modal */}
      <AddModelModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddModel={handleDirectAddModel}
        existingModels={userModels}
        isDarkMode={isDarkMode}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-16 right-5 z-50 px-4 py-3 rounded-xl border shadow-xl text-xs sm:text-sm font-semibold flex items-center gap-2.5 animate-in slide-in-from-top duration-200 ${
            isDarkMode
              ? 'bg-slate-800 border-slate-700 text-slate-100'
              : 'bg-[#f4f7fa] border-[#d3dce6] text-slate-900'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
