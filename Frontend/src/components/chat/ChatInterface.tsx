'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  Avatar,
  IconButton,
  AppBar,
  Toolbar,
  Divider,
  Fade,
  Alert,
} from '@mui/material';
import { 
  Send, 
  ArrowBack, 
  SmartToy, 
  Person,
  ContentCopy,
  ThumbUp,
  ThumbDown,
} from '@mui/icons-material';
import { Agent, AskAgentRequest, AskAgentResponse } from '../../types';
import api from '../../services/api';

interface ChatInterfaceProps {
  agent: Agent;
  onBack: () => void;
}

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'agent';
  timestamp: Date;
  isTyping?: boolean;
}

/**
 * Interface de chat para conversar com agentes
 */
const ChatInterface: React.FC<ChatInterfaceProps> = ({ agent, onBack }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Mensagem de boas-vindas
  useEffect(() => {
    const welcomeMessage: Message = {
      id: 'welcome',
      content: `Olá! Eu sou ${agent.name}. ${agent.description} Como posso ajudá-lo hoje?`,
      sender: 'agent',
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  }, [agent]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    // Adiciona mensagem do usuário
    setMessages(prev => [...prev, userMessage]);
    const question = inputValue;
    setInputValue('');
    setLoading(true);
    setError('');

    // Adiciona indicador de digitação
    const typingMessage: Message = {
      id: 'typing',
      content: '',
      sender: 'agent',
      timestamp: new Date(),
      isTyping: true,
    };
    setMessages(prev => [...prev, typingMessage]);

    try {
      const request: AskAgentRequest = { prompt: question };
      const response = await api.post<AskAgentResponse>(`/agents/${agent.id}/ask`, request);
      
      // Remove indicador de digitação e adiciona resposta
      setMessages(prev => {
        const withoutTyping = prev.filter(msg => msg.id !== 'typing');
        const agentMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: response.data.response,
          sender: 'agent',
          timestamp: new Date(),
        };
        return [...withoutTyping, agentMessage];
      });
    } catch (error: any) {
      setError('Erro ao enviar mensagem. Tente novamente.');
      
      // Remove indicador de digitação
      setMessages(prev => prev.filter(msg => msg.id !== 'typing'));
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.',
        sender: 'agent',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
      console.error('Erro ao enviar mensagem:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // TODO: Mostrar toast de sucesso
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      {/* Header */}
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="voltar"
            onClick={onBack}
            sx={{ mr: 2 }}
          >
            <ArrowBack />
          </IconButton>
          
          <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
            <SmartToy />
          </Avatar>
          
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" noWrap>
              {agent.name}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              Agente IA
            </Typography>
          </Box>

          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="caption" color="text.secondary">
              Status: Online
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Error Alert */}
      {error && (
        <Alert 
          severity="error" 
          onClose={() => setError('')}
          sx={{ m: 1 }}
        >
          {error}
        </Alert>
      )}

      {/* Messages Area */}
      <Box sx={{ 
        flexGrow: 1, 
        overflow: 'auto', 
        p: 1,
        background: 'linear-gradient(to bottom, #f5f5f5, #ffffff)',
      }}>
        <List sx={{ pb: 2 }}>
          {messages.map((message, index) => (
            <Fade key={message.id} in={true} timeout={300}>
              <ListItem
                sx={{
                  display: 'flex',
                  flexDirection: message.sender === 'user' ? 'row-reverse' : 'row',
                  alignItems: 'flex-start',
                  gap: 1,
                  mb: 1,
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: message.sender === 'user' ? 'primary.main' : 'secondary.main',
                    width: 36,
                    height: 36,
                  }}
                >
                  {message.sender === 'user' ? <Person /> : <SmartToy />}
                </Avatar>
                
                <Box sx={{ 
                  maxWidth: '75%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: message.sender === 'user' ? 'flex-end' : 'flex-start',
                }}>
                  <Paper
                    elevation={1}
                    sx={{
                      p: 2,
                      bgcolor: message.sender === 'user' ? 'primary.light' : 'grey.100',
                      color: message.sender === 'user' ? 'white' : 'text.primary',
                      borderRadius: 2,
                      position: 'relative',
                    }}
                  >
                    {message.isTyping ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2">
                          {agent.name} está digitando
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          {[0, 1, 2].map((i) => (
                            <Box
                              key={i}
                              sx={{
                                width: 6,
                                height: 6,
                                borderRadius: '50%',
                                bgcolor: 'primary.main',
                                animation: 'pulse 1.4s ease-in-out infinite',
                                animationDelay: `${i * 0.2}s`,
                                '@keyframes pulse': {
                                  '0%, 80%, 100%': {
                                    opacity: 0.3,
                                  },
                                  '40%': {
                                    opacity: 1,
                                  },
                                },
                              }}
                            />
                          ))}
                        </Box>
                      </Box>
                    ) : (
                      <>
                        <Typography 
                          variant="body1" 
                          sx={{ 
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                          }}
                        >
                          {message.content}
                        </Typography>
                        
                        {message.sender === 'agent' && (
                          <Box sx={{ 
                            display: 'flex', 
                            gap: 1, 
                            mt: 1,
                            justifyContent: 'flex-end',
                          }}>
                            <IconButton
                              size="small"
                              onClick={() => copyToClipboard(message.content)}
                              sx={{ color: 'text.secondary' }}
                            >
                              <ContentCopy fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              sx={{ color: 'text.secondary' }}
                            >
                              <ThumbUp fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              sx={{ color: 'text.secondary' }}
                            >
                              <ThumbDown fontSize="small" />
                            </IconButton>
                          </Box>
                        )}
                      </>
                    )}
                  </Paper>
                  
                  <Typography 
                    variant="caption" 
                    color="text.secondary"
                    sx={{ 
                      mt: 0.5,
                      px: 1,
                    }}
                  >
                    {formatTime(message.timestamp)}
                  </Typography>
                </Box>
              </ListItem>
            </Fade>
          ))}
        </List>
        <div ref={messagesEndRef} />
      </Box>

      <Divider />

      {/* Input Area */}
      <Paper
        elevation={3}
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'flex-end',
          gap: 1,
          bgcolor: 'background.paper',
        }}
      >
        <TextField
          fullWidth
          multiline
          maxRows={4}
          variant="outlined"
          placeholder="Digite sua mensagem..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={loading}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 3,
            },
          }}
        />
        <Button
          variant="contained"
          endIcon={<Send />}
          onClick={handleSendMessage}
          disabled={!inputValue.trim() || loading}
          sx={{ 
            minWidth: 'auto', 
            px: 3,
            py: 1.5,
            borderRadius: 3,
          }}
        >
          Enviar
        </Button>
      </Paper>
    </Box>
  );
};

export default ChatInterface;
