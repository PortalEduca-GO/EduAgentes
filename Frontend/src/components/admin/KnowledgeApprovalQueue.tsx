'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Description as DocumentIcon,
  Link as LinkIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import api from '@/services/api';

interface PendingKnowledge {
  id: number;
  title: string;
  content?: string;
  knowledge_type: 'DOCUMENT' | 'LINK' | 'TEXT';
  status: 'PENDING';
  url?: string;
  file_path?: string;
  file_type?: string;
  tags?: string;
  created_at: string;
  author: {
    id: number;
    username: string;
    role: string;
  };
  agents: Array<{
    id: number;
    name: string;
  }>;
}

const KnowledgeApprovalQueue: React.FC = () => {
  const [pendingKnowledge, setPendingKnowledge] = useState<PendingKnowledge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Dialog states
  const [openApprovalDialog, setOpenApprovalDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [selectedKnowledge, setSelectedKnowledge] = useState<PendingKnowledge | null>(null);
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject'>('approve');
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    loadPendingKnowledge();
  }, []);

  const loadPendingKnowledge = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/knowledge/pending');
      setPendingKnowledge(response.data || []);
    } catch (error: any) {
      console.error('Erro ao carregar conhecimentos pendentes:', error);
      
      let errorMessage = 'Erro ao carregar conhecimentos pendentes';
      
      if (error.response) {
        // Erro de resposta da API
        if (error.response.status === 422) {
          errorMessage = 'Erro de validação na API. Verifique se você está autenticado.';
        } else if (error.response.status === 401) {
          errorMessage = 'Acesso não autorizado. Faça login novamente.';
        } else if (error.response.status === 403) {
          errorMessage = 'Você não tem permissão para acessar esta funcionalidade.';
        } else if (error.response.data?.detail) {
          errorMessage = error.response.data.detail;
        }
      } else if (error.request) {
        // Erro de rede
        errorMessage = 'Erro de conexão. Verifique se o servidor está funcionando.';
      }
      
      setError(errorMessage);
      setPendingKnowledge([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprovalAction = async () => {
    if (!selectedKnowledge) return;

    try {
      setError(null);
      const requestData = {
        action: approvalAction,
        rejection_reason: approvalAction === 'reject' ? rejectionReason : undefined
      };

      await api.post(`/knowledge/${selectedKnowledge.id}/approve`, requestData);
      
      const actionText = approvalAction === 'approve' ? 'aprovado' : 'rejeitado';
      setSuccess(`Conhecimento ${actionText} com sucesso!`);
      
      setOpenApprovalDialog(false);
      setSelectedKnowledge(null);
      setRejectionReason('');
      
      // Recarrega a lista
      loadPendingKnowledge();
    } catch (error: any) {
      console.error('Erro ao processar aprovação:', error);
      
      let errorMessage = `Erro ao processar ${approvalAction === 'approve' ? 'aprovação' : 'rejeição'}`;
      
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.response?.status === 422) {
        errorMessage = 'Erro de validação. Verifique os dados enviados.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Sessão expirada. Faça login novamente.';
      } else if (error.response?.status === 403) {
        errorMessage = 'Você não tem permissão para esta ação.';
      }
      
      setError(errorMessage);
    }
  };

  const handleOpenApproval = (knowledge: PendingKnowledge, action: 'approve' | 'reject') => {
    setSelectedKnowledge(knowledge);
    setApprovalAction(action);
    setRejectionReason('');
    setOpenApprovalDialog(true);
  };

  const handleOpenView = (knowledge: PendingKnowledge) => {
    setSelectedKnowledge(knowledge);
    setOpenViewDialog(true);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'DOCUMENT': return <DocumentIcon />;
      case 'LINK': return <LinkIcon />;
      default: return null;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'DOCUMENT': return 'primary';
      case 'LINK': return 'secondary';
      default: return 'default';
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('pt-BR'),
      time: date.toLocaleTimeString('pt-BR')
    };
  };

  if (loading) return <Typography>Carregando...</Typography>;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Fila de Aprovação - Base de Conhecimento
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {pendingKnowledge.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'grey.50' }}>
          <ApproveIcon color="success" sx={{ fontSize: 48, mb: 2 }} />
          <Typography variant="h6" color="textSecondary" gutterBottom>
            Não há conhecimentos pendentes de aprovação
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Todos os conhecimentos foram processados. Novos conteúdos aparecerão aqui quando forem submetidos para aprovação.
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Título</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Autor</TableCell>
                <TableCell>Data Criação</TableCell>
                <TableCell>Agentes</TableCell>
                <TableCell>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pendingKnowledge.map((knowledge) => {
                const datetime = formatDateTime(knowledge.created_at);
                return (
                  <TableRow key={knowledge.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getTypeIcon(knowledge.knowledge_type)}
                        {knowledge.title}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={knowledge.knowledge_type}
                        color={getTypeColor(knowledge.knowledge_type) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">{knowledge.author.username}</Typography>
                        <Typography variant="caption" color="textSecondary">
                          {knowledge.author.role}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">{datetime.date}</Typography>
                        <Typography variant="caption" color="textSecondary">
                          {datetime.time}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {knowledge.agents.map(agent => (
                        <Chip key={agent.id} label={agent.name} size="small" sx={{ mr: 0.5 }} />
                      ))}
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Visualizar">
                        <IconButton onClick={() => handleOpenView(knowledge)} size="small">
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Aprovar">
                        <IconButton 
                          onClick={() => handleOpenApproval(knowledge, 'approve')} 
                          size="small"
                          color="success"
                        >
                          <ApproveIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Rejeitar">
                        <IconButton 
                          onClick={() => handleOpenApproval(knowledge, 'reject')} 
                          size="small"
                          color="error"
                        >
                          <RejectIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Dialog de Aprovação/Rejeição */}
      <Dialog open={openApprovalDialog} onClose={() => setOpenApprovalDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {approvalAction === 'approve' ? 'Aprovar Conhecimento' : 'Rejeitar Conhecimento'}
        </DialogTitle>
        <DialogContent>
          {selectedKnowledge && (
            <Box sx={{ pt: 1 }}>
              <Typography variant="h6" gutterBottom>
                {selectedKnowledge.title}
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Autor: {selectedKnowledge.author.username} ({selectedKnowledge.author.role})
              </Typography>
              
              {approvalAction === 'reject' && (
                <TextField
                  label="Motivo da rejeição"
                  multiline
                  rows={3}
                  fullWidth
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  sx={{ mt: 2 }}
                  required
                />
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenApprovalDialog(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleApprovalAction}
            variant="contained"
            color={approvalAction === 'approve' ? 'success' : 'error'}
            disabled={approvalAction === 'reject' && !rejectionReason.trim()}
          >
            {approvalAction === 'approve' ? 'Aprovar' : 'Rejeitar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Visualização */}
      <Dialog open={openViewDialog} onClose={() => setOpenViewDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Visualizar Conhecimento</DialogTitle>
        <DialogContent>
          {selectedKnowledge && (
            <Box sx={{ pt: 1 }}>
              <Typography variant="h6" gutterBottom>
                {selectedKnowledge.title}
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="textSecondary">
                  <strong>Tipo:</strong> {selectedKnowledge.knowledge_type}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  <strong>Autor:</strong> {selectedKnowledge.author.username} ({selectedKnowledge.author.role})
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  <strong>Criado em:</strong> {formatDateTime(selectedKnowledge.created_at).date} às {formatDateTime(selectedKnowledge.created_at).time}
                </Typography>
              </Box>

              {selectedKnowledge.knowledge_type === 'LINK' && selectedKnowledge.url && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    <strong>URL:</strong> <a href={selectedKnowledge.url} target="_blank" rel="noopener noreferrer">{selectedKnowledge.url}</a>
                  </Typography>
                </Box>
              )}

              {selectedKnowledge.knowledge_type === 'DOCUMENT' && selectedKnowledge.file_path && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    <strong>Arquivo:</strong> {selectedKnowledge.file_path.split('/').pop()}
                  </Typography>
                </Box>
              )}

              {selectedKnowledge.content && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" gutterBottom>
                    <strong>Conteúdo:</strong>
                  </Typography>
                  <Paper sx={{ p: 2, backgroundColor: 'grey.50', maxHeight: 300, overflow: 'auto' }}>
                    <Typography variant="body2" style={{ whiteSpace: 'pre-wrap' }}>
                      {selectedKnowledge.content.substring(0, 1000)}
                      {selectedKnowledge.content.length > 1000 && '...'}
                    </Typography>
                  </Paper>
                </Box>
              )}

              {selectedKnowledge.tags && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    <strong>Tags:</strong> {selectedKnowledge.tags}
                  </Typography>
                </Box>
              )}

              <Box>
                <Typography variant="body2" gutterBottom>
                  <strong>Agentes Associados:</strong>
                </Typography>
                {selectedKnowledge.agents.map(agent => (
                  <Chip key={agent.id} label={agent.name} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                ))}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenViewDialog(false)}>
            Fechar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default KnowledgeApprovalQueue;
