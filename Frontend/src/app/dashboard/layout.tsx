// src/app/dashboard/layout.tsx
import AuthGuard from '../../components/auth/AuthGuard';
import Navbar from '../../components/layout/Navbar';
import { Container } from '@mui/material';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <Navbar />
      <Container component="main" maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {children}
      </Container>
    </AuthGuard>
  );
}
