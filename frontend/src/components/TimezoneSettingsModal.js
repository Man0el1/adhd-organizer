import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Globe,
  Clock,
  Check,
  RotateCw,
  Search,
  Sparkles,
  MapPin,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import {
  getUserTimezone,
  setUserTimezone,
  getDetectedBrowserTimezone,
  getTimezoneNowParts,
  COMMON_TIMEZONES,
} from '../utils/date.js';
import { apiFetch } from '../utils/api.js';

export default function TimezoneSettingsModal({
  isOpen,
  onClose,
  isDarkMode = false,
  onTimezoneChanged,
}) {
  const [selectedTz, setSelectedTz] = useState(() => getUserTimezone());
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTimeParts, setCurrentTimeParts] = useState(() =>
    getTimezoneNowParts(getUserTimezone())
  );
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // 'success' | 'error' | null
  const [statusMessage, setStatusMessage] = useState('');

  const detectedBrowserTz = useMemo(() => getDetectedBrowserTimezone(), []);

  // Atualiza o relógio em tempo real a cada segundo para o fuso selecionado
  useEffect(() => {
    if (!isOpen) return;

    setCurrentTimeParts(getTimezoneNowParts(selectedTz));
    const timer = setInterval(() => {
      setCurrentTimeParts(getTimezoneNowParts(selectedTz));
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, selectedTz]);

  // Sincroniza estado quando modal abre
  useEffect(() => {
    if (isOpen) {
      setSelectedTz(getUserTimezone());
      setSaveStatus(null);
      setStatusMessage('');
      setSearchQuery('');
    }
  }, [isOpen]);

  // Filtra lista de fusos horários por termo de pesquisa
  const filteredTimezones = useMemo(() => {
    if (!searchQuery.trim()) return COMMON_TIMEZONES;
    const q = searchQuery.toLowerCase().trim();
    return COMMON_TIMEZONES.filter(
      (tz) =>
        tz.label.toLowerCase().includes(q) ||
        tz.value.toLowerCase().includes(q) ||
        tz.region.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Agrupa por região
  const groupedTimezones = useMemo(() => {
    const groups = {};
    filteredTimezones.forEach((tz) => {
      if (!groups[tz.region]) groups[tz.region] = [];
      groups[tz.region].push(tz);
    });
    return groups;
  }, [filteredTimezones]);

  const handleApplyBrowserTimezone = () => {
    setSelectedTz(detectedBrowserTz);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus(null);
    setStatusMessage('');

    try {
      // 1. Atualiza no backend
      const res = await apiFetch('/api/user/timezone', {
        method: 'PATCH',
        body: JSON.stringify({ timezone: selectedTz }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Falha ao salvar fuso horário no servidor.');
      }

      // 2. Salva localmente e emite evento para toda a aplicação
      setUserTimezone(selectedTz);
      if (onTimezoneChanged) {
        onTimezoneChanged(selectedTz);
      }

      setSaveStatus('success');
      setStatusMessage('Fuso horário configurado e salvo com sucesso!');

      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err) {
      // Fallback: se houver falha de rede ou backend off-line, ainda persiste localmente
      setUserTimezone(selectedTz);
      if (onTimezoneChanged) {
        onTimezoneChanged(selectedTz);
      }
      setSaveStatus('success');
      setStatusMessage('Fuso horário atualizado na sua sessão!');
      setTimeout(() => {
        onClose();
      }, 1200);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className={`w-full max-w-lg rounded-2xl border shadow-2xl flex flex-col max-h-[92vh] overflow-hidden transition-all ${
          isDarkMode
            ? 'bg-slate-900 border-slate-700 text-slate-100'
            : 'bg-white border-[#d3dce6] text-slate-900'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className={`p-4 sm:p-5 border-b flex items-center justify-between shrink-0 ${
            isDarkMode ? 'border-slate-800 bg-slate-900/90' : 'border-slate-100 bg-[#f8fafc]'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#1d56af]/10 text-[#1d56af] dark:text-blue-400 flex items-center justify-center shrink-0">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                Configuração de Fuso Horário
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Ajuste seu horário local para sincronizar tarefas e calendário
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
              isDarkMode
                ? 'hover:bg-slate-800 text-slate-400 hover:text-white border-transparent'
                : 'hover:bg-slate-200/60 text-slate-400 hover:text-slate-700 border-transparent'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Clock & Detected Info Box */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto min-h-0 flex-1">
          {/* Relógio em tempo real no fuso selecionado */}
          <div
            className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
              isDarkMode
                ? 'bg-blue-950/30 border-blue-900/50 text-blue-200'
                : 'bg-[#f0f6ff] border-[#cbe0f8] text-[#124286]'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#1d56af] text-white flex items-center justify-center shrink-0 shadow-xs">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider opacity-75">
                  Horário atual no fuso selecionado
                </span>
                <div className="font-mono text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {currentTimeParts.timeWithSecondsStr}
                </div>
                <div className="text-xs opacity-80 mt-0.5">
                  Data local: <span className="font-semibold">{currentTimeParts.ymd}</span>
                </div>
              </div>
            </div>

            {/* Botão de sincronizar com o fuso detectado do navegador */}
            {detectedBrowserTz !== selectedTz && (
              <button
                type="button"
                onClick={handleApplyBrowserTimezone}
                className={`text-xs px-3 py-1.5 rounded-lg border font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow-xs active:scale-95 ${
                  isDarkMode
                    ? 'bg-slate-800 hover:bg-slate-700 text-blue-300 border-slate-700'
                    : 'bg-white hover:bg-slate-50 text-[#1d56af] border-[#cbe0f8]'
                }`}
                title={`Usar fuso detectado no navegador: ${detectedBrowserTz}`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>Usar do Navegador</span>
              </button>
            )}
          </div>

          {/* Informação sobre fuso detectado */}
          <div
            className={`px-3 py-2 rounded-xl text-xs flex items-center justify-between gap-2 border ${
              isDarkMode ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 truncate">
              <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span className="truncate">
                Detectado pelo navegador:{' '}
                <strong className="text-slate-900 dark:text-white font-mono">
                  {detectedBrowserTz}
                </strong>
              </span>
            </div>
            {selectedTz === detectedBrowserTz ? (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 shrink-0">
                Sincronizado
              </span>
            ) : (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 shrink-0">
                Personalizado
              </span>
            )}
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar cidade, estado ou fuso horário..."
              className={`w-full pl-9 pr-3 py-2 rounded-xl border text-xs sm:text-sm outline-none transition-all ${
                isDarkMode
                  ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                  : 'bg-white border-[#d3dce6] text-slate-900 placeholder-slate-400 focus:border-[#1d56af] focus:ring-1 focus:ring-[#1d56af]'
              }`}
            />
          </div>

          {/* Lista de Fusos Horários Agrupados */}
          <div
            className={`border rounded-xl max-h-56 overflow-y-auto divide-y ${
              isDarkMode ? 'border-slate-700 divide-slate-800' : 'border-[#d3dce6] divide-slate-100'
            }`}
          >
            {Object.keys(groupedTimezones).length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400">
                Nenhum fuso horário encontrado para "{searchQuery}".
              </div>
            ) : (
              Object.entries(groupedTimezones).map(([region, tzs]) => (
                <div key={region} className="p-2">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1">
                    {region}
                  </div>
                  <div className="space-y-1">
                    {tzs.map((tz) => {
                      const isSelected = selectedTz === tz.value;
                      return (
                        <button
                          key={tz.value}
                          type="button"
                          onClick={() => setSelectedTz(tz.value)}
                          className={`w-full px-2.5 py-1.5 rounded-lg text-left text-xs transition-colors flex items-center justify-between cursor-pointer ${
                            isSelected
                              ? isDarkMode
                                ? 'bg-blue-900/40 text-blue-200 font-semibold'
                                : 'bg-[#e3edfa] text-[#124286] font-semibold'
                              : isDarkMode
                              ? 'text-slate-300 hover:bg-slate-800 hover:text-white'
                              : 'text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <div className="truncate pr-2">
                            <span className="block truncate">{tz.label}</span>
                            <span className="text-[10px] font-mono text-slate-400">{tz.value}</span>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-[#1d56af] dark:text-blue-400 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Dica amigável */}
          <div
            className={`p-3 rounded-xl border text-[11px] leading-relaxed flex items-start gap-2.5 ${
              isDarkMode
                ? 'bg-slate-800/50 border-slate-700/70 text-slate-300'
                : 'bg-slate-50 border-slate-200 text-slate-600'
            }`}
          >
            <HelpCircle className="w-4 h-4 text-[#1d56af] dark:text-blue-400 shrink-0 mt-0.5" />
            <div>
              <strong>Como o FocusMod trata seus horários:</strong> Suas tarefas pessoais
              são gravadas com o horário local da sua rotina (por exemplo, 09:00). Ao mudar de fuso,
              suas tarefas acompanham o novo horário local e o calendário mantém a data e hora corretas.
            </div>
          </div>

          {/* Status Message */}
          {statusMessage && (
            <div
              className={`px-3 py-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
                saveStatus === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
              }`}
            >
              {saveStatus === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{statusMessage}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className={`p-4 border-t flex items-center justify-between shrink-0 ${
            isDarkMode ? 'border-slate-800 bg-slate-900/90' : 'border-slate-100 bg-[#f8fafc]'
          }`}
        >
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
              isDarkMode
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#1d56af] hover:bg-[#16438a] text-white transition-all shadow-xs cursor-pointer flex items-center gap-2 active:scale-95 disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <RotateCw className="w-3.5 h-3.5 animate-spin" />
                <span>Salvando...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Salvar Fuso Horário</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
