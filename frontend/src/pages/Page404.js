import React, { useState } from 'react';

export default function Page404() {

  return (
    <div className="min-h-[calc(100vh-10rem)] bg-[#ebf0f5] text-slate-800 flex items-center justify-center p-6">
      <main className="max-w-md w-full bg-[#f4f7fa] border border-[#d3dce6] rounded-2xl p-8 text-center shadow-md space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-[#e3edfa] border border-[#a3c5ed] text-[#1d56af] flex items-center justify-center font-bold text-2xl mx-auto shadow-xs">
          404
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Página não encontrada</h1>
        <p className="text-sm text-slate-600">A página que você está procurando não existe ou foi movida.</p>
        <button
          type="button"
          onClick={() => window.location.href = '/'}
          className="px-5 py-2.5 bg-[#1d56af] hover:bg-[#16438a] text-white rounded-xl font-semibold text-sm transition-colors cursor-pointer shadow-sm"
        >
          Voltar para a página inicial
        </button>
      </main>
    </div>
  );
}
