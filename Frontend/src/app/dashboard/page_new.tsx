// src/app/dashboard/page.tsx

'use client';

import React, { useState, useEffect } from 'react';
import {
  Grid,
  CircularProgress,
  Typography,
  Box,
  Alert,
} from '@mui/material';
import AgentCard from '../../components/dashboard/AgentCard';
import { Agent } from '../../types';
import api from '../../services/api';

const DashboardPage: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        setLoading(true);
        setError('');
        
        const response = await api.get<Agent[]>('/agents');
        setAgents(response.data);
      } catch (err: any) {
        console.error('Erro ao buscar agentes:', err);
        setError('Erro ao carregar os agentes. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchAgents();
  }, []);

  // Mostra indicador de carregamento
  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
      </Box>
    );
  }

  // Mostra mensagem de erro
  if (error) {
    return (
      <Box sx={{ mt: 2 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  // Mostra mensagem se não há agentes
  if (agents.length === 0) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <Typography variant="h6" color="text.secondary">
          Nenhum agente disponível no momento.
        </Typography>
      </Box>
    );
  }

  // Renderiza a lista de agentes
  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        {agents.map((agent) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={agent.id}>
            <AgentCard agent={agent} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default DashboardPage;
