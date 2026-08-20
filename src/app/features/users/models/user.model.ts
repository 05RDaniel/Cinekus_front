export interface AdminUser {
  id: number;
  username: string;
  email: string;
  rol: string;
}

export interface CreateUserPayload {
  username: string;
  email: string;
  password: string;
  rol: 'ADMIN' | 'USER';
}

export interface UpdateUserPayload {
  username?: string;
  email?: string;
  password?: string;
  rol?: 'ADMIN' | 'USER';
}
