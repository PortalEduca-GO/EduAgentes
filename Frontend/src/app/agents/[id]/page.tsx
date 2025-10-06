'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  TextField,
  Button,
  Alert,
  Avatar,
  Chip,
  Container,
  Paper,
  IconButton,
  Tooltip,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
} from '@mui/material';
import { 
  Settings,
  Description,
  Link as LinkIcon,
  PhotoCamera,
  Save,
  ArrowBack,
  Delete,
  CloudUpload,
} from '@mui/icons-material';
import { useAuth } from '../../../hooks/useAuth';
import AuthGuard from '../../../components/auth/AuthGuard';
import Navbar from '../../../components/layout/Navbar';
import api, { getImageUrl } from '../../../services/api';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`agent-tabpanel-${index}`}
      aria-labelledby={`agent-tab-${index}`}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `agent-tab-${index}`,
    'aria-controls': `agent-tabpanel-${index}`,
  };
}

interface Agent {
  id: number;
  name: string;
  description: string;
  system_prompt: string;
  status: string;
  logo_url?: string;
  creator_id: number;
  creator_name: string;
  created_at: string;
  updated_at: string;
}

interface Document {
  id: number;
  agent_id: number;
  filename: string;
  file_path: string;
  uploaded_at: string;
}

interface Link {
  id: number;
  agent_id: number;
  url: string;
  title: string;
  description?: string;
  added_at: string;
}

const AgentEditPage: React.FC = () => {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const [agent, setAgent] = useState<Agent | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tabValue, setTabValue] = useState(0);
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    system_prompt: '',
    status: 'PENDING',
  });
  
  // Logo upload
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  
  // Document upload
  const [uploading, setUploading] = useState(false);
  
  // Link form
  const [linkForm, setLinkForm] = useState({
    url: '',
    title: '',
    description: '',
  });
  const [addingLink, setAddingLink] = useState(false);

  const fetchAgent = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/agents/${id}`);
      const agentData = response.data;
      
      setAgent(agentData);
      setFormData({
        name: agentData.name,
        description: agentData.description,
        system_prompt: agentData.system_prompt,
        status: agentData.status,
      });
      
      if (agentData.logo_url) {
        console.log('Setting logo preview to:', agentData.logo_url);
        setLogoPreview(getImageUrl(agentData.logo_url) || '');
      } else {
        console.log('No logo URL found for agent');
        setLogoPreview('');
      }
      
      setError('');
    } catch (error: any) {
      console.error('Erro ao buscar agente:', error);
      setError('Erro ao carregar dados do agente');
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async () => {
    try {
      const response = await api.get(`/agents/${id}/documents`);
      setDocuments(response.data);
    } catch (error: any) {
      console.error('Erro ao buscar documentos:', error);
    }
  };

  const fetchLinks = async () => {
    try {
      const response = await api.get(`/agents/${id}/links`);
      setLinks(response.data);
    } catch (error: any) {
      console.error('Erro ao buscar links:', error);
    }
  };

  useEffect(() => {
    if (id) {
      fetchAgent();
      fetchDocuments();
      fetchLinks();
    }
  }, [id]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Prepare update data
      const updateData: any = {
        name: formData.name,
        description: formData.description,
        system_prompt: formData.system_prompt,
      };
      
      // Only include status if user can approve agents
      const canApprove = user?.role === 'MASTER_ADMIN';
      if (canApprove) {
        updateData.status = formData.status;
      }
      
      // Update agent basic info
      await api.patch(`/agents/${id}`, updateData);
      
      // Upload logo if changed
      if (logoFile) {
        console.log('Uploading logo file:', logoFile.name, logoFile.type, logoFile.size);
        const logoFormData = new FormData();
        logoFormData.append('file', logoFile);
        
        try {
          const logoResponse = await api.post(`/agents/${id}/logo`, logoFormData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
          console.log('Logo upload response:', logoResponse.data);
        } catch (logoError: any) {
          console.error('Logo upload error:', logoError);
          console.error('Logo error response:', logoError.response?.data);
          throw logoError; // Re-throw to be caught by outer catch
        }
      }
      
      setSuccess('Agente atualizado com sucesso!');
      setError('');
      setLogoFile(null); // Clear logo file after successful upload
      fetchAgent(); // Refresh data
      
    } catch (error: any) {
      console.error('Erro ao salvar agente:', error);
      setError(error.response?.data?.detail || 'Erro ao salvar alterações');
      setSuccess('');
    } finally {
      setSaving(false);
    }
  };

  const handleDocumentUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      
      await api.post(`/agents/${id}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setSuccess('Documento enviado com sucesso!');
      fetchDocuments(); // Refresh documents
      
    } catch (error: any) {
      console.error('Erro ao enviar documento:', error);
      setError(error.response?.data?.detail || 'Erro ao enviar documento');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDocument = async (docId: number) => {
    if (!confirm('Tem certeza que deseja excluir este documento?')) return;

    try {
      await api.delete(`/documents/${docId}`);
      setSuccess('Documento excluído com sucesso!');
      fetchDocuments(); // Refresh documents
    } catch (error: any) {
      console.error('Erro ao excluir documento:', error);
      setError(error.response?.data?.detail || 'Erro ao excluir documento');
    }
  };

  const handleAddLink = async () => {
    if (!linkForm.url.trim() || !linkForm.title.trim()) {
      setError('URL e título são obrigatórios');
      return;
    }

    try {
      setAddingLink(true);
      await api.post(`/agents/${id}/links`, linkForm);
      
      setSuccess('Link adicionado com sucesso!');
      setLinkForm({ url: '', title: '', description: '' });
      fetchLinks(); // Refresh links
      
    } catch (error: any) {
      console.error('Erro ao adicionar link:', error);
      setError(error.response?.data?.detail || 'Erro ao adicionar link');
    } finally {
      setAddingLink(false);
    }
  };

  const handleDeleteLink = async (linkId: number) => {
    if (!confirm('Tem certeza que deseja excluir este link?')) return;

    try {
      await api.delete(`/links/${linkId}`);
      setSuccess('Link excluído com sucesso!');
      fetchLinks(); // Refresh links
    } catch (error: any) {
      console.error('Erro ao excluir link:', error);
      setError(error.response?.data?.detail || 'Erro ao excluir link');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'success';
      case 'REJECTED': return 'error';
      case 'PENDING': return 'warning';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'Aprovado';
      case 'REJECTED': return 'Rejeitado';
      case 'PENDING': return 'Pendente';
      default: return status;
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
            <CircularProgress size={60} />
          </Box>
        </Container>
      </>
    );
  }

  if (!agent) {
    return (
      <>
        <Navbar />
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Alert severity="error">
            Agente não encontrado
          </Alert>
        </Container>
      </>
    );
  }

  const canApprove = user?.role === 'MASTER_ADMIN';
  const canEdit = agent.creator_id === user?.id || canApprove;

  if (!canEdit) {
    return (
      <>
        <Navbar />
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Alert severity="error">
            Você não tem permissão para editar este agente
          </Alert>
        </Container>
      </>
    );
  }

  return (
    <AuthGuard requiredRole="ADMIN">
      <Navbar />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton onClick={() => router.back()} sx={{ mr: 2 }}>
              <ArrowBack />
            </IconButton>
            <Avatar 
              src={logoPreview} 
              sx={{ bgcolor: 'primary.main', mr: 2, width: 56, height: 56 }}
            >
              {agent.name.charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="h4" gutterBottom>
                {agent.name}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip 
                  label={getStatusLabel(agent.status)}
                  color={getStatusColor(agent.status)} 
                  size="small"
                />
                <Typography variant="body2" color="text.secondary">
                  Criado por {agent.creator_name}
                </Typography>
              </Box>
            </Box>
          </Box>
          
          <Button
            variant="contained"
            startIcon={saving ? <CircularProgress size={20} /> : <Save />}
            onClick={handleSave}
            disabled={saving}
            size="large"
          >
            {saving ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </Box>

        {/* Alerts */}
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

        {/* Tabs */}
        <Paper elevation={1}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange} 
              aria-label="agent edit tabs"
              variant="fullWidth"
            >
              <Tab 
                icon={<Settings />} 
                label="Configurações" 
                iconPosition="start"
                {...a11yProps(0)} 
                sx={{ minHeight: 64 }}
              />
            </Tabs>
          </Box>

          {/* Tab: Configurações */}
          <TabPanel value={tabValue} index={0}>
            <Box sx={{ display: 'grid', gap: 3 }}>
              {/* Logo Upload */}
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Logo do Agente
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar 
                      src={logoPreview} 
                      sx={{ width: 100, height: 100 }}
                    >
                      {agent.name.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box>
                      <input
                        accept="image/*"
                        style={{ display: 'none' }}
                        id="logo-upload"
                        type="file"
                        onChange={handleLogoChange}
                      />
                      <label htmlFor="logo-upload">
                        <Button
                          component="span"
                          variant="outlined"
                          startIcon={<PhotoCamera />}
                        >
                          Alterar Logo
                        </Button>
                      </label>
                      <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary' }}>
                        Formatos aceitos: JPG, PNG. Tamanho máximo: 5MB
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>

              {/* Basic Info */}
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Informações Básicas
                  </Typography>
                  <Box sx={{ display: 'grid', gap: 3 }}>
                    <TextField
                      fullWidth
                      label="Nome do Agente"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      required
                    />
                    
                    <TextField
                      fullWidth
                      label="Descrição"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      multiline
                      rows={3}
                      required
                    />
                    
                    {canApprove && (
                      <FormControl fullWidth>
                        <InputLabel>Status</InputLabel>
                        <Select
                          value={formData.status}
                          label="Status"
                          onChange={(e) => handleInputChange('status', e.target.value)}
                        >
                          <MenuItem value="PENDING">Pendente</MenuItem>
                          <MenuItem value="APPROVED">Aprovado</MenuItem>
                          <MenuItem value="REJECTED">Rejeitado</MenuItem>
                        </Select>
                      </FormControl>
                    )}
                  </Box>
                </CardContent>
              </Card>

              {/* System Prompt */}
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Prompt do Sistema
                  </Typography>
                  <TextField
                    fullWidth
                    label="Instruções para o agente de IA"
                    value={formData.system_prompt}
                    onChange={(e) => handleInputChange('system_prompt', e.target.value)}
                    multiline
                    rows={8}
                    placeholder="Defina o comportamento e as instruções para o agente de IA..."
                    required
                  />
                </CardContent>
              </Card>
            </Box>
          </TabPanel>
        </Paper>
      </Container>
    </AuthGuard>
  );
};

export default AgentEditPage;
