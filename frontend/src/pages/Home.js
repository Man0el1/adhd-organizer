import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Intro } from '../components/Intro.js';
import { InteractiveSimulator } from '../components/InteractiveSimulator.js';
import { HowItWorks } from '../components/HowItWorks.js';
import { FaqSection } from '../components/FaqSection.js';
import { RegisterModal } from '../components/RegisterModal.js';

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
    navigate('/dashboard');
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
          onOpenRegister={() => handleOpenRegister()}
          onScrollToSimulator={scrollToSimulator}
          onEnterDashboard={() => navigate('/dashboard')}
        />

        <section id="simulador">
          <InteractiveSimulator onOpenRegisterWithModules={(mods) => handleOpenRegister(mods)} />
        </section>

        <HowItWorks />

        <FaqSection />

        <RegisterModal
          isOpen={isRegisterOpen}
          onClose={() => setIsRegisterOpen(false)}
          initialModules={selectedInitialModules}
          onCompleteRegistration={handleCompleteRegistration}
          isLoginMode={isLoginMode}
          onSwitchMode={(mode) => setIsLoginMode(mode)}
        />
      </main>
    </div>
  );
}
