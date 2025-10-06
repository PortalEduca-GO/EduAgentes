'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Box,
  Alert,
  CircularProgress,
  Chip,
  Button,
  Paper,
  Avatar,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
} from '@mui/material';
import { 
  SmartToy, 
  ArrowBack, 
  Edit,
  PhotoCamera,
  Psychology,
  Save,
  Cancel,
  LibraryBooks,
} from '@mui/icons-material';
import AuthGuard from '../../../../components/auth/AuthGuard';
import { Agent } from '../../../../types';
import api, { getImageUrl } from '../../../../services/api';

const AgentManagementPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const agentId = params.agentId as string;
  
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    system_prompt: '',
    expertise: [] as string[],
    status: 'PENDING' as Agent['status']
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchAgent = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await api.get<Agent>(`/agents/${agentId}`);
      setAgent(response.data);
      
      // Initialize edit form
      setEditForm({
        name: response.data.name,
        description: response.data.description,
        system_prompt: response.data.system_prompt || '',
        expertise: response.data.expertise || [],
        status: response.data.status
      });
    } catch (err: any) {
      console.error('Erro ao buscar agente:', err);
      setError(
        err.response?.data?.detail || 
        'Erro ao carregar dados do agente'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (agentId) {
      fetchAgent();
    }
  }, [agentId]);

  const handleBack = () => {
    router.push('/admin');
  };

  const handleEditOpen = () => {
    setEditDialogOpen(true);
  };

  const handleEditClose = () => {
    setEditDialogOpen(false);
    setLogoFile(null);
  };

  const handleSaveAgent = async () => {
    if (!agent) return;

    try {
      setSaving(true);
      
      // Upload logo if new file selected
      let logoUrl = agent.logo_url;
      if (logoFile) {
        const formData = new FormData();
        formData.append('file', logoFile);
        
        const logoResponse = await api.post(`/agents/${agentId}/logo`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        logoUrl = logoResponse.data.logo_url;
      }

      // Update agent data
      const updateData = {
        ...editForm,
        logo_url: logoUrl
      };

      await api.put(`/agents/${agentId}`, updateData);
      
      // Refresh agent data
      await fetchAgent();
      setEditDialogOpen(false);
      setLogoFile(null);
    } catch (err: any) {
      console.error('Erro ao salvar agente:', err);
      setError(err.response?.data?.detail || 'Erro ao salvar agente');
    } finally {
      setSaving(false);
    }
  };

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setLogoFile(file);
    }
  };

  const handleExpertiseChange = (value: string) => {
    const expertiseArray = value.split(',').map(item => item.trim()).filter(Boolean);
    setEditForm(prev => ({ ...prev, expertise: expertiseArray }));
  };

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

  if (loading) {
    return (
      <AuthGuard requiredRole="ADMIN">
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
            <CircularProgress />
          </Box>
        </Container>
      </AuthGuard>
    );
  }

  if (error || !agent) {
    return (
      <AuthGuard requiredRole="ADMIN">
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={handleBack}
            sx={{ mb: 2 }}
          >
            Voltar para Admin
          </Button>
          <Alert severity="error">
            {error || 'Agente não encontrado'}
          </Alert>
        </Container>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard requiredRole="ADMIN">
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={handleBack}
            sx={{ mb: 2 }}
          >
            Voltar para Admin
          </Button>
          
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 3 }}>
                <Avatar
                  src={getImageUrl(agent.logo_url)}
                  sx={{ 
                    width: 80, 
                    height: 80, 
                    mr: 3,
                    bgcolor: 'primary.main'
                  }}
                >
                  <SmartToy sx={{ fontSize: 40 }} />
                </Avatar>
                
                <Box sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h4" component="h1">
                      {agent.name}
                    </Typography>
                    <Button
                      startIcon={<Edit />}
                      variant="outlined"
                      onClick={handleEditOpen}
                    >
                      Editar
                    </Button>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Chip 
                      label={getStatusText(agent.status)} 
                      color={getStatusColor(agent.status) as any}
                      variant="filled"
                    />
                    <Typography variant="body2" color="text.secondary">
                      ID: {agent.id}
                    </Typography>
                  </Box>

                  {/* Expertise Tags */}
                  {agent.expertise && agent.expertise.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Áreas de Expertise:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {agent.expertise.map((skill, index) => (
                          <Chip
                            key={index}
                            label={skill}
                            size="small"
                            variant="outlined"
                            color="primary"
                          />
                        ))}
                      </Box>
                    </Box>
                  )}

                  {/* Status da Base de Conhecimento */}
                  <Box sx={{ mb: 2 }}>
                    <Paper sx={{ p: 2, textAlign: 'center', backgroundColor: 'primary.light', color: 'white' }}>
                      <Typography variant="h6">
                        📚 Base de Conhecimento Centralizada
                      </Typography>
                      <Typography variant="body2">
                        Gerenciamento unificado ativo
                      </Typography>
                    </Paper>
                  </Box>
                </Box>
              </Box>
              
              <Typography variant="body1" paragraph>
                {agent.description}
              </Typography>
              
              {agent.system_prompt && (
                <Paper sx={{ p: 2, backgroundColor: 'grey.50' }}>
                  <Typography variant="subtitle2" gutterBottom>
                    <Psychology sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Prompt do Sistema:
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
                    {agent.system_prompt}
                  </Typography>
                </Paper>
              )}
            </CardContent>
          </Card>
        </Box>

        {/* Edit Dialog */}
        <Dialog 
          open={editDialogOpen} 
          onClose={handleEditClose}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Edit sx={{ mr: 1 }} />
              Editar Agente
            </Box>
          </DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 1 }}>
              {/* Logo Upload */}
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Logo do Agente
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar
                    src={logoFile ? URL.createObjectURL(logoFile) : getImageUrl(agent.logo_url)}
                    sx={{ width: 60, height: 60 }}
                  >
                    <SmartToy />
                  </Avatar>
                  <Button
                    component="label"
                    variant="outlined"
                    startIcon={<PhotoCamera />}
                  >
                    Alterar Logo
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleLogoChange}
                    />
                  </Button>
                </Box>
              </Box>

              <TextField
                label="Nome"
                value={editForm.name}
                onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                fullWidth
                required
              />

              <TextField
                label="Descrição"
                value={editForm.description}
                onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                multiline
                rows={3}
                fullWidth
                required
              />

              <TextField
                label="Áreas de Expertise (separadas por vírgula)"
                value={editForm.expertise.join(', ')}
                onChange={(e) => handleExpertiseChange(e.target.value)}
                fullWidth
                placeholder="Machine Learning, Data Science, Python"
              />

              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={editForm.status}
                  label="Status"
                  onChange={(e) => setEditForm(prev => ({ 
                    ...prev, 
                    status: e.target.value as Agent['status'] 
                  }))}
                >
                  <MenuItem value="PENDING">Pendente</MenuItem>
                  <MenuItem value="APPROVED">Aprovado</MenuItem>
                  <MenuItem value="REJECTED">Rejeitado</MenuItem>
                </Select>
              </FormControl>

              <TextField
                label="Prompt do Sistema"
                value={editForm.system_prompt}
                onChange={(e) => setEditForm(prev => ({ ...prev, system_prompt: e.target.value }))}
                multiline
                rows={6}
                fullWidth
                placeholder="Você é um assistente especializado em..."
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleEditClose}>
              <Cancel sx={{ mr: 1 }} />
              Cancelar
            </Button>
            <Button 
              onClick={handleSaveAgent}
              variant="contained"
              disabled={saving || !editForm.name || !editForm.description}
            >
              {saving ? <CircularProgress size={20} sx={{ mr: 1 }} /> : <Save sx={{ mr: 1 }} />}
              Salvar
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </AuthGuard>
  );
};

export default AgentManagementPage;
