import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  LayoutDashboard,
  Calendar,
  Clock,
  CheckSquare,
  Sparkles,
  ArrowLeft,
  Settings,
  Flame,
  Brain,
  Layers,
  ChevronRight
} from 'lucide-react';

export default function Main() {
  const [activeTab, setActiveTab] = useState('inicio');
  const [modules, setModules] = useState([
    { id: 'agenda-visual', name: 'Agenda Visual', desc: 'Linha do tempo diária com progresso', icon: Clock, count: '3 ativas' },
    { id: 'calendario', name: 'Calendário & Lembretes', desc: 'Datas importantes sem sobrecarga', icon: Calendar, count: '2 eventos' },
    { id: 'tarefas', name: 'Micro-Passos', desc: 'Decomposição de tarefas para TDAH', icon: CheckSquare, count: '5 pendentes' },
  ]);

  const [newModuleName, setNewModuleName] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const handleAddModule = (e) => {
    e.preventDefault();
    if (!newModuleName.trim()) return;
    const newMod = {
      id: `mod-${Date.now()}`,
      name: newModuleName.trim(),
      desc: 'Módulo personalizado adicionado',
      icon: Layers,
      count: 'Novo',
    };
    setModules([...modules, newMod]);
    setNewModuleName('');
    setShowAddModal(false);
  };

  return (
    <div className="min-h-screen bg-[#1E1414] text-[#F5E6DA] selection:bg-[#800020] selection:text-[#F5E6DA]">
      {/* Top Header */}
      <header className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-[#3D2B2B] bg-[#1E1414]/95 backdrop-blur-md">
        <div className="flex h-full items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="w-9 h-9 rounded-xl bg-[#800020] flex items-center justify-center text-[#F5E6DA] font-bold text-lg shadow-md hover:bg-[#A00028] transition-colors"
            >
              F
            </Link>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-[#F5E6DA] leading-none">
                Focus<span className="text-[#A67C52]">Mod</span>
              </h1>
              <span className="text-[10px] text-[#A67C52] uppercase font-semibold tracking-wider">
                Área Principal
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/dashboard"
              className="px-3.5 py-1.5 rounded-xl bg-[#800020] hover:bg-[#A00028] text-[#F5E6DA] text-xs font-bold transition-colors shadow-md flex items-center gap-1.5"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Abrir Painel Completo</span>
            </Link>
            <Link
              to="/"
              className="px-3 py-1.5 rounded-xl bg-[#2D1F1F] hover:bg-[#3D2B2B] border border-[#3D2B2B] text-[#D1BFA5] hover:text-[#F5E6DA] text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Voltar ao Início</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex pt-16">
        {/* Left Sidebar */}
        <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-60 sm:w-64 border-r border-[#3D2B2B] bg-[#251818] flex flex-col justify-between p-4 shrink-0 z-20">
          <div className="space-y-4">
            <button
              onClick={() => setShowAddModal(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold text-[#F5E6DA] bg-[#800020] hover:bg-[#A00028] rounded-xl shadow-md transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Criar Novo Módulo</span>
            </button>

            <div className="pt-2">
              <span className="px-2 text-[10px] font-bold uppercase tracking-widest text-[#A67C52] block mb-2">
                Navegação
              </span>
              <nav className="flex flex-col gap-1.5">
                {[
                  { id: 'inicio', label: 'Visão Geral', icon: LayoutDashboard },
                  { id: 'sobre', label: 'Sobre o Método', icon: Brain },
                  { id: 'projetos', label: 'Meus Módulos', icon: Layers },
                  { id: 'contato', label: 'Configurações', icon: Settings },
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer text-left ${
                        isActive
                          ? 'bg-[#800020] text-[#F5E6DA] shadow-sm'
                          : 'text-[#D1BFA5] hover:bg-[#2D1F1F] hover:text-[#F5E6DA]'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-[#F5E6DA]' : 'text-[#A67C52]'}`} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* User profile / status indicator at bottom */}
          <div className="p-3 rounded-xl bg-[#1E1414] border border-[#3D2B2B] text-xs">
            <div className="flex items-center gap-2 text-[#A67C52] font-semibold mb-1">
              <Flame className="w-4 h-4 text-[#800020]" />
              <span>Foco & Clareza</span>
            </div>
            <p className="text-[11px] text-[#D1BFA5] leading-relaxed">
              Sem estímulos caóticos ou notificações invasivas.
            </p>
          </div>
        </aside>

        {/* Dynamic Main Content */}
        <main className="ml-60 sm:ml-64 w-full min-h-[calc(100vh-4rem)] p-6 sm:p-10 bg-[#1E1414]">
          {activeTab === 'inicio' && (
            <div className="max-w-4xl space-y-6">
              <div className="p-6 rounded-2xl bg-[#2D1F1F] border border-[#3D2B2B] shadow-lg">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#3D2B2B] text-[#A67C52] text-xs font-bold uppercase tracking-wider mb-3">
                  <Sparkles className="w-3.5 h-3.5" /> Espaço de Trabalho
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-[#F5E6DA] mb-2">
                  Bem-vindo ao FocusMod
                </h2>
                <p className="text-sm text-[#D1BFA5] leading-relaxed">
                  Aqui está o seu ambiente de rotina adaptativa. Utilize os módulos modulares na barra esquerda para gerenciar tarefas e compromissos no ritmo do seu cérebro.
                </p>
              </div>

              {/* Modules Quick List */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-widest text-[#A67C52]">
                  Módulos Ativos na Sua Rotina
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {modules.map((m) => {
                    const Icon = m.icon;
                    return (
                      <div
                        key={m.id}
                        className="p-4 rounded-xl bg-[#251818] border border-[#3D2B2B] hover:border-[#800020] transition-colors flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-[#800020] flex items-center justify-center text-[#F5E6DA]">
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-[#F5E6DA]">{m.name}</h4>
                            <p className="text-xs text-[#A67C52]">{m.desc}</p>
                          </div>
                        </div>
                        <span className="text-xs px-2.5 py-1 rounded-md bg-[#2D1F1F] border border-[#3D2B2B] text-[#D1BFA5] font-semibold">
                          {m.count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'sobre' && (
            <div className="max-w-3xl space-y-6">
              <div className="p-6 rounded-2xl bg-[#2D1F1F] border border-[#3D2B2B] shadow-lg">
                <h2 className="text-2xl font-bold text-[#F5E6DA] mb-3">Sobre o Método FocusMod</h2>
                <p className="text-sm text-[#D1BFA5] leading-relaxed mb-4">
                  Tradicionais aplicativos de produtividade sobrecarregam pessoas com TDAH através de listas intermináveis de recursos, tags, árvores de subtarefas e notificações punitivas que alimentam a culpa.
                </p>
                <p className="text-sm text-[#D1BFA5] leading-relaxed">
                  No FocusMod, nós invertemos essa lógica: você liga apenas os modelos de que precisa e os organiza em uma barra lateral limpa, intuitiva e acolhedora com tons terrosos suaves.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'projetos' && (
            <div className="max-w-4xl space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-[#F5E6DA]">Gerenciar Meus Módulos</h2>
                  <p className="text-xs sm:text-sm text-[#D1BFA5]">Configure o que aparece na sua barra lateral</p>
                </div>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-4 py-2 bg-[#800020] hover:bg-[#A00028] text-[#F5E6DA] font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Adicionar Módulo
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {modules.map((mod) => (
                  <div key={mod.id} className="p-5 bg-[#251818] border border-[#3D2B2B] rounded-xl flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-base text-[#F5E6DA]">{mod.name}</span>
                        <span className="text-xs text-[#A67C52]">{mod.count}</span>
                      </div>
                      <p className="text-xs text-[#D1BFA5]">{mod.desc}</p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-[#3D2B2B] flex items-center justify-between">
                      <span className="text-[11px] text-[#A67C52]">Ativo na barra</span>
                      <Link to="/dashboard" className="text-xs text-[#F5E6DA] hover:text-[#A67C52] flex items-center gap-1 font-semibold">
                        Ver no Painel <ChevronRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'contato' && (
            <div className="max-w-xl space-y-6">
              <div className="p-6 rounded-2xl bg-[#2D1F1F] border border-[#3D2B2B] shadow-lg">
                <h2 className="text-2xl font-bold text-[#F5E6DA] mb-3">Configurações & Preferências</h2>
                <div className="space-y-4 text-xs sm:text-sm">
                  <div className="p-3 bg-[#1E1414] rounded-xl border border-[#3D2B2B] flex items-center justify-between">
                    <div>
                      <p className="font-bold text-[#F5E6DA]">Tema Acolhedor Dark</p>
                      <p className="text-xs text-[#A67C52]">Cores em marrom café e vinho (#800020)</p>
                    </div>
                    <span className="text-xs font-bold text-[#A67C52]">Padrão Ativo</span>
                  </div>

                  <div className="p-3 bg-[#1E1414] rounded-xl border border-[#3D2B2B] flex items-center justify-between">
                    <div>
                      <p className="font-bold text-[#F5E6DA]">Redução de Estímulos</p>
                      <p className="text-xs text-[#A67C52]">Sem notificações sonoras invasivas</p>
                    </div>
                    <span className="text-xs font-bold text-[#A67C52]">Habilitado</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Simple Add Module Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[#2D1F1F] border border-[#3D2B2B] rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-[#F5E6DA]">Criar Novo Módulo</h3>
            <p className="text-xs text-[#D1BFA5]">
              Dê um nome para a ferramenta ou lista que deseja fixar na sua rotina:
            </p>
            <form onSubmit={handleAddModule} className="space-y-4">
              <input
                type="text"
                value={newModuleName}
                onChange={(e) => setNewModuleName(e.target.value)}
                placeholder="Ex: Diário de Dopamina, Hidratação..."
                className="w-full px-4 py-2.5 rounded-xl bg-[#1E1414] border border-[#3D2B2B] text-[#F5E6DA] placeholder-[#A67C52]/60 text-sm focus:outline-none focus:border-[#800020]"
                autoFocus
              />
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#1E1414] text-[#D1BFA5] hover:text-[#F5E6DA] text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#800020] hover:bg-[#A00028] text-[#F5E6DA] text-xs font-bold transition-colors"
                >
                  Adicionar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
