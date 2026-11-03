import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, Lock, Mail, ArrowLeft, AlertCircle } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('teste@focusmod.com');
  const [password, setPassword] = useState('123456');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleFillDemo = (demoEmail = 'teste@focusmod.com', demoPass = '123456') => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMsg('');
  };

  useEffect(() => {
    if (localStorage.getItem('token')) {
      navigate('/main');
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        throw new Error('A API não respondeu em JSON. Verifique se o backend está em execução na porta 8080.');
      }

      const data = await response.json();

      if (!response.ok) {
        setErrorMsg(data.message || 'Erro ao realizar login.');
        setIsLoading(false);
        return;
      }

      setSuccessMsg(data.message || 'Login concluído com sucesso!');
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      setTimeout(() => {
        navigate('/main');
      }, 500);
    } catch (e) {
      console.error('Erro ao fazer login:', e);
      setErrorMsg(e instanceof Error ? e.message : 'Erro ao fazer login. Por favor, tente novamente.');
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
          <h1 className="text-2xl font-bold text-slate-900">Entrar no FocusMod</h1>
          <p className="text-xs text-slate-500">Acesse seus modelos e sua rotina personalizada</p>
        </div>

        {/* Banner com credenciais padrão para acesso rápido temporário */}
        <div className="p-3 rounded-xl bg-[#e3edfa] border border-[#a3c5ed] text-xs text-[#124286] flex items-center justify-between gap-3 shadow-2xs">
          <div className="truncate">
            <span className="font-bold block">Acesso Rápido Padrão:</span>
            <span className="text-[11px] text-slate-600 block mt-0.5">
              Email: <strong className="text-slate-800 font-mono">teste@focusmod.com</strong>
              <br />
              Senha: <strong className="text-slate-800 font-mono">123456</strong>
            </span>
          </div>
          <button
            type="button"
            onClick={() => handleFillDemo('teste@focusmod.com', '123456')}
            className="px-2.5 py-1.5 text-[11px] font-semibold bg-[#1d56af] hover:bg-[#16438a] text-white rounded-lg transition-colors cursor-pointer shrink-0 shadow-2xs active:scale-95"
            title="Recarregar dados padrão"
          >
            Preencher
          </button>
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

        <form onSubmit={handleLogin} className="space-y-4">
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

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl bg-[#1d56af] hover:bg-[#16438a] disabled:opacity-50 text-white font-bold text-sm shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            <LogIn className="w-4 h-4" />
            <span>{isLoading ? 'Entrando...' : 'Entrar no Painel'}</span>
          </button>
        </form>

        <div className="pt-4 border-t border-[#d3dce6] text-center space-y-2">
          <p className="text-xs text-slate-600">
            Não tem uma conta?{' '}
            <Link to="/register" className="text-[#1d56af] hover:text-[#16438a] font-bold underline">
              Criar conta grátis
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
