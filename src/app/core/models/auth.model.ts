export type UserRole = 'USER' | 'ADMIN';

export interface User {
  id: number;
  nombre: string;
  email: string;
  rol: UserRole;
}

export interface LoginResponse {
  token: string;
  user: User;
}
