# TeamsBots - Sistema Educacional

Sistema completo de chatbots educacionais com interface web e integração com IA.

## 📋 Estrutura do Projeto

```
TeamsBots/
├── Backend/                    # API FastAPI
│   ├── main_production.py     # Aplicação principal
│   ├── app_production.py      # Script de inicialização para IIS
│   ├── auth.py               # Autenticação JWT
│   ├── database.py           # Conexão SQL Server
│   ├── models.py             # Modelos de dados
│   ├── schemas.py            # Schemas Pydantic
│   ├── web.config            # Configuração IIS
│   ├── .env                  # Variáveis de ambiente
│   └── requirements.txt      # Dependências Python
│
├── Frontend/                  # Interface React/Next.js
│   ├── src/                  # Código fonte
│   ├── public/               # Arquivos estáticos
│   ├── index.html            # Página principal
│   ├── web.config            # Configuração IIS com proxy
│   └── package.json          # Dependências Node.js
│
└── .venv/                    # Ambiente virtual Python
```

## 🚀 Configuração de Produção

### IIS Sites Configurados:
- **TeamsBotFrontend**: HTTPS:443 (teamsbot.dev.educacao.go.gov.br)
- **TeamsBotBackend**: HTTP:80 (proxy reverso)

### Serviços Ativos:
- **Backend API**: http://localhost:3000 (FastAPI)
- **Frontend Local**: http://localhost:8090 (IIS)
- **Database**: SQL Server (LOOKER:2733/EDU_HOM)
- **AI Service**: Google Gemini (gemini-2.5-flash)

## ⚙️ Como Executar

### 1. Backend (API)
```bash
cd Backend
d:\Internet\.venv\Scripts\python.exe main_production.py
```

### 2. Frontend
- Configurado no IIS para servir automaticamente
- Acesso: http://localhost:8090

### 3. Domínio de Produção
- URL: https://teamsbot.dev.educacao.go.gov.br
- Status: ✅ Funcionando (via nginx externo)

## 🔧 Configuração

### Variáveis de Ambiente (.env)
```
DATABASE_URL=mssql+pyodbc://...
GEMINI_API_KEY=...
JWT_SECRET_KEY=...
```

### Credenciais de Teste
- **Usuário**: admin
- **Senha**: admin123

## 📊 Status dos Serviços

### ✅ Funcionando
- Database Connection
- Gemini AI Integration
- Authentication System
- IIS Configuration
- HTTPS/SSL

### ⚠️ Observações
- Proxy reverso externo (nginx) configurado para o domínio principal
- Backend roda como processo independente (porta 3000)
- Frontend é servido pelo IIS com proxy para API

## 🛠️ Manutenção

### Logs
- Backend: `Backend/logs/app_production.log`
- IIS: Logs padrão do IIS

### Reiniciar Serviços
```powershell
# Reiniciar IIS
iisreset

# Reiniciar Backend
# Parar processo Python na porta 3000 e executar main_production.py
```

## 📝 Funcionalidades

- ✅ Sistema de login/autenticação
- ✅ Chat com IA (Google Gemini)
- ✅ Gerenciamento de agentes
- ✅ Base de conhecimento
- ✅ Interface administrativa
- ✅ API RESTful completa

---

**Desenvolvido para Secretaria de Educação de Goiás**  
**Status**: ✅ Produção - Funcionando