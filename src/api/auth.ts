import { api } from './client';

export type LoginReq = { email: string; password: string };
export type LoginRes = {
  user_id: string;
  email: string;
  accessToken: string;
  refreshToken: string;
  message: string;
};

export type SignupReq = {
  email: string;
  password: string;
  name: string;
  phone: string;
  student_num: string;
};

export const AuthAPI = {
  signup: (body: SignupReq) =>
    api<{ message: string }>('/api/users', { method: 'POST', body }),

  login: (body: LoginReq) =>
    api<LoginRes>('/api/auth/login', { method: 'POST', body }),

  logout: () =>
    api<{ message: string }>('/api/auth/logout', { method: 'POST', auth: true }),

  findEmail: (body: { name: string; phone: string }) =>
    api<{ email: string; message: string }>('/api/users/find-email', {
      method: 'POST',
      body,
    }),

  findPassword: (body: { email: string; phone: string }) =>
    api<{ message: string }>('/api/users/find-password', {
      method: 'POST',
      body,
    }),

  changePassword: (body: { current_password: string; new_password: string }) =>
    api<{ message: string }>('/api/users/password', {
      method: 'PUT',
      body,
      auth: true,
    }),

  checkEmail: (email: string) =>
    api<{ available: boolean; message: string }>('/api/users/check-email', {
      method: 'GET',
      query: { email },
    }),

  verifyPhone: (body: { phone: string; verification_code: string }) =>
    api<{ verified: boolean; message: string }>('/api/auth/verify-phone', {
      method: 'POST',
      body,
    }),
};