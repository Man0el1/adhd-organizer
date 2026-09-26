import React, { useState } from 'react';
import { AVAILABLE_MODULES } from '../../data/modulesData.js';
import {
  Clock3,
  CalendarDays,
  Hourglass,
  ListTree,
  BatteryCharging,
  Sparkles,
  CheckCircle,
  Circle,
  Plus,
  Play,
  Pause,
  RotateCcw,
  Sliders,
  ArrowRight,
  Info,
  Calendar as CalendarIcon,
  Flame,
  Check
} from 'lucide-react';

export function InteractiveSimulator({
  onOpenRegisterWithModules
}) {
  // Enabled modules in sidebar
  const [enabledModules, setEnabledModules] = useState([
    'agenda-visual',
    'calendario-lembretes',
    'temporizador-foco'
  ]);

  // Active module currently displayed in the preview
  const [activeModuleId, setActiveModuleId] = useState('agenda-visual');

  // Simulator state: Agenda tasks
  const [agendaTasks, setAgendaTasks] = useState([
    { id: '1', time: '09:00 - 10:00', title: 'Reunião ou Aula Principal', tag: 'Prioridade Alta', color: 'bg-[#800020] text-[#F5E6DA]', done: true },
    { id: '2', time: '10:15 - 11:15', title: 'Bloco de Foco sem Distrações', tag: 'Trabalho Profundo', color: 'bg-[#A00028] text-[#F5E6DA]', done: false, current: true },
    { id: '3', time: '11:30 - 12:00', title: 'Pausa para Hidratação & Caminhada', tag: 'Recarga Sensorial', color: 'bg-[#3D2B2B] text-[#A67C52]', done: false },
    { id: '4', time: '14:00 - 15:00', title: 'Revisão de E-mails e Organização', tag: 'Rotina Leve', color: 'bg-[#251818] text-[#D1BFA5]', done: false },
  ]);

  // Simulator state: Micro-tasks decomposer
  const [microTasks, setMicroTasks] = useState([
    { id: 'm1', step: '1', text: 'Abrir o documento em branco e colocar o título', done: true },
    { id: 'm2', step: '2', text: 'Escrever apenas 3 tópicos gerais em marcadores', done: true },
    { id: 'm3', step: '3', text: 'Completar o primeiro parágrafo sem julgar a qualidade', done: false },
    { id: 'm4', step: '4', text: 'Salvar o arquivo e fazer uma pausa de 3 minutos', done: false },
  ]);

  // Simulator state: Timer
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerMinutes, setTimerMinutes] = useState(25);
  const [timerSeconds, setTimerSeconds] = useState(0);

  // Simulator state: Mental Battery
  const [energyLevel, setEnergyLevel] = useState('media');

  // Simulator state: Brain Dump items
  const [brainDumpInput, setBrainDumpInput] = useState('');
  const [brainDumpList, setBrainDumpList] = useState([
    'Lembrar de comprar remédio na farmácia',
    'Ideia para o trabalho final: usar infográfico',
    'Responder mensagem da Mari até às 18h'
  ]);

  const toggleModule = (id) => {
    if (enabledModules.includes(id)) {
      if (enabledModules.length <= 1) return;
      const updated = enabledModules.filter(m => m !== id);
      setEnabledModules(updated);
      if (activeModuleId === id) {
        setActiveModuleId(updated[0]);
      }
    } else {
      const updated = [...enabledModules, id];
      setEnabledModules(updated);
      setActiveModuleId(id);
    }
  };

  const toggleAgendaTask = (id) => {
    setAgendaTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const toggleMicroTask = (id) => {
    setMicroTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const addBrainDump = (e) => {
    e.preventDefault();
    if (!brainDumpInput.trim()) return;
    setBrainDumpList(prev => [brainDumpInput.trim(), ...prev]);
    setBrainDumpInput('');
  };

  const getModuleIcon = (iconName, className = "w-4 h-4") => {
    switch (iconName) {
      case 'Clock3': return <Clock3 className={className} />;
      case 'CalendarDays': return <CalendarDays className={className} />;
      case 'Hourglass': return <Hourglass className={className} />;
      case 'ListTree': return <ListTree className={className} />;
      case 'BatteryCharging': return <BatteryCharging className={className} />;
      case 'Sparkles': return <Sparkles className={className} />;
      default: return <Clock3 className={className} />;
    }
  };

  return (
    <section id="simulador" className="py-16 md:py-24 bg-[#1E1414] border-b border-[#3D2B2B]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Title */}
        <div className="max-w-3xl mx-auto text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#3D2B2B] text-[#A67C52] text-xs font-bold uppercase tracking-widest mb-3">
            <Sliders className="w-3.5 h-3.5" />
            <span>Simulador Interativo da Barra Lateral</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#F5E6DA]">
            Você escolhe os modelos. Eles aparecem na sua aba esquerda.
          </h2>
          <p className="mt-3 text-base sm:text-lg text-[#D1BFA5]">
            Clique nos botões abaixo para ativar ou desativar ferramentas. Veja como a aba lateral à esquerda e a tela principal respondem instantaneamente.
          </p>
        </div>

        {/* Module Selector Pills / Toggles */}
        <div className="mb-8 p-4 bg-[#251818] rounded-2xl border border-[#3D2B2B]">
          <div className="flex items-center justify-between mb-3 px-1">
            <span className="text-xs sm:text-sm font-bold text-[#F5E6DA] flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-[#A67C52]" />
              Ative ou desative os modelos para a sua aba esquerda:
            </span>
            <span className="text-xs text-[#A67C52] font-semibold hidden sm:block">
              {enabledModules.length} de {AVAILABLE_MODULES.length} modelos ativos
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {AVAILABLE_MODULES.map((mod) => {
              const isEnabled = enabledModules.includes(mod.id);
              return (
                <button
                  type="button"
                  key={mod.id}
                  onClick={() => toggleModule(mod.id)}
                  id={`toggle-mod-${mod.id}`}
                  className={`p-3 rounded-xl text-left border transition-colors cursor-pointer flex flex-col justify-between ${
                    isEnabled
                      ? 'bg-[#2D1F1F] border-[#800020] text-[#F5E6DA] shadow-md'
                      : 'bg-[#1E1414] border-[#3D2B2B] text-[#9E8A78] hover:border-[#A67C52]/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`p-1.5 rounded-lg ${isEnabled ? 'bg-[#800020] text-white' : 'bg-[#2D1F1F] text-[#9E8A78]'}`}>
                      {getModuleIcon(mod.icon, "w-4 h-4")}
                    </span>
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                      isEnabled ? 'bg-[#800020] text-white' : 'border border-[#3D2B2B]'
                    }`}>
                      {isEnabled && <Check className="w-3 h-3" />}
                    </span>
                  </div>
                  <div>
                    <span className="block font-semibold text-xs leading-snug">
                      {mod.name.split(' (')[0]}
                    </span>
                    <span className="block text-[10px] text-[#A67C52] mt-0.5">
                      {isEnabled ? 'Ativo na esquerda' : 'Desativado'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Workspace Simulator Window */}
        <div className="bg-[#2D1F1F] text-[#F5E6DA] rounded-2xl shadow-2xl border border-[#3D2B2B] overflow-hidden">

          {/* Mock Window Titlebar */}
          <div className="bg-[#180E0E] px-4 py-3 border-b border-[#3D2B2B] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#800020]"></span>
                <span className="w-3 h-3 rounded-full bg-[#A67C52]"></span>
                <span className="w-3 h-3 rounded-full bg-[#3D2B2B]"></span>
              </div>
              <span className="text-xs text-[#D1BFA5] ml-2 font-medium">FocusMod Workspace • Painel Personalizado</span>
            </div>
            <div className="text-xs bg-[#2D1F1F] px-2.5 py-1 rounded-md text-[#A67C52] border border-[#3D2B2B]">
              Sem sobrecarga sensorial
            </div>
          </div>

          {/* Workspace Body: Left Sidebar + Main Active Content */}
          <div className="flex flex-col md:flex-row min-h-[460px]">

            {/* THE LEFT SIDEBAR (The core concept requested by the user!) */}
            <aside className="w-full md:w-64 bg-[#251818] border-r border-[#3D2B2B] p-3 flex flex-col justify-between shrink-0">
              <div>
                <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-[#A67C52]">
                  Sua Aba na Esquerda
                </div>

                <nav className="space-y-1.5 mt-1">
                  {AVAILABLE_MODULES.filter(m => enabledModules.includes(m.id)).map((mod) => {
                    const isActive = activeModuleId === mod.id;
                    return (
                      <button
                        type="button"
                        key={mod.id}
                        onClick={() => setActiveModuleId(mod.id)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-semibold text-xs sm:text-sm text-left transition-colors cursor-pointer ${
                          isActive
                            ? 'bg-[#800020] text-[#F5E6DA] shadow-md'
                            : 'text-[#D1BFA5] hover:bg-[#2D1F1F] hover:text-[#F5E6DA]'
                        }`}
                      >
                        <span className={isActive ? 'text-[#F5E6DA]' : 'text-[#A67C52]'}>
                          {getModuleIcon(mod.icon, "w-4 h-4")}
                        </span>
                        <span className="truncate flex-1">{mod.name.split(' (')[0]}</span>
                        {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#F5E6DA]"></span>}
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Sidebar bottom indicator */}
              <div className="mt-4 p-3 rounded-xl bg-[#1E1414] border border-[#3D2B2B] text-[11px] text-[#D1BFA5] space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-[#A67C52]">
                  <Info className="w-3.5 h-3.5" />
                  <span>Flexibilidade Total</span>
                </div>
                <p>Apenas os modelos que você escolheu ocupam espaço nesta barra.</p>
              </div>
            </aside>

            {/* MAIN CONTENT AREA: Renders the active module */}
            <main className="flex-1 p-5 sm:p-6 overflow-y-auto bg-[#1E1414]">

              {/* Active Module Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-[#3D2B2B] gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg text-[#F5E6DA]">
                      {AVAILABLE_MODULES.find(m => m.id === activeModuleId)?.previewTitle || 'Módulo Ativo'}
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#3D2B2B] text-[#A67C52] uppercase tracking-wider">
                      {AVAILABLE_MODULES.find(m => m.id === activeModuleId)?.category}
                    </span>
                  </div>
                  <p className="text-xs text-[#D1BFA5] mt-0.5">
                    {AVAILABLE_MODULES.find(m => m.id === activeModuleId)?.adhdBenefit}
                  </p>
                </div>

                <div className="text-xs text-[#A67C52] bg-[#251818] px-3 py-1.5 rounded-lg border border-[#3D2B2B] self-start sm:self-auto font-mono">
                  {new Date().toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' })}
                </div>
              </div>

              {/* VIEW 1: AGENDA VISUAL (TIMELINE ESTILO TIIMO) */}
              {activeModuleId === 'agenda-visual' && (
                <div className="space-y-3">
                  <div className="p-3 bg-[#2D1F1F] rounded-xl border border-[#800020]/40 flex items-center justify-between text-xs text-[#F5E6DA]">
                    <span className="font-medium flex items-center gap-2">
                      <Clock3 className="w-4 h-4 text-[#A67C52]" />
                      Bloco ativo no momento: <strong className="text-[#F5E6DA]">Bloco de Foco sem Distrações</strong>
                    </span>
                    <span className="font-bold bg-[#800020] text-white px-2 py-0.5 rounded">65% concluído</span>
                  </div>

                  <div className="space-y-2.5">
                    {agendaTasks.map((task) => (
                      <div
                        key={task.id}
                        onClick={() => toggleAgendaTask(task.id)}
                        className={`p-3.5 rounded-xl border transition-colors cursor-pointer flex items-center justify-between ${
                          task.done
                            ? 'bg-[#251818] border-[#3D2B2B] opacity-60'
                            : task.current
                              ? 'bg-[#2D1F1F] border-[#800020] shadow-md ring-1 ring-[#800020]'
                              : 'bg-[#2D1F1F] border-[#3D2B2B] hover:border-[#A67C52]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            className="text-[#A67C52] transition-colors cursor-pointer"
                            aria-label={task.done ? "Marcar como pendente" : "Marcar como concluída"}
                          >
                            {task.done ? (
                              <CheckCircle className="w-5 h-5 text-[#800020]" />
                            ) : (
                              <Circle className="w-5 h-5 text-[#9E8A78]" />
                            )}
                          </button>
                          <div>
                            <span className="text-xs font-mono font-semibold text-[#A67C52] block">
                              {task.time}
                            </span>
                            <span className={`font-semibold text-sm ${task.done ? 'line-through text-[#9E8A78]' : 'text-[#F5E6DA]'}`}>
                              {task.title}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`text-[11px] font-medium px-2 py-1 rounded-md ${task.color}`}>
                            {task.tag}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <p className="text-[11px] text-[#9E8A78] text-center pt-2">
                    💡 Clique nos itens para marcar conclusão e sentir o efeito de micro-vitória.
                  </p>
                </div>
              )}

              {/* VIEW 2: CALENDÁRIO DE LEMBRETES */}
              {activeModuleId === 'calendario-lembretes' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                    <div className="bg-[#251818] p-4 rounded-xl border border-[#3D2B2B]">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-bold text-xs text-[#F5E6DA]">Visão Mensal Espaçada</span>
                        <span className="text-xs text-[#A67C52] font-semibold">Setembro 2026</span>
                      </div>

                      <div className="grid grid-cols-7 gap-1 text-center text-xs">
                        {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
                          <div key={i} className="text-[10px] font-bold text-[#A67C52] py-1">{d}</div>
                        ))}
                        {[...Array(30)].map((_, i) => {
                          const day = i + 1;
                          const isSpecial = day === 5 || day === 14 || day === 22;
                          const isToday = day === 1;
                          return (
                            <div
                              key={i}
                              className={`py-1.5 rounded-md text-xs transition-colors ${
                                isToday
                                  ? 'bg-[#800020] text-[#F5E6DA] font-bold'
                                  : isSpecial
                                    ? 'bg-[#3D2B2B] text-[#A67C52] font-bold border border-[#A67C52]/40'
                                    : 'text-[#D1BFA5] hover:bg-[#2D1F1F]'
                              }`}
                            >
                              {day}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <span className="font-bold text-xs text-[#F5E6DA] block mb-1">Próximos Lembretes Críticos</span>

                      <div className="p-3 rounded-xl bg-[#2D1F1F] border border-[#800020] flex items-start gap-2.5">
                        <CalendarIcon className="w-4 h-4 text-[#A67C52] shrink-0 mt-0.5" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-xs text-[#F5E6DA]">Entrega do Relatório Mensal</span>
                            <span className="text-[10px] bg-[#800020] text-white px-1.5 py-0.2 rounded">Em 4 dias</span>
                          </div>
                          <p className="text-[11px] text-[#D1BFA5] mt-0.5">Sexta-feira • 15:00</p>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-[#2D1F1F] border border-[#3D2B2B] flex items-start gap-2.5">
                        <CalendarIcon className="w-4 h-4 text-[#A67C52] shrink-0 mt-0.5" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-xs text-[#F5E6DA]">Consulta com Especialista</span>
                            <span className="text-[10px] bg-[#3D2B2B] text-[#D1BFA5] px-1.5 py-0.2 rounded border border-[#3D2B2B]">Em 13 dias</span>
                          </div>
                          <p className="text-[11px] text-[#D1BFA5] mt-0.5">Dia 14 • 10:30</p>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* VIEW 3: TEMPORIZADOR FOCO & DOPAMINA */}
              {activeModuleId === 'temporizador-foco' && (
                <div className="flex flex-col items-center justify-center p-6 bg-[#251818] rounded-2xl border border-[#3D2B2B] text-center space-y-4">
                  <div className="flex gap-2">
                    {[15, 25, 45].map((mins) => (
                      <button
                        type="button"
                        key={mins}
                        onClick={() => {
                          setTimerMinutes(mins);
                          setTimerSeconds(0);
                          setTimerRunning(false);
                        }}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                          timerMinutes === mins
                            ? 'bg-[#800020] text-[#F5E6DA]'
                            : 'bg-[#1E1414] text-[#D1BFA5] border border-[#3D2B2B]'
                        }`}
                      >
                        {mins} minutos
                      </button>
                    ))}
                  </div>

                  {/* Circular visual timer representation */}
                  <div className="relative w-40 h-40 rounded-full border-4 border-[#800020] flex flex-col items-center justify-center bg-[#1E1414] shadow-inner">
                    <span className="text-3xl font-bold font-mono text-[#F5E6DA]">
                      {String(timerMinutes).padStart(2, '0')}:{String(timerSeconds).padStart(2, '0')}
                    </span>
                    <span className="text-[11px] text-[#A67C52] font-semibold mt-1">
                      {timerRunning ? 'Em Foco Consciente' : 'Pronto para Começar'}
                    </span>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setTimerRunning(!timerRunning)}
                      className="px-6 py-2.5 rounded-xl bg-[#800020] hover:bg-[#A00028] text-[#F5E6DA] font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {timerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                      {timerRunning ? 'Pausar' : 'Iniciar Foco'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setTimerRunning(false);
                        setTimerMinutes(25);
                        setTimerSeconds(0);
                      }}
                      className="p-2.5 rounded-xl bg-[#1E1414] border border-[#3D2B2B] text-[#D1BFA5] hover:text-[#F5E6DA] text-xs cursor-pointer"
                      title="Reiniciar"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* VIEW 4: DECOMPOSITOR DE MICRO-PASSOS */}
              {activeModuleId === 'decompositor-tarefas' && (
                <div className="space-y-3">
                  <div className="p-3 bg-[#251818] rounded-xl border border-[#3D2B2B]">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#A67C52] block">Quebrando a Paralisia</span>
                    <h4 className="font-bold text-sm text-[#F5E6DA]">Escrever Artigo de 500 Palavras</h4>
                  </div>

                  <div className="space-y-2">
                    {microTasks.map((t) => (
                      <div
                        key={t.id}
                        onClick={() => toggleMicroTask(t.id)}
                        className={`p-3 rounded-xl border transition-colors cursor-pointer flex items-center gap-3 ${
                          t.done
                            ? 'bg-[#251818] border-[#3D2B2B] opacity-60'
                            : 'bg-[#2D1F1F] border-[#800020]/60 hover:border-[#800020]'
                        }`}
                      >
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                          t.done ? 'bg-[#800020] text-white' : 'bg-[#3D2B2B] text-[#A67C52]'
                        }`}>
                          {t.done ? <Check className="w-3.5 h-3.5" /> : t.step}
                        </span>
                        <span className={`text-xs font-medium ${t.done ? 'line-through text-[#9E8A78]' : 'text-[#F5E6DA]'}`}>
                          {t.text}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Dopamine Progress Bar */}
                  <div className="p-3 bg-[#251818] rounded-xl border border-[#3D2B2B] flex items-center justify-between text-xs">
                    <span className="text-[#D1BFA5] font-medium flex items-center gap-1">
                      <Flame className="w-4 h-4 text-[#A67C52]" />
                      Recompensa de Dopamina:
                    </span>
                    <span className="font-bold text-[#A67C52]">
                      {Math.round((microTasks.filter(t => t.done).length / microTasks.length) * 100)}% Concluído
                    </span>
                  </div>
                </div>
              )}

              {/* VIEW 5: BATERIA MENTAL & ENERGIA */}
              {activeModuleId === 'bateria-mental' && (
                <div className="space-y-4">
                  <div className="p-4 bg-[#251818] rounded-xl border border-[#3D2B2B]">
                    <span className="text-xs font-bold text-[#F5E6DA] block mb-2">Como está sua energia mental hoje?</span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { key: 'alta', label: 'Bateria Alta ⚡', desc: 'Pronto para tarefas densas' },
                        { key: 'media', label: 'Bateria Média 🔋', desc: 'Foco moderado regular' },
                        { key: 'baixa', label: 'Bateria Baixa 🪫', desc: 'Apenas o essencial' },
                        { key: 'sobrecarga', label: 'Sobrecarga 🛑', desc: 'Pausa e descanso' }
                      ].map((item) => (
                        <button
                          type="button"
                          key={item.key}
                          onClick={() => setEnergyLevel(item.key)}
                          className={`p-2.5 rounded-xl text-left border transition-colors cursor-pointer ${
                            energyLevel === item.key
                              ? 'bg-[#800020] text-[#F5E6DA] border-[#800020]'
                              : 'bg-[#1E1414] text-[#D1BFA5] border-[#3D2B2B]'
                          }`}
                        >
                          <span className="block font-bold text-xs">{item.label}</span>
                          <span className={`block text-[10px] mt-0.5 ${energyLevel === item.key ? 'text-[#F5E6DA]/80' : 'text-[#9E8A78]'}`}>
                            {item.desc}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 bg-[#2D1F1F] rounded-xl border border-[#3D2B2B] text-xs text-[#D1BFA5]">
                    <strong className="text-[#A67C52] block mb-1">Sugestão do FocusMod:</strong>
                    {energyLevel === 'alta' && 'Momento ideal para atacar tarefas que você estava adiando!'}
                    {energyLevel === 'media' && 'Faça blocos de 25 minutos com pausas regulares de 5 minutos.'}
                    {energyLevel === 'baixa' && 'Execute apenas 1 ou 2 micro-passos e descanse sem culpa.'}
                    {energyLevel === 'sobrecarga' && 'Feche as abas excedentes, respire e reduza luzes brilhantes.'}
                  </div>
                </div>
              )}

              {/* VIEW 6: BRAIN DUMP / LIXEIRA MENTAL */}
              {activeModuleId === 'brain-dump' && (
                <div className="space-y-3">
                  <form onSubmit={addBrainDump} className="flex gap-2">
                    <input
                      type="text"
                      value={brainDumpInput}
                      onChange={(e) => setBrainDumpInput(e.target.value)}
                      placeholder="Pensamento intrusivo ou ideia rápida..."
                      className="flex-1 px-3 py-2 text-xs rounded-xl bg-[#251818] border border-[#3D2B2B] text-[#F5E6DA] placeholder-[#9E8A78] focus:outline-none focus:ring-2 focus:ring-[#800020]"
                    />
                    <button
                      type="submit"
                      className="px-3 py-2 bg-[#800020] text-white text-xs font-semibold rounded-xl hover:bg-[#A00028] transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Despejar
                    </button>
                  </form>

                  <div className="space-y-1.5">
                    {brainDumpList.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-lg bg-[#251818] border border-[#3D2B2B] text-xs text-[#F5E6DA] flex items-center justify-between"
                      >
                        <span>{item}</span>
                        <button
                          type="button"
                          onClick={() => setBrainDumpList(brainDumpList.filter((_, i) => i !== idx))}
                          className="text-[#A67C52] hover:text-[#F5E6DA] text-[11px] cursor-pointer"
                        >
                          Limpar
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </main>

          </div>

          {/* Bottom Bar in Simulator with CTA */}
          <div className="bg-[#180E0E] px-4 py-3 border-t border-[#3D2B2B] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <span className="text-[#D1BFA5] text-center sm:text-left">
              Configuração personalizada: <strong>{enabledModules.length} modelos na sua barra esquerda</strong>.
            </span>
            <button
              type="button"
              onClick={() => onOpenRegisterWithModules?.(enabledModules)}
              className="px-4 py-2 bg-[#800020] hover:bg-[#A00028] text-[#F5E6DA] font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <span>Salvar Essa Combinação na Minha Conta</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </div>
    </section>
  );
}
