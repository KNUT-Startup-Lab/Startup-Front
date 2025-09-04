import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthAPI, LoginReq, LoginRes } from '../api/auth';

type User = { user_id: string; email: string } | null;

type Ctx = {
  user: User;
  login: (cred: LoginReq) => Promise<void>;
  logout: () => Promise<void>;
  ready: boolean;
};

const AuthContext = createContext<Ctx>({
  user: null,
  login: async () => {},
  logout: async () => {},
  ready: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const user_id = await AsyncStorage.getItem('user_id');
      const email = await AsyncStorage.getItem('email');
      if (user_id && email) setUser({ user_id, email });
      setReady(true);
    })();
  }, []);

  async function login(cred: LoginReq) {
    const res: LoginRes = await AuthAPI.login(cred);
    await AsyncStorage.multiSet([
      ['accessToken', res.accessToken],
      ['refreshToken', res.refreshToken],
      ['user_id', res.user_id],
      ['email', res.email],
    ]);
    setUser({ user_id: res.user_id, email: res.email });
  }

  async function logout() {
    try {
      await AuthAPI.logout();
    } catch {}
    await AsyncStorage.multiRemove([
      'accessToken',
      'refreshToken',
      'email',
      'user_id',
    ]);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, ready }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);