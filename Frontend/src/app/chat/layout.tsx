// src/app/chat/layout.tsx

import React from 'react';
import AuthGuard from '../../components/auth/AuthGuard';

interface ChatLayoutProps {
  children: React.ReactNode;
}

const ChatLayout: React.FC<ChatLayoutProps> = ({ children }) => {
  return (
    <AuthGuard requiredRole="USER">
      {children}
    </AuthGuard>
  );
};

export default ChatLayout;
