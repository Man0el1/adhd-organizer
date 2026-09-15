import React, { useState, useEffect} from 'react';
import {Plus} from 'lucide-react';


export default function Register() {
  const [email, setEmail] = useState()

  const handleAddModule = async(e) => {
    e.preventDefault();
  }

  return (
    <div className="min-h-screen">
      <header className="fixed top-0 left-0 right-0 z-50 h-16 border-b bg-white">
        <div className="flex h-full items-center px-6">
          <h1 className="text-xl font-bold">Meu Website</h1>
        </div>
      </header>

      <div className="flex pt-16">

        <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-56 border-r bg-gray-50">
          <nav className="flex flex-col gap-2 p-4">
            <button onClick={handleAddModule} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              <Plus className="w-4 h-4" /> Criar Novo
            </button>
            <a href="#inicio">Início</a>
            <a href="#sobre">Sobre</a>
            <a href="#projetos">Projetos</a>
            <a href="#contato">Contato</a>
          </nav>
        </aside>

        {/* Conteúdo */}
        <main className="ml-56 w-full">
          <section id="inicio" className="min-h-screen p-10">
            <h2>Início</h2>
          </section>

          <section id="sobre" className="min-h-screen p-10">
            <h2>Sobre</h2>
          </section>

          <section id="projetos" className="min-h-screen p-10">
            <h2>Projetos</h2>
          </section>

          <section id="contato" className="min-h-screen p-10">
            <h2>Contato</h2>
          </section>
        </main>

      </div>
    </div>
  );
}
