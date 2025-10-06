// src/app/admin/layout.tsx
import AuthGuard from '../../components/auth/AuthGuard';
import Navbar from '../../components/layout/Navbar';
import { Container } from '@mui/material';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard requiredRole="ADMIN">
      <Navbar />
      <Container component="main" maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {children}
      </Container>
    </AuthGuard>
  );
}
