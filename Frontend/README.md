# Edu Frontend

Aplicação frontend para a plataforma Edu - um sistema de gerenciamento e interação com agentes de IA.

## Tecnologias Utilizadas

- **Next.js 15** - Framework React com App Router
- **React 19** - Biblioteca para interfaces de usuário
- **TypeScript** - Tipagem estática
- **Material-UI (MUI)** - Biblioteca de componentes UI
- **Axios** - Cliente HTTP para comunicação com a API
- **Context API** - Gerenciamento de estado global

## Funcionalidades

### Autenticação
- Login seguro com JWT
- Persistência de sessão
- Proteção de rotas baseada em roles
- Logout automático em caso de token inválido

### Dashboard
- Visualização de agentes aprovados
- Cards informativos com status dos agentes
- Interface para iniciar conversas com agentes

### Painel Administrativo
- **Criação de Agentes** (ADMIN+): Formulário para criar novos agentes
- **Aprovação de Agentes** (GLOBAL_ADMIN+): Queue para aprovar/rejeitar agentes pendentes
- **Criação de Usuários** (MASTER_ADMIN): Formulário para criar usuários com roles específicos
- **Upload de Documentos**: Upload de PDFs para enriquecer agentes

### Hierarquia de Roles
1. **USER** - Usuário básico (visualizar e conversar com agentes)
2. **ADMIN** - Administrador (criar agentes)
3. **GLOBAL_ADMIN** - Administrador global (aprovar agentes)
4. **MASTER_ADMIN** - Administrador master (criar usuários)

## Arquitetura

### Estrutura de Pastas
```
src/
├── app/                    # App Router do Next.js
│   ├── dashboard/         # Página do dashboard
│   ├── admin/            # Página de administração
│   ├── layout.tsx        # Layout raiz com providers
│   └── page.tsx          # Página de login
├── components/
│   ├── auth/             # Componentes de autenticação
│   │   ├── AuthProvider.tsx
│   │   └── withAuth.tsx
│   ├── dashboard/        # Componentes do dashboard
│   │   └── AgentCard.tsx
│   ├── admin/           # Componentes administrativos
│   │   ├── AgentApprovalQueue.tsx
│   │   ├── UserCreator.tsx
│   │   ├── AgentCreator.tsx
│   │   └── FileUploader.tsx
│   └── layout/          # Componentes de layout
│       └── Navbar.tsx
├── hooks/               # Hooks customizados
│   └── useAuth.ts
├── services/           # Serviços e configurações
│   └── api.ts
└── types/             # Definições TypeScript
    └── index.ts
```

### Componentes Principais

#### AuthProvider
- Gerencia estado global de autenticação
- Persistência automática de sessão
- Verificação de token válido na inicialização

#### withAuth HOC
- Protege rotas que requerem autenticação
- Suporte a verificação de roles mínimos
- Redirecionamento automático para login

#### API Service
- Instância configurada do Axios
- Interceptador para adicionar token automaticamente
- Tratamento de erros 401 (token inválido)

## Configuração e Execução

### Pré-requisitos
- Node.js 18+
- NPM ou Yarn (use caminho completo: `& "C:\Program Files\nodejs\npm.cmd"`)
- Backend da aplicação rodando em `http://localhost:8080`

### Instalação
```bash
# Instalar dependências (caminho completo do npm no Windows)
& "C:\Program Files\nodejs\npm.cmd" install

# Executar em modo de desenvolvimento
& "C:\Program Files\nodejs\npm.cmd" run dev

# Build para produção
& "C:\Program Files\nodejs\npm.cmd" run build

# Executar versão de produção
& "C:\Program Files\nodejs\npm.cmd" start
```

### Variáveis de Ambiente
```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8080
```

## Autenticação e Segurança

### Fluxo de Autenticação
1. Usuário faz login com email/senha
2. Backend retorna JWT token + dados do usuário
3. Token é salvo no localStorage
4. Token é automaticamente incluído em todas as requisições
5. Em caso de token inválido, usuário é redirecionado para login

### Proteção de Rotas
- Todas as rotas internas são protegidas pelo HOC `withAuth`
- Verificação de roles para funcionalidades administrativas
- Redirecionamento automático baseado em permissões

## Integração com API

### Endpoints Utilizados
- `POST /login` - Autenticação
- `GET /users/me` - Dados do usuário
- `GET /agents` - Listar agentes aprovados
- `GET /agents/pending` - Listar agentes pendentes (GLOBAL_ADMIN+)
- `POST /agents` - Criar agente (ADMIN+)
- `PATCH /agents/{id}/status` - Aprovar/rejeitar agente (GLOBAL_ADMIN+)
- `POST /agents/{id}/upload` - Upload de PDF (ADMIN+)
- `POST /agents/{id}/ask` - Perguntar ao agente
- `POST /master/users` - Criar usuário (MASTER_ADMIN)

### Tratamento de Erros
- Interceptadores Axios para tratamento centralizado
- Exibição de mensagens de erro amigáveis
- Logout automático em caso de token expirado

## Interface do Usuário

### Design System
- Material-UI com tema customizado
- Paleta de cores consistente
- Responsividade em todos os componentes
- Feedback visual para ações do usuário

### Componentes de UI
- Cards para exibição de agentes
- Formulários com validação
- Navegação por abas no painel admin
- Dialogs para confirmações e detalhes
- Progress indicators para uploads

## Funcionalidades Futuras

- [ ] Interface de chat com agentes
- [ ] Histórico de conversas
- [ ] Gerenciamento de arquivos uploadados
- [ ] Dashboard com métricas e gráficos
- [ ] Configurações de usuário
- [ ] Notificações em tempo real
- [ ] Modo dark/light
- [ ] Internacionalização (i18n)

## Contribuição

1. Fork do projeto
2. Criar branch para feature (`git checkout -b feature/AmazingFeature`)
3. Commit das mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.
