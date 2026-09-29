import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Lock, Mail, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';

export default function Register() {
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
        body: JSON.stringify({ email, password, confirmPassword })
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
    <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center px-4 py-12 bg-[#1E1414] text-[#F5E6DA]">
      <div className="w-full max-w-md bg-[#251818] border border-[#3D2B2B] rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-[#800020] flex items-center justify-center text-[#F5E6DA] font-bold text-xl mx-auto shadow-md">
            F
          </div>
          <h1 className="text-2xl font-bold text-[#F5E6DA]">Criar Conta no FocusMod</h1>
          <p className="text-xs text-[#D1BFA5]">Comece a organizar sua rotina sem sobrecarga mental</p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-950/60 border border-red-700/50 text-red-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-700/50 text-emerald-200 text-xs flex items-center gap-2">
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
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

          <div>
            <label className="block text-xs font-bold text-[#A67C52] uppercase tracking-wider mb-1.5" htmlFor="confirmPassword">
              Confirmar Senha
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#A67C52]">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#1E1414] border border-[#3D2B2B] focus:border-[#800020] text-sm text-[#F5E6DA] placeholder-[#A67C52]/50 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div className="text-xs text-[#A67C52] flex items-center gap-1.5 py-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#800020]" />
            <span>100% gratuito e respeitando seu ritmo</span>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl bg-[#800020] hover:bg-[#A00028] disabled:opacity-50 text-[#F5E6DA] font-bold text-sm shadow-lg transition-colors flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>{isLoading ? 'Criando conta...' : 'Criar Minha Conta'}</span>
          </button>
        </form>

        <div className="pt-4 border-t border-[#3D2B2B] text-center space-y-2">
          <p className="text-xs text-[#D1BFA5]">
            Já tem uma conta?{' '}
            <Link to="/login" className="text-[#A67C52] hover:text-[#F5E6DA] font-bold underline">
              Entrar
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
