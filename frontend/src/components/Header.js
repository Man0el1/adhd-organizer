import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, UserPlus, LogIn, Sliders, ExternalLink, Sparkles, Layers } from 'lucide-react';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const scrollToTop = () => {
    const HomePageOpen = window.location.pathname === '/';
    if (HomePageOpen) window.scrollTo({ top: 0, behavior: 'auto' });
  };

  return (
    <header className="sticky top-0 z-40 bg-[#f4f7fa]/95 backdrop-blur-xs border-b border-[#d3dce6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">

          {/* Left Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <Link to="/" onClick={scrollToTop} className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-[#1d56af] rounded-lg p-1">
              <div className="w-10 h-10 rounded-xl bg-[#1d56af] flex items-center justify-center text-white font-bold text-lg shadow-sm group-hover:scale-105 transition-transform">F</div>
              <span className="font-bold text-xl text-slate-900 tracking-tight">Focus<span className="text-[#1d56af]">Mod</span></span>
            </Link>

            <a href="/#simulador" className="flex items-center gap-1.5 text-[#124286] hover:text-[#16438a] transition-colors py-1 font-semibold cursor-pointer">
              <Sliders className="w-4 h-4" /> Experimente os modelos!
            </a>

            <a href="/module-list" className="hover:text-slate-900 transition-colors py-1"> Modelos Disponíveis </a>
            <a href="/#como-funciona" className="hover:text-slate-900 transition-colors py-1"> Como Funciona </a>
            <a href="/#faq" className="hover:text-slate-900 transition-colors py-1"> Dúvidas </a>
          </nav>

          {/* Right links */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/login" id="header-login-btn" className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-[#e8edf2] rounded-xl transition-colors cursor-pointer flex items-center gap-1.5">
              <LogIn className="w-3.5 h-3.5 text-[#1d56af]" /> Entrar
            </Link>

            <Link to="/register" id="header-register-btn" className="px-4 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#1d56af] hover:bg-[#16438a] rounded-xl shadow-sm transition-colors cursor-pointer flex items-center gap-2">
              <UserPlus className="w-4 h-4" /> Criar Conta Grátis
            </Link>
          </div>

          {/* Mobile */}
          <div className="w-full flex md:hidden items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Link to="/" className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-[#1d56af] rounded-lg p-1">
                <div className="w-10 h-10 rounded-xl bg-[#1d56af] flex items-center justify-center text-white font-bold text-lg shadow-sm group-hover:scale-105 transition-transform">F</div>
                <span className="font-bold text-xl text-slate-900 tracking-tight">Focus<span className="text-[#1d56af]">Mod</span></span>
              </Link>
            </div>

            <div className="flex items-center justify-center">
              <button type="button" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-slate-600 hover:text-slate-900 hover:bg-[#e8edf2] rounded-lg transition-colors" aria-label="Abrir menu">
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#d3dce6] bg-[#f4f7fa] px-4 pt-3 pb-6 space-y-3">
          <nav className="flex flex-col space-y-2 text-base font-medium text-slate-600">
            <a href="/#simulador" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 text-left px-3 py-2 rounded-lg hover:bg-[#e8edf2] text-[#124286] font-semibold">
              <Sliders className="w-4 h-4" /> Simulador da Barra Lateral
            </a>
            <Link to="/module-list" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-[#e8edf2] hover:text-slate-900">
              Modelos Disponíveis
            </Link>
            <a href="/#como-funciona" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-[#e8edf2] hover:text-slate-900">
              Como Funciona
            </a>
            <a href="/#faq" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-[#e8edf2] hover:text-slate-900">
              Dúvidas
            </a>
          </nav>
          <div className="pt-3 border-t border-[#d3dce6] flex flex-col gap-2">
            <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="w-full py-2.5 text-center font-bold text-slate-800 bg-white border border-[#d3dce6] rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-xs">
              <Sparkles className="w-4 h-4 text-[#1d56af]" />Entrar
            </Link>
            <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="w-full py-2.5 text-center font-bold text-white bg-[#1d56af] hover:bg-[#16438a] rounded-xl cursor-pointer shadow-sm">
              Criar Conta Grátis
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
