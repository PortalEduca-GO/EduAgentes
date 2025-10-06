'use client';

import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import AIModelConfig from '@/components/admin/AIModelConfig';
import AuthGuard from '@/components/auth/AuthGuard';

export default function MasterAdminPage() {
  return (
    <AuthGuard requiredRole="MASTER_ADMIN">
      <Container maxWidth="lg">
        <Box py={4}>
          <Typography variant="h4" component="h1" gutterBottom>
            Painel Master Admin
          </Typography>
          
          <Typography variant="body1" color="text.secondary" paragraph>
            Configurações avançadas do sistema disponíveis apenas para Master Admins.
          </Typography>

          <AIModelConfig />
        </Box>
      </Container>
    </AuthGuard>
  );
}
