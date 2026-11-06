import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  X,
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  RotateCcw,
  Bot,
  User,
} from 'lucide-react';
import { apiFetch } from '../utils/api.js';

export default function AiTaskModal({
  isOpen,
  onClose,
  onTaskCreated,
  isDarkMode = false,
}) {
  const INITIAL_MESSAGES = [
    {
      id: 'welcome',
      role: 'assistant',
      text: 'Olá! Sou o assistente de tarefas com IA do FocusMod. Descreva em linguagem natural o que deseja agendar (por exemplo: "Adicione no calendário uma reunião amanhã às 14h") e eu estruturarei a tarefa para sua confirmação antes de salvar.',
    },
  ];

  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [isInterpreting, setIsInterpreting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [pendingConfirmation, setPendingConfirmation] = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => {
        inputRef.current?.focus();
        scrollToBottom();
      }, 150);
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [isOpen, messages]);

  // Tecla Escape para fechar
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleResetChat = () => {
    setMessages(INITIAL_MESSAGES);
    setInputText('');
    setPendingConfirmation(null);
  };

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    const cleanText = inputText.trim();
    if (!cleanText || isInterpreting) return;

    const userMessageId = `user-${Date.now()}`;
    const newUserMsg = {
      id: userMessageId,
      role: 'user',
      text: cleanText,
    };

    setMessages((prev) => [...prev, newUserMsg]);
    setInputText('');
    setIsInterpreting(true);

    try {
      const res = await apiFetch('/api/ai/interpret-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: cleanText }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || data.status === 'error') {
        throw new Error(data.message || 'Falha ao processar solicitação de IA.');
      }

      if (data.status === 'needs_info') {
        setMessages((prev) => [
          ...prev,
          {
            id: `assist-${Date.now()}`,
            role: 'assistant',
            text: data.message || 'Preciso de mais informações para criar a tarefa.',
            isClarification: true,
          },
        ]);
      } else if (data.status === 'ready_for_confirmation') {
        setPendingConfirmation(data);
        setMessages((prev) => [
          ...prev,
          {
            id: `assist-${Date.now()}`,
            role: 'assistant',
            text: 'Entendi o que você precisa! Confira os dados estruturados abaixo e confirme se posso adicionar ao seu painel:',
            confirmationData: data,
          },
        ]);
      }
    } catch (err) {
      console.error('Erro na conversa com IA:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `assist-${Date.now()}`,
          role: 'assistant',
          text: `Não foi possível interpretar a tarefa: ${err.message || 'Erro inesperado.'}`,
          isError: true,
        },
      ]);
    } finally {
      setIsInterpreting(false);
    }
  };

  const handleConfirmAndCreate = async (confirmationData) => {
    if (!confirmationData?.structuredTask || isSaving) return;

    setIsSaving(true);

    try {
      const payload = confirmationData.structuredTask;

      const res = await apiFetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Erro ao salvar tarefa no banco.');
      }

      const responseData = await res.json().catch(() => ({}));
      const createdTask = responseData.task || payload;

      // Dispara evento global para que os modelos na tela atualizem
      window.dispatchEvent(
        new CustomEvent('focusmod_task_created', {
          detail: { task: createdTask },
        })
      );

      if (onTaskCreated) {
        onTaskCreated(createdTask);
      }

      // Adiciona mensagem de sucesso
      setMessages((prev) => [
        ...prev,
        {
          id: `assist-${Date.now()}`,
          role: 'assistant',
          text: `Pronto! A tarefa "${payload.name}" foi criada e salva com sucesso no modelo "${confirmationData.targetModel.name}". Posso ajudar com mais alguma tarefa?`,
          isSuccess: true,
        },
      ]);

      setPendingConfirmation(null);
    } catch (err) {
      console.error('Erro ao salvar tarefa confirmada:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `assist-${Date.now()}`,
          role: 'assistant',
          text: `Erro ao salvar a tarefa no banco de dados: ${err.message}`,
          isError: true,
        },
      ]);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRejectConfirmation = () => {
    setPendingConfirmation(null);
    setMessages((prev) => [
      ...prev,
      {
        id: `assist-${Date.now()}`,
        role: 'assistant',
        text: 'Criação cancelada. Como gostaria de ajustar as informações?',
      },
    ]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Painel Lateral estilo Drawer */}
      <div
        className={`relative z-50 w-full sm:w-[440px] md:w-[480px] h-full border-l shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-200 transition-colors ${
          isDarkMode
            ? 'bg-slate-900 border-slate-800 text-slate-100'
            : 'bg-[#f4f7fa] border-[#d3dce6] text-slate-900'
        }`}
      >
        {/* Top Header */}
        <div
          className={`px-4 py-3 border-b flex items-center justify-between shrink-0 ${
            isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-[#e8edf2] border-[#d3dce6]'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-500 text-white flex items-center justify-center font-bold shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-sm sm:text-base font-bold leading-tight">
                  Assistente de Tarefas
                </h2>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full font-mono font-semibold bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                  IA
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Organização via linguagem natural
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleResetChat}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                isDarkMode
                  ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                  : 'text-slate-400 hover:text-slate-700 hover:bg-[#e8edf2]'
              }`}
              title="Reiniciar conversa"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onClose}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                isDarkMode
                  ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                  : 'text-slate-400 hover:text-slate-700 hover:bg-[#e8edf2]'
              }`}
              title="Fechar (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Chat Messages List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 min-h-0">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';

            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-600 to-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed transition-all ${
                    isUser
                      ? 'bg-[#1d56af] text-white rounded-br-xs shadow-xs'
                      : isDarkMode
                      ? 'bg-slate-800/90 text-slate-100 rounded-bl-xs border border-slate-700/80 shadow-xs'
                      : 'bg-white text-slate-800 rounded-bl-xs border border-[#d3dce6] shadow-2xs'
                  }`}
                >
                  {/* Texto da mensagem */}
                  <p className="whitespace-pre-wrap">{msg.text}</p>

                  {/* Card de Confirmação embutido no chat */}
                  {msg.confirmationData && (
                    <div
                      className={`mt-3 p-3 rounded-xl border text-xs space-y-2.5 animate-in fade-in duration-150 ${
                        isDarkMode
                          ? 'bg-slate-950/80 border-slate-700/80'
                          : 'bg-[#f8fafc] border-[#cbd5e1]'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold pb-1.5 border-b border-slate-200 dark:border-slate-800 text-indigo-600 dark:text-indigo-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Resumo estruturado da tarefa:</span>
                      </div>

                      <div className="space-y-1.5">
                        {msg.confirmationData.summaryFields?.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-start justify-between gap-2"
                          >
                            <span className="text-slate-400 font-medium text-[11px]">
                              {item.label}:
                            </span>
                            <span className="font-bold text-right break-words text-slate-800 dark:text-slate-200">
                              {item.value}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Botões de Ação na confirmação (só ativos se for a pendência atual) */}
                      {pendingConfirmation && (
                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                          <button
                            type="button"
                            onClick={handleRejectConfirmation}
                            disabled={isSaving}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                              isDarkMode
                                ? 'border-slate-700 text-slate-300 hover:bg-slate-800'
                                : 'border-[#d3dce6] text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            Não, ajustar
                          </button>

                          <button
                            type="button"
                            onClick={() => handleConfirmAndCreate(msg.confirmationData)}
                            disabled={isSaving}
                            className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                          >
                            {isSaving ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                <span>Salvando...</span>
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Sim, criar tarefa</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {msg.isClarification && (
                    <div className="mt-1.5 flex items-center gap-1 text-[11px] text-amber-500 font-medium">
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>Aguardando resposta...</span>
                    </div>
                  )}

                  {msg.isError && (
                    <div className="mt-1.5 flex items-center gap-1 text-[11px] text-rose-500 font-medium">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Tente reformular sua mensagem</span>
                    </div>
                  )}

                  {msg.isSuccess && (
                    <div className="mt-1.5 flex items-center gap-1 text-[11px] text-emerald-500 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Salvo no banco com sucesso</span>
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-7 h-7 rounded-lg bg-[#1d56af] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {/* Indicador de Digitação da IA */}
          {isInterpreting && (
            <div className="flex gap-2.5 justify-start items-center">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-600 to-blue-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                <Bot className="w-4 h-4" />
              </div>
              <div
                className={`rounded-2xl px-3.5 py-2 text-xs flex items-center gap-2 border ${
                  isDarkMode
                    ? 'bg-slate-800 text-slate-300 border-slate-700'
                    : 'bg-white text-slate-600 border-[#d3dce6]'
                }`}
              >
                <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-500" />
                <span>Interpretando tarefa com DeepSeek...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Form at Bottom */}
        <div
          className={`p-3 border-t shrink-0 ${
            isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-[#e8edf2] border-[#d3dce6]'
          }`}
        >
          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Descreva a tarefa que quer agendar..."
              disabled={isInterpreting}
              className={`flex-1 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm outline-none border transition-colors ${
                isDarkMode
                  ? 'bg-slate-900 border-slate-700 text-slate-100 placeholder:text-slate-500 focus:border-indigo-500'
                  : 'bg-white border-[#d3dce6] text-slate-800 placeholder:text-slate-400 focus:border-[#1d56af] shadow-2xs'
              }`}
            />

            <button
              type="submit"
              disabled={!inputText.trim() || isInterpreting}
              className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-500 hover:from-indigo-500 hover:via-blue-500 hover:to-cyan-400 text-white flex items-center justify-center shadow-xs transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              title="Enviar mensagem"
            >
              {isInterpreting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </form>

          <p className="text-[10px] text-slate-400 text-center mt-1.5">
            Dica: cite o modelo (ex: Calendário) e detalhes como data e horário.
          </p>
        </div>
      </div>
    </div>
  );
}
