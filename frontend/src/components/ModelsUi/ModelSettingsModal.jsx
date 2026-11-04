import React from 'react';
import { Settings, X } from 'lucide-react';

export default function ModelSettingsModal({
  isOpen,
  onClose,
  modelName = 'Módulo',
  isDarkMode = false,
}) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-[2px] animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`w-full max-w-md rounded-2xl border p-5 shadow-2xl space-y-4 transition-colors ${
          isDarkMode
            ? 'bg-slate-900 border-slate-800 text-slate-100'
            : 'bg-[#f4f7fa] border-[#d3dce6] text-slate-900'
        }`}
      >
        {/* Cabeçalho */}
        <div className="flex items-center justify-between pb-3 border-b border-[#d3dce6] dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div
              className={`p-2 rounded-xl ${
                isDarkMode
                  ? 'bg-slate-800 text-blue-400'
                  : 'bg-[#e3edfa] text-[#1d56af]'
              }`}
            >
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base leading-tight">
                Configurações — {modelName}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Preferências e ajustes deste módulo
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Corpo vazio (placeholder para futuras configurações) */}
        <div
          className={`py-8 px-4 rounded-xl border border-dashed text-center space-y-2 ${
            isDarkMode
              ? 'border-slate-800 bg-slate-950/40 text-slate-400'
              : 'border-[#d3dce6] bg-white/70 text-slate-500'
          }`}
        >
          <Settings className="w-8 h-8 mx-auto text-slate-400 opacity-70" />
          <p className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200">
            Nenhuma configuração adicional disponível no momento.
          </p>
          <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
            Em breve você poderá personalizar opções específicas para este módulo aqui.
          </p>
        </div>

        {/* Rodapé */}
        <div className="flex items-center justify-end pt-2 border-t border-[#d3dce6] dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold rounded-xl bg-[#1d56af] hover:bg-[#16438a] text-white cursor-pointer shadow-xs transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
