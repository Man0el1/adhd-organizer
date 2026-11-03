import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, CalendarDays, Hourglass, Brain, ArrowRight } from 'lucide-react';

const MODULES = [
  {
    type: 'routine',
    name: 'Agenda Visual',
    subtitle: 'Linha do tempo e horários',
    icon: Clock,
    color: 'text-[#1d56af] bg-[#e3edfa] border-[#a3c5ed]',
    desc: 'Organize seu dia em blocos cronológicos de tempo com início e término para acompanhar suas atividades com clareza.',
    badge: 'Rotina Diária'
  },
  {
    type: 'calendario',
    name: 'Calendário',
    subtitle: 'Visão mensal e prazos',
    icon: CalendarDays,
    color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
    desc: 'Acompanhe seus compromissos, tarefas com data marcada e prazos distribuídos ao longo das semanas.',
    badge: 'Datas e Prazos'
  },
  {
    type: 'pomodoro',
    name: 'Pomodoro',
    subtitle: 'Temporizador de foco',
    icon: Hourglass,
    color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    desc: 'Sessões de foco de 25 minutos intercaladas com pausas curtas para manter o ritmo e a concentração sem sobrecarga.',
    badge: 'Hiperfoco'
  },
  {
    type: 'brain-dump',
    name: 'Brain Dump',
    subtitle: 'Descarga mental rápida',
    icon: Brain,
    color: 'text-amber-600 bg-amber-50 border-amber-200',
    desc: 'Captura rápida para despejar pensamentos, tarefas soltas e ideias imediatas sem burocracia.',
    badge: 'Alívio Mental'
  }
];

export default function ModuleList() {
  return (
    <div className="min-h-[calc(100vh-10rem)] bg-[#ebf0f5] text-slate-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="text-center space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-[#124286] bg-[#e3edfa] border border-[#a3c5ed] px-3 py-1 rounded-md">
            Modelos de Produtividade
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">
            Biblioteca de Modelos do FocusMod
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
            Escolha as ferramentas que melhor se adaptam à forma como o seu cérebro processa o tempo e as prioridades.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {MODULES.map((mod) => {
            const Icon = mod.icon;
            return (
              <div
                key={mod.type}
                className="bg-[#f4f7fa] border border-[#d3dce6] rounded-2xl p-6 shadow-sm hover:border-[#a3c5ed] transition-all flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 rounded-xl border flex items-center justify-center ${mod.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-[#e3edfa] text-[#124286] border border-[#a3c5ed]">
                      {mod.badge}
                    </span>
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-slate-900">{mod.name}</h2>
                    <p className="text-xs text-slate-500 font-medium">{mod.subtitle}</p>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {mod.desc}
                  </p>
                </div>

                <div className="pt-6 mt-4 border-t border-[#d3dce6] flex items-center justify-between">
                  <Link
                    to="/register"
                    className="text-xs font-bold text-[#1d56af] hover:text-[#16438a] flex items-center gap-1"
                  >
                    Ativar no seu painel <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
