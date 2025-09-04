// src/api/client.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../config';

type Method = 'GET'|'POST'|'PUT'|'DELETE';
export async function api<T>(
  path: string,
  options: { method?: Method; body?: any; auth?: boolean; query?: Record<string, string> } = {}
): Promise<T> {
  const method = options.method ?? 'GET';
  const qs = options.query ? '?' + new URLSearchParams(options.query).toString() : '';
  const headers: Record<string,string> = { 'Content-Type': 'application/json' };

  if (options.auth) {
    const token = await AsyncStorage.getItem('accessToken');
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}${qs}`, {
    method,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : {};
  if (!res.ok) {
    const msg = data?.message || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return data as T;
}