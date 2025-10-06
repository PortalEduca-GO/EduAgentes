'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
  Alert,
  CircularProgress,
  Chip,
  Divider,
  Paper
} from '@mui/material';
import {
  Psychology as PsychologyIcon,
  CloudSync as HybridIcon,
  Computer as LlamaIcon,
  Cloud as GeminiIcon,
  Security as SecurityIcon
} from '@mui/icons-material';
import { useAuth } from '@/hooks/useAuth';
import api from '@/services/api';

interface SystemConfig {
  key: string;
  value: string;
  description: string;
  updated_at: string;
  updated_by_username: string;
}

interface AIModelConfigProps {
  // Este componente só deve ser usado por Master Admins
}

export default function AIModelConfig({ }: AIModelConfigProps) {
  const { user } = useAuth();
  const [currentConfig, setCurrentConfig] = useState<SystemConfig | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>('HYBRID');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Verificar se é Master Admin
  const isMasterAdmin = user?.role === 'MASTER_ADMIN';

  const modelOptions = [
    {
      value: 'HYBRID',
      label: 'Híbrido (Padrão)',
      icon: <HybridIcon />,
      description: 'Sistema completo em 3 estágios: Documentos (Llama) → Links (Gemini) → Conhecimento Geral (Gemini)',
      benefits: [
        'Máxima precisão com documentos locais',
        'Flexibilidade com conteúdo web',
        'Fallback para conhecimento geral'
      ],
      color: '#2196f3'
    },
    {
      value: 'LLAMA_ONLY',
      label: 'Apenas Llama',
      icon: <LlamaIcon />,
      description: 'Usa somente o modelo Llama local com documentos carregados',
      benefits: [
        'Privacidade total (sem APIs externas)',
        'Controle completo dos dados',
        'Sem custos de API'
      ],
      color: '#4caf50'
    },
    {
      value: 'GEMINI_ONLY',
      label: 'Apenas Gemini',
      icon: <GeminiIcon />,
      description: 'Usa apenas Google Gemini para links e conhecimento geral',
      benefits: [
        'Respostas mais rápidas',
        'Conhecimento atualizado',
        'Melhor compreensão de contexto'
      ],
      color: '#ff9800'
    }
  ];

  useEffect(() => {
    if (isMasterAdmin) {
      fetchCurrentConfig();
    }
  }, [isMasterAdmin]);

  const fetchCurrentConfig = async () => {
    try {
      setLoading(true);
      const response = await api.get('/master/system/ai-model');
      setCurrentConfig(response.data);
      setSelectedModel(response.data.value);
    } catch (error) {
      console.error('Erro ao carregar configuração:', error);
      setMessage({ type: 'error', text: 'Erro ao carregar configuração atual' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateConfig = async () => {
    try {
      setUpdating(true);
      setMessage(null);

      console.log('Enviando atualização:', { ai_model_type: selectedModel });

      const response = await api.put('/master/system/ai-model', {
        ai_model_type: selectedModel
      });

      console.log('Resposta recebida:', response.data);

      // Atualiza configuração local
      setCurrentConfig(response.data);
      
      // Força refresh da configuração para garantir sincronização
      await fetchCurrentConfig();
      
      setMessage({ 
        type: 'success', 
        text: `✅ Configuração atualizada para: ${getModelLabel(selectedModel)}` 
      });
    } catch (error: any) {
      console.error('Erro detalhado ao atualizar configuração:', {
        error,
        response: error.response,
        data: error.response?.data,
        status: error.response?.status
      });
      
      const errorMessage = error.response?.data?.detail 
        || error.message 
        || 'Erro desconhecido ao atualizar configuração';
      
      setMessage({ 
        type: 'error', 
        text: `❌ ${errorMessage}` 
      });
    } finally {
      setUpdating(false);
    }
  };

  const getModelLabel = (value: string) => {
    return modelOptions.find(option => option.value === value)?.label || value;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  if (!isMasterAdmin) {
    return (
      <Card>
        <CardContent>
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <SecurityIcon color="error" />
            <Typography variant="h6" color="error">
              Acesso Negado
            </Typography>
          </Box>
          <Typography>
            Esta funcionalidade é exclusiva para Master Admins.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="center" alignItems="center" py={4}>
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box>
      <Card>
        <CardContent>
          <Box display="flex" alignItems="center" gap={2} mb={3}>
            <SecurityIcon color="primary" />
            <Typography variant="h5" component="h1">
              Configuração do Modelo de IA
            </Typography>
            <Chip 
              label="Master Admin" 
              color="primary" 
              size="small"
              icon={<SecurityIcon />}
            />
          </Box>

          <Typography variant="body1" color="text.secondary" mb={3}>
            Configure qual modelo de IA será usado em todo o sistema. Esta configuração afeta todos os agentes e usuários.
          </Typography>

          {/* Configuração Atual */}
          {currentConfig && (
            <Paper elevation={1} sx={{ p: 2, mb: 3, bgcolor: 'background.default' }}>
              <Typography variant="subtitle2" color="primary" gutterBottom>
                Configuração Atual
              </Typography>
              <Box display="flex" alignItems="center" gap={2}>
                <Typography variant="body2">
                  <strong>Modelo:</strong> {getModelLabel(currentConfig.value)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Atualizado em: {formatDate(currentConfig.updated_at)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Por: {currentConfig.updated_by_username}
                </Typography>
              </Box>
            </Paper>
          )}

          {/* Mensagens */}
          {message && (
            <Alert severity={message.type} sx={{ mb: 3 }}>
              {message.text}
            </Alert>
          )}

          {/* Seleção de Modelo */}
          <FormControl component="fieldset" fullWidth>
            <FormLabel component="legend">
              <Typography variant="h6" gutterBottom>
                Selecionar Modelo de IA
              </Typography>
            </FormLabel>

            <RadioGroup
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
            >
              {modelOptions.map((option) => (
                <Box key={option.value} mb={2}>
                  <Paper 
                    elevation={selectedModel === option.value ? 3 : 1}
                    sx={{ 
                      p: 2, 
                      border: selectedModel === option.value ? `2px solid ${option.color}` : 'none',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <FormControlLabel
                      value={option.value}
                      control={<Radio color="primary" />}
                      label={
                        <Box>
                          <Box display="flex" alignItems="center" gap={1} mb={1}>
                            <Box sx={{ color: option.color }}>
                              {option.icon}
                            </Box>
                            <Typography variant="h6">
                              {option.label}
                            </Typography>
                          </Box>
                          
                          <Typography variant="body2" color="text.secondary" mb={2}>
                            {option.description}
                          </Typography>

                          <Box>
                            <Typography variant="subtitle2" color="primary" gutterBottom>
                              Benefícios:
                            </Typography>
                            {option.benefits.map((benefit, index) => (
                              <Typography key={index} variant="body2" component="li" sx={{ ml: 2 }}>
                                {benefit}
                              </Typography>
                            ))}
                          </Box>
                        </Box>
                      }
                    />
                  </Paper>
                </Box>
              ))}
            </RadioGroup>
          </FormControl>

          <Divider sx={{ my: 3 }} />

          {/* Botões de Ação */}
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="body2" color="text.secondary">
              ⚠️ Esta alteração afetará todos os agentes imediatamente
            </Typography>
            
            <Button
              variant="contained"
              onClick={handleUpdateConfig}
              disabled={updating || selectedModel === currentConfig?.value}
              startIcon={updating ? <CircularProgress size={20} /> : <PsychologyIcon />}
              size="large"
            >
              {updating ? 'Atualizando...' : 'Aplicar Configuração'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
