'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  Paper,
  Alert,
  Avatar,
  Chip,
  CircularProgress,
  Badge,
  Container,
  Grid,
  Button,
  Fade,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import { 
  AdminPanelSettings, 
  SmartToy, 
  PersonAdd, 
  PendingActions,
  CheckCircle,
  People,
  Psychology,
  Refresh,
  SupervisorAccount,
  TrendingUp,
  Assessment,
  Settings,
  ErrorOutline,
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import AuthGuard from '../../components/auth/AuthGuard';
import Navbar from '../../components/layout/Navbar';
import UserCreator from '../../components/admin/UserCreatorForm';
import AgentCreator from '../../components/admin/CreateAgentForm';
import AgentApprovalQueue from '../../components/admin/AgentApprovalQueueForm';
import AgentManagement from '../../components/admin/AgentManagement';
import UserManagement from '../../components/admin/UserManagement';
import AIModelConfig from '../../components/admin/AIModelConfig';
import api from '../../services/api';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
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
    id: `admin-tab-${index}`,
    'aria-controls': `admin-tabpanel-${index}`,
  };
}

interface AdminStats {
  totalUsers: number;
  totalAgents: number;
  pendingAgents: number;
  approvedAgents: number;
  rejectedAgents: number;
}

const AdminPage: React.FC = () => {
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalAgents: 0,
    pendingAgents: 0,
    approvedAgents: 0,
    rejectedAgents: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const fetchStats = async () => {
    try {
      setRefreshing(true);
      
      // Por enquanto, não temos endpoint para listar usuários
      // TODO: Implementar GET /users/ no backend para contar usuários
      const totalUsers = 0;

      // Fetch agents
      const agentsResponse = await api.get('/agents');
      const agents = agentsResponse.data;
      
      const pendingAgents = agents.filter((agent: any) => agent.status === 'PENDING').length;
      const approvedAgents = agents.filter((agent: any) => agent.status === 'APPROVED').length;
      const rejectedAgents = agents.filter((agent: any) => agent.status === 'REJECTED').length;

      setStats({
        totalUsers,
        totalAgents: agents.length,
        pendingAgents,
        approvedAgents,
        rejectedAgents,
      });
      
      setError('');
    } catch (error: any) {
      console.error('Erro ao buscar estatísticas:', error);
      setError('Erro ao carregar estatísticas do painel');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [user?.role]);

  const canCreateUsers = user?.role === 'MASTER_ADMIN';
  const canApproveAgents = user?.role === 'MASTER_ADMIN';
  const canCreateAgents = user && ['ADMIN', 'MASTER_ADMIN'].includes(user.role);

  // Calcula quais abas devem ser mostradas
  const availableTabs = [];
  let tabIndex = 0;

  // Agent Management - Sempre disponível para admins
  if (canCreateAgents) {
    availableTabs.push({
      index: tabIndex++,
      label: 'Gerenciar Agentes',
      icon: <Settings />,
      component: <AgentManagement />,
    });
  }

  if (canCreateAgents) {
    availableTabs.push({
      index: tabIndex++,
      label: 'Criar Agente',
      icon: <SmartToy />,
      component: <AgentCreator />,
    });
  }

  if (canApproveAgents) {
    availableTabs.push({
      index: tabIndex++,
      label: 'Aprovar Agentes',
      icon: (
        <Badge badgeContent={stats.pendingAgents} color="error">
          <PendingActions />
        </Badge>
      ),
      component: <AgentApprovalQueue />
    });
  }

  // User Management - Apenas para MASTER_ADMIN
  if (canCreateUsers) {
    availableTabs.push({
      index: tabIndex++,
      label: 'Gerenciar Usuários',
      icon: <SupervisorAccount />,
      component: <UserManagement />,
    });
  }

  if (canCreateUsers) {
    availableTabs.push({
      index: tabIndex++,
      label: 'Criar Usuário',
      icon: <PersonAdd />,
      component: <UserCreator />
    });
  }

  // Configurações do Sistema - Apenas para MASTER_ADMIN
  if (user?.role === 'MASTER_ADMIN') {
    availableTabs.push({
      index: tabIndex++,
      label: 'Configurações do Sistema',
      icon: <Psychology />,
      component: <AIModelConfig />,
    });
  }

  const getStatsCards = () => {
    const cards = [
      {
        title: 'Total de Agentes',
        value: stats.totalAgents,
        icon: <Psychology />,
        color: 'primary.main',
        bgColor: 'primary.light',
      },
      {
        title: 'Agentes Pendentes',
        value: stats.pendingAgents,
        icon: <PendingActions />,
        color: 'warning.main',
        bgColor: 'warning.light',
      },
      {
        title: 'Agentes Aprovados',
        value: stats.approvedAgents,
        icon: <CheckCircle />,
        color: 'success.main',
        bgColor: 'success.light',
      },
      {
        title: 'Agentes Rejeitados',
        value: stats.rejectedAgents,
        icon: <ErrorOutline />,
        color: 'error.main',
        bgColor: 'error.light',
      },
    ];

    if (canCreateUsers) {
      cards.unshift({
        title: 'Total de Usuários',
        value: stats.totalUsers,
        icon: <People />,
        color: 'info.main',
        bgColor: 'info.light',
      });
    }

    return cards;
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'Administrador';
      case 'GLOBAL_ADMIN':
        return 'Administrador Global';
      case 'MASTER_ADMIN':
        return 'Administrador Master';
      default:
        return role;
    }
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'Pode criar agentes';
      case 'GLOBAL_ADMIN':
        return 'Pode criar e aprovar agentes';
      case 'MASTER_ADMIN':
        return 'Acesso completo ao sistema';
      default:
        return '';
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

  return (
    <AuthGuard requiredRole="ADMIN">
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar sx={{ bgcolor: 'primary.main', mr: 2, width: 56, height: 56 }}>
              <AdminPanelSettings fontSize="large" />
            </Avatar>
            <Box>
              <Typography variant="h4" gutterBottom>
                Painel Administrativo
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip 
                  label={getRoleDisplayName(user?.role || '')}
                  color="primary" 
                  size="small"
                />
                <Typography variant="body2" color="text.secondary">
                  {getRoleDescription(user?.role || '')}
                </Typography>
              </Box>
            </Box>
          </Box>
          
          <Tooltip title="Atualizar estatísticas">
            <IconButton 
              onClick={fetchStats} 
              disabled={refreshing}
              color="primary"
              size="large"
            >
              <Refresh sx={{ 
                animation: refreshing ? 'spin 1s linear infinite' : 'none',
                '@keyframes spin': {
                  '0%': { transform: 'rotate(0deg)' },
                  '100%': { transform: 'rotate(360deg)' },
                },
              }} />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Statistics Cards */}
        <Box sx={{ 
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: canCreateUsers ? 'repeat(5, 1fr)' : 'repeat(4, 1fr)'
          },
          gap: 3,
          mb: 4
        }}>
          {getStatsCards().map((card, index) => (
            <Card 
              key={index}
              elevation={3}
              sx={{ 
                background: `linear-gradient(135deg, ${card.bgColor}20 0%, ${card.bgColor}10 100%)`,
                border: `1px solid ${card.bgColor}40`,
              }}
            >
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <Avatar 
                  sx={{ 
                    bgcolor: card.color, 
                    mx: 'auto', 
                    mb: 2,
                    width: 48,
                    height: 48,
                  }}
                >
                  {card.icon}
                </Avatar>
                <Typography variant="h4" fontWeight="bold" color={card.color}>
                  {card.value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {card.title}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>

        <Divider sx={{ mb: 4 }} />

        {availableTabs.length === 0 ? (
          <Paper sx={{ p: 3 }}>
            <Typography variant="body1" color="text.secondary">
              Você não tem permissão para acessar funcionalidades administrativas.
            </Typography>
          </Paper>
        ) : (
          <Paper elevation={1}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs 
                value={tabValue} 
                onChange={handleTabChange} 
                aria-label="admin tabs"
                variant="fullWidth"
              >
                {availableTabs.map((tab) => (
                  <Tab 
                    key={tab.index}
                    icon={tab.icon} 
                    label={tab.label} 
                    iconPosition="start"
                    {...a11yProps(tab.index)} 
                    sx={{ minHeight: 64 }}
                  />
                ))}
              </Tabs>
            </Box>

            {/* Tab Panels */}
            {availableTabs.map((tab) => (
              <TabPanel key={tab.index} value={tabValue} index={tab.index}>
                {tab.component}
              </TabPanel>
            ))}
          </Paper>
        )}
      </Container>
    </AuthGuard>
  );
};

export default AdminPage;
