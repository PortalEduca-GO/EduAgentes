// src/app/chat/[agentId]/page.tsx

'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Typography,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  AppBar,
  Toolbar,
  Button,
} from '@mui/material';
import { Send as SendIcon, ArrowBack } from '@mui/icons-material';
import { useRouter, useParams } from 'next/navigation';
import api from '../../../services/api';

interface Message {
  sender: 'user' | 'agent';
  text: string;
  timestamp: Date;
}

const ChatPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const agentId = params.agentId as string;
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [agentName, setAgentName] = useState('');
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll para a última mensagem
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Buscar informações do agente ao carregar a página
  useEffect(() => {
    const fetchAgentInfo = async () => {
      try {
        const response = await api.get(`/agents/${agentId}`);
        setAgentName(response.data.name);
        
        // Adicionar mensagem de boas-vindas
        setMessages([
          {
            sender: 'agent',
            text: `Olá! Eu sou o ${response.data.name}. Como posso ajudá-lo hoje?`,
            timestamp: new Date(),
          },
        ]);
      } catch (error) {
        console.error('Erro ao buscar informações do agente:', error);
        setAgentName('Agente');
      }
    };

    if (agentId) {
      fetchAgentInfo();
    }
  }, [agentId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      sender: 'user',
      text: input.trim(),
      timestamp: new Date(),
    };

    // Adicionar mensagem do usuário
    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input.trim();
    setInput('');
    setIsLoading(true);

    try {
      // Fazer chamada para a API
      const response = await api.post(`/agents/${agentId}/ask`, {
        prompt: currentInput,
      });

      const agentMessage: Message = {
        sender: 'agent',
        text: response.data.response,
        timestamp: new Date(),
      };

      // Adicionar resposta do agente
      setMessages((prev) => [...prev, agentMessage]);
    } catch (error: any) {
      console.error('Erro ao enviar mensagem:', error);
      
      const errorMessage: Message = {
        sender: 'agent',
        text: 'Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handler para Enter no TextField
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !isLoading) {
        handleSendMessage(e as any);
      }
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <AppBar position="static" elevation={1}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => router.push('/dashboard')}
            sx={{ mr: 2 }}
          >
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Chat com {agentName}
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Área de mensagens */}
      <Box sx={{ flexGrow: 1, overflow: 'hidden', display: 'flex' }}>
        <Paper
          sx={{
            flex: 1,
            margin: 2,
            padding: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              flexGrow: 1,
              overflowY: 'auto',
              padding: 1,
            }}
          >
            <List sx={{ padding: 0 }}>
              {messages.map((message, index) => (
                <ListItem
                  key={index}
                  sx={{
                    display: 'flex',
                    justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                    padding: '8px 0',
                  }}
                >
                  <Paper
                    sx={{
                      padding: 2,
                      maxWidth: '70%',
                      backgroundColor: message.sender === 'user' ? 'primary.main' : 'grey.100',
                      color: message.sender === 'user' ? 'white' : 'text.primary',
                      borderRadius: message.sender === 'user' 
                        ? '18px 18px 4px 18px' 
                        : '18px 18px 18px 4px',
                    }}
                  >
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                      {message.text}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        display: 'block',
                        textAlign: 'right',
                        mt: 0.5,
                        opacity: 0.7,
                      }}
                    >
                      {formatTime(message.timestamp)}
                    </Typography>
                  </Paper>
                </ListItem>
              ))}
              
              {/* Indicador de carregamento */}
              {isLoading && (
                <ListItem sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                  <Paper
                    sx={{
                      padding: 2,
                      backgroundColor: 'grey.100',
                      borderRadius: '18px 18px 18px 4px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                    }}
                  >
                    <CircularProgress size={16} />
                    <Typography variant="body2" color="text.secondary">
                      {agentName} está digitando...
                    </Typography>
                  </Paper>
                </ListItem>
              )}
            </List>
            <div ref={messagesEndRef} />
          </Box>
        </Paper>
      </Box>

      {/* Área de input */}
      <Paper
        component="form"
        onSubmit={handleSendMessage}
        sx={{
          padding: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          borderRadius: 0,
          elevation: 3,
        }}
      >
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Digite sua mensagem..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isLoading}
          multiline
          maxRows={4}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '24px',
            },
          }}
        />
        <IconButton
          type="submit"
          color="primary"
          disabled={!input.trim() || isLoading}
          sx={{
            backgroundColor: 'primary.main',
            color: 'white',
            '&:hover': {
              backgroundColor: 'primary.dark',
            },
            '&:disabled': {
              backgroundColor: 'grey.300',
            },
          }}
        >
          <SendIcon />
        </IconButton>
      </Paper>
    </Box>
  );
};

export default ChatPage;
