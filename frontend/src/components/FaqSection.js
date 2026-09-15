import React, { useState } from 'react';
import { FAQ_ITEMS } from '../data/modulesData.js';
import { ChevronDown, HelpCircle } from 'lucide-react';

export function FaqSection() {
  const [openFaq, setOpenFaq] = useState(FAQ_ITEMS[0].id);

  const toggleFaq = (id) => {
    setOpenFaq(openFaq === id ? null : id);
  };

  return (
    <section id="faq" className="py-16 md:py-24 bg-[#1E1414] border-b border-[#3D2B2B]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-[#A67C52] bg-[#3D2B2B] px-3 py-1 rounded-md">
            Tire Suas Dúvidas
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#F5E6DA] mt-3">
            Perguntas Frequentes
          </h2>
          <p className="mt-3 text-base sm:text-lg text-[#D1BFA5]">
            Tudo o que você precisa saber sobre o sistema modular e personalizável do FocusMod.
          </p>
        </div>

        <div className="space-y-3">
          {FAQ_ITEMS.map((item) => {
            const isOpen = openFaq === item.id;
            return (
              <div
                key={item.id}
                className="bg-[#251818] rounded-2xl border border-[#3D2B2B] overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(item.id)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-[#2D1F1F] transition-colors"
                >
                  <span className="font-bold text-sm sm:text-base text-[#F5E6DA]">
                    {item.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-[#A67C52] transition-transform duration-200 shrink-0 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-[#D1BFA5] leading-relaxed border-t border-[#3D2B2B]/40">
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
