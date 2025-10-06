'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Alert,
  CircularProgress,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
} from '@mui/material';
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import {
  Person as PersonIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { User } from '../../types';
import UserCreator from './UserCreator';
import api from '../../services/api';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showUserCreator, setShowUserCreator] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({
    username: '',
    password: '',
    role: 'USER'
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get<User[]>('/master/users');
      setUsers(response.data);
    } catch (err: any) {
      console.error('Erro ao buscar usuários:', err);
      setError(err.response?.data?.detail || 'Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  const handleUserCreated = () => {
    setShowUserCreator(false);
    fetchUsers(); // Recarrega a lista após criar um usuário
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setEditForm({
      username: user.username,
      password: '',
      role: user.role
    });
    setEditDialog(true);
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;

    try {
      const updateData: any = {};
      
      if (editForm.username !== editingUser.username) {
        updateData.username = editForm.username;
      }
      
      if (editForm.password.trim()) {
        updateData.password = editForm.password;
      }
      
      if (editForm.role !== editingUser.role) {
        updateData.role = editForm.role;
      }

      if (Object.keys(updateData).length === 0) {
        setError('Nenhuma alteração detectada');
        return;
      }

      await api.patch(`/master/users/${editingUser.id}`, updateData);
      setSuccess('Usuário atualizado com sucesso!');
      setError('');
      setEditDialog(false);
      setEditingUser(null);
      fetchUsers();
    } catch (err: any) {
      console.error('Erro ao atualizar usuário:', err);
      setError(err.response?.data?.detail || 'Erro ao atualizar usuário');
    }
  };

  const handleDeleteUser = async (userId: number, username: string) => {
    if (!confirm(`Tem certeza que deseja excluir o usuário "${username}"?`)) {
      return;
    }

    try {
      console.log(`Tentando excluir usuário ID: ${userId}, Nome: ${username}`);
      const response = await api.delete(`/master/users/${userId}`);
      console.log('Resposta da exclusão:', response);
      
      setSuccess('✅ Usuário excluído com sucesso!');
      setError('');
      
      // Recarrega a lista de usuários
      await fetchUsers();
    } catch (err: any) {
      console.error('Erro detalhado ao excluir usuário:', {
        error: err,
        response: err.response,
        status: err.response?.status,
        data: err.response?.data,
        message: err.message
      });
      
      const errorMessage = err.response?.data?.detail 
        || err.response?.data?.message
        || err.message
        || 'Erro desconhecido ao excluir usuário';
      
      setError(`❌ ${errorMessage}`);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'MASTER_ADMIN':
        return 'error';
      case 'ADMIN':
        return 'primary';
      case 'USER':
        return 'default';
      default:
        return 'default';
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'MASTER_ADMIN':
        return 'Master Admin';
      case 'ADMIN':
        return 'Admin';
      case 'USER':
        return 'Usuário';
      default:
        return role;
    }
  };

  const columns: GridColDef[] = [
    {
      field: 'id',
      headerName: 'ID',
      width: 80,
    },
    {
      field: 'username',
      headerName: 'Nome de Usuário',
      flex: 1,
      minWidth: 200,
    },
    {
      field: 'role',
      headerName: 'Papel',
      width: 150,
      renderCell: (params) => (
        <Chip
          label={getRoleText(params.value)}
          color={getRoleColor(params.value) as any}
          size="small"
          icon={<PersonIcon />}
        />
      ),
    },
    {
      field: 'created_at',
      headerName: 'Criado em',
      width: 150,
      renderCell: (params) => {
        const date = new Date(params.value);
        return date.toLocaleString('pt-BR');
      },
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Ações',
      width: 120,
      getActions: (params) => [
        <GridActionsCellItem
          key="edit"
          icon={
            <Tooltip title="Editar usuário">
              <EditIcon />
            </Tooltip>
          }
          label="Editar"
          onClick={() => handleEditUser(params.row)}
        />,
        <GridActionsCellItem
          key="delete"
          icon={
            <Tooltip title="Excluir usuário">
              <DeleteIcon />
            </Tooltip>
          }
          label="Excluir"
          onClick={() => handleDeleteUser(params.row.id, params.row.username)}
        />,
      ],
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
          Gerenciar Usuários
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            startIcon={<RefreshIcon />}
            onClick={fetchUsers}
            variant="outlined"
          >
            Atualizar
          </Button>
          <Button
            startIcon={<AddIcon />}
            onClick={() => setShowUserCreator(!showUserCreator)}
            variant="contained"
          >
            {showUserCreator ? 'Ocultar Formulário' : 'Novo Usuário'}
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Seção de Criação de Usuário */}
        {showUserCreator && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Criar Novo Usuário
              </Typography>
              <UserCreator />
            </CardContent>
          </Card>
        )}

        {/* Lista de Usuários */}
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Usuários do Sistema
              </Typography>
              <Chip
                label={`Total: ${users.length}`}
                color="primary"
                variant="outlined"
                sx={{ ml: 2 }}
              />
            </Box>
            
            <Divider sx={{ mb: 2 }} />
            
            <DataGrid
              rows={users}
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
      </Box>

      {/* Dialog de Edição */}
      <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Editar Usuário</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gap: 2, pt: 1 }}>
            <TextField
              fullWidth
              label="Nome de Usuário"
              value={editForm.username}
              onChange={(e) => setEditForm(prev => ({ ...prev, username: e.target.value }))}
              required
            />
            <TextField
              fullWidth
              label="Nova Senha (deixe em branco para manter)"
              type="password"
              value={editForm.password}
              onChange={(e) => setEditForm(prev => ({ ...prev, password: e.target.value }))}
              placeholder="Digite apenas se quiser alterar"
            />
            <FormControl fullWidth>
              <InputLabel>Papel do Usuário</InputLabel>
              <Select
                value={editForm.role}
                label="Papel do Usuário"
                onChange={(e) => setEditForm(prev => ({ ...prev, role: e.target.value }))}
              >
                <MenuItem value="USER">Usuário</MenuItem>
                <MenuItem value="ADMIN">Administrador</MenuItem>
                <MenuItem value="ADMIN">Administrador</MenuItem>
                <MenuItem value="MASTER_ADMIN">Master Admin</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog(false)}>Cancelar</Button>
          <Button onClick={handleUpdateUser} variant="contained">Salvar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserManagement;
