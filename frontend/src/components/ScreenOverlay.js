import React, { useEffect } from 'react';
import { X, Layers, Sparkles } from 'lucide-react';

export default function FullScreenOverlay({ isOpen, onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
    >
      {/* Retângulo vertical por cima de tudo */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md sm:max-w-lg h-[86vh] max-h-[780px] bg-[#251818] border border-[#3D2B2B] rounded-3xl shadow-2xl flex flex-col text-[#F5E6DA] overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Top Header */}
        <header className="h-14 px-5 border-b border-[#3D2B2B] flex items-center justify-between bg-[#1E1414] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#800020] flex items-center justify-center text-[#F5E6DA] shadow">
              <Layers className="w-4 h-4 text-[#F5E6DA]" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#F5E6DA] leading-tight">
                Espaço Sobreposto
              </h2>
              <p className="text-[10px] text-[#A67C52]">
                Retângulo vertical de ação rápida
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-[#2D1F1F] hover:bg-[#800020] text-[#D1BFA5] hover:text-[#F5E6DA] transition-all cursor-pointer flex items-center gap-1 text-xs"
            title="Fechar (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </header>

        {/* Content Body: Vertical Card */}
        <div className="flex-1 p-5 flex flex-col justify-between overflow-y-auto">
          <div className="border-2 border-dashed border-[#4D3838] rounded-2xl p-6 text-center space-y-4 my-auto bg-[#1E1414]/50">
            <div className="w-12 h-12 rounded-xl bg-[#800020]/20 border border-[#800020] mx-auto flex items-center justify-center text-[#800020]">
              <Sparkles className="w-6 h-6 text-[#A67C52]" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-[#F5E6DA]">
                Pronto para Customização
              </h3>
              <p className="text-xs text-[#D1BFA5] leading-relaxed">
                Este retângulo vertical aparece por cima de todo o dashboard ao clicar no botão <span className="font-bold text-[#A67C52]">+</span>.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[#251818] border border-[#3D2B2B] text-left text-[11px] text-[#D1BFA5] space-y-1">
              <p className="font-semibold text-[#F5E6DA]">💡 O que você pode colocar aqui:</p>
              <ul className="list-disc pl-4 space-y-0.5 text-[#A67C52]">
                <li>Criação expressa de tarefas ou hábitos</li>
                <li>Notas rápidas de hiperfoco</li>
                <li>Formulário ou timer adicional</li>
              </ul>
            </div>
          </div>

          {/* Footer Action */}
          <div className="pt-3 border-t border-[#3D2B2B] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#1E1414] hover:bg-[#2D1F1F] text-[#D1BFA5] hover:text-[#F5E6DA] text-xs font-semibold transition-colors cursor-pointer border border-[#3D2B2B]"
            >
              Fechar
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#800020] hover:bg-[#A00028] text-[#F5E6DA] text-xs font-bold transition-all shadow cursor-pointer"
            >
              Concluído
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
