import { useState, useEffect } from 'react';
import Hero from './pages/Hero';
import Aprender from './pages/Aprender';
import MetodoStats from './pages/MetodoStats';
import Estudiante from './pages/Estudiante';
import Pricing from './pages/Pricing';
import CTA from './pages/CTA';
import Resultados from './pages/Resultados';

function App() {
  const [pagina, setPagina] = useState<'home' | 'resultados'>('home');
  const [flashButtonsKey, setFlashButtonsKey] = useState(0);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pagina]);

  const navegarA = (p: 'home' | 'resultados') => {
    setPagina(p);
  };

  if (pagina === 'resultados') {
    return <Resultados
      onVolver={() => navegarA('home')}
      onVerPricing={() => {
        setPagina('home');
        setFlashButtonsKey(k => k + 1);
        setTimeout(() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' }), 50);
      }}
    />;
  }

  return (
    <div className="min-h-screen hero-startup-bg startup-fixed-bg overflow-x-hidden">
      <Hero onVerResultados={() => navegarA('resultados')} />
      <Estudiante />
      <MetodoStats />
      <Aprender />
      <Pricing flashButtonsKey={flashButtonsKey} />
      <CTA onVerResultados={() => navegarA('resultados')} />
    </div>
  );
}

export default App;

