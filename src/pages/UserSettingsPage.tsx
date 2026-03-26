import type { FC } from 'react';
import UserSettingsView from '../features/user-settings/components/UserSettingsView';
import { useUserSettingsLogic } from '../features/user-settings/hooks/useUserSettingsLogic';

interface Props {
  onOpenLogout?: () => void;
}

const UserSettingsPage: FC<Props> = ({ onOpenLogout }) => {
  const viewModel = useUserSettingsLogic();

  return <UserSettingsView onOpenLogout={onOpenLogout} {...viewModel} />;
};

export default UserSettingsPage;
