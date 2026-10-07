# Prompt para Claude — Arquitetura e implementação de aplicação de formulários dinâmicos

Você é um arquiteto de software e engenheiro sênior full stack. Sua tarefa é **projetar e implementar a base de uma aplicação web de formulários dinâmicos**, onde usuários de negócio possam montar formulários a partir de campos genéricos, publicar versões desses formulários, permitir preenchimento dinâmico e salvar respostas em banco de dados.

A solução deve ser pensada para evolução real em ambiente corporativo, com foco em **manutenibilidade, organização, extensibilidade, versionamento, auditoria e boa separação de responsabilidades**.

## Objetivo do sistema

A aplicação deve permitir:

- Cadastrar tipos genéricos de campos.
- Montar formulários dinamicamente a partir desses campos.
- Organizar campos por seções, páginas ou grupos.
- Configurar propriedades dos campos, como rótulo, descrição, obrigatoriedade, placeholder, máscara, validações, valores padrão, visibilidade condicional e ordem.
- Salvar o formulário como rascunho.
- Versionar o formulário.
- Publicar uma versão específica do formulário.
- Renderizar o formulário dinamicamente no frontend.
- Receber submissões/respostas dos usuários.
- Persistir as respostas de forma rastreável e auditável.
- Permitir evolução futura para multi-tenant, autenticação/autorização, anexos, workflows e relatórios.

---

## Stack obrigatória

### Backend

- **C# com .NET 10**
- **ASP.NET Core Web API**
- **CQRS**
- **DDD pragmático**
- **Arquitetura em camadas / monólito modular**
- **MediatR**
- **FluentValidation**
- **Entity Framework Core 10**
- **PostgreSQL**
- Provider **Npgsql**
- Swagger / OpenAPI

### Frontend

- **React**
- **TypeScript**
- **shadcn/ui**
- Organização escalável de componentes
- Formulários renderizados dinamicamente a partir de schema/configuração recebida do backend

### Banco de dados

- **PostgreSQL como banco principal**
- Abordagem **híbrida relacional + JSONB**
- O sistema **não deve usar NoSQL como banco principal**

---

## Diretriz arquitetural principal

A solução deve usar **PostgreSQL com modelo híbrido**, onde:

- Entidades principais e relacionamentos de negócio ficam em **modelo relacional**.
- Definição dinâmica do formulário e payload de respostas variáveis podem ficar em **JSONB**.
- Deve haver suporte claro para **versionamento do formulário**, de modo que uma submissão sempre aponte para a versão exata usada no momento do preenchimento.
- O projeto deve ser preparado para consultas futuras, auditoria e relatórios.

Evite EAV puro como solução principal.
Evite microsserviços.
Evite excesso de abstrações desnecessárias.

---

## O que você deve entregar

Quero que você produza uma resposta completa, organizada em seções, contendo os itens abaixo.

## 1. Visão de arquitetura

Descreva a arquitetura recomendada para o sistema, justificando:

- Por que usar monólito modular neste momento.
- Como aplicar DDD de forma pragmática.
- Como aplicar CQRS sem exagero cerimonial.
- Onde MediatR entra.
- Como dividir responsabilidades entre domínio, aplicação, infraestrutura e API.
- Quais bounded contexts ou módulos fazem sentido.

Sugestão de módulos iniciais:

- Forms
- FormVersions
- FieldCatalog
- Submissions
- Identity/Access (mesmo que inicial)
- Audit

## 2. Estrutura da solução .NET

Crie uma proposta concreta de estrutura de pastas e projetos, por exemplo:

- `src/BuildingBlocks`
- `src/Modules/Forms/Domain`
- `src/Modules/Forms/Application`
- `src/Modules/Forms/Infrastructure`
- `src/Modules/Forms/API`
- `src/Bootstrapper` ou `src/WebApi`

Mostre uma árvore de diretórios sugerida.

## 3. Modelagem de domínio

Defina as principais entidades, agregados, value objects e enums.

Esperado no mínimo:

- `Form`
- `FormVersion`
- `FormFieldDefinition`
- `FieldType` ou catálogo de tipos
- `Submission`
- `SubmissionStatus`
- `PublishStatus`
- objetos de regra/validação quando fizer sentido

Explique:

- Qual agregado controla consistência.
- O que pertence ao domínio e o que é apenas DTO/read model.
- Quais regras de negócio centrais devem estar no domínio.

## 4. Modelagem do banco PostgreSQL

Proponha uma modelagem inicial de banco com tabelas e colunas.

Quero que você detalhe pelo menos:

- `forms`
- `form_versions`
- `field_catalog` ou equivalente
- `submissions`
- `audit_logs`

Inclua colunas importantes, por exemplo:

- ids
- status
- version number
- created at
- updated at
- published at
- created by
- schema jsonb
- response data jsonb

Explique:

- O que fica relacional.
- O que fica em JSONB.
- Quais índices sugerir.
- Como preparar a base para filtros e relatórios futuros.

Se fizer sentido, proponha o uso de colunas derivadas/materializadas ou projeções para consultas frequentes.

## 5. Exemplo de schema JSON do formulário

Monte um exemplo de schema JSON realista para um formulário dinâmico, incluindo:

- metadados do formulário
- seções/páginas
- campos
- tipo do campo
- label
- required
- placeholder
- validações
- opções para select/radio
- regra condicional simples

O schema deve ser coerente com a modelagem proposta.

## 6. Backend — casos de uso CQRS

Defina comandos e queries iniciais.

### Comandos mínimos

- `CreateFormCommand`
- `AddFieldCommand`
- `CreateDraftVersionCommand`
- `PublishFormVersionCommand`
- `SubmitFormResponseCommand`
- `ArchiveFormCommand`

### Queries mínimas

- `GetFormByIdQuery`
- `GetPublishedFormVersionQuery`
- `GetFormBuilderQuery`
- `GetSubmissionByIdQuery`
- `ListFormsQuery`

Para cada um, explique:

- objetivo
- payload
- validações
- resposta esperada

## 7. Endpoints da API

Proponha endpoints REST iniciais, por exemplo:

- `POST /api/forms`
- `GET /api/forms/{id}`
- `POST /api/forms/{id}/fields`
- `POST /api/forms/{id}/versions`
- `POST /api/forms/{id}/versions/{versionId}/publish`
- `GET /api/forms/{id}/published`
- `POST /api/forms/{id}/submissions`
- `GET /api/submissions/{id}`

Mostre um contrato inicial de request/response em JSON para os principais endpoints.

## 8. Backend — esqueleto de código

Gere exemplos de código em C# para:

- uma entidade de domínio principal
- um comando
- um handler com MediatR
- um validator com FluentValidation
- uma configuração EF Core
- um controller minimal ou controller tradicional

O código deve ser limpo e coerente, mas não precisa implementar tudo do sistema.

## 9. Estratégia do frontend com React + shadcn/ui

Defina a melhor abordagem para o frontend considerando que o objetivo é:

- montar formulário dinamicamente
- editar formulário com boa UX
- renderizar formulário a partir de schema
- reaproveitar componentes de campo
- manter tipagem forte em TypeScript

Quero que você proponha:

- arquitetura de pastas do front
- divisão entre `features`, `shared`, `components`, `schemas`, `services`
- como usar shadcn/ui nesse contexto
- como mapear tipos de campo para componentes visuais
- como lidar com validação frontend
- como lidar com estado do builder

Sugira se vale usar:

- React Hook Form
- Zod
- TanStack Query
- Zustand

E justifique cada escolha.

## 10. Estrutura sugerida do frontend

Monte uma árvore de pastas sugerida, por exemplo:

- `src/app`
- `src/features/forms/builder`
- `src/features/forms/renderer`
- `src/features/forms/api`
- `src/components/ui`
- `src/components/form-fields`
- `src/lib`
- `src/types`

## 11. Estratégia de renderização dinâmica

Explique como implementar o renderer de formulários no frontend a partir de schema.

Quero que detalhe:

- map de tipo de campo -> componente
- contrato TypeScript do schema
- renderização de campos condicionais
- seções/páginas
- validação client-side
- envio ao backend

## 12. Decisões técnicas e trade-offs

Quero uma seção específica comparando e justificando:

- PostgreSQL híbrido vs NoSQL puro
- JSONB vs modelagem totalmente relacional para campos dinâmicos
- React + shadcn/ui vs outras abordagens
- monólito modular vs microsserviços
- CQRS pragmático vs CRUD simples

## 13. Roadmap incremental

Monte um plano por fases:

### Fase 1

MVP com:
- cadastro de formulário
- builder simples
- versionamento básico
- publicação
- submissão

### Fase 2

- regras condicionais
- mais tipos de campo
- auditoria
- autenticação/autorização

### Fase 3

- multi-tenant
- anexos
- relatórios
- exportações
- workflows

## 14. Requisitos de qualidade

Considere e descreva:

- logging
- tratamento de erros
- idempotência quando aplicável
- auditoria
- observabilidade
- testes unitários
- testes de integração
- versionamento de API
- migrations

## 15. Restrições importantes

Siga estas restrições obrigatoriamente:

- Não proponha microsserviços como solução inicial.
- Não use MongoDB como banco principal.
- Não proponha EAV puro como modelagem central.
- Não complique a arquitetura desnecessariamente.
- Prefira clareza, separação de responsabilidades e pragmatismo.
- Considere que o builder de formulários poderá crescer e virar parte central do produto.
- O frontend precisa usar **shadcn/ui**.

## 16. Formato da resposta esperado

Quero que sua resposta venha em formato de documento técnico, com:

- títulos e subtítulos claros
- tabelas quando útil
- exemplos práticos
- trechos de código
- exemplos de JSON
- sugestões opinativas quando houver trade-off

Ao final, inclua:

1. Uma **recomendação final objetiva da stack**.
2. Uma **árvore inicial de solução backend e frontend**.
3. Um **MVP inicial recomendado**.
4. Um **exemplo mínimo funcional de backend + frontend** para iniciar o projeto.

## Instrução final

Não responda superficialmente. Responda como se estivesse preparando a base arquitetural real de um projeto corporativo que será implementado por uma equipe.
