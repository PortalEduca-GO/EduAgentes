# TeamsBots - Sistema Educacional

Sistema completo de chatbots educacionais com interface web e integração com IA.

## Estrutura do Projeto

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
