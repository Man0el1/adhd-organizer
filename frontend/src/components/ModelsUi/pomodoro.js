import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

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
    <main class="w-full max-w-md px-6">

      <div class="flex items-center justify-between mb-10">
        <h1 class="text-xl font-semibold">Pomodoro</h1>

        <button class="p-2 rounded-lg hover:bg-[#3D2B2B] transition">
          ⚙
        </button>
      </div>

      <section class="text-center">

        <div class="mb-8">
          <p class="text-sm text-[#B9A6A0] mb-3">FOCUS</p>

          <span class="text-8xl font-semibold tracking-tight">
            25:00
          </span>
        </div>

        <div class="flex justify-center gap-3">

          <button
            class="px-8 py-3 rounded-xl bg-[#800020] hover:bg-[#99002b] transition font-medium"
          >
            Start
          </button>

          <button
            class="px-5 py-3 rounded-xl bg-[#2A1D1D] hover:bg-[#3D2B2B] transition"
          >
            Reset
          </button>

        </div>

      </section>

      <div class="flex justify-center gap-2 mt-10">

        <span class="w-2.5 h-2.5 rounded-full bg-[#800020]"></span>
        <span class="w-2.5 h-2.5 rounded-full bg-[#3D2B2B]"></span>
        <span class="w-2.5 h-2.5 rounded-full bg-[#3D2B2B]"></span>
        <span class="w-2.5 h-2.5 rounded-full bg-[#3D2B2B]"></span>

      </div>

      <div class="mt-10 p-4 rounded-xl bg-[#241919] border border-[#3D2B2B]">
        <p class="text-xs text-[#B9A6A0] mb-1">CURRENT TASK</p>
        <p class="font-medium">Estudar para a prova</p>
      </div>

    </main>
  );
}
