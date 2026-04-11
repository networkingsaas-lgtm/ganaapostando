import GrupoApuestasView from '../features/grupo-apuestas/components/GrupoApuestasView';
import { useGrupoApuestasLogic } from '../features/grupo-apuestas/hooks/useGrupoApuestasLogic';
import MetodoLoadingScreen from '../shared/components/MetodoLoadingScreen';

export default function GrupoApuestasPage() {
  const viewModel = useGrupoApuestasLogic();

  if (viewModel.isPageLoading) {
    return <MetodoLoadingScreen />;
  }

  return <GrupoApuestasView {...viewModel} />;
}
