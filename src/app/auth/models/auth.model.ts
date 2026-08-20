export type UserRole = 'USER' | 'ADMIN';

export interface User {
  id: number;
  username: string;
  email: string;
  rol: UserRole;
}

export interface LoginResponse {
  token: string;
  user: User;
}
