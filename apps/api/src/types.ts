import type { Session } from './auth.js';

export interface AppVariables {
  requestId: string;
  user: Session['user'];
  session: Session['session'];
}

export interface AppEnv {
  Variables: AppVariables;
}
