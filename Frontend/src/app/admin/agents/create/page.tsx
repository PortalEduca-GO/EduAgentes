'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Avatar,
  Divider,
  Chip,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  SmartToy as BotIcon,
  Psychology as PsychologyIcon,
  Settings as SettingsIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { CreateAgentRequest } from '../../../../types';
import api from '../../../../services/api';

const steps = [
  {
    label: 'Informações Básicas',
    description: 'Nome e descrição do agente',
    icon: <BotIcon />,
  },
  {
    label: 'Personalização',
    description: 'Prompt do sistema e comportamento',
    icon: <PsychologyIcon />,
  },
  {
    label: 'Configurações',
    description: 'Configurações avançadas',
    icon: <SettingsIcon />,
  },
];

export default function CreateAgentPage() {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState<CreateAgentRequest>({
    name: '',
    description: '',
    system_prompt: 'Você é um assistente prestativo e inteligente. Responda sempre de forma clara, precisa e educada.',
  });

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

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 0:
        if (!formData.name.trim()) {
          setError('Nome do agente é obrigatório');
          return false;
        }
        if (formData.name.length < 3) {
          setError('Nome deve ter pelo menos 3 caracteres');
          return false;
        }
        if (!formData.description.trim()) {
          setError('Descrição é obrigatória');
          return false;
        }
        if (formData.description.length < 10) {
          setError('Descrição deve ter pelo menos 10 caracteres');
          return false;
        }
        return true;
      case 1:
        if (!formData.system_prompt?.trim()) {
          setError('Prompt do sistema é obrigatório');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(activeStep)) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.post('/agents', formData);
      
      setSuccess(`Agente "${formData.name}" criado com sucesso!`);
      
      // Redirecionar após 2 segundos
      setTimeout(() => {
        router.push(`/agents/${response.data.id}`);
      }, 2000);
      
    } catch (err: any) {
      console.error('Erro ao criar agente:', err);
      
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

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Nome do Agente"
              value={formData.name}
              onChange={handleInputChange('name')}
              placeholder="Ex: Assistente de Vendas"
              disabled={loading}
              sx={{ mb: 3 }}
              helperText="Escolha um nome descritivo e único para seu agente"
            />
            
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Descrição"
              value={formData.description}
              onChange={handleInputChange('description')}
              placeholder="Descreva o que seu agente faz e como pode ajudar..."
              disabled={loading}
              helperText="Explique o propósito e funcionalidades do agente"
            />
          </Box>
        );
      
      case 1:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              O prompt do sistema define como seu agente se comporta e responde. Seja específico sobre:
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Chip label="Personalidade" size="small" sx={{ mr: 1, mb: 1 }} />
              <Chip label="Especialização" size="small" sx={{ mr: 1, mb: 1 }} />
              <Chip label="Tom de voz" size="small" sx={{ mr: 1, mb: 1 }} />
              <Chip label="Limitações" size="small" sx={{ mr: 1, mb: 1 }} />
            </Box>
            
            <TextField
              fullWidth
              multiline
              rows={8}
              label="Prompt do Sistema"
              value={formData.system_prompt}
              onChange={handleInputChange('system_prompt')}
              disabled={loading}
              helperText="Define como o agente se comporta e responde às perguntas"
              placeholder="Você é um assistente especializado em... Sempre responda de forma..."
            />
          </Box>
        );
      
      case 2:
        return (
          <Box sx={{ mt: 2 }}>
            <Card elevation={1} sx={{ mb: 3, borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Resumo do Agente
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Nome:
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {formData.name}
                  </Typography>
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Descrição:
                  </Typography>
                  <Typography variant="body2">
                    {formData.description}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Prompt do Sistema:
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      maxHeight: 100, 
                      overflow: 'auto',
                      p: 1,
                      bgcolor: 'grey.50',
                      borderRadius: 1,
                      fontFamily: 'monospace',
                      fontSize: '0.875rem',
                    }}
                  >
                    {formData.system_prompt}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
            
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              Após a criação, seu agente ficará com status "Pendente" até ser aprovado por um administrador.
            </Alert>
          </Box>
        );
      
      default:
        return 'Passo desconhecido';
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.back()}
          sx={{ mb: 2, textTransform: 'none' }}
        >
          Voltar
        </Button>
        
        <Box display="flex" alignItems="center" sx={{ mb: 2 }}>
          <Avatar 
            sx={{ 
              mr: 2, 
              bgcolor: 'primary.main',
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
            }}
          >
            <BotIcon />
          </Avatar>
          <Box>
            <Typography variant="h4" fontWeight="bold">
              Criar Novo Agente
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Configure seu assistente de IA personalizado
            </Typography>
          </Box>
        </Box>
      </Box>

      <Paper elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Box sx={{ p: 4 }}>
          {(error || success) && (
            <Box sx={{ mb: 3 }}>
              {error && (
                <Alert severity="error" sx={{ borderRadius: 2, mb: 2 }}>
                  {error}
                </Alert>
              )}
              {success && (
                <Alert severity="success" sx={{ borderRadius: 2 }}>
                  {success}
                </Alert>
              )}
            </Box>
          )}

          <Stepper activeStep={activeStep} orientation="vertical">
            {steps.map((step, index) => (
              <Step key={step.label}>
                <StepLabel
                  icon={
                    <Avatar 
                      sx={{ 
                        width: 32, 
                        height: 32,
                        bgcolor: activeStep >= index ? 'primary.main' : 'grey.300',
                      }}
                    >
                      {step.icon}
                    </Avatar>
                  }
                >
                  <Typography variant="h6" fontWeight="bold">
                    {step.label}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {step.description}
                  </Typography>
                </StepLabel>
                
                <StepContent>
                  {renderStepContent(index)}
                  
                  <Box sx={{ mt: 3 }}>
                    <Box display="flex" gap={2}>
                      {activeStep === steps.length - 1 ? (
                        <Button
                          variant="contained"
                          onClick={handleSubmit}
                          disabled={loading}
                          startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                          sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            px: 3,
                            background: 'linear-gradient(45deg, #4CAF50 30%, #8BC34A 90%)',
                            '&:hover': {
                              background: 'linear-gradient(45deg, #388E3C 30%, #689F38 90%)',
                            },
                          }}
                        >
                          {loading ? 'Criando...' : 'Criar Agente'}
                        </Button>
                      ) : (
                        <Button
                          variant="contained"
                          onClick={handleNext}
                          disabled={loading}
                          sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            px: 3,
                          }}
                        >
                          Próximo
                        </Button>
                      )}
                      
                      {activeStep > 0 && (
                        <Button
                          onClick={handleBack}
                          disabled={loading}
                          sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            px: 3,
                          }}
                        >
                          Voltar
                        </Button>
                      )}
                    </Box>
                  </Box>
                </StepContent>
              </Step>
            ))}
          </Stepper>
        </Box>
      </Paper>
    </Container>
  );
}
