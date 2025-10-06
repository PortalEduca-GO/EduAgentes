// src/components/admin/UserCreator.tsx

'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Snackbar,
} from '@mui/material';
import { PersonAdd } from '@mui/icons-material';
import { CreateUserRequest, Role } from '../../types';
import api from '../../services/api';

/**
 * Componente para criação de novos usuários
 * Acessível apenas para MASTER_ADMIN
 */
const UserCreator: React.FC = () => {
  const [formData, setFormData] = useState<CreateUserRequest>({
    username: '',
    password: '',
    role: 'USER',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleInputChange = (field: keyof CreateUserRequest) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value,
    }));
    
    // Limpa mensagens
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleRoleChange = (event: any) => {
    setFormData(prev => ({
      ...prev,
      role: event.target.value as Role,
    }));
    
    if (error) setError('');
    if (success) setSuccess('');
  };

  const validateForm = (): boolean => {
    if (!formData.username.trim()) {
      setError('Nome de usuário é obrigatório');
      return false;
    }
    if (formData.username.trim().length < 3) {
      setError('Nome de usuário deve ter pelo menos 3 caracteres');
      return false;
    }
    if (!formData.password.trim()) {
      setError('Senha é obrigatória');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Senha deve ter pelo menos 6 caracteres');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      console.log('Enviando dados:', formData); // Debug
      await api.post('/master/users', formData);
      
      setSuccess(`Usuário ${formData.username} criado com sucesso!`);
      
      // Limpa o formulário
      setFormData({
        username: '',
        password: '',
        role: 'ADMIN',
      });
    } catch (err: any) {
      console.error('Erro ao criar usuário:', err);
      
      // Extrair mensagem específica do FastAPI
      let errorMessage = 'Erro ao criar usuário. Tente novamente.';
      
      if (err.response?.data?.detail) {
        errorMessage = err.response.data.detail;
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = `Erro de conexão: ${err.message}`;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSuccess('');
    setError('');
  };

  return (
    <Box>
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <PersonAdd sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
            <Box>
              <Typography variant="h5" component="h2">
                Criar Novo Usuário
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Crie usuários com diferentes níveis de acesso
              </Typography>
            </Box>
          </Box>

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Nome de Usuário"
              value={formData.username}
              onChange={handleInputChange('username')}
              margin="normal"
              required
              disabled={loading}
              placeholder="Digite o nome de usuário"
              helperText="Mínimo 3 caracteres"
            />

            <TextField
              fullWidth
              label="Senha"
              type="password"
              value={formData.password}
              onChange={handleInputChange('password')}
              margin="normal"
              required
              disabled={loading}
              placeholder="Digite a senha"
              helperText="Mínimo 6 caracteres"
            />

            <FormControl fullWidth margin="normal" required>
              <InputLabel>Nível de Acesso</InputLabel>
              <Select
                value={formData.role}
                onChange={handleRoleChange}
                disabled={loading}
                label="Nível de Acesso"
              >
                <MenuItem value="USER">Usuário</MenuItem>
                <MenuItem value="ADMIN">Admin</MenuItem>
                <MenuItem value="MASTER_ADMIN">Master Admin</MenuItem>
              </Select>
            </FormControl>

            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <PersonAdd />}
                sx={{ minWidth: 140 }}
              >
                {loading ? 'Criando...' : 'Criar Usuário'}
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>

      {/* Notificações */}
      <Snackbar
        open={!!success}
        autoHideDuration={6000}
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

export default UserCreator;
