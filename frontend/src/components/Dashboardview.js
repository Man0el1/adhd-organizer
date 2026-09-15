import React, { useState } from 'react';
import { AVAILABLE_MODULES } from '../data/modulesData.js';
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
  LogOut,
  Calendar as CalendarIcon,
  Flame,
  Check,
  ChevronLeft,
  Settings,
  Bell,
  User
} from 'lucide-react';

export function DashboardView({
  userData,
  onLogout
}) {
  const [activeModuleId, setActiveModuleId] = useState(
    userData?.modules?.[0] || 'agenda-visual'
  );
  const [userModules, setUserModules] = useState(userData?.modules || ['agenda-visual', 'calendario-lembretes']);
  const [isConfiguringModules, setIsConfiguringModules] = useState(false);

  // Agenda State
  const [agendaTasks, setAgendaTasks] = useState([
    { id: '1', time: '08:30 - 09:30', title: 'Rotina Matinal & Hidratação', tag: 'Hábito', color: 'bg-[#A67C52] text-[#1E1414]', done: true },
    { id: '2', time: '09:45 - 11:00', title: 'Trabalho / Estudo Principal (Hiperfoco)', tag: 'Foco Alto', color: 'bg-[#800020] text-[#F5E6DA]', done: false, current: true },
    { id: '3', time: '11:15 - 12:00', title: 'Organização de Arquivos & E-mails', tag: 'Rotina Leve', color: 'bg-[#3D2B2B] text-[#D1BFA5]', done: false },
    { id: '4', time: '14:00 - 15:30', title: 'Reunião ou Revisão de Projetos', tag: 'Compromisso', color: 'bg-[#800020] text-[#F5E6DA]', done: false },
  ]);
  const [newAgendaTitle, setNewAgendaTitle] = useState('');
  const [newAgendaTime, setNewAgendaTime] = useState('');

  // Micro-Tasks State
  const [microTasks, setMicroTasks] = useState([
    { id: 'm1', step: '1', text: 'Abrir o material e separar o que vou usar', done: true },
    { id: 'm2', step: '2', text: 'Fazer o primeiro rascunho em 5 minutos', done: false },
    { id: 'm3', step: '3', text: 'Revisar apenas os pontos principais', done: false },
    { id: 'm4', step: '4', text: 'Salvar e marcar como concluído!', done: false }
  ]);
  const [newMicroTaskText, setNewMicroTaskText] = useState('');

  // Brain Dump State
  const [brainDumpInput, setBrainDumpInput] = useState('');
  const [brainDumpList, setBrainDumpList] = useState([
    'Pesquisar artigo sobre regulação de dopamina',
    'Comprar lâmpada de luz amarelada para o quarto',
    'Mandar mensagem de confirmação para sexta-feira'
  ]);

  // Timer State
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerMinutes, setTimerMinutes] = useState(25);
  const [timerSeconds, setTimerSeconds] = useState(0);

  // Energy Battery State
  const [energyLevel, setEnergyLevel] = useState('media');

  const getModuleIcon = (iconName, className = "w-5 h-5") => {
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

  const toggleModuleConfig = (id) => {
    if (userModules.includes(id)) {
      if (userModules.length <= 1) return;
      const updated = userModules.filter(m => m !== id);
      setUserModules(updated);
      if (activeModuleId === id) setActiveModuleId(updated[0]);
    } else {
      const updated = [...userModules, id];
      setUserModules(updated);
      setActiveModuleId(id);
    }
  };

  const handleAddAgendaTask = (e) => {
    e.preventDefault();
    if (!newAgendaTitle.trim()) return;
    setAgendaTasks([
      ...agendaTasks,
      {
        id: Date.now().toString(),
        time: newAgendaTime.trim() || 'Horário Livre',
        title: newAgendaTitle.trim(),
        tag: 'Personalizado',
        color: 'bg-[#800020] text-[#F5E6DA]',
        done: false
      }
    ]);
    setNewAgendaTitle('');
    setNewAgendaTime('');
  };

  const handleAddMicroTask = (e) => {
    e.preventDefault();
    if (!newMicroTaskText.trim()) return;
    setMicroTasks([
      ...microTasks,
      {
        id: Date.now().toString(),
        step: String(microTasks.length + 1),
        text: newMicroTaskText.trim(),
        done: false
      }
    ]);
    setNewMicroTaskText('');
  };

  const handleAddBrainDump = (e) => {
    e.preventDefault();
    if (!brainDumpInput.trim()) return;
    setBrainDumpList([brainDumpInput.trim(), ...brainDumpList]);
    setBrainDumpInput('');
  };

  const currentUserName = userData?.name || 'Seu Espaço';

  return (
    <div className="min-h-screen bg-[#1E1414] text-[#F5E6DA] flex flex-col font-sans">

      {/* Top Navigation Bar */}
      <header className="h-16 px-4 sm:px-6 bg-[#251818] border-b border-[#3D2B2B] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#800020] flex items-center justify-center font-bold text-[#F5E6DA] text-sm">
            F
          </div>
          <span className="font-bold text-lg text-[#F5E6DA] tracking-tight">Focus<span className="text-[#A67C52]">Mod</span></span>
          <span className="text-xs bg-[#3D2B2B] text-[#D1BFA5] px-2.5 py-0.5 rounded-full hidden sm:inline-block">
            Painel do Usuário (Estilo Tiimo)
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsConfiguringModules(!isConfiguringModules)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#3D2B2B] hover:bg-[#4D3838] text-xs font-semibold text-[#D1BFA5] hover:text-[#F5E6DA] transition-colors cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5 text-[#A67C52]" />
            <span>Editar Barra Lateral</span>
          </button>

          <div className="h-4 w-px bg-[#3D2B2B] mx-1"></div>

          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#800020] flex items-center justify-center text-xs font-bold text-[#F5E6DA]">
              {currentUserName.charAt(0).toUpperCase()}
            </div>
            <span className="text-xs font-medium text-[#F5E6DA] hidden md:inline-block">
              {currentUserName}
            </span>
          </div>

          <button
            type="button"
            onClick={onLogout}
            title="Voltar para a Landing Page"
            className="p-1.5 rounded-lg bg-[#3D2B2B] hover:bg-[#800020] text-[#D1BFA5] hover:text-[#F5E6DA] transition-colors cursor-pointer text-xs flex items-center gap-1"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sair</span>
          </button>
        </div>
      </header>

      {/* Module Customization Drawer if active */}
      {isConfiguringModules && (
        <div className="bg-[#2D1F1F] border-b border-[#3D2B2B] p-4 px-6">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h4 className="font-bold text-sm text-[#F5E6DA]">Personalize sua Barra Lateral Esquerda:</h4>
              <p className="text-xs text-[#D1BFA5]">Ative ou desative modelos instantaneamente.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_MODULES.map((m) => {
                const isSelected = userModules.includes(m.id);
                return (
                  <button
                    type="button"
                    key={m.id}
                    onClick={() => toggleModuleConfig(m.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[#800020] text-[#F5E6DA]'
                        : 'bg-[#1E1414] text-[#D1BFA5] border border-[#3D2B2B]'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3" />}
                    <span>{m.name.split(' (')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Main Container: Left Sidebar + Central Work Canvas */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">

        {/* THE LEFT SIDEBAR (Requested core requirement) */}
        <aside className="w-full md:w-64 bg-[#251818] border-r border-[#3D2B2B] p-4 flex flex-col justify-between shrink-0">
          <div>
            <div className="px-2 py-1 mb-2 text-[11px] font-bold uppercase tracking-wider text-[#A67C52]">
              Sua Aba na Esquerda
            </div>

            <nav className="space-y-1.5">
              {AVAILABLE_MODULES.filter(m => userModules.includes(m.id)).map((mod) => {
                const isActive = activeModuleId === mod.id;
                return (
                  <button
                    type="button"
                    key={mod.id}
                    onClick={() => setActiveModuleId(mod.id)}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl font-medium text-sm text-left transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-[#800020] text-[#F5E6DA] shadow-md font-bold'
                        : 'text-[#D1BFA5] hover:bg-[#2D1F1F] hover:text-[#F5E6DA]'
                    }`}
                  >
                    <span className={isActive ? 'text-[#F5E6DA]' : 'text-[#A67C52]'}>
                      {getModuleIcon(mod.icon, "w-4 h-4")}
                    </span>
                    <span className="truncate flex-1">{mod.name.split(' (')[0]}</span>
                    {isActive && <span className="w-2 h-2 rounded-full bg-[#A67C52]"></span>}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="pt-4 border-t border-[#3D2B2B] text-xs text-[#A67C52] space-y-1">
            <p className="font-semibold text-[#F5E6DA]">Modo Foco Ativo</p>
            <p className="text-[11px] text-[#D1BFA5]">Seu espaço sem distrações e com seus modelos preferidos.</p>
          </div>
        </aside>

        {/* WORK CANVAS: Selected Model Area */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto bg-[#1E1414]">

          <div className="max-w-4xl mx-auto space-y-6">

            {/* Header of Active Module */}
            <div className="bg-[#251818] p-5 rounded-2xl border border-[#3D2B2B] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-[#F5E6DA]">
                    {AVAILABLE_MODULES.find(m => m.id === activeModuleId)?.name}
                  </h2>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-[#800020] text-[#F5E6DA]">
                    Ativo
                  </span>
                </div>
                <p className="text-xs text-[#D1BFA5] mt-1">
                  {AVAILABLE_MODULES.find(m => m.id === activeModuleId)?.fullDesc}
                </p>
              </div>

              <div className="text-xs text-[#A67C52] bg-[#1E1414] px-3 py-1.5 rounded-xl border border-[#3D2B2B]">
                {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </div>
            </div>

            {/* MODEL VIEW 1: AGENDA VISUAL (TIMELINE ESTILO TIIMO) */}
            {activeModuleId === 'agenda-visual' && (
              <div className="space-y-4">

                {/* Add new task input */}
                <form onSubmit={handleAddAgendaTask} className="bg-[#2D1F1F] p-4 rounded-2xl border border-[#3D2B2B] flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    value={newAgendaTitle}
                    onChange={(e) => setNewAgendaTitle(e.target.value)}
                    placeholder="Adicionar novo bloco na linha do tempo..."
                    className="flex-1 px-4 py-2.5 rounded-xl bg-[#1E1414] border border-[#3D2B2B] text-sm text-[#F5E6DA] focus:outline-none focus:ring-2 focus:ring-[#800020]"
                  />
                  <input
                    type="text"
                    value={newAgendaTime}
                    onChange={(e) => setNewAgendaTime(e.target.value)}
                    placeholder="Ex: 16:00 - 17:00"
                    className="w-full sm:w-40 px-4 py-2.5 rounded-xl bg-[#1E1414] border border-[#3D2B2B] text-sm text-[#F5E6DA] focus:outline-none focus:ring-2 focus:ring-[#800020]"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#800020] hover:bg-[#A00028] text-[#F5E6DA] font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Adicionar</span>
                  </button>
                </form>

                {/* Timeline Tasks */}
                <div className="space-y-3">
                  {agendaTasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => setAgendaTasks(agendaTasks.map(t => t.id === task.id ? { ...t, done: !t.done } : t))}
                      className={`p-4 rounded-2xl border transition-colors cursor-pointer flex items-center justify-between ${
                        task.done
                          ? 'bg-[#251818] border-[#3D2B2B] opacity-60'
                          : task.current
                            ? 'bg-[#2D1F1F] border-[#800020] ring-1 ring-[#800020] shadow-lg'
                            : 'bg-[#2D1F1F] border-[#3D2B2B] hover:border-[#A67C52]'
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <button type="button" className="text-[#800020]">
                          {task.done ? (
                            <CheckCircle className="w-5 h-5 text-[#A67C52]" />
                          ) : (
                            <Circle className="w-5 h-5 text-[#D1BFA5]" />
                          )}
                        </button>
                        <div>
                          <span className="text-xs font-mono font-bold text-[#A67C52] block">
                            {task.time}
                          </span>
                          <span className={`font-semibold text-sm sm:text-base ${task.done ? 'line-through text-[#8A766B]' : 'text-[#F5E6DA]'}`}>
                            {task.title}
                          </span>
                        </div>
                      </div>

                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${task.color}`}>
                        {task.tag}
                      </span>
                    </div>
                  ))}
                </div>

              </div>
            )}

            {/* MODEL VIEW 2: CALENDÁRIO DE LEMBRETES */}
            {activeModuleId === 'calendario-lembretes' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#251818] p-5 rounded-2xl border border-[#3D2B2B]">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-bold text-sm text-[#F5E6DA]">Calendário Espaçado</span>
                    <span className="text-xs text-[#A67C52] font-semibold">Setembro 2026</span>
                  </div>

                  <div className="grid grid-cols-7 gap-1.5 text-center text-xs">
                    {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
                      <div key={i} className="text-[11px] font-bold text-[#A67C52] py-1">{d}</div>
                    ))}
                    {[...Array(30)].map((_, i) => {
                      const day = i + 1;
                      const isToday = day === 1;
                      const hasEvent = day === 8 || day === 15 || day === 28;
                      return (
                        <div
                          key={i}
                          className={`py-2 rounded-xl text-xs font-medium cursor-pointer transition-colors ${
                            isToday
                              ? 'bg-[#800020] text-[#F5E6DA] font-bold'
                              : hasEvent
                                ? 'bg-[#3D2B2B] text-[#A67C52] border border-[#800020]'
                                : 'text-[#D1BFA5] hover:bg-[#2D1F1F]'
                          }`}
                        >
                          {day}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-bold text-sm text-[#F5E6DA]">Lembretes Críticos Registrados</h3>

                  <div className="p-4 rounded-2xl bg-[#251818] border border-[#800020] flex items-start gap-3">
                    <CalendarIcon className="w-5 h-5 text-[#800020] shrink-0 mt-0.5" />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-[#F5E6DA]">Entrega do Projeto Semestral</h4>
                        <span className="text-[10px] bg-[#800020] text-[#F5E6DA] px-2 py-0.5 rounded-full font-bold">Em 7 dias</span>
                      </div>
                      <p className="text-xs text-[#D1BFA5] mt-1">Sexta-feira • 17:00 • Notificação gentil ativada</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#251818] border border-[#3D2B2B] flex items-start gap-3">
                    <CalendarIcon className="w-5 h-5 text-[#A67C52] shrink-0 mt-0.5" />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-[#F5E6DA]">Consulta de Acompanhamento</h4>
                        <span className="text-[10px] bg-[#3D2B2B] text-[#D1BFA5] px-2 py-0.5 rounded-full">Em 14 dias</span>
                      </div>
                      <p className="text-xs text-[#D1BFA5] mt-1">Dia 15 • 10:30</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* MODEL VIEW 3: TEMPORIZADOR FOCO & DOPAMINA */}
            {activeModuleId === 'temporizador-foco' && (
              <div className="bg-[#251818] p-8 rounded-3xl border border-[#3D2B2B] text-center max-w-lg mx-auto space-y-6">
                <div className="flex justify-center gap-2">
                  {[15, 25, 45].map((m) => (
                    <button
                      type="button"
                      key={m}
                      onClick={() => { setTimerMinutes(m); setTimerSeconds(0); setTimerRunning(false); }}
                      className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                        timerMinutes === m
                          ? 'bg-[#800020] text-[#F5E6DA]'
                          : 'bg-[#1E1414] text-[#D1BFA5] border border-[#3D2B2B]'
                      }`}
                    >
                      {m} min
                    </button>
                  ))}
                </div>

                <div className="w-48 h-48 rounded-full border-4 border-[#800020] flex flex-col items-center justify-center mx-auto bg-[#1E1414] shadow-2xl">
                  <span className="text-4xl font-bold font-mono text-[#F5E6DA]">
                    {String(timerMinutes).padStart(2, '0')}:{String(timerSeconds).padStart(2, '0')}
                  </span>
                  <span className="text-xs text-[#A67C52] mt-1 font-semibold">
                    {timerRunning ? '⚡ Hiperfoco Ativo' : 'Pronto'}
                  </span>
                </div>

                <div className="flex justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setTimerRunning(!timerRunning)}
                    className="px-6 py-3 bg-[#800020] hover:bg-[#A00028] text-[#F5E6DA] font-bold rounded-xl text-sm flex items-center gap-2 cursor-pointer shadow-lg"
                  >
                    {timerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    <span>{timerRunning ? 'Pausar' : 'Começar Agora'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setTimerRunning(false); setTimerMinutes(25); setTimerSeconds(0); }}
                    className="p-3 bg-[#1E1414] border border-[#3D2B2B] text-[#D1BFA5] hover:text-[#F5E6DA] rounded-xl cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* MODEL VIEW 4: DECOMPOSITOR DE MICRO-PASSOS */}
            {activeModuleId === 'decompositor-tarefas' && (
              <div className="space-y-4">
                <form onSubmit={handleAddMicroTask} className="flex gap-2">
                  <input
                    type="text"
                    value={newMicroTaskText}
                    onChange={(e) => setNewMicroTaskText(e.target.value)}
                    placeholder="Adicionar micro-passo simples (menos de 2 min)..."
                    className="flex-1 px-4 py-2.5 rounded-xl bg-[#251818] border border-[#3D2B2B] text-sm text-[#F5E6DA] focus:outline-none focus:ring-2 focus:ring-[#800020]"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-[#800020] hover:bg-[#A00028] text-[#F5E6DA] font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Passo</span>
                  </button>
                </form>

                <div className="space-y-2.5">
                  {microTasks.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => setMicroTasks(microTasks.map(item => item.id === t.id ? { ...item, done: !item.done } : item))}
                      className={`p-3.5 rounded-xl border transition-colors cursor-pointer flex items-center gap-3 ${
                        t.done
                          ? 'bg-[#251818] border-[#3D2B2B] opacity-60'
                          : 'bg-[#2D1F1F] border-[#3D2B2B] hover:border-[#800020]'
                      }`}
                    >
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                        t.done ? 'bg-[#A67C52] text-[#1E1414]' : 'bg-[#800020] text-[#F5E6DA]'
                      }`}>
                        {t.done ? <Check className="w-3.5 h-3.5" /> : t.step}
                      </span>
                      <span className={`text-sm ${t.done ? 'line-through text-[#8A766B]' : 'text-[#F5E6DA]'}`}>
                        {t.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* MODEL VIEW 5: BATERIA MENTAL */}
            {activeModuleId === 'bateria-mental' && (
              <div className="bg-[#251818] p-6 rounded-2xl border border-[#3D2B2B] space-y-4">
                <h3 className="font-bold text-base text-[#F5E6DA]">Nível de Energia de Hoje</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { key: 'alta', label: 'Bateria Alta ⚡', desc: 'Ataque tarefas difíceis' },
                    { key: 'media', label: 'Bateria Média 🔋', desc: 'Ritmo constante' },
                    { key: 'baixa', label: 'Bateria Baixa 🪫', desc: 'Apenas o essencial' },
                    { key: 'sobrecarga', label: 'Sobrecarga 🛑', desc: 'Descanse sem culpa' }
                  ].map((lvl) => (
                    <button
                      type="button"
                      key={lvl.key}
                      onClick={() => setEnergyLevel(lvl.key)}
                      className={`p-4 rounded-xl text-left border transition-colors cursor-pointer ${
                        energyLevel === lvl.key
                          ? 'bg-[#800020] text-[#F5E6DA] border-[#800020]'
                          : 'bg-[#1E1414] text-[#D1BFA5] border-[#3D2B2B]'
                      }`}
                    >
                      <span className="font-bold text-sm block">{lvl.label}</span>
                      <span className="text-xs opacity-80 block mt-1">{lvl.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* MODEL VIEW 6: BRAIN DUMP */}
            {activeModuleId === 'brain-dump' && (
              <div className="bg-[#251818] p-6 rounded-2xl border border-[#3D2B2B] space-y-4">
                <form onSubmit={handleAddBrainDump} className="flex gap-2">
                  <input
                    type="text"
                    value={brainDumpInput}
                    onChange={(e) => setBrainDumpInput(e.target.value)}
                    placeholder="Pensamento ou lembrete que surgiu na cabeça..."
                    className="flex-1 px-4 py-2.5 rounded-xl bg-[#1E1414] border border-[#3D2B2B] text-sm text-[#F5E6DA] focus:outline-none focus:ring-2 focus:ring-[#800020]"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-[#800020] text-[#F5E6DA] font-bold text-xs rounded-xl hover:bg-[#A00028] transition-colors cursor-pointer"
                  >
                    Despejar
                  </button>
                </form>

                <div className="space-y-2">
                  {brainDumpList.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-[#1E1414] border border-[#3D2B2B] text-sm text-[#F5E6DA] flex items-center justify-between"
                    >
                      <span>{item}</span>
                      <button
                        type="button"
                        onClick={() => setBrainDumpList(brainDumpList.filter((_, i) => i !== idx))}
                        className="text-xs text-[#A67C52] hover:text-[#F5E6DA] cursor-pointer"
                      >
                        Limpar
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </main>

      </div>
    </div>
  );
}
