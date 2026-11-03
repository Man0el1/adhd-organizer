import React, { useState } from 'react';
import { FAQ_ITEMS } from '../../data/modulesData.js';
import { ChevronDown, HelpCircle } from 'lucide-react';

export function FaqSection() {
  const [openFaq, setOpenFaq] = useState(FAQ_ITEMS[0].id);

  const toggleFaq = (id) => {
    setOpenFaq(openFaq === id ? null : id);
  };

  return (
    <section id="faq" className="py-16 md:py-24 bg-[#ebf0f5] border-b border-[#d3dce6]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-[#124286] bg-[#e3edfa] border border-[#a3c5ed] px-3 py-1 rounded-md">
            Tire Suas Dúvidas
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mt-3">
            Perguntas Frequentes
          </h2>
          <p className="mt-3 text-base sm:text-lg text-slate-600">
            Tudo o que você precisa saber sobre o sistema modular e personalizável do FocusMod.
          </p>
        </div>

        <div className="space-y-3">
          {FAQ_ITEMS.map((item) => {
            const isOpen = openFaq === item.id;
            return (
              <div
                key={item.id}
                className="bg-[#f4f7fa] rounded-2xl border border-[#d3dce6] overflow-hidden transition-colors shadow-xs"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(item.id)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-[#e8edf2] transition-colors"
                >
                  <span className="font-bold text-sm sm:text-base text-slate-900">
                    {item.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-[#1d56af] transition-transform duration-200 shrink-0 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-[#d3dce6]">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
