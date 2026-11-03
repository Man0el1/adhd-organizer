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
{/* TODO: LEMBRAR DE RETIRAR E REFORMULAR TUDO ISSO DEPOIS*/}
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
    { id: '1', time: '09:00 - 10:00', title: 'Reunião ou Aula Principal', tag: 'Prioridade Alta', color: 'bg-[#e3edfa] text-[#124286] border border-[#a3c5ed]', done: true },
    { id: '2', time: '10:15 - 11:15', title: 'Bloco de Foco sem Distrações', tag: 'Trabalho Profundo', color: 'bg-[#1d56af] text-white', done: false, current: true },
    { id: '3', time: '11:30 - 12:00', title: 'Pausa para Hidratação & Caminhada', tag: 'Recarga Sensorial', color: 'bg-emerald-50 text-emerald-700 border border-emerald-200', done: false },
    { id: '4', time: '14:00 - 15:00', title: 'Revisão de E-mails e Organização', tag: 'Rotina Leve', color: 'bg-amber-50 text-amber-700 border border-amber-200', done: false },
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
    <section id="simulador" className="py-16 md:py-24 bg-[#ebf0f5] border-b border-[#d3dce6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Title */}
        <div className="max-w-3xl mx-auto text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-[#e3edfa] border border-[#a3c5ed] text-[#124286] text-xs font-bold uppercase tracking-widest mb-3 shadow-xs">
            <Sliders className="w-3.5 h-3.5 text-[#1d56af]" />
            <span>Simulador Interativo da Barra Lateral</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
            Você escolhe os modelos. Eles aparecem na sua aba esquerda.
          </h2>
          <p className="mt-3 text-base sm:text-lg text-slate-600">
            Clique nos botões abaixo para ativar ou desativar ferramentas. Veja como a aba lateral à esquerda e a tela principal respondem instantaneamente.
          </p>
        </div>

        {/* Module Selector Pills / Toggles */}
        <div className="mb-8 p-4 bg-[#f4f7fa] rounded-2xl border border-[#d3dce6] shadow-xs">
          <div className="flex items-center justify-between mb-3 px-1">
            <span className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-[#1d56af]" />
              Ative ou desative os modelos para a sua aba esquerda:
            </span>
            <span className="text-xs text-[#124286] font-semibold hidden sm:block">
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
                  className={`p-3 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                    isEnabled
                      ? 'bg-[#e3edfa] border-[#a3c5ed] text-[#124286] shadow-xs ring-1 ring-[#1d56af]/20'
                      : 'bg-white border-[#d3dce6] text-slate-600 hover:border-[#a3c5ed] hover:bg-[#f4f7fa]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`p-1.5 rounded-lg ${isEnabled ? 'bg-[#1d56af] text-white' : 'bg-[#e8edf2] text-slate-500'}`}>
                      {getModuleIcon(mod.icon, "w-4 h-4")}
                    </span>
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                      isEnabled ? 'bg-[#1d56af] text-white' : 'border border-[#d3dce6]'
                    }`}>
                      {isEnabled && <Check className="w-3 h-3 stroke-[3]" />}
                    </span>
                  </div>
                  <div>
                    <span className="block font-semibold text-xs leading-snug">
                      {mod.name.split(' (')[0]}
                    </span>
                    <span className={`block text-[10px] mt-0.5 font-medium ${isEnabled ? 'text-[#1d56af]' : 'text-slate-400'}`}>
                      {isEnabled ? 'Ativo na esquerda' : 'Desativado'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Workspace Simulator Window */}
        <div className="bg-[#f4f7fa] text-slate-800 rounded-2xl shadow-lg border border-[#d3dce6] overflow-hidden">

          {/* Mock Window Titlebar */}
          <div className="bg-[#eef3f7] px-4 py-3 border-b border-[#d3dce6] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#1d56af]"></span>
                <span className="w-3 h-3 rounded-full bg-[#a3c5ed]"></span>
                <span className="w-3 h-3 rounded-full bg-[#d3dce6]"></span>
              </div>
              <span className="text-xs text-slate-700 ml-2 font-medium">FocusMod Workspace • Painel Personalizado</span>
            </div>
            <div className="text-xs bg-white px-2.5 py-1 rounded-md text-[#124286] border border-[#d3dce6] font-medium shadow-2xs">
              Sem sobrecarga sensorial
            </div>
          </div>

          {/* Workspace Body: Left Sidebar + Main Active Content */}
          <div className="flex flex-col md:flex-row min-h-[460px]">

            {/* THE LEFT SIDEBAR (The core concept requested by the user!) */}
            <aside className="w-full md:w-64 bg-[#eef3f7] border-r border-[#d3dce6] p-3 flex flex-col justify-between shrink-0">
              <div>
                <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-[#124286]">
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
                            ? 'bg-[#1d56af] text-white shadow-xs'
                            : 'text-slate-700 hover:bg-[#e3edfa]/60 hover:text-slate-900'
                        }`}
                      >
                        <span className={isActive ? 'text-white' : 'text-[#1d56af]'}>
                          {getModuleIcon(mod.icon, "w-4 h-4")}
                        </span>
                        <span className="truncate flex-1">{mod.name.split(' (')[0]}</span>
                        {isActive && <span className="w-1.5 h-1.5 rounded-full bg-white"></span>}
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Sidebar bottom indicator */}
              <div className="mt-4 p-3 rounded-xl bg-white border border-[#d3dce6] text-[11px] text-slate-600 space-y-1 shadow-2xs">
                <div className="flex items-center gap-1.5 font-bold text-[#124286]">
                  <Info className="w-3.5 h-3.5" />
                  <span>Flexibilidade Total</span>
                </div>
                <p>Apenas os modelos que você escolheu ocupam espaço nesta barra.</p>
              </div>
            </aside>

            {/* MAIN CONTENT AREA: Renders the active module */}
            <main className="flex-1 p-5 sm:p-6 overflow-y-auto bg-white">

              {/* Active Module Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-[#d3dce6] gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg text-slate-900">
                      {AVAILABLE_MODULES.find(m => m.id === activeModuleId)?.previewTitle || 'Módulo Ativo'}
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#e3edfa] text-[#124286] border border-[#a3c5ed] uppercase tracking-wider">
                      {AVAILABLE_MODULES.find(m => m.id === activeModuleId)?.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {AVAILABLE_MODULES.find(m => m.id === activeModuleId)?.adhdBenefit}
                  </p>
                </div>

                <div className="text-xs text-slate-700 bg-[#f4f7fa] px-3 py-1.5 rounded-lg border border-[#d3dce6] self-start sm:self-auto font-mono">
                  {new Date().toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' })}
                </div>
              </div>

              {/* VIEW 1: AGENDA VISUAL (TIMELINE ESTILO TIIMO) */}
              {activeModuleId === 'agenda-visual' && (
                <div className="space-y-3">
                  <div className="p-3 bg-[#e3edfa] rounded-xl border border-[#a3c5ed] flex items-center justify-between text-xs text-[#124286]">
                    <span className="font-medium flex items-center gap-2">
                      <Clock3 className="w-4 h-4 text-[#1d56af]" />
                      Bloco ativo no momento: <strong className="text-slate-900">Bloco de Foco sem Distrações</strong>
                    </span>
                    <span className="font-bold bg-[#1d56af] text-white px-2 py-0.5 rounded">65% concluído</span>
                  </div>

                  <div className="space-y-2.5">
                    {agendaTasks.map((task) => (
                      <div
                        key={task.id}
                        onClick={() => toggleAgendaTask(task.id)}
                        className={`p-3.5 rounded-xl border transition-colors cursor-pointer flex items-center justify-between ${
                          task.done
                            ? 'bg-[#f8fafc] border-[#d3dce6] opacity-75'
                            : task.current
                              ? 'bg-[#f4f7fa] border-[#1d56af] shadow-xs ring-1 ring-[#1d56af]/30'
                              : 'bg-white border-[#d3dce6] hover:border-[#a3c5ed]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            className="text-[#1d56af] transition-colors cursor-pointer"
                            aria-label={task.done ? "Marcar como pendente" : "Marcar como concluída"}
                          >
                            {task.done ? (
                              <CheckCircle className="w-5 h-5 text-[#1d56af]" />
                            ) : (
                              <Circle className="w-5 h-5 text-slate-300" />
                            )}
                          </button>
                          <div>
                            <span className="text-xs font-mono font-semibold text-[#124286] block">
                              {task.time}
                            </span>
                            <span className={`font-semibold text-sm ${task.done ? 'line-through text-slate-400' : 'text-slate-800'}`}>
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

                  <p className="text-[11px] text-slate-500 text-center pt-2">
                    💡 Clique nos itens para marcar conclusão e sentir o efeito de micro-vitória.
                  </p>
                </div>
              )}

              {/* VIEW 2: CALENDÁRIO DE LEMBRETES */}
              {activeModuleId === 'calendario-lembretes' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                    <div className="bg-[#f4f7fa] p-4 rounded-xl border border-[#d3dce6]">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-bold text-xs text-slate-900">Visão Mensal Espaçada</span>
                        <span className="text-xs text-[#124286] font-semibold">Setembro 2026</span>
                      </div>

                      <div className="grid grid-cols-7 gap-1 text-center text-xs">
                        {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
                          <div key={i} className="text-[10px] font-bold text-slate-500 py-1">{d}</div>
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
                                  ? 'bg-[#1d56af] text-white font-bold'
                                  : isSpecial
                                    ? 'bg-[#e3edfa] text-[#124286] font-bold border border-[#a3c5ed]'
                                    : 'text-slate-700 hover:bg-[#e8edf2]'
                              }`}
                            >
                              {day}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <span className="font-bold text-xs text-slate-900 block mb-1">Próximos Lembretes Críticos</span>

                      <div className="p-3 rounded-xl bg-white border border-[#a3c5ed] flex items-start gap-2.5 shadow-2xs">
                        <CalendarIcon className="w-4 h-4 text-[#1d56af] shrink-0 mt-0.5" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-xs text-slate-900">Entrega do Relatório Mensal</span>
                            <span className="text-[10px] bg-[#1d56af] text-white px-1.5 py-0.2 rounded font-medium">Em 4 dias</span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">Sexta-feira • 15:00</p>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-white border border-[#d3dce6] flex items-start gap-2.5 shadow-2xs">
                        <CalendarIcon className="w-4 h-4 text-[#1d56af] shrink-0 mt-0.5" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-xs text-slate-900">Consulta com Especialista</span>
                            <span className="text-[10px] bg-[#e8edf2] text-slate-700 px-1.5 py-0.2 rounded border border-[#d3dce6]">Em 13 dias</span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">Dia 14 • 10:30</p>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* VIEW 3: TEMPORIZADOR FOCO & DOPAMINA */}
              {activeModuleId === 'temporizador-foco' && (
                <div className="flex flex-col items-center justify-center p-6 bg-[#f4f7fa] rounded-2xl border border-[#d3dce6] text-center space-y-4">
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
                            ? 'bg-[#1d56af] text-white shadow-xs'
                            : 'bg-white text-slate-700 border border-[#d3dce6] hover:bg-[#e8edf2]'
                        }`}
                      >
                        {mins} minutos
                      </button>
                    ))}
                  </div>

                  {/* Circular visual timer representation */}
                  <div className="relative w-40 h-40 rounded-full border-4 border-[#1d56af] flex flex-col items-center justify-center bg-white shadow-xs">
                    <span className="text-3xl font-bold font-mono text-slate-900">
                      {String(timerMinutes).padStart(2, '0')}:{String(timerSeconds).padStart(2, '0')}
                    </span>
                    <span className="text-[11px] text-[#124286] font-semibold mt-1">
                      {timerRunning ? 'Em Foco Consciente' : 'Pronto para Começar'}
                    </span>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setTimerRunning(!timerRunning)}
                      className="px-6 py-2.5 rounded-xl bg-[#1d56af] hover:bg-[#16438a] text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
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
                      className="p-2.5 rounded-xl bg-white border border-[#d3dce6] text-slate-600 hover:text-slate-900 text-xs cursor-pointer shadow-2xs"
                      title="Reiniciar"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* VIEW 4: BRAIN DUMP / LIXEIRA MENTAL */}
              {activeModuleId === 'brain-dump' && (
                <div className="space-y-3">
                  <form onSubmit={addBrainDump} className="flex gap-2">
                    <input
                      type="text"
                      value={brainDumpInput}
                      onChange={(e) => setBrainDumpInput(e.target.value)}
                      placeholder="Pensamento intrusivo ou ideia rápida..."
                      className="flex-1 px-3 py-2 text-xs rounded-xl bg-white border border-[#d3dce6] text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1d56af]/20 shadow-xs"
                    />
                    <button
                      type="submit"
                      className="px-3.5 py-2 bg-[#1d56af] text-white text-xs font-semibold rounded-xl hover:bg-[#16438a] transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Despejar
                    </button>
                  </form>

                  <div className="space-y-1.5">
                    {brainDumpList.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-lg bg-[#f4f7fa] border border-[#d3dce6] text-xs text-slate-800 flex items-center justify-between"
                      >
                        <span>{item}</span>
                        <button
                          type="button"
                          onClick={() => setBrainDumpList(brainDumpList.filter((_, i) => i !== idx))}
                          className="text-slate-400 hover:text-red-600 text-[11px] cursor-pointer"
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
          <div className="bg-[#eef3f7] px-4 py-3 border-t border-[#d3dce6] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <span className="text-slate-600 text-center sm:text-left">
              Configuração personalizada: <strong className="text-slate-900">{enabledModules.length} modelos na sua barra esquerda</strong>.
            </span>
            <button
              type="button"
              onClick={() => onOpenRegisterWithModules?.(enabledModules)}
              className="px-4 py-2 bg-[#1d56af] hover:bg-[#16438a] text-white font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
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
