import React, { useState } from 'react';

export default function Page404() {

  return (
    <div>
      <main className="">
        <h1 className="text-4xl font-bold text-center mt-20">404 - Página não encontrada</h1>
        <p className="text-center mt-4">A página que você está procurando não existe.</p>
        <input type="button" value="Voltar para a página inicial" className="block mx-auto mt-6 px-4 py-2 bg-[#800020] text-[#F5E6DA] rounded hover:bg-[#A00030] cursor-pointer" onClick={() => window.location.href = '/'} />
      </main>
    </div>
  );
}
