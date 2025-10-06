// src/components/auth/AuthGuard.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { CircularProgress, Box } from '@mui/material';
import { Role } from '../../types';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: Role;
  redirectTo?: string;
}

export default function AuthGuard({ 
  children, 
  requiredRole, 
  redirectTo = '/' 
}: AuthGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Se o carregamento terminou e não há usuário, redireciona para o login
    if (!loading && !user) {
      router.push(redirectTo);
      return;
    }

    // Se tem usuário mas não tem a role necessária, redireciona
    if (!loading && user && requiredRole) {
      const roleHierarchy: Record<Role, number> = {
        'USER': 1,
        'ADMIN': 2,
        'MASTER_ADMIN': 3,
      };

      const userLevel = roleHierarchy[user.role] || 0;
      const requiredLevel = roleHierarchy[requiredRole] || 0;

      if (userLevel < requiredLevel) {
        // Usuário não tem permissão suficiente, redireciona para dashboard
        router.push('/dashboard');
        return;
      }
    }
  }, [user, loading, router, requiredRole, redirectTo]);

  // Enquanto estiver carregando a informação do usuário, exibe um spinner
  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
        flexDirection="column"
        gap={2}
      >
        <CircularProgress size={40} />
        <Box sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
          Verificando autenticação...
        </Box>
      </Box>
    );
  }

  // Se não está logado, não renderiza nada (vai redirecionar)
  if (!user) {
    return null;
  }

  // Se tem role requerida e usuário não tem permissão, não renderiza
  if (requiredRole) {
    const roleHierarchy: Record<Role, number> = {
      'USER': 1,
      'ADMIN': 2,
      'MASTER_ADMIN': 3,
    };

    const userLevel = roleHierarchy[user.role] || 0;
    const requiredLevel = roleHierarchy[requiredRole] || 0;

    if (userLevel < requiredLevel) {
      return null;
    }
  }

  // Se o usuário estiver logado e tiver permissão, renderiza o conteúdo
  return <>{children}</>;
}
