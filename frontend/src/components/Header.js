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
    <header className="sticky top-0 z-40 bg-[#1E1414]/95 backdrop-blur-xs border-b border-[#3D2B2B]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">

          {/* Left Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium margin text-[#D1BFA5]">
            <Link to="/" onClick={scrollToTop} className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-[#800020] rounded-lg p-1">
              <div className="w-10 h-10 rounded-xl bg-[#800020] flex items-center justify-center text-[#F5E6DA] font-bold text-lg shadow-md group-hover:scale-105 transition-transform">F</div>
              <span className="font-bold text-xl text-[#F5E6DA] tracking-tight">Focus<span className="text-[#A67C52]">Mod</span></span>
            </Link>

            <a href="/#simulador" className="flex items-center gap-1.5 text-[#A67C52] hover:text-[#F5E6DA] transition-colors py-1 font-semibold cursor-pointer">
              <Sliders className="w-4 h-4" /> Experimente os modelos!
            </a>

            <a href="/module-list" className="hover:text-[#F5E6DA] transition-colors py-1"> Modelos Disponíveis </a>
            <a href="/#como-funciona" className="hover:text-[#F5E6DA] transition-colors py-1"> Como Funciona </a>
            <a href="/#faq" className="hover:text-[#F5E6DA] transition-colors py-1"> Dúvidas </a>
          </nav>

          {/* Right links */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/dashboard" id="header-login-btn" className="px-3.5 py-2 text-xs font-semibold text-[#D1BFA5] hover:text-[#F5E6DA] hover:bg-[#2D1F1F] rounded-xl transition-colors cursor-pointer flex items-center gap-1.5">
              <LogIn className="w-3.5 h-3.5 text-[#A67C52]" /> Entrar
            </Link>

            <Link to="/simulador" id="header-register-btn" className="px-4 py-2.5 text-xs sm:text-sm font-bold text-[#F5E6DA] bg-[#800020] hover:bg-[#A00028] rounded-xl shadow-lg transition-colors cursor-pointer flex items-center gap-2">
              <UserPlus className="w-4 h-4" /> Criar Conta Grátis
            </Link>
          </div>

          {/* Mobile */}
          <div className="w-full flex md:hidden items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Link to="/" className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-[#800020] rounded-lg p-1">
                <div className="w-10 h-10 rounded-xl bg-[#800020] flex items-center justify-center text-[#F5E6DA] font-bold text-lg shadow-md group-hover:scale-105 transition-transform">F</div>
                <span className="font-bold text-xl text-[#F5E6DA] tracking-tight">Focus<span className="text-[#A67C52]">Mod</span></span>
              </Link>
            </div>

            <div className="flex items-center justify-center">
              <button type="button" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-[#D1BFA5] hover:text-[#F5E6DA] hover:bg-[#2D1F1F] rounded-lg transition-colors" aria-label="Abrir menu">
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#3D2B2B] bg-[#1E1414] px-4 pt-3 pb-6 space-y-3">
          <nav className="flex flex-col space-y-2 text-base font-medium text-[#D1BFA5]">
            <a href="/#faq" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 text-left px-3 py-2 rounded-lg hover:bg-[#2D1F1F] text-[#A67C52] font-semibold">
              <Sliders className="w-4 h-4" /> Simulador da Barra Lateral
            </a>
            <Link to="/modulos" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-[#2D1F1F] hover:text-[#F5E6DA]">
              Modelos Disponíveis
            </Link>
            <a href="/#como-funciona" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-[#2D1F1F] hover:text-[#F5E6DA]">
              Como Funciona
            </a>
            <a href="/#faq" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-[#2D1F1F] hover:text-[#F5E6DA]">
              Dúvidas
            </a>
          </nav>
          <div className="pt-3 border-t border-[#3D2B2B] flex flex-col gap-2">
            <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="w-full py-2.5 text-center font-bold text-[#F5E6DA] bg-[#2D1F1F] border border-[#A67C52] rounded-xl flex items-center justify-center gap-2 cursor-pointer">
              <Sparkles className="w-4 h-4 text-[#A67C52]" />Entrar
            </Link>
            <Link to="/simulador" onClick={() => setMobileMenuOpen(false)} className="w-full py-2.5 text-center font-bold text-[#F5E6DA] bg-[#800020] rounded-xl cursor-pointer shadow-lg">
              Criar Conta Grátis
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
