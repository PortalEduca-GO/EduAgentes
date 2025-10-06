'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  OutlinedInput,
  Alert,
  Fab,
  CircularProgress,
  LinearProgress,
  Backdrop
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Upload as UploadIcon,
  Link as LinkIcon,
  Description as DocumentIcon,
  CloudUpload as CloudUploadIcon,
  Approval as ApprovalIcon,
  Psychology as ProcessingIcon
} from '@mui/icons-material';
import api from '@/services/api';
import { useAuth } from '@/hooks/useAuth';

interface Knowledge {
  id: number;
  title: string;
  content?: string;
  knowledge_type: 'DOCUMENT' | 'LINK';
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED';
  url?: string;
  file_path?: string;
  file_type?: string;
  tags?: string;
  created_at: string;
  updated_at: string;
  expires_at?: string;
  approved_at?: string;
  rejection_reason?: string;
  author: {
    id: number;
    username: string;
    role: string;
  };
  approved_by?: {
    id: number;
    username: string;
  };
  agents: Array<{
    id: number;
    name: string;
  }>;
}

interface Agent {
  id: number;
  name: string;
  status: string;
}

const KnowledgeManagement: React.FC = () => {
  const { user } = useAuth();

  // Adicionar estilos CSS para animação
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse {
        0% {
          transform: scale(1);
          opacity: 1;
        }
        50% {
          transform: scale(1.1);
          opacity: 0.7;
        }
        100% {
          transform: scale(1);
          opacity: 1;
        }
      }
    `;
    document.head.appendChild(style);
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);

  const [knowledgeItems, setKnowledgeItems] = useState<Knowledge[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [ragProcessing, setRagProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Dialog states
  const [openDialog, setOpenDialog] = useState(false);
  const [editingKnowledge, setEditingKnowledge] = useState<Knowledge | null>(null);
  
  // Form states
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    knowledge_type: 'DOCUMENT' as 'DOCUMENT' | 'LINK',
    url: '',
    tags: '',
    expires_at: null as Date | null,
    agent_ids: [] as number[]
  });
  
  // File upload state for form
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [knowledgeResponse, agentsResponse] = await Promise.all([
        api.get('/knowledge'),
        api.get('/agents')
      ]);
      
      setKnowledgeItems(knowledgeResponse.data);
      setAgents(agentsResponse.data.filter((agent: Agent) => agent.status === 'APPROVED'));
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setError(null);
      setSuccess(null);

      // Validação básica
      if (!formData.title.trim()) {
        setError('O título é obrigatório');
        return;
      }

      if (formData.title.trim().length < 3) {
        setError('O título deve ter pelo menos 3 caracteres');
        return;
      }

      if (formData.title.trim().length > 500) {
        setError('O título deve ter no máximo 500 caracteres');
        return;
      }

      if (formData.knowledge_type === 'DOCUMENT' && selectedFile) {
        // Iniciar animação de processamento RAG
        setRagProcessing(true);
        setProcessingStep('📤 Enviando documento...');

        // Para documentos, fazer upload do arquivo
        const uploadFormData = new FormData();
        uploadFormData.append('file', selectedFile);
        uploadFormData.append('title', formData.title.trim());
        uploadFormData.append('agent_ids', formData.agent_ids.join(','));
        uploadFormData.append('tags', formData.tags.trim());

        console.log('Sending document upload:', {
          fileName: selectedFile.name,
          fileType: selectedFile.type,
          fileSize: selectedFile.size,
          title: formData.title.trim(),
          agent_ids: formData.agent_ids.join(','),
          tags: formData.tags.trim()
        });

        // Simular etapas do processamento
        setProcessingStep('📄 Extraindo conteúdo do documento...');
        await new Promise(resolve => setTimeout(resolve, 1000));

        setProcessingStep('🧠 Processando com IA...');
        await new Promise(resolve => setTimeout(resolve, 500));

        setProcessingStep('🔍 Gerando embeddings...');
        await new Promise(resolve => setTimeout(resolve, 800));

        setProcessingStep('💾 Salvando na base de conhecimento...');

        await api.post('/knowledge/upload', uploadFormData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        
        setProcessingStep('✅ Processamento concluído!');
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setSuccess('Documento processado e enviado com sucesso!');
      } else if (formData.knowledge_type === 'LINK') {
        // Validação para links
        if (!formData.url.trim()) {
          setError('A URL é obrigatória para conhecimento do tipo Link');
          return;
        }

        // Iniciar processamento para links
        setRagProcessing(true);
        setProcessingStep('🔗 Processando link...');

        const payload = {
          ...formData,
          title: formData.title.trim(),
          url: formData.url.trim(),
          tags: formData.tags.trim() || null,
          expires_at: formData.expires_at?.toISOString() || null
        };

        console.log('Sending link knowledge data:', payload);

        setProcessingStep('🌐 Extraindo conteúdo da URL...');
        await new Promise(resolve => setTimeout(resolve, 1000));

        setProcessingStep('🧠 Processando com IA...');
        await new Promise(resolve => setTimeout(resolve, 500));

        setProcessingStep('🔍 Gerando embeddings...');
        await new Promise(resolve => setTimeout(resolve, 800));

        setProcessingStep('💾 Salvando na base de conhecimento...');

        if (editingKnowledge) {
          await api.put(`/knowledge/${editingKnowledge.id}`, payload);
          setProcessingStep('✅ Conhecimento atualizado!');
          setSuccess('Conhecimento atualizado com sucesso!');
        } else {
          await api.post('/knowledge', payload);
          setProcessingStep('✅ Conhecimento criado!');
          setSuccess('Conhecimento criado com sucesso!');
        }
        
        await new Promise(resolve => setTimeout(resolve, 500));
      } else {
        setError('Selecione um arquivo para conhecimento do tipo Documento');
        return;
      }
      
      loadData();
      handleCloseDialog();
    } catch (err: any) {
      console.error('Erro completo:', err);
      console.error('Response data:', err.response?.data);
      console.error('Response status:', err.response?.status);
      
      let errorMessage = 'Erro ao salvar conhecimento';
      
      if (err.response?.data?.detail) {
        errorMessage = Array.isArray(err.response.data.detail) 
          ? err.response.data.detail.map((d: any) => d.msg || d).join(', ')
          : err.response.data.detail;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(`Erro ao salvar: ${errorMessage}`);
    } finally {
      setRagProcessing(false);
      setProcessingStep('');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este conhecimento?')) return;
    
    try {
      await api.delete(`/knowledge/${id}`);
      setSuccess('Conhecimento excluído com sucesso!');
      loadData();
    } catch (err) {
      console.error('Erro ao excluir:', err);
      setError('Erro ao excluir conhecimento');
    }
  };

  const handleOpenDialog = (knowledge?: Knowledge) => {
    if (knowledge) {
      setEditingKnowledge(knowledge);
      setFormData({
        title: knowledge.title,
        content: knowledge.content || '',
        knowledge_type: knowledge.knowledge_type,
        url: knowledge.url || '',
        tags: knowledge.tags || '',
        expires_at: knowledge.expires_at ? new Date(knowledge.expires_at) : null,
        agent_ids: knowledge.agents.map(a => a.id)
      });
    } else {
      setEditingKnowledge(null);
      setFormData({
        title: '',
        content: '',
        knowledge_type: 'DOCUMENT',
        url: '',
        tags: '',
        expires_at: null,
        agent_ids: []
      });
      setSelectedFile(null);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingKnowledge(null);
    setSelectedFile(null);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'DOCUMENT': return <DocumentIcon />;
      case 'LINK': return <LinkIcon />;
      default: return <DocumentIcon />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'DOCUMENT': return 'primary';
      case 'LINK': return 'secondary';
      default: return 'primary';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'success';
      case 'PENDING': return 'warning';
      case 'REJECTED': return 'error';
      case 'EXPIRED': return 'error';
      default: return 'default';
    }
  };

  if (loading) return <Typography>Carregando...</Typography>;

  return (
    <Box sx={{ p: 3 }}>
      {/* Backdrop com animação de processamento RAG */}
      <Backdrop
        sx={{
          color: '#fff',
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backdropFilter: 'blur(4px)',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
        }}
        open={ragProcessing}
      >
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            gap: 3,
            textAlign: 'center',
            maxWidth: 400,
            p: 4,
            borderRadius: 2,
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          }}
        >
          <ProcessingIcon sx={{ fontSize: 60, color: '#4caf50', animation: 'pulse 2s infinite' }} />
          
          <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold' }}>
            Processando com IA
          </Typography>
          
          <Box sx={{ width: '100%', position: 'relative' }}>
            <LinearProgress 
              sx={{ 
                height: 8, 
                borderRadius: 4,
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: '#4caf50',
                  borderRadius: 4,
                }
              }} 
            />
          </Box>
          
          <Typography 
            variant="body1" 
            sx={{ 
              fontSize: '1.1rem',
              minHeight: '1.5em',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            {processingStep}
          </Typography>
          
          <Typography variant="body2" sx={{ opacity: 0.8, fontStyle: 'italic' }}>
            Este processo pode levar alguns segundos...
          </Typography>
        </Box>
      </Backdrop>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Base de Conhecimento
        </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            {user?.role === 'MASTER_ADMIN' && (
              <Button
                variant="outlined"
                startIcon={<ApprovalIcon />}
                onClick={() => window.location.href = '/admin/knowledge/approval'}
              >
                Fila de Aprovação
              </Button>
            )}
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
            >
              Novo Conhecimento
            </Button>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Título</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Autor</TableCell>
                <TableCell>Data Criação</TableCell>
                <TableCell>Agentes</TableCell>
                <TableCell>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {knowledgeItems.map((knowledge) => (
                <TableRow key={knowledge.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getTypeIcon(knowledge.knowledge_type)}
                      {knowledge.title}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={knowledge.knowledge_type}
                      color={getTypeColor(knowledge.knowledge_type) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={knowledge.status}
                      color={getStatusColor(knowledge.status) as any}
                      size="small"
                    />
                    {knowledge.status === 'REJECTED' && knowledge.rejection_reason && (
                      <Typography variant="caption" color="error" display="block">
                        {knowledge.rejection_reason}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2">{knowledge.author.username}</Typography>
                      <Typography variant="caption" color="textSecondary">
                        {knowledge.author.role}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2">
                        {new Date(knowledge.created_at).toLocaleDateString('pt-BR')}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {new Date(knowledge.created_at).toLocaleTimeString('pt-BR')}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    {knowledge.agents.map(agent => (
                      <Chip key={agent.id} label={agent.name} size="small" sx={{ mr: 0.5 }} />
                    ))}
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleOpenDialog(knowledge)} size="small">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(knowledge.id)} size="small">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Dialog para criar/editar conhecimento */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle>
            {editingKnowledge ? 'Editar Conhecimento' : 'Novo Conhecimento'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField
                label="Título"
                fullWidth
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />

              <FormControl fullWidth>
                <InputLabel>Tipo</InputLabel>
                <Select
                  value={formData.knowledge_type}
                  onChange={(e) => setFormData({ ...formData, knowledge_type: e.target.value as any })}
                >
                  <MenuItem value="DOCUMENT">Documento</MenuItem>
                  <MenuItem value="LINK">Link</MenuItem>
                </Select>
              </FormControl>

              {formData.knowledge_type === 'LINK' && (
                <TextField
                  label="URL"
                  fullWidth
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                />
              )}

              {formData.knowledge_type === 'DOCUMENT' && (
                <Box>
                  <Box sx={{ mb: 2 }}>
                    <Button
                      variant="outlined"
                      component="label"
                      startIcon={<CloudUploadIcon />}
                      fullWidth
                      sx={{ p: 2, borderStyle: 'dashed' }}
                    >
                      {selectedFile ? selectedFile.name : 'Selecionar Documento'}
                      <input
                        type="file"
                        hidden
                        accept=".pdf,.doc,.docx,.txt"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            // Validar tamanho do arquivo (10MB)
                            if (file.size > 10 * 1024 * 1024) {
                              setError('Arquivo muito grande. Máximo permitido: 10MB');
                              return;
                            }
                            
                            // Validar tipo de arquivo
                            const allowedTypes = [
                              'application/pdf',
                              'text/plain',
                              'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                              'application/msword'
                            ];
                            
                            if (!allowedTypes.includes(file.type)) {
                              setError('Tipo de arquivo não permitido. Use PDF, DOC, DOCX ou TXT');
                              return;
                            }
                            
                            setSelectedFile(file);
                            // Auto-definir o título baseado no nome do arquivo se estiver vazio
                            if (!formData.title) {
                              setFormData({ 
                                ...formData, 
                                title: file.name.replace(/\.[^/.]+$/, "") 
                              });
                            }
                          }
                        }}
                      />
                    </Button>
                  </Box>
                  
                  {selectedFile && (
                    <Alert severity="success" sx={{ mb: 2 }}>
                      <Typography variant="body2">
                        Arquivo selecionado: <strong>{selectedFile.name}</strong>
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Tamanho: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </Typography>
                    </Alert>
                  )}
                  
                  <Typography variant="body2" color="textSecondary">
                    Formatos aceitos: PDF, DOC, DOCX, TXT (máx. 10MB)
                  </Typography>
                </Box>
              )}

              <FormControl fullWidth>
                <InputLabel>Agentes com Acesso</InputLabel>
                <Select
                  multiple
                  value={formData.agent_ids}
                  onChange={(e) => setFormData({ ...formData, agent_ids: e.target.value as number[] })}
                  input={<OutlinedInput label="Agentes com Acesso" />}
                  renderValue={(selected) => {
                    if (!selected.length) return 'Nenhum agente selecionado';
                    const selectedAgents = agents?.filter(a => selected.includes(a.id)) || [];
                    return selectedAgents.map(a => a.name).join(', ');
                  }}
                >
                  {agents && agents.length > 0 ? (
                    agents.map((agent) => (
                      <MenuItem key={agent.id} value={agent.id}>
                        <Checkbox checked={formData.agent_ids.includes(agent.id)} />
                        <ListItemText primary={agent.name} />
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled value="">
                      <ListItemText primary="Nenhum agente disponível" />
                    </MenuItem>
                  )}
                </Select>
              </FormControl>

              <TextField
                label="Tags (separadas por vírgula)"
                fullWidth
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              />

              <TextField
                label="Data de Expiração (opcional)"
                type="datetime-local"
                fullWidth
                value={formData.expires_at ? formData.expires_at.toISOString().slice(0, 16) : ''}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  expires_at: e.target.value ? new Date(e.target.value) : null 
                })}
                InputLabelProps={{ shrink: true }}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancelar</Button>
            <Button
              onClick={handleSave}
              variant="contained"
              disabled={
                ragProcessing ||
                !formData.title || 
                (formData.knowledge_type === 'DOCUMENT' && !selectedFile && !editingKnowledge) ||
                (formData.knowledge_type === 'LINK' && !formData.url)
              }
              startIcon={ragProcessing ? <CircularProgress size={20} color="inherit" /> : undefined}
            >
              {ragProcessing 
                ? 'Processando...' 
                : (editingKnowledge ? 'Atualizar' : 'Criar')
              }
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  };

  export default KnowledgeManagement;
