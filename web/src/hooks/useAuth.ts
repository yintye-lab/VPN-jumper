import { useState, useEffect, useCallback } from 'react';
import { api, User } from '../services/api';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    const token = api.getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const profile = await api.getProfile();
      setUser(profile);
    } catch {
      api.setToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (username: string, password: string) => {
    const response = await api.login(username, password);
    api.setToken(response.access_token);
    setUser(response.user);
    return response;
  };

  const register = async (email: string, username: string, password: string) => {
    const response = await api.register(email, username, password);
    api.setToken(response.access_token);
    setUser(response.user);
    return response;
  };

  const logout = () => {
    api.setToken(null);
    setUser(null);
  };

  return { user, loading, login, register, logout };
}
