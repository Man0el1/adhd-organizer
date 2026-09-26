import React, { useState } from 'react';
import { AVAILABLE_MODULES } from '../../data/modulesData.js';
import {
  X,
  Check,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

export function RegisterModal({
  isOpen,
  onClose,
  initialModules = ['agenda-visual', 'calendario-lembretes'],
  onCompleteRegistration,
  isLoginMode = false,
  onSwitchMode
}) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedModules, setSelectedModules] = useState(initialModules);

  if (!isOpen) return null;

  const toggleModule = (id) => {
    if (selectedModules.includes(id)) {
      if (selectedModules.length <= 1) return;
      setSelectedModules(selectedModules.filter(m => m !== id));
    } else {
      setSelectedModules([...selectedModules, id]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLoginMode) {
      onCompleteRegistration({
        name: name || 'Usuário FocusMod',
        email: email || 'usuario@exemplo.com',
        modules: selectedModules
      });
      return;
    }

    if (step === 1) {
      setStep(2);
    } else {
      onCompleteRegistration({
        name: name || 'Usuário FocusMod',
        email: email || 'usuario@exemplo.com',
        modules: selectedModules
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="bg-[#1E1414] text-[#F5E6DA] border border-[#3D2B2B] rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">

        {/* Header */}
        <div className="px-6 py-5 bg-[#251818] border-b border-[#3D2B2B] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#800020] flex items-center justify-center text-[#F5E6DA] font-bold text-sm">
              F
            </div>
            <div>
              <h3 className="font-bold text-base text-[#F5E6DA]">
                {isLoginMode ? 'Entrar no FocusMod' : 'Criar Conta no FocusMod'}
              </h3>
              <p className="text-xs text-[#A67C52]">
                {isLoginMode
                  ? 'Acesse seu painel com seus modelos salvos'
                  : `Etapa ${step} de 2 • ${step === 1 ? 'Seus Dados' : 'Escolha seus Módulos'}`}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#3D2B2B] text-[#D1BFA5] hover:text-[#F5E6DA] hover:bg-[#4D3838] transition-colors cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Step 1: User details */}
          {step === 1 && (
            <div className="space-y-4">
              {!isLoginMode && (
                <div>
                  <label className="block text-xs font-semibold text-[#D1BFA5] mb-1.5">
                    Como você prefere ser chamado(a)?
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu nome ou apelido"
                    required={!isLoginMode}
                    className="w-full px-4 py-3 rounded-xl bg-[#251818] border border-[#3D2B2B] text-[#F5E6DA] placeholder-[#A67C52]/60 focus:outline-none focus:border-[#800020] text-sm"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#D1BFA5] mb-1.5">
                  Seu melhor E-mail
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemplo@gmail.com"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-[#251818] border border-[#3D2B2B] text-[#F5E6DA] placeholder-[#A67C52]/60 focus:outline-none focus:border-[#800020] text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#D1BFA5] mb-1.5">
                  Senha
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo de 6 caracteres"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-[#251818] border border-[#3D2B2B] text-[#F5E6DA] placeholder-[#A67C52]/60 focus:outline-none focus:border-[#800020] text-sm"
                />
              </div>

              <div className="pt-2">
                <div className="flex items-center gap-2 text-xs text-[#A67C52]">
                  <ShieldCheck className="w-4 h-4 text-[#A67C52] shrink-0" />
                  <span>Seus dados nunca são compartilhados. Sem anúncios ou spam.</span>
                </div>
              </div>

              {/* Mode Switcher (Login <-> Register) */}
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => onSwitchMode(!isLoginMode)}
                  className="text-xs text-[#D1BFA5] hover:text-[#F5E6DA] underline cursor-pointer"
                >
                  {isLoginMode
                    ? 'Ainda não tem conta? Criar conta gratuita'
                    : 'Já tem uma conta? Clique para entrar'}
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Choose Modules */}
          {step === 2 && !isLoginMode && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-[#F5E6DA]">
                  Quais ferramentas você quer ver na sua barra lateral?
                </h4>
                <p className="text-xs text-[#D1BFA5] mt-1">
                  Você pode ativar e desativar qualquer uma delas mais tarde a qualquer momento.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-60 overflow-y-auto pr-1">
                {AVAILABLE_MODULES.map((mod) => {
                  const isChecked = selectedModules.includes(mod.id);
                  return (
                    <div
                      key={mod.id}
                      onClick={() => toggleModule(mod.id)}
                      className={`p-3 rounded-xl border transition-colors cursor-pointer flex items-start justify-between ${
                        isChecked
                          ? 'bg-[#2D1F1F] border-[#800020] ring-1 ring-[#800020]'
                          : 'bg-[#251818] border-[#3D2B2B] opacity-70 hover:opacity-100'
                      }`}
                    >
                      <div className="pr-2">
                        <span className="font-bold text-xs text-[#F5E6DA] block">
                          {mod.name}
                        </span>
                        <span className="text-[11px] text-[#D1BFA5] line-clamp-2 mt-0.5">
                          {mod.shortDesc}
                        </span>
                      </div>
                      <span className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${
                        isChecked ? 'bg-[#800020] text-[#F5E6DA]' : 'border border-[#3D2B2B]'
                      }`}>
                        {isChecked && <Check className="w-3.5 h-3.5" />}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="p-3 bg-[#251818] rounded-xl border border-[#3D2B2B] text-xs text-[#A67C52]">
                📌 Total selecionado: <strong>{selectedModules.length} ferramentas</strong> na sua aba esquerda.
              </div>
            </div>
          )}

          {/* Footer buttons */}
          <div className="pt-4 border-t border-[#3D2B2B] flex items-center justify-between gap-3">
            {!isLoginMode && step === 2 ? (
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2.5 text-xs font-semibold text-[#D1BFA5] hover:text-[#F5E6DA] bg-[#2D1F1F] rounded-xl border border-[#3D2B2B] cursor-pointer"
              >
                Voltar
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-xs font-semibold text-[#D1BFA5] hover:text-[#F5E6DA] cursor-pointer"
              >
                Cancelar
              </button>
            )}

            <button
              type="submit"
              className="px-6 py-2.5 bg-[#800020] hover:bg-[#A00028] text-[#F5E6DA] font-bold text-xs sm:text-sm rounded-xl shadow-lg transition-colors flex items-center gap-1.5 cursor-pointer ml-auto"
            >
              <span>
                {isLoginMode
                  ? 'Entrar no Painel'
                  : step === 1
                    ? 'Continuar para Escolha de Módulos'
                    : 'Finalizar & Entrar na Minha Área'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
