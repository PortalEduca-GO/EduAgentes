'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Alert,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
} from '@mui/material';
import { CloudUpload, PictureAsPdf, Delete } from '@mui/icons-material';
import api from '../../services/api';

interface FileUploaderProps {
  agentId: string;
  agentName: string;
  onUploadSuccess?: () => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ 
  agentId, 
  agentName, 
  onUploadSuccess 
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const pdfFiles = Array.from(files).filter(file => file.type === 'application/pdf');
      setSelectedFiles(pdfFiles);
      setError('');
      setSuccess('');
      
      if (pdfFiles.length !== files.length) {
        setError('Apenas arquivos PDF são aceitos');
      }
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      setError('Selecione pelo menos um arquivo PDF');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess('');
    setUploadProgress(0);

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const formData = new FormData();
        formData.append('file', file);

        await api.post(`/agents/${agentId}/upload`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const fileProgress = (progressEvent.loaded / progressEvent.total) * 100;
              const totalProgress = ((i * 100) + fileProgress) / selectedFiles.length;
              setUploadProgress(totalProgress);
            }
          },
        });
      }

      setSuccess(`${selectedFiles.length} arquivo(s) enviado(s) com sucesso!`);
      setSelectedFiles([]);
      setUploadProgress(100);
      
      if (onUploadSuccess) {
        onUploadSuccess();
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Erro ao enviar arquivo(s)');
      console.error('Erro no upload:', error);
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 2000);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Upload de Documentos - {agentName}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Envie arquivos PDF para enriquecer a base de conhecimento do agente.
        </Typography>

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 2 }}>
          <input
            accept=".pdf"
            style={{ display: 'none' }}
            id="file-upload"
            multiple
            type="file"
            onChange={handleFileSelect}
            disabled={uploading}
          />
          <label htmlFor="file-upload">
            <Button
              variant="outlined"
              component="span"
              startIcon={<CloudUpload />}
              disabled={uploading}
              fullWidth
            >
              Selecionar Arquivos PDF
            </Button>
          </label>
        </Box>

        {selectedFiles.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Arquivos Selecionados:
            </Typography>
            <List dense>
              {selectedFiles.map((file, index) => (
                <ListItem
                  key={index}
                  secondaryAction={
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => removeFile(index)}
                      disabled={uploading}
                    >
                      <Delete />
                    </IconButton>
                  }
                >
                  <ListItemIcon>
                    <PictureAsPdf color="error" />
                  </ListItemIcon>
                  <ListItemText
                    primary={file.name}
                    secondary={formatFileSize(file.size)}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {uploading && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Enviando arquivos... {Math.round(uploadProgress)}%
            </Typography>
            <LinearProgress variant="determinate" value={uploadProgress} />
          </Box>
        )}

        <Button
          variant="contained"
          onClick={handleUpload}
          disabled={selectedFiles.length === 0 || uploading}
          startIcon={<CloudUpload />}
          fullWidth
        >
          {uploading ? 'Enviando...' : 'Enviar Arquivos'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default FileUploader;
