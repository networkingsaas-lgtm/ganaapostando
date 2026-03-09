import { useState, useEffect } from 'react';
import Hero from './page/Hero';
import Aprender from './page/Aprender';
import MetodoStats from './page/MetodoStats';
import Estudiante from './page/Estudiante';
import Pricing from './page/Pricing';
import CTA from './page/CTA';
import Resultados from './page/Resultados';

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
      <Aprender />
      <MetodoStats />
      <Estudiante />
      <Pricing flashButtonsKey={flashButtonsKey} />
      <CTA onVerResultados={() => navegarA('resultados')} />
    </div>
  );
}

export default App;

