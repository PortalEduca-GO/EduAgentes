// src/components/admin/AgentCreator.tsx

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
  CircularProgress,
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
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleInputChange = (field: keyof CreateAgentRequest) => (
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

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError('Nome do agente é obrigatório');
      return false;
    }
    if (!formData.description.trim()) {
      setError('Descrição do agente é obrigatória');
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
      await api.post('/agents', formData);
      
      setSuccess('Agente criado com sucesso! Aguardando aprovação.');
      
      // Limpa o formulário
      setFormData({
        name: '',
        description: '',
        system_prompt: '',
      });
    } catch (err: any) {
      console.error('Erro ao criar agente:', err);
      
      // Extrair mensagem específica do FastAPI
      let errorMessage = 'Erro ao criar agente. Tente novamente.';
      
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
            <SmartToy sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
            <Box>
              <Typography variant="h5" component="h2">
                Criar Novo Agente
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Crie um agente de IA personalizado para a plataforma
              </Typography>
            </Box>
          </Box>

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Nome do Agente"
              value={formData.name}
              onChange={handleInputChange('name')}
              margin="normal"
              required
              disabled={loading}
              placeholder="Ex: Assistente de Matemática"
            />

            <TextField
              fullWidth
              label="Descrição"
              value={formData.description}
              onChange={handleInputChange('description')}
              margin="normal"
              required
              multiline
              rows={3}
              disabled={loading}
              placeholder="Descreva o propósito e especialidade do agente..."
            />

            <TextField
              fullWidth
              label="Prompt do Sistema (Opcional)"
              value={formData.system_prompt}
              onChange={handleInputChange('system_prompt')}
              margin="normal"
              multiline
              rows={4}
              disabled={loading}
              placeholder="Instruções específicas sobre como o agente deve se comportar..."
              helperText="Define a personalidade e comportamento do agente"
            />

            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <SmartToy />}
                sx={{ minWidth: 140 }}
              >
                {loading ? 'Criando...' : 'Criar Agente'}
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

export default AgentCreator;
