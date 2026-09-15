import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUp } from 'lucide-react';

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  return (
    <footer className="bg-[#180E0E] text-[#D1BFA5] border-t border-[#3D2B2B]">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 pt-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-12 border-b border-[#3D2B2B]">
          {/* Brand */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#800020] flex items-center justify-center text-[#F5E6DA] font-bold">
                F
              </div>
              <span className="font-bold text-lg text-[#F5E6DA] tracking-tight">Focus<span className="text-[#A67C52]">Mod</span></span>
            </div>
            <p className="text-xs text-[#D1BFA5] leading-relaxed">
              Sistema de apoio à produtividade e rotina adaptativa para pessoas com Transtorno do Déficit de Atenção e Hiperatividade (TDAH).
            </p>
            <div className="text-[11px] text-[#A67C52]">
              Desenvolvido com respeito aos ritmos neurodivergentes.
            </div>
            <button type="button" onClick={scrollToTop} className="flex p-3 items-center justify-center rounded-full bg-[#800020] text-[#F5E6DA] transition-colors hover:bg-[#A67C52] focus:outline-none focus:ring-2 focus:ring-[#F5E6DA]">
              <ArrowUp size={16} aria-hidden="true" /> Voltar ao topo
            </button>
          </div>

          {/* Nav */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#A67C52] mb-3">Navegação</h3>
            <ul className="space-y-2 text-xs">
              <li><Link to="/" className="hover:text-[#F5E6DA] transition-colors">Início</Link></li>
              <li><a href="/#simulador" className="hover:text-[#F5E6DA] transition-colors">Experimente os modelos!</a></li>
              <li><Link to="/modulos" className="hover:text-[#F5E6DA] transition-colors">Biblioteca de modelos</Link></li>
              <li><a href="/#como-funciona" className="hover:text-[#F5E6DA] transition-colors"> Como Funciona </a></li>
              <li><a href="/#faq" className="hover:text-[#F5E6DA] transition-colors">Perguntas Frequentes</a></li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#A67C52]/70 font-medium uppercase tracking-wider">
          <div>
            © {new Date().getFullYear()}.
          </div>
          <div className="flex gap-6">
            <span className="hover:text-[#F5E6DA] cursor-pointer">Privacidade</span>
            <span className="hover:text-[#F5E6DA] cursor-pointer">Termos de Uso</span>
            <span className="hover:text-[#F5E6DA] cursor-pointer">Suporte</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
