import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, ArrowRight, Lock, Mail, ArrowLeft } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem('token')) {
      navigate('/main');
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try{
      let response = await fetch('http://localhost:8080/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify({email, senha})
      });
      let data = await response.json();
      alert(data.message) // mudar de alert para algo customizado
      if (!response.ok) return;

      localStorage.setItem("token");
      navigate('/main');
    } catch (e) {
      console.error('Erro ao fazer login:', e);
      alert('Erro ao fazer login. Por favor, tente novamente.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center px-4 py-12 bg-[#1E1414] text-[#F5E6DA]">
      <div className="w-full max-w-md bg-[#251818] border border-[#3D2B2B] rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-[#800020] flex items-center justify-center text-[#F5E6DA] font-bold text-xl mx-auto shadow-md">
            F
          </div>
          <h1 className="text-2xl font-bold text-[#F5E6DA]">Entrar no FocusMod</h1>
          <p className="text-xs text-[#D1BFA5]">Acesse seus modelos e sua rotina personalizada</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#A67C52] uppercase tracking-wider mb-1.5" htmlFor="email">
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#A67C52]">
                <Mail className="w-4 h-4" />
              </div>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seuemail@exemplo.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#1E1414] border border-[#3D2B2B] focus:border-[#800020] text-sm text-[#F5E6DA] placeholder-[#A67C52]/50 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#A67C52] uppercase tracking-wider mb-1.5" htmlFor="password">
              Senha
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#A67C52]">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#1E1414] border border-[#3D2B2B] focus:border-[#800020] text-sm text-[#F5E6DA] placeholder-[#A67C52]/50 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <button type="submit" className="w-full py-3 px-4 rounded-xl bg-[#800020] hover:bg-[#A00028] text-[#F5E6DA] font-bold text-sm shadow-lg transition-colors flex items-center justify-center gap-2 cursor-pointer mt-2">
            <LogIn className="w-4 h-4" /> Entrar no Painel
          </button>
        </form>

        <div className="pt-4 border-t border-[#3D2B2B] text-center space-y-2">
          <p className="text-xs text-[#D1BFA5]">
            Não tem uma conta?{' '}
            <Link to="/register" className="text-[#A67C52] hover:text-[#F5E6DA] font-bold underline">
              Criar conta grátis
            </Link>
          </p>
          <div>
            <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-[#A67C52] hover:text-[#F5E6DA] transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" /> Voltar ao Início
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
