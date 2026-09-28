import React, { useState, useEffect } from 'react';
import {
  Folder,
  FolderPlus,
  ChevronDown,
  ChevronRight,
  Plus,
  Clock,
  CalendarDays,
  Calendar as CalendarIcon,
  Trash2,
  LogOut,
  Brain,
  Layers
} from 'lucide-react';
import Pomodoro from '../components/ModelsUi/Pomodoro.js';
import Calendar from '../components/ModelsUi/Calendar.js';
import Routine from '../components/ModelsUi/Routine.js';
import BrainDump from '../components/ModelsUi/BrainDump.js';
import FullScreenOverlay from '../components/ScreenOverlay.js';
import { useNavigate } from 'react-router-dom';

export default function Main({userData}) {
  const navigate = useNavigate();

  const initialSpaces = () => {
    const saved = localStorage.getItem('focusmod_spaces'); //TODO: Mudar para API real
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return [
      {
        id: 'space-rotina',
        name: 'Rotina & Foco',
        icon: '☀️',
        isOpen: true,
      },
      {
        id: 'space-estudos',
        name: 'Estudos & Prazos',
        icon: '📚',
        isOpen: true,
      },
      {
        id: 'space-pessoal',
        name: 'Espaço Pessoal',
        icon: '🧠',
        isOpen: false,
      }
    ];
  };

  const logout = () => {
    if (localStorage.getItem('token')) localStorage.removeItem('token');
    navigate('/');
  }

  const initialModules = () => {
    const saved = localStorage.getItem('focusmod_user_modules');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return [
      {
        id: 'pomodoro-1',
        name: 'Pomodoro Adaptativo',
        type: 'pomodoro',
        spaceId: 'space-rotina',
      },
      {
        id: 'routine',
        name: 'Agenda Visual',
        type: 'routine',
        spaceId: 'space-rotina',
      },
      {
        id: 'calendario-1',
        name: 'Calendário de Prazos',
        type: 'calendario',
        spaceId: 'space-estudos',
      },
      {
        id: 'brain-dump',
        name: 'Brain Dump',
        type: 'brain-dump',
        spaceId: 'space-pessoal',
      },
    ];
  };

  const [spaces, setSpaces] = useState(initialSpaces);
  const [modules, setModules] = useState(initialModules);
  const [activeModuleId, setActiveModuleId] = useState('pomodoro-1');

  // Modals & Overlay state
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [showCreateSpaceModal, setShowCreateSpaceModal] = useState(false);
  const [showCreateModuleModal, setShowCreateModuleModal] = useState(false);
  const [targetSpaceForNewModule, setTargetSpaceForNewModule] = useState('space-rotina');

  // Form states for creating Space
  const [newSpaceName, setNewSpaceName] = useState('');
  const [newSpaceIcon, setNewSpaceIcon] = useState('📁');

  // Form states for creating Module
  const [newModuleName, setNewModuleName] = useState('');
  const [newModuleType, setNewModuleType] = useState('pomodoro');

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('focusmod_spaces', JSON.stringify(spaces)); // TODO: Mudar para API real
  }, [spaces]);

  useEffect(() => {
    localStorage.setItem('focusmod_user_modules', JSON.stringify(modules));
  }, [modules]);

  // Space management // TODO: spaces should be managed by API in the future
  const toggleSpaceOpen = (spaceId) => {
    setSpaces(spaces.map((s) => (s.id === spaceId ? { ...s, isOpen: !s.isOpen } : s)));
  };

  const handleCreateSpace = (e) => {
    e.preventDefault();
    if (!newSpaceName.trim()) return;
    const newSpace = {
      id: `space-${Date.now()}`,
      name: newSpaceName.trim(),
      icon: newSpaceIcon || '📁',
      isOpen: true,
    };
    setSpaces([...spaces, newSpace]);
    setNewSpaceName('');
    setShowCreateSpaceModal(false);
  };

  const handleDeleteSpace = (spaceId, e) => {
    e.stopPropagation();
    if (spaces.length <= 1) return;
    const remaining = spaces.filter((s) => s.id !== spaceId);
    const fallbackSpaceId = remaining[0]?.id || 'geral';
    setModules(
      modules.map((m) => (m.spaceId === spaceId ? { ...m, spaceId: fallbackSpaceId } : m))
    );
    setSpaces(remaining);
  };

  // Module management // TODO modules precisa ser editado na api
  const handleOpenCreateModule = (spaceId) => {
    setTargetSpaceForNewModule(spaceId);
    setNewModuleName('');
    setNewModuleType('pomodoro');
    setShowCreateModuleModal(true);
  };

  const handleCreateModule = (e) => {
    e.preventDefault();
    const type = newModuleType;
    const defaultName = type === 'pomodoro' ? 'Pomodoro Adaptativo' : 'Calendário & Prazos';
    const finalName = newModuleName.trim() || defaultName;

    const newMod = {
      id: `${type}-${Date.now()}`,
      name: finalName,
      type: type,
      spaceId: targetSpaceForNewModule || spaces[0]?.id || 'space-rotina',
    };

    setModules([...modules, newMod]);
    setActiveModuleId(newMod.id);
    setShowCreateModuleModal(false);
    setNewModuleName('');
  };

  const handleDeleteModule = (modId, e) => {
    e.stopPropagation();
    if (modules.length <= 1) return;
    const remaining = modules.filter((m) => m.id !== modId);
    setModules(remaining);
    if (activeModuleId === modId) {
      setActiveModuleId(remaining[0]?.id);
    }
  };

  const getModuleIcon = (type, className = 'w-3.5 h-3.5') => { // TODO mudar type para nome
    switch (type) {
      case 'pomodoro':
        return <Clock className={`${className} text-[#A67C52]`} />;
      case 'calendario':
        return <CalendarDays className={`${className} text-[#800020]`} />;
      case 'routine':
      case 'agenda-visual':
        return <CalendarIcon className={`${className} text-[#A67C52]`} />;
      case 'brain-dump':
        return <Brain className={`${className} text-violet-400`} />;
      default:
        return <Layers className={`${className} text-[#A67C52]`} />;
    }
  };

  const currentUserName = userData?.name || 'Membro FocusMod'; // TODO pegar nome do usuario na api
  const activeModule = modules.find((m) => m.id === activeModuleId) || modules[0];

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-[#1E1414] text-[#F5E6DA] select-none">

      {/* Top Navbar: Compact 48px (h-12) */}
      <header className="h-12 border-b border-[#3D2B2B] bg-[#1E1414] px-4 flex items-center justify-between z-30 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#800020] flex items-center justify-center text-[#F5E6DA] font-bold text-sm shadow">
            F
          </div>
          <div className="flex items-center gap-1.5">
            <h1 className="text-sm font-bold text-[#F5E6DA] leading-none">
              Focus<span className="text-[#A67C52]">Mod</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2"> {/* TODO mudar currentname aqui*/}
          <div className="h-3 w-px bg-[#3D2B2B] mx-1"></div>

          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-full bg-[#800020] flex items-center justify-center text-[10px] font-bold text-[#F5E6DA]">
              {currentUserName.charAt(0).toUpperCase()}
            </div>
            <span className="text-xs font-medium text-[#F5E6DA] hidden md:inline truncate max-w-[120px]">
              {currentUserName}
            </span>
          </div>

          <button
            type="button"
            onClick={logout}
            title="Sair"
            className="p-1 rounded-lg bg-[#3D2B2B] hover:bg-[#800020] text-[#D1BFA5] hover:text-[#F5E6DA] transition-colors cursor-pointer text-xs"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Main Layout: Fixed 100% viewport, zero outer scroll */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
        {/* Left Sidebar: Compact, fits viewport TODO: mudar tamanho dos spaces e models*/}
        <aside className="w-full md:w-72 bg-[#251818] border-r border-[#3D2B2B] flex flex-col justify-between shrink-0 overflow-hidden min-h-0">
          {/* Top Section of Sidebar */}
          <div className="flex-1 flex flex-col overflow-hidden min-h-0 p-3">
            {/* Header info */}
            <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-[#3D2B2B] shrink-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#A67C52] flex items-center gap-1">
                LOREM
              </span>
              <button
                type="button"
                onClick={() => setShowCreateSpaceModal(true)}
                className="text-[10px] text-[#D1BFA5] hover:text-[#F5E6DA] flex items-center gap-0.5 cursor-pointer font-medium"
              >
                <Plus className="w-2.5 h-2.5 text-[#F5E6DA]" /> {/* TODO: deixar botao mais bonito */}
                <span>Novo Space</span>
              </button>
            </div>

            {/* Spaces List: Compact, internal scroll only if user creates many folders */}
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-0.5 min-h-0">
              {spaces.map((space) => {
                const spaceModules = modules.filter((m) => m.spaceId === space.id);
                return (
                  <div
                    key={space.id}
                    className="rounded-xl bg-[#1E1414]/70 border border-[#3D2B2B] overflow-hidden shrink-0"
                  >
                    {/* Space/Folder Header */}
                    <div
                      onClick={() => toggleSpaceOpen(space.id)}
                      className="px-2.5 py-1.5 flex items-center justify-between cursor-pointer hover:bg-[#2D1F1F] transition-colors select-none group"
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="text-[10px] text-[#A67C52]">
                          {space.isOpen ? (
                            <ChevronDown className="w-3 h-3" />
                          ) : (
                            <ChevronRight className="w-3 h-3" />
                          )}
                        </span>
                        <span className="text-xs">{space.icon || '📁'}</span>
                        <span className="font-bold text-[11px] text-[#F5E6DA] truncate">
                          {space.name}
                        </span>
                        <span className="text-[9px] bg-[#3D2B2B] text-[#D1BFA5] px-1 py-0.2 rounded-full font-mono">
                          {spaceModules.length}
                        </span>
                      </div>

                      <div className="flex items-center gap-0.5 opacity-80 group-hover:opacity-100">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenCreateModule(space.id);
                          }}
                          title="Criar módulo nesta pasta"
                          className="p-0.5 rounded hover:bg-[#800020] text-[#D1BFA5] hover:text-[#F5E6DA] cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        {spaces.length > 1 && (
                          <button
                            type="button"
                            onClick={(e) => handleDeleteSpace(space.id, e)}
                            title="Remover pasta"
                            className="p-0.5 rounded hover:bg-[#800020] text-[#6D5A5A] hover:text-red-300 cursor-pointer"
                          >
                            <Trash2 className="w-2.5 h-2.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Modules inside this Space */}
                    {space.isOpen && (
                      <div className="p-1 space-y-0.5 bg-[#1A1010]/60 border-t border-[#3D2B2B]">
                        {spaceModules.length === 0 ? (
                          <div className="py-1 text-center text-[10px] text-[#6D5A5A]">
                            <button
                              type="button"
                              onClick={() => handleOpenCreateModule(space.id)}
                              className="text-[#A67C52] hover:text-[#F5E6DA] underline cursor-pointer"
                            >
                              + Criar Pomodoro ou Calendário
                            </button>
                          </div>
                        ) : (
                          spaceModules.map((mod) => {
                            const isActive = activeModuleId === mod.id;
                            return (
                              <div
                                key={mod.id}
                                onClick={() => setActiveModuleId(mod.id)}
                                className={`w-full flex items-center justify-between px-2 py-1 rounded-lg text-[11px] font-medium cursor-pointer transition-colors group ${
                                  isActive
                                    ? 'bg-[#800020] text-[#F5E6DA] font-bold shadow-sm'
                                    : 'text-[#D1BFA5] hover:bg-[#2D1F1F] hover:text-[#F5E6DA]'
                                }`}
                              >
                                <div className="flex items-center gap-1.5 truncate">
                                  <span>{getModuleIcon(mod.type, 'w-3 h-3')}</span>
                                  <span className="truncate">{mod.name}</span>
                                </div>

                                <div className="flex items-center gap-1">
                                  {isActive && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#A67C52] shrink-0"></span>
                                  )}
                                  {modules.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={(e) => handleDeleteModule(mod.id, e)}
                                      title="Remover"
                                      className="opacity-0 group-hover:opacity-100 hover:text-red-300 p-0.5"
                                    >
                                      <Trash2 className="w-2.5 h-2.5" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Central Work Canvas: Viewport-contained, zero page scroll */}
        <main className="flex-1 bg-[#1E1414] p-3 sm:p-5 flex flex-col justify-center items-center overflow-hidden min-h-0">
          <div className="w-full max-w-3xl flex-1 flex flex-col justify-center items-center overflow-hidden min-h-0">
            {activeModule?.type === 'pomodoro' && (
              <Pomodoro/>
            )}

            {activeModule?.type === 'calendario' && (
              <Calendar/>
            )}

            {(activeModule?.type === 'routine' || activeModule?.type === 'agenda-visual') && (
              <Routine/>
            )}

            {activeModule?.type === 'brain-dump' && (
              <BrainDump/>
            )}
          </div>
        </main>
      </div>

      {/* REQUESTED: BOTTOM RIGHT FLOATING BUTTON WITH `+` */}
      <button
        type="button"
        onClick={() => setIsOverlayOpen(true)}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 w-12 h-12 rounded-full bg-[#800020] hover:bg-[#A00028] text-[#F5E6DA] shadow-2xl flex items-center justify-center transition-all transform hover:scale-110 active:scale-95 cursor-pointer ring-2 ring-[#A67C52]/50 border border-[#800020]"
        title="Abrir tela sobreposta (+)"
      >
        <Plus className="w-6 h-6 stroke-[2.5]" />
      </button>

      {/* FULL SCREEN OVERLAY */}
      <FullScreenOverlay
        isOpen={isOverlayOpen}
        onClose={() => setIsOverlayOpen(false)}
      />

      {/* MODAL: CRIAR NOVA PASTA */}
      {showCreateSpaceModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#251818] border border-[#3D2B2B] rounded-2xl p-5 shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-[#3D2B2B] pb-2">
              <h3 className="font-bold text-sm text-[#F5E6DA] flex items-center gap-1.5">
                <FolderPlus className="w-4 h-4 text-[#A67C52]" />
                <span>Nova Pasta (Space)</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowCreateSpaceModal(false)}
                className="text-[#D1BFA5] hover:text-[#F5E6DA] text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSpace} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#D1BFA5] mb-1">
                  Nome da Pasta
                </label>
                <input
                  type="text"
                  required
                  value={newSpaceName}
                  onChange={(e) => setNewSpaceName(e.target.value)}
                  placeholder="Ex: Trabalho, Estudos, Hábitos..."
                  className="w-full bg-[#1E1414] border border-[#3D2B2B] focus:border-[#800020] rounded-lg px-2.5 py-1.5 text-xs text-[#F5E6DA] placeholder-[#6D5A5A] outline-none"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#D1BFA5] mb-1">
                  Ícone
                </label>
                <div className="flex gap-1.5">
                  {['📁', '☀️', '📚', '💼', '🎯', '⚡', '🧠', '🌿'].map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setNewSpaceIcon(emoji)}
                      className={`w-8 h-8 rounded-lg border text-sm flex items-center justify-center cursor-pointer transition-colors ${
                        newSpaceIcon === emoji
                          ? 'bg-[#800020] border-[#800020]'
                          : 'bg-[#1E1414] border-[#3D2B2B] hover:bg-[#2D1F1F]'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#3D2B2B]">
                <button
                  type="button"
                  onClick={() => setShowCreateSpaceModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-[#1E1414] text-[#D1BFA5] text-xs font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#800020] hover:bg-[#A00028] text-[#F5E6DA] text-xs font-bold transition-all shadow cursor-pointer"
                >
                  Criar Pasta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CRIAR POMODORO OU CALENDÁRIO */}
      {showCreateModuleModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#251818] border border-[#3D2B2B] rounded-2xl p-5 shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-[#3D2B2B] pb-2">
              <h3 className="font-bold text-sm text-[#F5E6DA] flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-[#A67C52]" />
                <span>Adicionar Módulo à Pasta</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowCreateModuleModal(false)}
                className="text-[#D1BFA5] hover:text-[#F5E6DA] text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateModule} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#D1BFA5] mb-1.5">
                  Tipo de Módulo:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setNewModuleType('pomodoro');
                      if (!newModuleName || newModuleName === 'Calendário & Prazos') {
                        setNewModuleName('Pomodoro Adaptativo');
                      }
                    }}
                    className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                      newModuleType === 'pomodoro'
                        ? 'bg-[#800020] border-[#800020] shadow ring-1 ring-[#A67C52]'
                        : 'bg-[#1E1414] border-[#3D2B2B] hover:bg-[#2D1F1F]'
                    }`}
                  >
                    <Clock className="w-4 h-4 text-[#A67C52] mb-1" />
                    <p className="font-bold text-xs text-[#F5E6DA]">Pomodoro</p>
                    <p className="text-[10px] text-[#D1BFA5]">Hiperfoco</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setNewModuleType('calendario');
                      if (!newModuleName || newModuleName === 'Pomodoro Adaptativo') {
                        setNewModuleName('Calendário & Prazos');
                      }
                    }}
                    className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                      newModuleType === 'calendario'
                        ? 'bg-[#800020] border-[#800020] shadow ring-1 ring-[#A67C52]'
                        : 'bg-[#1E1414] border-[#3D2B2B] hover:bg-[#2D1F1F]'
                    }`}
                  >
                    <CalendarDays className="w-4 h-4 text-[#800020] mb-1" />
                    <p className="font-bold text-xs text-[#F5E6DA]">Calendário</p>
                    <p className="text-[10px] text-[#D1BFA5]">Prazos</p>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#D1BFA5] mb-1">
                  Nome do Módulo
                </label>
                <input
                  type="text"
                  value={newModuleName}
                  onChange={(e) => setNewModuleName(e.target.value)}
                  placeholder={
                    newModuleType === 'pomodoro'
                      ? 'Ex: Pomodoro Estudos...'
                      : 'Ex: Calendário Pessoal...'
                  }
                  className="w-full bg-[#1E1414] border border-[#3D2B2B] focus:border-[#800020] rounded-lg px-2.5 py-1.5 text-xs text-[#F5E6DA] placeholder-[#6D5A5A] outline-none"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#D1BFA5] mb-1">
                  Pasta de Destino
                </label>
                <select
                  value={targetSpaceForNewModule}
                  onChange={(e) => setTargetSpaceForNewModule(e.target.value)}
                  className="w-full bg-[#1E1414] border border-[#3D2B2B] rounded-lg px-2.5 py-1.5 text-xs text-[#F5E6DA] outline-none"
                >
                  {spaces.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.icon} {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#3D2B2B]">
                <button
                  type="button"
                  onClick={() => setShowCreateModuleModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-[#1E1414] text-[#D1BFA5] text-xs font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#800020] hover:bg-[#A00028] text-[#F5E6DA] text-xs font-bold transition-all shadow cursor-pointer"
                >
                  Criar e Abrir
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};