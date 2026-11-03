import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Lock, Mail, ArrowLeft, CheckCircle2, AlertCircle, User } from 'lucide-react';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (password && password !== confirmPassword) {
      setErrorMsg('As senhas não coincidem.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, confirmPassword })
      });
      const data = await response.json();

      if (!response.ok) {
        setErrorMsg(data.message || 'Erro ao registrar conta.');
        setIsLoading(false);
        return;
      }

      setSuccessMsg(data.message || 'Conta criada com sucesso!');
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      setTimeout(() => {
        navigate('/main');
      }, 500);
    } catch (e) {
      console.error('Erro ao registrar:', e);
      setErrorMsg('Erro ao registrar conta. Por favor, tente novamente.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center px-4 py-12 bg-[#ebf0f5] text-slate-800">
      <div className="w-full max-w-md bg-[#f4f7fa] border border-[#d3dce6] rounded-2xl p-6 sm:p-8 shadow-md space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-[#1d56af] flex items-center justify-center text-white font-bold text-xl mx-auto shadow-sm">
            F
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Criar Conta no FocusMod</h1>
          <p className="text-xs text-slate-500">Comece a organizar sua rotina sem sobrecarga mental</p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#124286] uppercase tracking-wider mb-1.5" htmlFor="username">
              Nome de Usuário
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                id="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="ex: joaosilva"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#d3dce6] focus:border-[#1d56af] focus:ring-2 focus:ring-[#1d56af]/20 text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition-all shadow-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#124286] uppercase tracking-wider mb-1.5" htmlFor="email">
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seuemail@exemplo.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#d3dce6] focus:border-[#1d56af] focus:ring-2 focus:ring-[#1d56af]/20 text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition-all shadow-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#124286] uppercase tracking-wider mb-1.5" htmlFor="password">
              Senha
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#d3dce6] focus:border-[#1d56af] focus:ring-2 focus:ring-[#1d56af]/20 text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition-all shadow-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#124286] uppercase tracking-wider mb-1.5" htmlFor="confirmPassword">
              Confirmar Senha
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#d3dce6] focus:border-[#1d56af] focus:ring-2 focus:ring-[#1d56af]/20 text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition-all shadow-xs"
              />
            </div>
          </div>

          <div className="text-xs text-[#124286] flex items-center gap-1.5 py-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#1d56af]" />
            <span>100% gratuito e respeitando seu ritmo</span>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl bg-[#1d56af] hover:bg-[#16438a] disabled:opacity-50 text-white font-bold text-sm shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>{isLoading ? 'Criando conta...' : 'Criar Minha Conta'}</span>
          </button>
        </form>

        <div className="pt-4 border-t border-[#d3dce6] text-center space-y-2">
          <p className="text-xs text-slate-600">
            Já tem uma conta?{' '}
            <Link to="/login" className="text-[#1d56af] hover:text-[#16438a] font-bold underline">
              Entrar
            </Link>
          </p>
          <div>
            <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-[#1d56af] transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" /> Voltar ao Início
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
