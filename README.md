# DispensaMed – Sistema de Dispensação de Medicamentos

Sistema web que migra o sistema legado Delphi 7 de dispensação de medicamentos para uma stack moderna: **ASP.NET Core 8 (API)** + **Next.js 14 (Frontend)**.

---

## Requisitos

| Ferramenta | Versão mínima |
|---|---|
| .NET SDK | 8.0 |
| Node.js | 20 |
| Firebird | 2.5 / 3.0 / 4.0 |
| Docker + Compose | (opcional) |

---

## Configuração

### 1. Backend

Copie e ajuste o arquivo de configuração:

```bash
cd backend/DispensaMed.API
cp appsettings.json appsettings.Development.json
```

Edite `appsettings.Development.json`:

```json
{
  "ConnectionStrings": {
    "Firebird": "DataSource=<HOST>;Database=<CAMINHO_DO_FDB>;User=SYSDBA;Password=<SENHA>;Charset=UTF8"
  },
  "Jwt": {
    "Key": "<CHAVE_SECRETA_COM_32_CARACTERES_MINIMO>",
    "Issuer": "DispensaMed",
    "Audience": "DispensaMed",
    "ExpirationMinutes": "60",
    "RefreshTokenExpirationDays": "7"
  }
}
```

Execute a API:

```bash
cd backend
dotnet run --project DispensaMed.API
```

A API ficará disponível em `http://localhost:5000`.

### 2. Frontend

```bash
cd frontend
cp .env.example .env.local   # ou crie manualmente
# Defina: NEXT_PUBLIC_API_URL=http://localhost:5000
npm install
npm run dev
```

O frontend ficará disponível em `http://localhost:3000`.

---

## Docker Compose

```bash
# Na raiz do projeto:
docker compose up --build
```

- API: `http://localhost:5000`
- Frontend: `http://localhost:3000`

---

## Estrutura do Projeto

```
├── backend/
│   ├── DispensaMed.Domain/          # Entidades e interfaces de domínio
│   ├── DispensaMed.Infrastructure/  # Repositórios Firebird + helpers
│   ├── DispensaMed.Application/     # Serviços de aplicação + DTOs
│   └── DispensaMed.API/             # Controllers ASP.NET Core
└── frontend/
    ├── app/
    │   └── login/                   # Tela de login
    └── lib/
        └── auth.ts                  # Client da API de autenticação
```

---

## Endpoints da API

| Método | Rota | Descrição |
|---|---|---|
| POST | `/api/auth/login` | Autentica usuário |
| POST | `/api/auth/refresh` | Renova access token |
| POST | `/api/auth/logout` | Invalida refresh token |
| GET | `/api/auth/me` | Retorna usuário autenticado (requer JWT) |

### Exemplo – Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"login": "usuario", "senha": "senha123"}'
```

---

## Tabela criada automaticamente no startup

```sql
CREATE TABLE WEB_REFRESH_TOKENS (
    ID          INTEGER      NOT NULL PRIMARY KEY,
    USUARIO     VARCHAR(50)  NOT NULL,
    TOKEN       VARCHAR(500) NOT NULL,
    EXPIRES_AT  TIMESTAMP    NOT NULL,
    CREATED_AT  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);
CREATE GENERATOR GEN_WEB_REFRESH_TOKENS_ID;
```

A API verifica se a tabela existe e a cria automaticamente na primeira execução.
