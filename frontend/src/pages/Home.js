import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Intro } from '../components/Home/Intro.js';
import { InteractiveSimulator } from '../components/Home/InteractiveSimulator.js';
import { HowItWorks } from '../components/Home/HowItWorks.js';
import { FaqSection } from '../components/Home/FaqSection.js';

export default function Home() {
  const navigate = useNavigate();
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(false);
  const [selectedInitialModules, setSelectedInitialModules] = useState([
    'agenda-visual',
    'calendario-lembretes'
  ]);

  const handleOpenRegister = (modules = ['agenda-visual', 'calendario-lembretes']) => {
    setSelectedInitialModules(modules);
    setIsLoginMode(false);
    setIsRegisterOpen(true);
  };

  const handleCompleteRegistration = () => {
    setIsRegisterOpen(false);
    navigate('/main');
  };

  const scrollToSimulator = () => {
    const el = document.getElementById('simulador');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div>
      <main className="min-h-screen bg-[#1E1414] text-[#F5E6DA] selection:bg-[#800020] selection:text-[#F5E6DA] font-sans antialiased">
        <Intro
          onScrollToSimulator={scrollToSimulator}
        />

        <section id="simulador">
          <InteractiveSimulator onOpenRegisterWithModules={(mods) => handleOpenRegister(mods)} />
        </section>

        <HowItWorks />

        <FaqSection />
      </main>
    </div>
  );
}
