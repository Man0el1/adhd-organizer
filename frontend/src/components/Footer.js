import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUp } from 'lucide-react';

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  return (
    <footer className="bg-[#eef3f7] text-slate-600 border-t border-[#d3dce6]">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 pt-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-12 border-b border-[#d3dce6]">
          {/* Brand */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#1d56af] flex items-center justify-center text-white font-bold">
                F
              </div>
              <span className="font-bold text-lg text-slate-900 tracking-tight">Focus<span className="text-[#1d56af]">Mod</span></span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Sistema de apoio à produtividade e rotina adaptativa para pessoas com Transtorno do Déficit de Atenção e Hiperatividade (TDAH).
            </p>
            <div className="text-[11px] text-[#124286] font-medium">
              Desenvolvido com respeito aos ritmos neurodivergentes.
            </div>
            <button type="button" onClick={scrollToTop} className="inline-flex gap-2 p-2.5 px-4 items-center justify-center rounded-xl bg-[#1d56af] text-white text-xs font-semibold transition-colors hover:bg-[#16438a] focus:outline-none focus:ring-2 focus:ring-[#1d56af]/40 cursor-pointer shadow-xs">
              <ArrowUp size={15} aria-hidden="true" /> Voltar ao topo
            </button>
          </div>

          {/* Nav */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#124286] mb-3">Navegação</h3>
            <ul className="space-y-2 text-xs">
              <li><Link to="/" className="hover:text-[#1d56af] transition-colors">Início</Link></li>
              <li><a href="/#simulador" className="hover:text-[#1d56af] transition-colors">Experimente os modelos!</a></li>
              <li><Link to="/module-list" className="hover:text-[#1d56af] transition-colors">Biblioteca de modelos</Link></li>
              <li><a href="/#como-funciona" className="hover:text-[#1d56af] transition-colors"> Como Funciona </a></li>
              <li><a href="/#faq" className="hover:text-[#1d56af] transition-colors">Perguntas Frequentes</a></li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500 font-medium uppercase tracking-wider">
          <div>
            © {new Date().getFullYear()} FocusMod.
          </div>
          <div className="flex gap-6">
            <span className="hover:text-[#1d56af] cursor-pointer">Privacidade</span>
            <span className="hover:text-[#1d56af] cursor-pointer">Termos de Uso</span>
            <span className="hover:text-[#1d56af] cursor-pointer">Suporte</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
