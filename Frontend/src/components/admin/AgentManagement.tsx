'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  IconButton,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Tooltip,
  Avatar,
} from '@mui/material';
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  SmartToy,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { Agent } from '../../types';
import api, { getImageUrl } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';

const AgentManagement: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [agentToDelete, setAgentToDelete] = useState<Agent | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get<Agent[]>('/admin/agents');
      setAgents(response.data);
    } catch (err: any) {
      console.error('Erro ao buscar agentes:', err);
      setError(err.response?.data?.detail || 'Erro ao carregar agentes');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (agent: Agent) => {
    router.push(`/admin/agents/${agent.id}`);
  };

  const handleDeleteClick = (agent: Agent) => {
    setAgentToDelete(agent);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!agentToDelete) return;

    try {
      setDeleting(true);
      await api.delete(`/agents/${agentToDelete.id}`);
      
      // Remove o agente da lista local
      setAgents(prev => prev.filter(agent => agent.id !== agentToDelete.id));
      
      setDeleteDialogOpen(false);
      setAgentToDelete(null);
    } catch (err: any) {
      console.error('Erro ao excluir agente:', err);
      setError(err.response?.data?.detail || 'Erro ao excluir agente');
    } finally {
      setDeleting(false);
    }
  };

  // Verifica se é Master Admin
  const isMasterAdmin = user?.role === 'MASTER_ADMIN';

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'success';
      case 'PENDING':
        return 'warning';
      case 'REJECTED':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'Aprovado';
      case 'PENDING':
        return 'Pendente';
      case 'REJECTED':
        return 'Rejeitado';
      default:
        return status;
    }
  };

  const columns: GridColDef[] = [
    {
      field: 'logo',
      headerName: '',
      width: 60,
      sortable: false,
      renderCell: (params) => (
        <Avatar
          src={getImageUrl(params.row.logo_url)}
          sx={{ width: 32, height: 32 }}
        >
          <SmartToy fontSize="small" />
        </Avatar>
      ),
    },
    {
      field: 'id',
      headerName: 'ID',
      width: 80,
    },
    {
      field: 'name',
      headerName: 'Nome',
      flex: 1,
      minWidth: 200,
    },
    {
      field: 'description',
      headerName: 'Descrição',
      flex: 2,
      minWidth: 300,
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={getStatusText(params.value)}
          color={getStatusColor(params.value) as any}
          size="small"
        />
      ),
    },
    {
      field: 'owner_id',
      headerName: 'Proprietário',
      width: 120,
    },
    {
      field: 'created_at',
      headerName: 'Criado em',
      width: 120,
      renderCell: (params) => {
        const date = new Date(params.value);
        return date.toLocaleDateString('pt-BR');
      },
    },
    {
      field: 'documents_count',
      headerName: 'Docs',
      width: 80,
      renderCell: (params) => (
        <Chip
          label={params.row.documents?.length || 0}
          size="small"
          variant="outlined"
        />
      ),
    },
    {
      field: 'links_count',
      headerName: 'Links',
      width: 80,
      renderCell: (params) => (
        <Chip
          label={params.row.links?.length || 0}
          size="small"
          variant="outlined"
        />
      ),
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Ações',
      width: 120,
      getActions: (params) => {
        const actions = [];
        
        if (isMasterAdmin) {
          actions.push(
            <GridActionsCellItem
              key="edit"
              icon={
                <Tooltip title="Editar agente">
                  <EditIcon />
                </Tooltip>
              }
              label="Editar"
              onClick={() => handleEdit(params.row)}
            />,
            <GridActionsCellItem
              key="delete"
              icon={
                <Tooltip title="Excluir agente">
                  <DeleteIcon />
                </Tooltip>
              }
              label="Excluir"
              onClick={() => handleDeleteClick(params.row)}
            />
          );
        }
        
        return actions;
      },
    },
  ];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h2">
          Gerenciar Agentes
        </Typography>
        <Button
          startIcon={<RefreshIcon />}
          onClick={fetchAgents}
          variant="outlined"
        >
          Atualizar
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Card>
        <CardContent>
          <DataGrid
            rows={agents}
            columns={columns}
            initialState={{
              pagination: {
                paginationModel: { page: 0, pageSize: 10 },
              },
            }}
            pageSizeOptions={[5, 10, 25]}
            disableRowSelectionOnClick
            autoHeight
            sx={{
              '& .MuiDataGrid-cell': {
                borderBottom: '1px solid #f0f0f0',
              },
            }}
          />
        </CardContent>
      </Card>

      {/* Dialog de confirmação de exclusão */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => !deleting && setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja excluir o agente "{agentToDelete?.name}"?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Esta ação é irreversível e irá excluir:
          </Typography>
          <ul>
            <li>Todos os documentos da base de conhecimento</li>
            <li>Todos os links adicionados</li>
            <li>O logo do agente</li>
            <li>Todos os dados de vetorização</li>
          </ul>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            disabled={deleting}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={16} /> : <DeleteIcon />}
          >
            {deleting ? 'Excluindo...' : 'Excluir'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AgentManagement;
