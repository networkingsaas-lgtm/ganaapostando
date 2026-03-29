export type { RegisterPayload, RegisterResponse } from './authService';
export {
  loginWithEmailPassword as loginWithSupabase,
  registerUser as registerWithBackend,
} from './authService';
export { signOutFromSession as logoutFromSupabase } from './sessionService';
