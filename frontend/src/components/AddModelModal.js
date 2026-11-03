import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Plus,
  Clock,
  CalendarDays,
  Hourglass,
  Brain,
} from 'lucide-react';

export const MODAL_MODEL_OPTIONS = [
  {
    type: 'routine',
    name: 'Agenda Visual',
    subtitle: 'Linha do tempo e horários',
    icon: Clock,
    color: 'text-[#1d56af]',
    videoSrc: '/videos/intro.mp4',
    description:
      'Organize o seu dia em blocos cronológicos de tempo com horários definidos de início e término para acompanhar suas atividades com clareza.',
  },
  {
    type: 'calendario',
    name: 'Calendário',
    subtitle: 'Visão mensal e prazos',
    icon: CalendarDays,
    color: 'text-indigo-600',
    videoSrc: '/videos/intro.mp4',
    description:
      'Acompanhe seus compromissos e prazos distribuídos ao longo das semanas e meses com clareza.',
  },
  {
    type: 'pomodoro',
    name: 'Pomodoro',
    subtitle: 'Temporizador de foco',
    icon: Hourglass,
    color: 'text-emerald-600',
    videoSrc: '/videos/intro.mp4',
    description:
      'Temporizador de foco de 25 minutos intercalado com pausas curtas e longas para manter o ritmo e a concentração.',
  },
  {
    type: 'brain-dump',
    name: 'Brain Dump',
    subtitle: 'Descarga mental rápida',
    icon: Brain,
    color: 'text-amber-600',
    videoSrc: '/videos/intro.mp4',
    description:
      'Captura rápida para despejar pensamentos, ideias soltas e tarefas imediatas sem a necessidade de agendar datas.',
  },
];

export default function AddModelModal({
  isOpen,
  onClose,
  onAddModel,
  existingModels = [],
  isDarkMode = false,
}) {
  const [selectedType, setSelectedType] = useState('routine');
  const videoRef = useRef(null);

  const selectedModel =
    MODAL_MODEL_OPTIONS.find((m) => m.type === selectedType) ||
    MODAL_MODEL_OPTIONS[0];

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  }, [selectedType, isOpen]);

  if (!isOpen) return null;

  const handleConfirmAdd = () => {
    onAddModel(selectedModel);
    onClose();
  };

  const SelectedIcon = selectedModel.icon;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/45 backdrop-blur-[2px] animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`relative w-full max-w-4xl border rounded-2xl shadow-2xl overflow-hidden flex flex-col transition-colors ${
          isDarkMode
            ? 'bg-slate-900 border-slate-800 text-slate-100'
            : 'bg-[#f4f7fa] border-[#d3dce6] text-slate-900'
        }`}
      >
        {/* Header */}
        <div
          className={`px-5 py-3 border-b flex items-center justify-between shrink-0 ${
            isDarkMode
              ? 'bg-slate-950 border-slate-800'
              : 'bg-[#e8edf2] border-[#d3dce6]'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#1d56af] text-white flex items-center justify-center font-bold text-sm shadow-xs">
              <Plus className="w-4 h-4 stroke-[3]" />
            </div>
            <h2 className="text-base sm:text-lg font-bold">
              Adicionar modelo
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
              isDarkMode
                ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                : 'text-slate-400 hover:text-slate-700 hover:bg-[#e8edf2]'
            }`}
            title="Fechar (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body: Left Column + Right Column */}
        <div className="flex flex-col md:flex-row min-h-0 overflow-hidden">
          {/* Left Column: Model options */}
          <div
            className={`w-full md:w-72 border-b md:border-b-0 md:border-r p-4 flex flex-col justify-start shrink-0 space-y-2.5 ${
              isDarkMode
                ? 'border-slate-800 bg-slate-950/60'
                : 'border-[#d3dce6] bg-[#eef3f7]'
            }`}
          >
            {MODAL_MODEL_OPTIONS.map((item) => {
              const Icon = item.icon;
              const isSelected = selectedType === item.type;
              const existingCount = existingModels.filter(
                (m) => m.type === item.type
              ).length;

              return (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => setSelectedType(item.type)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl border transition-all cursor-pointer flex items-center gap-3 group ${
                    isSelected
                      ? isDarkMode
                        ? 'bg-blue-950/70 border-blue-700 shadow-xs ring-1 ring-blue-600/40 text-blue-100'
                        : 'bg-[#e3edfa] border-[#a3c5ed] shadow-xs ring-1 ring-[#1d56af]/25 text-[#124286]'
                      : isDarkMode
                      ? 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600 hover:bg-slate-750'
                      : 'bg-[#ffffff] border-[#d3dce6] text-slate-700 hover:border-[#b9cee2] hover:bg-[#e8edf2]'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                      isSelected
                        ? 'bg-[#1d56af] text-white'
                        : isDarkMode
                        ? 'bg-slate-700 text-slate-300 group-hover:text-white'
                        : 'bg-[#e8edf2] text-slate-600 group-hover:text-slate-900'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>

                  <div className="flex-1 min-w-0 pr-1">
                    <span className="font-semibold text-xs sm:text-sm truncate block leading-snug">
                      {item.name}
                    </span>
                    <span className="text-[10px] text-slate-400 truncate block leading-tight mt-0.5">
                      {item.subtitle}
                    </span>
                  </div>

                  {existingCount > 0 && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded shrink-0 font-medium ${
                        isDarkMode
                          ? 'bg-slate-700 text-slate-300'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {existingCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Right Column: Video + description */}
          <div
            className={`flex-1 min-w-0 p-5 flex flex-col justify-between overflow-hidden ${
              isDarkMode ? 'bg-slate-900' : 'bg-[#f4f7fa]'
            }`}
          >
            <div className="space-y-3">
              {/* Video Area */}
              <div
                className={`relative rounded-xl overflow-hidden border shadow-inner aspect-video max-h-[260px] w-full flex items-center justify-center ${
                  isDarkMode
                    ? 'bg-black/60 border-slate-800'
                    : 'bg-[#e8edf2] border-[#d3dce6]'
                }`}
              >
                <video
                  ref={videoRef}
                  key={selectedModel.type}
                  src={selectedModel.videoSrc}
                  controls
                  playsInline
                  loop
                  muted
                  className="w-full h-full object-cover"
                >
                  Seu navegador não suporta vídeos HTML5.
                </video>
              </div>

              {/* Brief Explanation Text */}
              <div className="space-y-1">
                <h3 className="text-sm font-bold flex items-center gap-1.5">
                  <SelectedIcon className={`w-4 h-4 ${selectedModel.color}`} />
                  <span>{selectedModel.name}</span>
                </h3>

                <p
                  className={`text-xs leading-relaxed ${
                    isDarkMode ? 'text-slate-400' : 'text-slate-600'
                  }`}
                >
                  {selectedModel.description}
                </p>
              </div>
            </div>

            {/* Bottom Right Corner: Add Button */}
            <div
              className={`pt-3 mt-3 border-t flex items-center justify-end ${
                isDarkMode ? 'border-slate-800' : 'border-[#d3dce6]'
              }`}
            >
              <button
                type="button"
                onClick={handleConfirmAdd}
                className="px-4 py-2 rounded-xl bg-[#1d56af] hover:bg-[#16438a] text-white text-xs sm:text-sm font-semibold shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>Adicionar</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
