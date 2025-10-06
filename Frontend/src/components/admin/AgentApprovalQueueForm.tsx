// src/components/admin/AgentApprovalQueue.tsx

'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Snackbar,
} from '@mui/material';
import { 
  CheckCircle, 
  Cancel, 
  Queue,
  Refresh,
  Settings,
} from '@mui/icons-material';
import { Agent, UpdateAgentStatusRequest } from '../../types';
import api from '../../services/api';
import { useRouter } from 'next/navigation';

/**
 * Componente para aprovação de agentes pendentes
 * Acessível apenas para MASTER_ADMIN
 */
const AgentApprovalQueue: React.FC = () => {
  const router = useRouter();
  const [pendingAgents, setPendingAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchPendingAgents = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await api.get<Agent[]>('/agents/pending');
      setPendingAgents(response.data);
    } catch (err: any) {
      console.error('Erro ao buscar agentes pendentes:', err);
      setError('Erro ao carregar agentes pendentes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingAgents();
  }, []);

  const handleStatusUpdate = async (agentId: number, status: 'APPROVED' | 'REJECTED') => {
    setActionLoading(agentId.toString());
    setError('');
    setSuccess('');

    try {
      const statusUpdate: UpdateAgentStatusRequest = { status };
      await api.patch(`/agents/${agentId}/status`, statusUpdate);
      
      // Remove o agente da lista local após sucesso
      setPendingAgents(prev => prev.filter(agent => agent.id !== agentId));
      
      const action = status === 'APPROVED' ? 'aprovado' : 'rejeitado';
      setSuccess(`Agente ${action} com sucesso!`);
    } catch (err: any) {
      console.error('Erro ao atualizar status:', err);
      setError(
        err.response?.data?.detail || 
        'Erro ao atualizar status do agente'
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleManageAgent = (agentId: number) => {
    router.push(`/admin/agents/${agentId}`);
  };

  const handleRefresh = () => {
    fetchPendingAgents();
  };

  const handleCloseSnackbar = () => {
    setSuccess('');
    setError('');
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Queue sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
              <Box>
                <Typography variant="h5" component="h2">
                  Fila de Aprovação
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {pendingAgents.length} agente(s) aguardando aprovação
                </Typography>
              </Box>
            </Box>
            
            <Tooltip title="Atualizar lista">
              <IconButton onClick={handleRefresh} disabled={loading}>
                <Refresh />
              </IconButton>
            </Tooltip>
          </Box>

          {pendingAgents.length === 0 ? (
            <Alert severity="info">
              Não há agentes pendentes de aprovação no momento.
            </Alert>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>ID</strong></TableCell>
                    <TableCell><strong>Nome</strong></TableCell>
                    <TableCell><strong>Descrição</strong></TableCell>
                    <TableCell align="center"><strong>Ações</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pendingAgents.map((agent) => (
                    <TableRow key={agent.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontFamily="monospace">
                          {agent.id}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body1" fontWeight="medium">
                          {agent.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          sx={{
                            maxWidth: 300,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {agent.description}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                          <Tooltip title="Gerenciar">
                            <IconButton
                              color="primary"
                              onClick={() => handleManageAgent(agent.id)}
                              size="small"
                            >
                              <Settings />
                            </IconButton>
                          </Tooltip>
                          
                          <Tooltip title="Aprovar">
                            <IconButton
                              color="success"
                              onClick={() => handleStatusUpdate(agent.id, 'APPROVED')}
                              disabled={actionLoading === agent.id.toString()}
                              size="small"
                            >
                              {actionLoading === agent.id.toString() ? (
                                <CircularProgress size={20} />
                              ) : (
                                <CheckCircle />
                              )}
                            </IconButton>
                          </Tooltip>
                          
                          <Tooltip title="Rejeitar">
                            <IconButton
                              color="error"
                              onClick={() => handleStatusUpdate(agent.id, 'REJECTED')}
                              disabled={actionLoading === agent.id.toString()}
                              size="small"
                            >
                              <Cancel />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Notificações */}
      <Snackbar
        open={!!success}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity="success"
          sx={{ width: '100%' }}
        >
          {success}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity="error"
          sx={{ width: '100%' }}
        >
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AgentApprovalQueue;
