'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType, LoginResponse } from '../../types';
import api from '../../services/api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Função para fazer login
  const login = async (username: string, password: string): Promise<void> => {
    try {
      console.log('Iniciando processo de login...');
      console.log('API Base URL:', process.env.NEXT_PUBLIC_API_URL);
      
      // Enviar dados como application/x-www-form-urlencoded (OAuth2PasswordRequestForm)
      const params = new URLSearchParams();
      params.append('username', username);
      params.append('password', password);
      
      console.log('URLSearchParams criado com username:', username);
      console.log('Fazendo requisição para /login...');
      
      const response = await api.post<LoginResponse>('/login', params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      
      console.log('Resposta do login recebida:', response.status, response.data);
      
      const { access_token: newToken, token_type } = response.data;
      console.log('Token recebido:', newToken ? 'Token válido' : 'Token inválido');
      
      // Buscar dados do usuário autenticado
      console.log('Buscando dados do usuário...');
      const userResponse = await api.get<User>('/users/me', {
        headers: {
          Authorization: `Bearer ${newToken}`,
        },
      });
      
      console.log('Dados do usuário recebidos:', userResponse.data);
      
      // Salva o token e usuário no localStorage
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(userResponse.data));
      
      // Atualiza o estado
      setToken(newToken);
      setUser(userResponse.data);
      
      console.log('Login concluído com sucesso!');
    } catch (error: any) {
      console.error('Erro detalhado no login:', error);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
        console.error('Response headers:', error.response.headers);
      } else if (error.request) {
        console.error('Request foi feito mas sem resposta:', error.request);
      } else {
        console.error('Erro ao configurar request:', error.message);
      }
      throw error;
    }
  };

  // Função para fazer logout
  const logout = (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  // Verifica se o usuário está logado ao inicializar
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
          setToken(storedToken);
          
          // Verifica se o token ainda é válido fazendo uma requisição para /users/me
          try {
            const response = await api.get<User>('/users/me');
            setUser(response.data);
          } catch (error) {
            // Se o token é inválido, limpa o localStorage
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setToken(null);
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Erro ao inicializar autenticação:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext deve ser usado dentro de um AuthProvider');
  }
  return context;
};
