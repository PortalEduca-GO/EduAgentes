// FILE: src/components/admin/AgentCreator.tsx

"use client";

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Grid,
  Avatar,
  Divider,
  Snackbar,
} from '@mui/material';
import { SmartToy } from '@mui/icons-material';
import { CreateAgentRequest } from '../../types';
import api from '../../services/api';

/**
 * Componente para criação de novos agentes
 * Acessível para ADMIN e MASTER_ADMIN
 */
const AgentCreator: React.FC = () => {
  const [formData, setFormData] = useState<CreateAgentRequest>({
    name: '',
    description: '',
    system_prompt: '',
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: keyof CreateAgentRequest) => (
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

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = 'Nome é obrigatório';
    } else if (formData.name.trim().length < 3) {
      errors.name = 'Nome deve ter pelo menos 3 caracteres';
    }

    if (!formData.description.trim()) {
      errors.description = 'Descrição é obrigatória';
    } else if (formData.description.trim().length < 10) {
      errors.description = 'Descrição deve ter pelo menos 10 caracteres';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validação no cliente: se inválido, aborta antes de chamar API
    if (!validateForm()) {
      setError('Por favor, corrija os erros no formulário');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
  // Debug: mostra payload antes de enviar para ajudar a diagnosticar 422
  console.debug('Creating agent payload:', formData);
  await api.post('/agents', formData);
      setSuccess(`Agente ${formData.name} criado com sucesso! Aguardando aprovação.`);
      // Limpa o formulário
      setFormData({ name: '', description: '', system_prompt: '' });
      setFieldErrors({});
    } catch (err: any) {
      const data = err?.response?.data;
      // Normaliza possíveis arrays de erro: pode vir como array ou como { detail: [...] }
      const errorsArray = Array.isArray(data) ? data : Array.isArray(data?.detail) ? data.detail : null;
      if (errorsArray) {
        const errors: Record<string, string> = {};
        errorsArray.forEach((errItem: any) => {
          if (errItem && errItem.loc && errItem.msg) {
            const field = errItem.loc[errItem.loc.length - 1];
            errors[String(field)] = String(errItem.msg);
          } else if (errItem && typeof errItem === 'string') {
            // Mensagem genérica na array
            errors['non_field_error'] = String(errItem);
          }
        });
        setFieldErrors(errors);
        setError('Por favor, corrija os erros no formulário');
      } else {
        // Nunca setamos um objeto diretamente em `error` (isso causa React child error)
        const errorMessage = typeof data === 'string'
          ? data
          : data?.detail || data?.message || err?.message || 'Erro ao criar agente';
        setError(String(errorMessage));
      }
      console.error('Erro ao criar agente:', err);
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = (): boolean => {
    return Boolean(formData.name.trim() && formData.description.trim());
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
          <SmartToy />
        </Avatar>
        <Box>
          <Typography variant="h6" gutterBottom>
            Criar Novo Agente
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Crie um agente especializado que passará por aprovação
          </Typography>
        </Box>
      </Box>

      <Card elevation={2}>
        <CardContent sx={{ p: 3 }}>
          {/* Mensagens de status */}
          {success && (
            <Alert severity="success" sx={{ mb: 3 }} icon={<SmartToy />}>
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
              {/* Nome */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Nome do Agente"
                  value={formData.name}
                  onChange={handleInputChange('name')}
                  required
                  disabled={loading}
                  error={!!fieldErrors.name}
                  helperText={fieldErrors.name || 'Nome único e descritivo do agente'}
                  placeholder="Ex: Professor de Matemática"
                />
              </Grid>

              {/* Descrição */}
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Descrição"
                  multiline
                  rows={4}
                  value={formData.description}
                  onChange={handleInputChange('description')}
                  required
                  disabled={loading}
                  error={!!fieldErrors.description}
                  helperText={fieldErrors.description || 'Descreva as capacidades e especialidades do agente'}
                  placeholder="Este agente é especializado em..."
                />
              </Grid>

              {/* System Prompt */}
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Prompt do Sistema (Opcional)"
                  multiline
                  rows={4}
                  value={formData.system_prompt}
                  onChange={handleInputChange('system_prompt')}
                  disabled={loading}
                  helperText="Define a personalidade e comportamento específico do agente"
                  placeholder="Você é um assistente especializado em..."
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            {/* Botão de submit */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                startIcon={loading ? <CircularProgress size={20} /> : <SmartToy />}
                disabled={!isFormValid() || loading}
                sx={{ px: 4, py: 1.5 }}
              >
                {loading ? 'Criando Agente...' : 'Criar Agente'}
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

export default AgentCreator;
