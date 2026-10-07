# Formulario WebApp

Aplicacao full stack para criacao, publicacao e preenchimento de formularios dinamicos, baseada no documento [prompt-claude-form-builder.md](prompt-claude-form-builder.md).

## Stack

- Backend: ASP.NET Core Web API em .NET 10, MediatR, FluentValidation, EF Core 10 e PostgreSQL
- Frontend: React 19, TypeScript, Vite, React Query, React Hook Form, Zod, Zustand e shadcn/ui
- Infraestrutura local: Docker Compose com PostgreSQL persistente

## Estrutura

- `src/backend`: API e modulos de dominio/aplicacao/infraestrutura
- `src/frontend/app`: interface React para builder e preenchimento dos formularios
- `docker-compose.yml`: orquestracao local com frontend, API e banco

## Execucao com Docker

Requisitos:

- Docker Desktop ou Docker Engine com Compose

Opcionalmente, copie `.env.example` para `.env` e ajuste as variaveis da instituicao.

Subida do ambiente:

```powershell
docker compose up --build -d
```

Acessos:

- Frontend: http://localhost:3000
- API: http://localhost:8080
- OpenAPI: http://localhost:8080/openapi/v1.json
- PostgreSQL: localhost:5432

Credenciais padrao do banco:

- Database: `formulario_dinamico`
- User: `formulario`
- Password: definida no `.env` local

Persistencia:

- Os dados do PostgreSQL ficam no volume nomeado `postgres_data`
- O volume foi validado com criacao de registro, reinicio do stack e leitura posterior do mesmo dado

Parada do ambiente:

```powershell
docker compose down
```

Parada sem apagar os dados do banco:

```powershell
docker compose down
```

Parada apagando os dados persistidos:

```powershell
docker compose down -v
```

## Execucao sem Docker

Backend:

```powershell
Set-Location .\src\backend
dotnet build ..\..\FormularioDinamico.slnx
dotnet run --project .\src\WebApi\FormularioDinamico.Api\FormularioDinamico.Api.csproj
```

Frontend:

```powershell
Set-Location .\src\frontend\app
npm install
npm run dev
```

## Observacoes operacionais

- A API aplica as migrations automaticamente no startup.
- O frontend em container usa proxy reverso do Nginx para encaminhar `/api`, `/openapi` e `/health` para a API.
- Para uso institucional em producao com a versao atual do MediatR, defina `MEDIATR_LICENSE_KEY` no `.env` ou no ambiente do deploy.
- O arquivo `NuGet.Config` local foi mantido para evitar restore em feeds privados nao autenticados no ambiente institucional.
