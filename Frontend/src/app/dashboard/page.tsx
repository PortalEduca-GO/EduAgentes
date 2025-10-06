// src/app/dashboard/page.tsx

'use client';

import React, { useState, useEffect } from 'react';
import {
  CircularProgress,
  Typography,
  Box,
  Alert,
  Container,
  Grid,
  Card,
  CardContent,
  Fab,
  Chip,
  Avatar,
  Button,
  Fade,
  Paper,
} from '@mui/material';
import {
  Add as AddIcon,
  SmartToy as BotIcon,
  TrendingUp as TrendingUpIcon,
  Psychology as PsychologyIcon,
  Speed as SpeedIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import AgentCard from '../../components/dashboard/AgentCard';
import { Agent } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import api, { getImageUrl } from '../../services/api';

const DashboardPage: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const { user } = useAuth();
  const router = useRouter();

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

  const handleCreateAgent = () => {
    router.push('/admin/agents/create');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'success';
      case 'PENDING': return 'warning';
      case 'REJECTED': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'Ativo';
      case 'PENDING': return 'Pendente';
      case 'REJECTED': return 'Rejeitado';
      default: return status;
    }
  };

  // Mostra indicador de carregamento
  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
        flexDirection="column"
      >
        <CircularProgress size={60} sx={{ mb: 2 }} />
        <Typography variant="h6" color="text.secondary">
          Carregando seus agentes...
        </Typography>
      </Box>
    );
  }

  // Mostra mensagem de erro
  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  const approvedAgents = agents.filter(agent => agent.status === 'APPROVED');
  const pendingAgents = agents.filter(agent => agent.status === 'PENDING');

  // Verifica se o usuário é admin
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'MASTER_ADMIN';

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Fade in timeout={600}>
        <Box>
          {/* Header Dashboard */}
          <Box sx={{ mb: 4 }}>
            <Typography 
              variant="h3" 
              component="h1" 
              gutterBottom
              sx={{ 
                fontWeight: 'bold',
                background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Dashboard
            </Typography>
            
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Bem-vindo, {user?.username}!
            </Typography>

            {/* Stats Cards - Apenas para Administradores */}
            {isAdmin && (
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 3, mt: 2, mb: 4 }}>
              <Box>
                <Paper
                  elevation={2}
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                  }}
                >
                  <Box display="flex" alignItems="center">
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', mr: 2 }}>
                      <BotIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" fontWeight="bold">
                        {agents.length}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Total de Agentes
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </Box>

              <Box>
                <Paper
                  elevation={2}
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                    color: 'white',
                  }}
                >
                  <Box display="flex" alignItems="center">
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', mr: 2 }}>
                      <SpeedIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" fontWeight="bold">
                        {approvedAgents.length}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Agentes Ativos
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </Box>

              <Box>
                <Paper
                  elevation={2}
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                    color: 'white',
                  }}
                >
                  <Box display="flex" alignItems="center">
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', mr: 2 }}>
                      <TrendingUpIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" fontWeight="bold">
                        {pendingAgents.length}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Pendentes
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </Box>

              <Box>
                <Paper
                  elevation={2}
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                    color: 'white',
                  }}
                >
                  <Box display="flex" alignItems="center">
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', mr: 2 }}>
                      <PsychologyIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" fontWeight="bold">
                        IA
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Sistema Híbrido
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </Box>
            </Box>
            )}
          </Box>

          {/* Agents Section */}
          <Box sx={{ mb: 4 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
              <Typography variant="h5" fontWeight="bold">
                Seus Agentes
              </Typography>
              {isAdmin && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleCreateAgent}
                  sx={{
                    borderRadius: 2,
                    textTransform: 'none',
                    px: 3,
                    background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #1976D2 30%, #1BA3D1 90%)',
                    },
                  }}
                >
                  Criar Agente
                </Button>
              )}
            </Box>

            {agents.length === 0 ? (
              <Paper
                elevation={1}
                sx={{
                  p: 6,
                  textAlign: 'center',
                  borderRadius: 3,
                  border: '2px dashed',
                  borderColor: 'divider',
                  background: 'rgba(0,0,0,0.02)',
                }}
              >
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    mx: 'auto',
                    mb: 2,
                    bgcolor: 'primary.light',
                  }}
                >
                  <BotIcon sx={{ fontSize: 40 }} />
                </Avatar>
                <Typography variant="h6" gutterBottom>
                  Nenhum agente criado ainda
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Crie seu primeiro agente de IA para começar a usar a plataforma
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleCreateAgent}
                  size="large"
                  sx={{
                    borderRadius: 2,
                    textTransform: 'none',
                    px: 4,
                    py: 1.5,
                  }}
                >
                  Criar Primeiro Agente
                </Button>
              </Paper>
            ) : (
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 3 }}>
                {agents.map((agent) => (
                  <Box key={agent.id}>
                    <Card
                      elevation={3}
                      sx={{
                        borderRadius: 4,
                        transition: 'all 0.3s ease',
                        height: '100%',
                        minHeight: 280,
                        '&:hover': {
                          elevation: 12,
                          transform: 'translateY(-6px)',
                          boxShadow: '0 12px 32px rgba(0,0,0,0.15)',
                        },
                      }}
                    >
                      <CardContent sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <Box display="flex" alignItems="center" sx={{ mb: 3 }}>
                          <Avatar
                            src={getImageUrl(agent.logo_url)}
                            sx={{
                              width: 70,
                              height: 70,
                              mr: 3,
                              bgcolor: 'primary.main',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                            }}
                          >
                            <BotIcon sx={{ fontSize: 35 }} />
                          </Avatar>
                          <Box flexGrow={1}>
                            <Typography variant="h5" fontWeight="bold" sx={{ mb: 1 }}>
                              {agent.name}
                            </Typography>
                            <Chip
                              label={getStatusText(agent.status)}
                              color={getStatusColor(agent.status) as any}
                              size="medium"
                              sx={{ 
                                borderRadius: 2,
                                fontWeight: 'bold',
                                px: 1,
                              }}
                            />
                          </Box>
                        </Box>
                        
                        <Typography 
                          variant="body1" 
                          color="text.secondary" 
                          sx={{ 
                            mb: 3,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                            lineHeight: 1.6,
                            flexGrow: 1,
                          }}
                        >
                          {agent.description}
                        </Typography>
                        
                        <Box display="flex" gap={2} sx={{ mt: 'auto' }}>
                          <Button
                            variant="outlined"
                            size="small"
                            fullWidth
                            onClick={() => router.push(`/agents/${agent.id}`)}
                            sx={{ 
                              borderRadius: 2, 
                              textTransform: 'none',
                              py: 1,
                              fontWeight: '600',
                              fontSize: '0.875rem',
                              borderWidth: 1.5,
                              '&:hover': {
                                borderWidth: 1.5,
                                transform: 'translateY(-1px)',
                                boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                              },
                            }}
                          >
                            Ver Detalhes
                          </Button>
                          {agent.status === 'APPROVED' && (
                            <Button
                              variant="contained"
                              size="small"
                              fullWidth
                              onClick={() => {
                                console.log('Conversar clicked for agent:', agent.id);
                                router.push(`/chat/${agent.id}`);
                              }}
                              sx={{ 
                                borderRadius: 2, 
                                textTransform: 'none',
                                py: 1,
                                fontWeight: '600',
                                fontSize: '0.875rem',
                                background: 'linear-gradient(45deg, #4CAF50 30%, #8BC34A 90%)',
                                boxShadow: '0 3px 6px rgba(76, 175, 80, 0.3)',
                                '&:hover': {
                                  background: 'linear-gradient(45deg, #388E3C 30%, #689F38 90%)',
                                  transform: 'translateY(-1px)',
                                  boxShadow: '0 6px 12px rgba(76, 175, 80, 0.4)',
                                },
                              }}
                            >
                              Conversar
                            </Button>
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        </Box>
      </Fade>

      {/* Floating Action Button - Apenas para Administradores */}
      {isAdmin && (
        <Fab
          color="primary"
          aria-label="add"
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
            '&:hover': {
              background: 'linear-gradient(45deg, #1976D2 30%, #1BA3D1 90%)',
            },
          }}
          onClick={handleCreateAgent}
        >
          <AddIcon />
        </Fab>
      )}
    </Container>
  );
};

export default DashboardPage;
