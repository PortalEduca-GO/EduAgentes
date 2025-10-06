'use client';

import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  IconButton,
  Chip,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  AdminPanelSettings as AdminIcon,
  SmartToy as BotIcon,
  Logout as LogoutIcon,
  KeyboardArrowDown as ArrowDownIcon,
  Security as SecurityIcon,
  LibraryBooks as KnowledgeIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    router.push('/');
    handleMenuClose();
  };

  const handleNavigate = (path: string) => {
    router.push(path);
    handleMenuClose();
  };

  // Verifica se o usuário tem permissões administrativas
  const hasAdminAccess = user?.role === 'ADMIN' || 
                        user?.role === 'MASTER_ADMIN';

  // Verifica se é Master Admin
  const isMasterAdmin = user?.role === 'MASTER_ADMIN';

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'MASTER_ADMIN': return 'error';
      case 'ADMIN': return 'info';
      case 'USER': return 'default';
      default: return 'default';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'MASTER_ADMIN': return 'Master';
      case 'ADMIN': return 'Admin';
      case 'USER': return 'Usuário';
      default: return role;
    }
  };

  return (
    <AppBar 
      position="static" 
      elevation={0}
      sx={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
      }}
    >
      <Toolbar sx={{ px: { xs: 2, sm: 3 } }}>
        <Box 
          display="flex" 
          alignItems="center" 
          sx={{ cursor: 'pointer' }}
          onClick={() => router.push('/dashboard')}
        >
          <Avatar
            sx={{
              mr: 2,
              bgcolor: 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <BotIcon />
          </Avatar>
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              fontWeight: 'bold',
              color: 'white',
            }}
          >
            Edu
          </Typography>
        </Box>
        
        <Box sx={{ flexGrow: 1 }} />
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {user && (
            <>
              <Button
                color="inherit"
                startIcon={<DashboardIcon />}
                onClick={() => router.push('/dashboard')}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  display: { xs: 'none', sm: 'flex' },
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.1)',
                  },
                }}
              >
                Dashboard
              </Button>

              {hasAdminAccess && (
                <>
                  <Button
                    color="inherit"
                    startIcon={<AdminIcon />}
                    onClick={() => router.push('/admin')}
                    sx={{
                      borderRadius: 2,
                      textTransform: 'none',
                      display: { xs: 'none', sm: 'flex' },
                      '&:hover': {
                        bgcolor: 'rgba(255,255,255,0.1)',
                      },
                    }}
                  >
                    Admin
                  </Button>

                  <Button
                    color="inherit"
                    startIcon={<KnowledgeIcon />}
                    onClick={() => router.push('/admin/knowledge')}
                    sx={{
                      borderRadius: 2,
                      textTransform: 'none',
                      display: { xs: 'none', sm: 'flex' },
                      '&:hover': {
                        bgcolor: 'rgba(255,255,255,0.1)',
                      },
                    }}
                  >
                    Base de Conhecimento
                  </Button>
                </>
              )}

              <Box display="flex" alignItems="center" sx={{ ml: 2 }}>
                <Button
                  onClick={handleMenuOpen}
                  sx={{
                    color: 'white',
                    textTransform: 'none',
                    borderRadius: 3,
                    px: 2,
                    py: 1,
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.1)',
                    },
                  }}
                  endIcon={<ArrowDownIcon />}
                >
                  <Box display="flex" alignItems="center" gap={1}>
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        bgcolor: 'rgba(255,255,255,0.2)',
                        fontSize: '0.875rem',
                      }}
                    >
                      {user.username.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box display="flex" flexDirection="column" alignItems="flex-start">
                      <Typography variant="body2" fontWeight="bold">
                        {user.username}
                      </Typography>
                      <Chip
                        label={getRoleLabel(user.role)}
                        color={getRoleColor(user.role) as any}
                        size="small"
                        sx={{ 
                          height: 16, 
                          fontSize: '0.6rem',
                          '& .MuiChip-label': {
                            px: 1,
                          },
                        }}
                      />
                    </Box>
                  </Box>
                </Button>

                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                  PaperProps={{
                    elevation: 8,
                    sx: {
                      borderRadius: 2,
                      mt: 1,
                      minWidth: 200,
                      '& .MuiMenuItem-root': {
                        borderRadius: 1,
                        mx: 1,
                        my: 0.5,
                      },
                    },
                  }}
                  transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                  anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                >
                  {[
                    <MenuItem key="dashboard" onClick={() => handleNavigate('/dashboard')}>
                      <ListItemIcon>
                        <DashboardIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText>Dashboard</ListItemText>
                    </MenuItem>,
                    
                    ...(hasAdminAccess ? [
                      <MenuItem key="admin" onClick={() => handleNavigate('/admin')}>
                        <ListItemIcon>
                          <AdminIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>Administração</ListItemText>
                      </MenuItem>,

                      <MenuItem key="knowledge" onClick={() => handleNavigate('/admin/knowledge')}>
                        <ListItemIcon>
                          <KnowledgeIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>Base de Conhecimento</ListItemText>
                      </MenuItem>
                    ] : []),

                    <Divider key="divider" sx={{ my: 1 }} />,

                    <MenuItem key="logout" onClick={handleLogout}>
                      <ListItemIcon>
                        <LogoutIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText>Sair</ListItemText>
                    </MenuItem>
                  ]}
                </Menu>
              </Box>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
