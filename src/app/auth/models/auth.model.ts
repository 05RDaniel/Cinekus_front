export type UserRole = 'USER' | 'ADMIN';

export interface User {
  id: number;
  username: string;
  first_name?: string | null;
  last_name?: string | null;
  email: string;
  rol: UserRole;
}

export interface LoginResponse {
  token: string;
  user: User;
}
