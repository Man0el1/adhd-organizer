import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Clock,
  CalendarDays,
  Hourglass,
  Brain,
  Plus,
  LogOut,
  Layers,
  Trash2,
  Pencil,
  Loader2,
  ChevronDown,
} from 'lucide-react';
import Pomodoro from '../components/ModelsUi/Pomodoro.js';
import Calendar from '../components/ModelsUi/Calendar.js';
import Routine from '../components/ModelsUi/Routine.js';
import BrainDump from '../components/ModelsUi/BrainDump.js';
import FullScreenOverlay from '../components/ScreenOverlay.js';
import { useNavigate } from 'react-router-dom';

export const MODEL_TEMPLATES = [
  {
    type: 'routine',
    defaultName: 'Agenda Visual',
    icon: Clock,
    color: 'text-[#A67C52]',
  },
  {
    type: 'calendario',
    defaultName: 'Calendário',
    icon: CalendarDays,
    color: 'text-[#800020]',
  },
  {
    type: 'pomodoro',
    defaultName: 'Pomodoro',
    icon: Hourglass,
    color: 'text-amber-400',
  },
  {
    type: 'brain-dump',
    defaultName: 'Brain Dump',
    icon: Brain,
    color: 'text-violet-400',
  },
];

const DEFAULT_MODELS = [
  { id: 'mod-routine-1', type: 'routine', name: 'Agenda Visual' },
  { id: 'mod-calendario-1', type: 'calendario', name: 'Calendário' },
  { id: 'mod-pomodoro-1', type: 'pomodoro', name: 'Pomodoro' },
  { id: 'mod-braindump-1', type: 'brain-dump', name: 'Brain Dump' },
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

// Ex: Modelo_2
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
    case 'routine':
    default:
      return Clock;
  }
}

export default function Main() {
  const navigate = useNavigate();

  const [userModels, setUserModels] = useState(DEFAULT_MODELS);
  const [isLoadingModels, setIsLoadingModels] = useState(true);
  const [activeModelId, setActiveModelId] = useState(DEFAULT_MODELS[0].id);
  const [todayCounts, setTodayCounts] = useState({});

  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const addMenuRef = useRef(null);

  const [editingModelId, setEditingModelId] = useState(null);
  const [editingNameValue, setEditingNameValue] = useState('');

  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 4000);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (addMenuRef.current && !addMenuRef.current.contains(e.target)) {
        setIsAddMenuOpen(false);
      }
    };
    if (isAddMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isAddMenuOpen]);

  const fetchUserModels = useCallback(async () => {
    try {
      const res = await fetch('/api/user/models');
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
      const todayStr = new Date().toISOString().split('T')[0];
      const res = await fetch(`/api/tasks/today-counts?today=${todayStr}`);
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

  useEffect(() => {
    fetchUserModels();
    fetchTodayCounts();
  }, [fetchUserModels, fetchTodayCounts]);

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

  const persistModelsToBackend = async (newModelsList, successMessage = '') => {
    try {
      const res = await fetch('/api/user/models', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ models: newModelsList }),
      });
      if (res.ok) {
        const data = await res.json();
        setUserModels(data.models || newModelsList);
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
    setIsAddMenuOpen(false);

    const uniqueName = getNextWindowsName(template.defaultName, userModels);
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
      `Modelo "${uniqueName}" adicionado e salvo!`
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
    <div className="flex flex-col h-screen w-screen bg-[#1E1414] text-[#F5E6DA] overflow-hidden select-none font-sans">
      <header className="h-14 border-b border-[#3D2B2B] bg-[#251818] px-4 sm:px-6 flex items-center justify-between shrink-0 shadow-md z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#800020] flex items-center justify-center font-bold text-base text-[#F5E6DA] shadow">
            F
          </div>
          <div>
            <h1 className="font-bold text-base sm:text-lg leading-tight tracking-tight text-[#F5E6DA]">
              FocusMod
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#1E1414] px-3 py-1.5 rounded-xl border border-[#3D2B2B]">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span className="text-xs sm:text-sm font-medium text-[#F5E6DA] truncate max-w-[140px]">
              {currentUserName}
            </span>
          </div>

          <button
            type="button"
            onClick={logout}
            title="Sair da conta"
            className="p-2 rounded-xl bg-[#1E1414] hover:bg-[#800020] text-[#D1BFA5] hover:text-[#F5E6DA] transition-colors cursor-pointer text-xs border border-[#3D2B2B]"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
        <aside className="w-full md:w-64 lg:w-72 bg-[#251818] border-r border-[#3D2B2B] flex flex-col justify-between shrink-0 overflow-hidden min-h-0 shadow-md">
          <div className="flex-1 flex flex-col overflow-hidden min-h-0 p-3 sm:p-4">
            <div className="pb-2.5 mb-3 border-b border-[#3D2B2B] flex items-center justify-between shrink-0 relative">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#A67C52] flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                MODELOS
              </span>

              <div className="relative" ref={addMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsAddMenuOpen(!isAddMenuOpen)}
                  title="Adicionar modelo"
                  className="px-2.5 py-1 rounded-xl bg-[#1E1414] hover:bg-[#800020] text-[#A67C52] hover:text-[#F5E6DA] transition-colors border border-[#3D2B2B] text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Adicionar</span>
                  <ChevronDown className="w-3 h-3 opacity-70" />
                </button>

                {isAddMenuOpen && (
                  <div className="absolute right-0 top-full mt-1.5 w-48 bg-[#251818] border border-[#3D2B2B] rounded-xl shadow-2xl p-1.5 z-40 space-y-1 animate-in fade-in zoom-in-95">
                    <div className="px-2.5 py-1 text-[10px] font-bold text-[#A67C52] uppercase tracking-wider border-b border-[#3D2B2B]/70">
                      Escolha o modelo:
                    </div>

                    {MODEL_TEMPLATES.map((tmpl) => {
                      const Icon = tmpl.icon;
                      return (
                        <button
                          key={tmpl.type}
                          type="button"
                          onClick={() => handleDirectAddModel(tmpl)}
                          className="w-full px-2.5 py-2 rounded-lg text-left text-xs font-semibold text-[#F5E6DA] hover:bg-[#800020] hover:text-[#F5E6DA] flex items-center gap-2.5 transition-colors cursor-pointer group"
                        >
                          <Icon className={`w-4 h-4 ${tmpl.color} group-hover:text-[#F5E6DA]`} />
                          <span>{tmpl.defaultName}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <nav className="flex-1 overflow-y-auto space-y-2 pr-0.5 min-h-0">
              {isLoadingModels && userModels.length === 0 ? (
                <div className="flex items-center justify-center py-8 text-[#A67C52] gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
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
                      className={`group relative w-full px-2.5 py-2.5 rounded-2xl border transition-all flex items-center gap-2 cursor-pointer shadow-sm select-none ${
                        isBeingDragged ? 'opacity-30 border-dashed border-[#A67C52]' : ''
                      } ${
                        isOver && !isBeingDragged
                          ? 'border-amber-400 ring-2 ring-amber-500/40 bg-[#2D1F1F]'
                          : ''
                      } ${
                        isActive
                          ? 'bg-[#800020] border-[#A67C52] text-[#F5E6DA] shadow-md ring-1 ring-[#800020]'
                          : 'bg-[#1E1414] border-[#3D2B2B] text-[#D1BFA5] hover:bg-[#2D1F1F] hover:text-[#F5E6DA]'
                      }`}
                    >
                      <div
                        className="cursor-grab active:cursor-grabbing p-1 -ml-1 text-[#6D5A5A] hover:text-[#D1BFA5] shrink-0 touch-none flex flex-col justify-center items-center gap-[3px]"
                        title="Arrastar para reordenar"
                      >
                        <span className="w-3.5 h-[2px] bg-current rounded-full" />
                        <span className="w-3.5 h-[2px] bg-current rounded-full" />
                        <span className="w-3.5 h-[2px] bg-current rounded-full" />
                      </div>

                      <div
                        className={`p-1.5 rounded-xl shrink-0 transition-colors ${
                          isActive
                            ? 'bg-[#A67C52] text-[#1E1414]'
                            : 'bg-[#251818] text-[#A67C52] group-hover:text-[#F5E6DA]'
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
                            className="w-full bg-[#1A1010] border border-[#A67C52] rounded-lg px-2 py-0.5 text-xs text-[#F5E6DA] outline-none"
                          />
                        ) : (
                          <div
                            onDoubleClick={(e) => handleStartRename(model, e)}
                            className="font-semibold text-xs sm:text-sm truncate cursor-pointer"
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
                            className="opacity-0 group-hover:opacity-100 p-1 text-[#6D5A5A] hover:text-[#F5E6DA] hover:bg-[#251818] rounded-md transition-opacity cursor-pointer"
                          >
                            <Pencil className="w-3 h-3" />
                          </button>
                        )}

                        {userModels.length > 1 && editingModelId !== model.id && (
                          <button
                            type="button"
                            onClick={(e) => handleRemoveModel(model.id, e)}
                            title="Excluir este modelo"
                            className="opacity-0 group-hover:opacity-100 p-1 text-[#6D5A5A] hover:text-red-400 hover:bg-[#251818] rounded-md transition-opacity cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}

                        {hasTasksForToday && (
                          <div
                            className="flex items-center gap-1.5 shrink-0 pl-0.5"
                            title={`${todayCount} tarefa(s) para hoje`}
                          >
                            <span className="relative flex h-2.5 w-2.5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500 ring-2 ring-[#251818]"></span>
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

        <main className="flex-1 bg-[#1E1414] p-0 flex flex-col overflow-hidden min-h-0">
          <div className="w-full h-full flex-1 flex flex-col min-h-0">
            {activeModel?.type === 'routine' && (
              <Routine modelInstance={activeModel} />
            )}
            {activeModel?.type === 'calendario' && (
              <Calendar modelInstance={activeModel} />
            )}
            {activeModel?.type === 'pomodoro' && (
              <Pomodoro modelInstance={activeModel} />
            )}
            {activeModel?.type === 'brain-dump' && (
              <BrainDump modelInstance={activeModel} />
            )}
          </div>
        </main>
      </div>

      <button
        type="button"
        onClick={() => setIsOverlayOpen(true)}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 w-12 h-12 rounded-full bg-[#800020] hover:bg-[#A00028] text-[#F5E6DA] shadow-2xl flex items-center justify-center transition-all transform hover:scale-110 active:scale-95 cursor-pointer ring-2 ring-[#A67C52]/50 border border-[#800020]"
        title="Adicionar nova tarefa (+)"
      >
        <Plus className="w-6 h-6 stroke-[2.5]" />
      </button>

      <FullScreenOverlay
        isOpen={isOverlayOpen}
        onClose={() => setIsOverlayOpen(false)}
        onTaskCreated={handleTaskCreated}
        availableModels={userModels}
      />

      {toastMessage && (
        <div className="fixed top-16 right-5 z-50 bg-[#2D1F1F] border border-[#800020] text-[#F5E6DA] px-4 py-3 rounded-2xl shadow-2xl text-xs sm:text-sm font-semibold flex items-center gap-2.5 animate-in slide-in-from-top duration-200">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0"></span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}