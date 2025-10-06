'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Grid,
  Alert,
  CircularProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Divider,
  Avatar,
  IconButton,
  Tooltip,
} from '@mui/material';
import { 
  CheckCircle, 
  Cancel, 
  Visibility, 
  SmartToy,
  Person,
  Schedule,
  Refresh,
} from '@mui/icons-material';
import { Agent, UpdateAgentStatusRequest } from '../../types';
import api from '../../services/api';

/**
 * Componente para aprovação de agentes pendentes
 * Acessível apenas para MASTER_ADMIN
 */
const AgentApprovalQueue: React.FC = () => {
  const [pendingAgents, setPendingAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchPendingAgents();
  }, []);

  const fetchPendingAgents = async (showRefreshLoader = false) => {
    try {
      if (showRefreshLoader) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError('');
      
      const response = await api.get<Agent[]>('/agents/pending');
      setPendingAgents(response.data);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Erro ao carregar agentes pendentes';
      setError(errorMessage);
      console.error('Erro ao buscar agentes pendentes:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleStatusChange = async (agentId: number, status: 'APPROVED' | 'REJECTED') => {
    try {
      setActionLoading(true);
      const updateData: UpdateAgentStatusRequest = { status };
      await api.patch(`/agents/${agentId}/status`, updateData);
      
      // Remove o agente da lista de pendentes
      setPendingAgents(prev => prev.filter(agent => agent.id !== agentId));
      
      setDialogOpen(false);
      setSelectedAgent(null);
      
      // Recarrega a lista para garantir consistência
      await fetchPendingAgents(true);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Erro ao atualizar status do agente';
      setError(errorMessage);
      console.error('Erro ao atualizar status:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const openAgentDetails = (agent: Agent) => {
    setSelectedAgent(agent);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setSelectedAgent(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading && !refreshing) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h6" gutterBottom>
            Aprovação de Agentes
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Revise e aprove agentes criados pelos usuários
          </Typography>
        </Box>
        
        <Tooltip title="Atualizar lista">
          <IconButton 
            onClick={() => fetchPendingAgents(true)}
            disabled={refreshing}
            color="primary"
          >
            <Refresh sx={{ 
              animation: refreshing ? 'spin 1s linear infinite' : 'none',
              '@keyframes spin': {
                '0%': { transform: 'rotate(0deg)' },
                '100%': { transform: 'rotate(360deg)' },
              },
            }} />
          </IconButton>
        </Tooltip>
      </Box>

      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 2 }}
          action={
            <Button color="inherit" size="small" onClick={() => fetchPendingAgents()}>
              Tentar Novamente
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {pendingAgents.length === 0 ? (
        <Alert severity="info" sx={{ textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            🎉 Nenhum agente pendente!
          </Typography>
          <Typography variant="body2">
            Todos os agentes foram revisados. Verifique novamente mais tarde.
          </Typography>
        </Alert>
      ) : (
        <>
          {/* Contador */}
          <Box sx={{ mb: 2 }}>
            <Chip 
              icon={<Schedule />}
              label={`${pendingAgents.length} agente(s) aguardando aprovação`}
              color="warning"
              variant="outlined"
            />
          </Box>

          {/* Lista de agentes */}
          <Grid container spacing={3}>
            {pendingAgents.map((agent) => (
              <Grid key={agent.id} size={{ xs: 12, md: 6, lg: 4 }}>
                <Card 
                  sx={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4,
                    },
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    {/* Header do card */}
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{ bgcolor: 'warning.main', mr: 1.5 }}>
                        <SmartToy />
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" component="div" noWrap>
                          {agent.name}
                        </Typography>
                        <Chip 
                          label="Pendente" 
                          color="warning" 
                          size="small"
                          icon={<Schedule fontSize="small" />}
                        />
                      </Box>
                    </Box>
                    
                    {/* Descrição */}
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ 
                        mb: 2,
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {agent.description}
                    </Typography>
                    
                    {/* Informações */}
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" display="block" gutterBottom>
                        <Person fontSize="inherit" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                        <strong>Criado por:</strong> ID {agent.owner_id}
                      </Typography>
                    </Box>
                    
                    {/* Data */}
                    <Typography variant="caption" color="text.secondary">
                      <strong>Criado:</strong> {formatDate(agent.created_at)}
                    </Typography>
                  </CardContent>
                  
                  {/* Ações */}
                  <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
                    <Button
                      size="small"
                      startIcon={<Visibility />}
                      onClick={() => openAgentDetails(agent)}
                    >
                      Detalhes
                    </Button>
                    
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        size="small"
                        color="success"
                        variant="contained"
                        startIcon={<CheckCircle />}
                        onClick={() => handleStatusChange(agent.id, 'APPROVED')}
                        disabled={actionLoading}
                      >
                        Aprovar
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        variant="outlined"
                        startIcon={<Cancel />}
                        onClick={() => handleStatusChange(agent.id, 'REJECTED')}
                        disabled={actionLoading}
                      >
                        Rejeitar
                      </Button>
                    </Box>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      )}

      {/* Dialog para detalhes do agente */}
      <Dialog
        open={dialogOpen}
        onClose={closeDialog}
        maxWidth="md"
        fullWidth
      >
        {selectedAgent && (
          <>
            <DialogTitle sx={{ pb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <SmartToy />
                </Avatar>
                <Box>
                  <Typography variant="h6">{selectedAgent.name}</Typography>
                  <Chip 
                    label="Aguardando Aprovação" 
                    color="warning" 
                    size="small" 
                  />
                </Box>
              </Box>
            </DialogTitle>
            
            <DialogContent>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Descrição"
                    value={selectedAgent.description}
                    multiline
                    rows={3}
                    InputProps={{ readOnly: true }}
                    variant="outlined"
                  />
                </Grid>
                
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Criado por"
                    value={`ID ${selectedAgent.owner_id}`}
                    InputProps={{ readOnly: true }}
                    variant="outlined"
                  />
                </Grid>
                
                {selectedAgent.system_prompt && (
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label="Prompt do Sistema"
                      value={selectedAgent.system_prompt}
                      multiline
                      rows={4}
                      InputProps={{ readOnly: true }}
                      variant="outlined"
                    />
                  </Grid>
                )}
                
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Data de Criação"
                    value={formatDate(selectedAgent.created_at)}
                    InputProps={{ readOnly: true }}
                    variant="outlined"
                  />
                </Grid>
              </Grid>
            </DialogContent>
            
            <DialogActions sx={{ p: 3, pt: 1 }}>
              <Button onClick={closeDialog}>
                Fechar
              </Button>
              
              <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
              
              <Button
                color="success"
                variant="contained"
                startIcon={<CheckCircle />}
                onClick={() => handleStatusChange(selectedAgent.id, 'APPROVED')}
                disabled={actionLoading}
              >
                {actionLoading ? 'Aprovando...' : 'Aprovar'}
              </Button>
              
              <Button
                color="error"
                variant="outlined"
                startIcon={<Cancel />}
                onClick={() => handleStatusChange(selectedAgent.id, 'REJECTED')}
                disabled={actionLoading}
              >
                {actionLoading ? 'Rejeitando...' : 'Rejeitar'}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default AgentApprovalQueue;
