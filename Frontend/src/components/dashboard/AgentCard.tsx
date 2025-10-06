// src/components/dashboard/AgentCard.tsx

'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Avatar,
  Chip,
  Box,
  Stack,
} from '@mui/material';
import { SmartToy, Settings } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { Agent } from '../../types';
import { getImageUrl } from '../../services/api';

interface AgentCardProps {
  agent: Agent;
  showManageButton?: boolean;
}

const AgentCard: React.FC<AgentCardProps> = ({ 
  agent, 
  showManageButton = false 
}) => {
  const router = useRouter();

  const handleConversarClick = () => {
    router.push(`/chat/${agent.id}`);
  };

  const handleGerenciarClick = () => {
    router.push(`/admin/agents/${agent.id}`);
  };

  return (
    <Card sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      transition: 'transform 0.2s, box-shadow 0.2s',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: 3,
      }
    }}>
      <CardContent sx={{ flexGrow: 1, pb: 1 }}>
        {/* Header com Avatar e Nome */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar 
            src={getImageUrl(agent.logo_url)} 
            sx={{ 
              width: 56, 
              height: 56, 
              mr: 2,
              bgcolor: 'primary.main' 
            }}
          >
            {!agent.logo_url && <SmartToy />}
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography 
              variant="h6" 
              component="div" 
              sx={{ 
                fontWeight: 600,
                lineHeight: 1.2,
                mb: 0.5 
              }}
            >
              {agent.name}
            </Typography>
            <Chip 
              label={agent.status}
              size="small"
              color={
                agent.status === 'APPROVED' ? 'success' : 
                agent.status === 'PENDING' ? 'warning' : 'error'
              }
              sx={{ fontSize: '0.75rem' }}
            />
          </Box>
        </Box>

        {/* Descrição */}
        <Typography 
          variant="body2" 
          color="text.secondary"
          sx={{ 
            mb: 2,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            lineHeight: 1.4
          }}
        >
          {agent.description}
        </Typography>

        {/* Expertises */}
        {agent.expertise && agent.expertise.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography 
              variant="caption" 
              color="text.secondary" 
              sx={{ mb: 1, display: 'block', fontWeight: 500 }}
            >
              Especialidades:
            </Typography>
            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
              {agent.expertise.slice(0, 3).map((expertise, index) => (
                <Chip
                  key={index}
                  label={expertise}
                  size="small"
                  variant="outlined"
                  sx={{ 
                    fontSize: '0.7rem',
                    height: '20px',
                    mb: 0.5
                  }}
                />
              ))}
              {agent.expertise.length > 3 && (
                <Chip
                  label={`+${agent.expertise.length - 3}`}
                  size="small"
                  variant="outlined"
                  sx={{ 
                    fontSize: '0.7rem',
                    height: '20px',
                    mb: 0.5
                  }}
                />
              )}
            </Stack>
          </Box>
        )}

        {/* Status da Base de Conhecimento */}
        <Box sx={{ display: 'flex', gap: 2, mt: 'auto' }}>
          <Typography variant="caption" color="text.secondary">
            � Base Centralizada
          </Typography>
          <Typography variant="caption" color="success.main">
            ✓ Ativa
          </Typography>
        </Box>
      </CardContent>

      <CardActions sx={{ px: 2, pb: 2, gap: 1 }}>
        <Button 
          size="small" 
          variant="contained" 
          onClick={handleConversarClick}
          sx={{ flexGrow: 1 }}
        >
          Conversar
        </Button>
        {showManageButton && (
          <Button 
            size="small" 
            variant="outlined"
            startIcon={<Settings />}
            onClick={handleGerenciarClick}
          >
            Gerenciar
          </Button>
        )}
      </CardActions>
    </Card>
  );
};

export default AgentCard;
