import GrupoApuestasView from '../features/grupo-apuestas/components/GrupoApuestasView';
import { useGrupoApuestasLogic } from '../features/grupo-apuestas/hooks/useGrupoApuestasLogic';

export default function GrupoApuestasPage() {
  const viewModel = useGrupoApuestasLogic();

  return <GrupoApuestasView {...viewModel} />;
}
