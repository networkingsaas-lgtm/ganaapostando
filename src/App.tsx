import { useState, useEffect } from 'react';
import Hero from './page/Hero';
import Method from './page/Method';
import Pricing from './page/Pricing';
import CTA from './page/CTA';
import Resultados from './page/Resultados';

function App() {
  const [pagina, setPagina] = useState<'home' | 'resultados'>('home');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pagina]);

  const navegarA = (p: 'home' | 'resultados') => {
    setPagina(p);
  };

  if (pagina === 'resultados') {
    return <Resultados
      onVolver={() => navegarA('home')}
      onVerPricing={() => { setPagina('home'); setTimeout(() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' }), 50); }}
    />;
  }

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <Hero onVerResultados={() => navegarA('resultados')} />
      <Method />
      <Pricing />
      <CTA onVerResultados={() => navegarA('resultados')} />
    </div>
  );
}

export default App;

