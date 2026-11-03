import React, { useRef, useEffect } from 'react';
import { ArrowRight, CheckCircle2, Brain, Clock, Calendar, Layers, Sparkles, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Intro() {

  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    },
    {
      threshold: 0.2,
    });

    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="relative pt-12 pb-16 md:pt-20 md:pb-24 overflow-hidden border-b border-[#d3dce6] bg-[#ebf0f5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-10 items-center">
          <div className="max-w-3xl text-center lg:text-left space-y-6 relative z-10">

            {/* Logo */}

            {/* Main */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-slate-900 leading-[1.15] tracking-tight">
              A organização que se <span className="text-[#1d56af] italic">molda</span> a você, sem sobrecarga.
            </h1>

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#e3edfa] border border-[#a3c5ed] text-[#124286] text-xs sm:text-sm font-bold uppercase tracking-wider shadow-xs">
              <Brain className="w-4 h-4 text-[#1d56af]"/> Sistema de Apoio para TDAH & Neurodiversidade
            </div>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
              Ao contrário de aplicativos rígidos cheios de opções desnecessárias, aqui você escolhe <strong>apenas o que funciona para o seu cérebro</strong>. Agenda visual estilo Tiimo, calendário com lembretes, temporizadores ou micro-passos — tudo fixado na sua aba esquerda.
            </p>

            {/* Main Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-3">
              <Link to="/register" id="hero-cta-register" className="w-full sm:w-auto px-7 py-3.5 text-base font-bold text-white bg-[#1d56af] hover:bg-[#16438a] rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2.5 cursor-pointer">
                Criar Minha Conta Grátis <ArrowRight className="w-5 h-5" />
              </Link>

              <Link to="/login" id="hero-cta-dashboard" className="w-full sm:w-auto px-6 py-3.5 text-base font-bold text-slate-800 bg-white hover:bg-[#f4f7fa] border border-[#d3dce6] rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs">
                <LogIn className="w-4 h-4 text-[#1d56af]" /> Entrar
              </Link>
            </div>

            <p className="text-xs text-slate-500 flex items-center justify-center lg:justify-start gap-2 pt-1 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#1d56af]" /> 100% gratuito para começar!
            </p>

          </div>

          {/* Video */}
          <div className="relative hidden lg:block h-[500px] overflow-hidden rounded-2xl border border-[#d3dce6] shadow-sm">
            <video ref={videoRef} muted loop playsInline preload="metadata" className="absolute inset-0 w-full h-full object-cover">
              <source src="/videos/intro.mp4" type="video/mp4" />
            </video>

            <div className="absolute inset-0 bg-gradient-to-r from-[#ebf0f5]/80 via-transparent to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#ebf0f5]/60 via-transparent to-transparent" />
          </div>

        </div>
        <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">

          <div className="bg-[#f4f7fa] p-5 rounded-2xl border border-[#d3dce6] shadow-xs hover:border-[#a3c5ed] transition-colors">
            <div className="w-10 h-10 rounded-xl bg-[#e3edfa] text-[#124286] flex items-center justify-center mb-3">
              <Layers className="w-5 h-5" />
            </div>
            <h2 className="font-bold text-base text-slate-900 mb-1">100% Modular</h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Ative só a agenda, só o calendário ou combine ambos na sua aba da esquerda.
            </p>
          </div>

          <div className="bg-[#f4f7fa] p-5 rounded-2xl border border-[#d3dce6] shadow-xs hover:border-[#a3c5ed] transition-colors">
            <div className="w-10 h-10 rounded-xl bg-[#e3edfa] text-[#124286] flex items-center justify-center mb-3">
              <Clock className="w-5 h-5" />
            </div>
            <h2 className="font-bold text-base text-slate-900 mb-1">Visual Estilo Tiimo</h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Barras de progresso visual que combatem a paralisia e a cegueira temporal.
            </p>
          </div>

          <div className="bg-[#f4f7fa] p-5 rounded-2xl border border-[#d3dce6] shadow-xs hover:border-[#a3c5ed] transition-colors">
            <div className="w-10 h-10 rounded-xl bg-[#e3edfa] text-[#124286] flex items-center justify-center mb-3">
              <Calendar className="w-5 h-5" />
            </div>
            <h2 className="font-bold text-base text-slate-900 mb-1">Lembretes Espaçados</h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Datas essenciais com alertas claros sem poluição visual ou notificações punitivas.
            </p>
          </div>

          <div className="bg-[#f4f7fa] p-5 rounded-2xl border border-[#d3dce6] shadow-xs hover:border-[#a3c5ed] transition-colors">
            <div className="w-10 h-10 rounded-xl bg-[#1d56af] text-white flex items-center justify-center mb-3">
              <Brain className="w-5 h-5" />
            </div>
            <h2 className="font-bold text-base text-slate-900 mb-1">Zero Sobrecarga</h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Paleta suave em tons neutros e azul que acalma o olhar e incentiva o foco.
            </p>
          </div>

        </div>

      </div>
    </section>
  );
}
