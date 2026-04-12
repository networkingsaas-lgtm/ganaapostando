import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import HeroSection from '../features/home/sections/HeroSection';
import AprenderSection from '../features/home/sections/AprenderSection';
import MetodoStatsSection from '../features/home/sections/MetodoStatsSection';
import EstudianteSection from '../features/home/sections/EstudianteSection';
import PricingSection from '../features/home/sections/PricingSection';
import CTASection from '../features/home/sections/CTASection';

interface Props {
  onVerResultados: () => void;
  onRegistrarse: () => void;
}

interface RouteState {
  scrollToPricing?: boolean;
}

export default function FormacionLandingPage({
  onVerResultados,
  onRegistrarse,
}: Props) {
  const location = useLocation();

  useEffect(() => {
    const state = location.state as RouteState | null;

    if (!state?.scrollToPricing) {
      return;
    }

    const scrollTimeout = window.setTimeout(() => {
      document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
    }, 50);

    return () => {
      window.clearTimeout(scrollTimeout);
    };
  }, [location]);

  return (
    <div
      className="min-h-screen hero-startup-bg startup-fixed-bg overflow-x-hidden"
      style={{ fontFamily: "'Sora', sans-serif" }}
    >
      <HeroSection onVerResultados={onVerResultados} />
      <EstudianteSection />
      <MetodoStatsSection onVerResultados={onVerResultados} />
      <AprenderSection />
      <PricingSection onRegistrarse={onRegistrarse} />
      <CTASection onVerResultados={onVerResultados} />
    </div>
  );
}
