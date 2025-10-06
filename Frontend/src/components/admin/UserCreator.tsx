// FILE: src/components/admin/UserCreator.tsx

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
  Grid,
  Avatar,
  Divider,
  FormHelperText,
  Snackbar,
} from '@mui/material';
import { PersonAdd, Visibility, VisibilityOff } from '@mui/icons-material';
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
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: keyof CreateUserRequest) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value,
    }));
    
    // Limpa erro do campo específico
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
    
    // Limpa mensagens globais
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
    const errors: Record<string, string> = {};

    if (!formData.username.trim()) {
      errors.username = 'Nome de usuário é obrigatório';
    } else if (formData.username.trim().length < 3) {
      errors.username = 'Nome de usuário deve ter pelo menos 3 caracteres';
    }

    if (!formData.password) {
      errors.password = 'Senha é obrigatória';
    } else if (formData.password.length < 6) {
      errors.password = 'Senha deve ter pelo menos 6 caracteres';
    }

    if (!formData.role) {
      errors.role = 'Papel é obrigatório';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setError('Por favor, corrija os erros no formulário');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await api.post('/master/users', formData);
      setSuccess(`Usuário ${formData.username} criado com sucesso!`);
      
      // Limpa o formulário
      setFormData({
        username: '',
        password: '',
        role: 'USER',
      });
      setFieldErrors({});
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message ||
                          'Erro ao criar usuário';
      setError(errorMessage);
      console.error('Erro ao criar usuário:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleLabel = (role: Role) => {
    switch (role) {
      case 'USER':
        return 'Usuário';
      case 'ADMIN':
        return 'Administrador';
      case 'MASTER_ADMIN':
        return 'Administrador Master';
      default:
        return role;
    }
  };

  const getRoleDescription = (role: Role) => {
    switch (role) {
      case 'USER':
        return 'Acesso básico - visualizar e conversar com agentes';
      case 'ADMIN':
        return 'Criar agentes e conhecimentos (aguarda aprovação)';
      case 'MASTER_ADMIN':
        return 'Criar usuários, aprovar agentes e conhecimentos + todas as funcionalidades';
      default:
        return '';
    }
  };

  const isFormValid = () => {
    return formData.username && formData.password && formData.role;
  };

  const handleCloseSnackbar = () => {
    setSuccess('');
    setError('');
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
          <PersonAdd />
        </Avatar>
        <Box>
          <Typography variant="h6" gutterBottom>
            Criar Novo Usuário
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Adicione novos usuários à plataforma com papéis específicos
          </Typography>
        </Box>
      </Box>

      <Card elevation={2}>
        <CardContent sx={{ p: 3 }}>
          {/* Mensagens de status */}
          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              {success}
            </Alert>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Formulário */}
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Nome de Usuário */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Nome de Usuário"
                  value={formData.username}
                  onChange={handleInputChange('username')}
                  required
                  disabled={loading}
                  error={!!fieldErrors.username}
                  helperText={fieldErrors.username || 'Nome único para login'}
                  placeholder="Ex: joao.silva"
                />
              </Grid>

              {/* Senha */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Senha"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange('password')}
                  required
                  disabled={loading}
                  error={!!fieldErrors.password}
                  helperText={fieldErrors.password || 'Mínimo 6 caracteres'}
                  placeholder="••••••••"
                  InputProps={{
                    endAdornment: (
                      <Button
                        size="small"
                        onClick={() => setShowPassword(!showPassword)}
                        sx={{ minWidth: 'auto', p: 1 }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </Button>
                    ),
                  }}
                />
              </Grid>

              {/* Papel */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl 
                  fullWidth 
                  required 
                  error={!!fieldErrors.role}
                  disabled={loading}
                >
                  <InputLabel>Papel do Usuário</InputLabel>
                  <Select
                    value={formData.role}
                    onChange={handleRoleChange}
                    label="Papel do Usuário"
                  >
                    <MenuItem value="USER">{getRoleLabel('USER')}</MenuItem>
                    <MenuItem value="ADMIN">{getRoleLabel('ADMIN')}</MenuItem>
                    <MenuItem value="MASTER_ADMIN">{getRoleLabel('MASTER_ADMIN')}</MenuItem>
                  </Select>
                  <FormHelperText>
                    {fieldErrors.role || getRoleDescription(formData.role)}
                  </FormHelperText>
                </FormControl>
              </Grid>

              {/* Descrição do papel selecionado */}
              {formData.role && (
                <Grid size={{ xs: 12 }}>
                  <Alert severity="info" sx={{ bgcolor: 'grey.50' }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Permissões do {getRoleLabel(formData.role)}:
                    </Typography>
                    <Typography variant="body2">
                      {getRoleDescription(formData.role)}
                    </Typography>
                  </Alert>
                </Grid>
              )}
            </Grid>

            <Divider sx={{ my: 3 }} />

            {/* Botão de submit */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                startIcon={loading ? <CircularProgress size={20} /> : <PersonAdd />}
                disabled={!isFormValid() || loading}
                sx={{ px: 4, py: 1.5 }}
              >
                {loading ? 'Criando Usuário...' : 'Criar Usuário'}
              </Button>
            </Box>
          </Box>
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
