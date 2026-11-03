import React from 'react';
import { HOW_IT_WORKS_STEPS } from '../../data/modulesData.js';
import { Check, SlidersHorizontal, PanelLeft, Smile } from 'lucide-react';

export function HowItWorks() {
  const getStepIcon = (index) => {
    switch (index) {
      case 0: return <SlidersHorizontal className="w-6 h-6 text-[#1d56af]" />;
      case 1: return <PanelLeft className="w-6 h-6 text-[#1d56af]" />;
      case 2: return <Smile className="w-6 h-6 text-[#1d56af]" />;
      default: return <Check className="w-6 h-6 text-[#1d56af]" />;
    }
  };

  return (
    <section id="como-funciona" className="py-16 md:py-24 bg-[#f4f7fa] border-b border-[#d3dce6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="max-w-3xl mx-auto text-center mb-14">
          <span className="text-xs font-bold uppercase tracking-widest text-[#124286] bg-[#e3edfa] border border-[#a3c5ed] px-3 py-1 rounded-md">
            Passo a Passo Simplificado
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mt-3">
            Como o FocusMod funciona na prática
          </h2>
          <p className="mt-3 text-base sm:text-lg text-slate-600">
            Sem manuais longos e sem configurações frustrantes. Em 3 passos você tem um ambiente acolhedor.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {HOW_IT_WORKS_STEPS.map((step, idx) => (
            <div
              key={step.step}
              className="bg-white rounded-2xl p-7 border border-[#d3dce6] shadow-xs relative flex flex-col justify-between hover:border-[#a3c5ed] transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="w-12 h-12 rounded-xl bg-[#e3edfa] border border-[#a3c5ed] flex items-center justify-center">
                    {getStepIcon(idx)}
                  </span>
                  <span className="text-3xl font-bold font-mono text-[#1d56af]/30">
                    {step.step}
                  </span>
                </div>

                <div className="inline-block text-[10px] font-bold text-[#124286] uppercase tracking-wider bg-[#e3edfa] border border-[#a3c5ed] px-2.5 py-0.5 rounded-md mb-2">
                  {step.tag}
                </div>

                <h3 className="text-xl font-bold text-slate-900 mb-2.5">
                  {step.title}
                </h3>

                <p className="text-sm text-slate-600 leading-relaxed">
                  {step.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-[#d3dce6] text-xs text-[#124286] flex items-center gap-1.5 font-medium">
                <Check className="w-4 h-4 text-[#1d56af]" />
                <span>Zero complicação cognitiva</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
