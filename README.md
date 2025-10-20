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

# Define o nome e o branch que irá disparar o pipeline
trigger:
- develop
# =========================================================================
# 1. Configuração do Agente e Build
# =========================================================================
pool:
  name: Default_linux # Pool de agentes self-hosted (VM/servidor)


variables:
  ZIP_FILENAME: 'app-deploy-$(Build.BuildId).tar.gz'
  DEPLOY_ROOT_PATH: '/var/www/eduagentes-service'
  SERVICE_NAME: 'unicorn-eduagentes.service'
  SSH_ENDPOINT: 'eduagentes-hom'

stages:
- stage: Build
  displayName: '1. Build e Empacotamento'
  jobs:
  - job: PrepareFiles
    displayName: 'Preparar Artefato de Deploy'
    steps:

      # 1. Usa a versão exata do Python (Descomente se for usar a tarefa)
      # - task: UsePythonVersion@0
      #   displayName: 'Usar Python 3.13.0 (Caminho Direto)'
      #   inputs:
      #     toolPath: '/opt/myagent-prod/_work/_tool/Python/3.13.0/x64'
      #     addToPath: true

      # 2. Cria o Venv e Instala Dependências (AJUSTADO para usar o caminho direto)
      - script: |
          echo "Isolando ambiente e instalando dependências..."
          
          # Cria o Venv
          python -m venv venv

          # Usa o caminho direto para o pip do venv (MAIS ROBUSTO)
          VENV_PIP="./venv/bin/pip"
          
          echo "Atualizando pip no Venv..."
          $VENV_PIP install --upgrade pip
          
          echo "Instalando dependências..."
          $VENV_PIP install uvicorn[standard] gunicorn google.generativeai pysqlite3-binary
          $VENV_PIP install -r requirements.txt

          echo "Instalação concluída no venv."
        displayName: '2. Criação do Venv e Instalação de Dependências'

      # 3. Compactação (CÓDIGO + VENV)
      - script: |
          echo "Criando artefato de deploy $(ZIP_FILENAME) usando tar.gz..."

          # 1. Cria a lista de exclusão do tar (formato shell)
          EXCLUDE_FILTERS="--exclude=./__pycache__ --exclude=./chroma_db --exclude=./logs --exclude=./.env.example --exclude=./test_production.py --exclude=./README.md --exclude=./web.config --exclude=./web.config.backup --exclude=./azure-pipelines.yml --exclude=./.git"

          # 2. Executa o tar para criar o arquivo comprimido
          tar -czf "$(Build.ArtifactStagingDirectory)/$(ZIP_FILENAME)" $EXCLUDE_FILTERS --directory=. .

          echo "Compactação concluída."
        displayName: '3. Compactar Código e Venv (TAR.GZ Nativo)'

      # 4. Publicar o Artefato Compactado
      - task: PublishBuildArtifacts@1
        displayName: '4. Publicar Artefato para Deploy'
        inputs:
          PathtoPublish: '$(Build.ArtifactStagingDirectory)'
          ArtifactName: 'drop' # Nome que será usado para baixar

# =========================================================================
# 2. Deploy via SSH
# =========================================================================
- stage: Deploy
  displayName: '2. Deploy para Homologação'
  dependsOn: Build
  condition: succeeded()
  jobs:
  - deployment: DeployBackend
    displayName: 'Transferência e Reinício de Serviço'
    environment: 'eduagentes-hom-backend'
    strategy:
      runOnce:
        deploy:
          steps:

            # 5. Baixa o artefato publicado do Build
            - task: DownloadBuildArtifacts@0
              displayName: '5. Baixar Artefato Compactado (drop)'
              inputs:
                buildType: 'current'
                artifactName: 'drop'
                downloadPath: '$(System.DefaultWorkingDirectory)'

            # 6. Copia o arquivo .zip para o servidor
            - task: CopyFilesOverSSH@0
              displayName: '6. Copiar Arquivo ZIP para o Servidor (/tmp)'
              inputs:
                # O problema estava aqui: $(SSH_ENDPOINT) deve ser o nome da Service Connection
                sshEndpoint: $(SSH_ENDPOINT) 
                # O arquivo ZIP estará dentro da pasta 'drop' após o download
                sourceFolder: '$(System.DefaultWorkingDirectory)/drop'
                targetFolder: '/tmp' # Pasta temporária no servidor
                cleanTargetFolder: false

            # 7. Executa comandos para descompactar e reiniciar
            - task: SSH@0
              displayName: '7. Descompactar e Reiniciar Serviço'
              inputs:
                sshEndpoint: $(SSH_ENDPOINT)
                runOptions: 'commands'
                commands: |

                  echo 'Alterar permissions para user compile'
                  # As variáveis DEPLOY_ROOT_PATH e SERVICE_NAME foram adicionadas no topo
                  sudo chown -R maelno.freitas:maelno.freitas $(DEPLOY_ROOT_PATH)

                  echo 'Movendo para o diretório de deploy: $(DEPLOY_ROOT_PATH)...'
                  cd $(DEPLOY_ROOT_PATH)

                  echo 'Descompactando arquivos de /tmp/$(ZIP_FILENAME) para $(DEPLOY_ROOT_PATH)...'
                  tar -xvf /tmp/$(ZIP_FILENAME) -C $(DEPLOY_ROOT_PATH)

                  # resolve ssqlite3 (mantido, mas pode ser melhor movido para um arquivo de inicialização)
                  sudo sed -i "1s/^/__import__('pysqlite3') \nimport sys \nsys.modules['sqlite3'] = sys.modules.pop('pysqlite3')\n/" $(DEPLOY_ROOT_PATH)/main_production.py

                  echo 'Removendo arquivo ZIP temporário: /tmp/$(ZIP_FILENAME)'
                  rm /tmp/$(ZIP_FILENAME)

                  echo 'Retornando permisions no app'
                  sudo chown -R nginx.nginx $(DEPLOY_ROOT_PATH)

                  echo 'Reiniciando o serviço Systemd: $(SERVICE_NAME)'
                  sudo systemctl stop $(SERVICE_NAME)
                  sudo systemctl start $(SERVICE_NAME)
