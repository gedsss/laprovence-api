# La Provence API

API REST para gestão de listas de presentes de casamento. Permite que noivos criem e gerenciem suas listas, e que convidados realizem compras de presentes.

## Tecnologias

- **Runtime:** Node.js com [Fastify](https://fastify.dev/)
- **ORM:** [Prisma](https://www.prisma.io/) (PostgreSQL)
- **Autenticação:** JWT via `@fastify/jwt`
- **Validação:** [Zod](https://zod.dev/)
- **Linguagem:** TypeScript
- **Linter/Formatter:** [Biome](https://biomejs.dev/)

## Pré-requisitos

- Node.js 18+
- PostgreSQL
- npm

## Instalação

```bash
# Clone o repositório
git clone <url-do-repositorio>
cd laprovence-api

# Instale as dependências
npm install
```

## Configuração

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/laprovence"
JWT_PASS="sua_chave_secreta_jwt"
```

## Banco de Dados

```bash
# Aplicar o schema ao banco de dados
npx prisma db push

# Gerar o cliente Prisma
npx prisma generate
```

## Executando

```bash
# Desenvolvimento (com hot reload)
npm run dev
```

O servidor ficará disponível em `http://localhost:3333`.

---

## Autenticação

As rotas protegidas exigem um token JWT no header da requisição:

```
Authorization: Bearer <token>
```

O token é obtido pela rota `POST /login`.

---

## Rotas

### Auth

| Método | Rota | Autenticação | Descrição |
|--------|------|:---:|-----------|
| POST | `/login` | ❌ | Login do usuário (limite: 5 req/min) |
| POST | `/forgot-password` | ❌ | Solicitar redefinição de senha |
| POST | `/reset-password` | ❌ | Redefinir senha com token |

#### POST `/login`
```json
{
  "email": "usuario@email.com",
  "password": "minhasenha123"
}
```
**Resposta:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### Usuários

| Método | Rota | Autenticação | Descrição |
|--------|------|:---:|-----------|
| POST | `/users` | ❌ | Criar novo usuário (casal) |
| GET | `/users/:id` | ✅ | Buscar usuário por ID |
| PUT | `/users/:id` | ✅ | Atualizar usuário |
| DELETE | `/users/:id` | ✅ | Deletar usuário |

#### POST `/users`
```json
{
  "nome_noiva": "Ana Silva",
  "nome_noivo": "Carlos Silva",
  "email": "ana.carlos@email.com",
  "telefone": "11999999999",
  "password": "minhasenha123",
  "data_casamento": "2026-12-15"
}
```

#### PUT `/users/:id`
Todos os campos são opcionais:
```json
{
  "email": "novo@email.com",
  "telefone": "11988888888",
  "password": "novasenha456",
  "data_casamento": "2026-12-20",
  "foto_casal": "https://url-da-foto.com/foto.jpg"
}
```

---

### Catálogo

| Método | Rota | Autenticação | Descrição |
|--------|------|:---:|-----------|
| POST | `/catalogo` | ✅ | Criar item no catálogo |
| GET | `/catalogo` | ❌ | Listar itens (com filtros e paginação) |
| GET | `/catalogo/:id` | ❌ | Buscar item por ID |
| PUT | `/catalogo/:id` | ✅ | Atualizar item |
| DELETE | `/catalogo/:id` | ✅ | Deletar item |

#### POST `/catalogo`
```json
{
  "nome": "Jogo de Jantar 12 Peças",
  "marca": "Oxford",
  "tamanho": "Standard",
  "descricao": "Jogo de jantar completo em porcelana",
  "preco": 450.00,
  "setor": "Mesa_posta",
  "estoque": 10,
  "quantidade": 1,
  "peso": 3.5,
  "status": "Ativo"
}
```

**Setores disponíveis:** `Mesa_posta`, `Prataria`, `Adornos`, `Aromas`, `Mobiliario`, `Vasos`, `Complementos`

**Status disponíveis:** `Ativo`, `Inativo`

#### GET `/catalogo` — Query params
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `page` | number | Página (padrão: 1) |
| `limit` | number | Itens por página (padrão: 20) |
| `setor` | string | Filtrar por setor |
| `status` | string | Filtrar por status (`Ativo`/`Inativo`) |
| `nome` | string | Busca por nome |

---

### Imagens do Catálogo

| Método | Rota | Autenticação | Descrição |
|--------|------|:---:|-----------|
| POST | `/catalogo-images` | ✅ | Adicionar imagem a um item |
| GET | `/catalogo-images/:id` | ❌ | Buscar imagem por ID |
| PUT | `/catalogo-images/:id` | ✅ | Atualizar imagem |
| DELETE | `/catalogo-images/:id` | ✅ | Deletar imagem |

#### POST `/catalogo-images`
```json
{
  "catalogo_id": "uuid-do-item",
  "url": "https://url-da-imagem.com/imagem.jpg",
  "posicao": 1
}
```

---

### Listas de Presentes

| Método | Rota | Autenticação | Descrição |
|--------|------|:---:|-----------|
| POST | `/listas` | ✅ | Criar lista |
| GET | `/listas/:id` | ✅ | Buscar lista por ID |
| GET | `/listas/codigo/:codigo` | ❌ | Buscar lista pelo código (6 chars) |
| GET | `/listas/user/:user_id` | ✅ | Listar listas de um usuário |
| PUT | `/listas/:id` | ✅ | Atualizar lista |
| DELETE | `/listas/:id` | ✅ | Deletar lista |

#### POST `/listas`
```json
{
  "user_id": "uuid-do-usuario",
  "nome_noivos": "Ana & Carlos",
  "telefone": "11999999999",
  "data_casamento": "2026-12-15",
  "foto_casal": "https://url-da-foto.com/foto.jpg",
  "mensagem_boas_vindas": "Bem-vindos à nossa lista de presentes!"
}
```

---

### Itens da Lista

| Método | Rota | Autenticação | Descrição |
|--------|------|:---:|-----------|
| POST | `/lista-itens` | ✅ | Adicionar item à lista |
| GET | `/listas/:listas_id/itens` | ❌ | Listar itens de uma lista |
| DELETE | `/lista-itens/:id` | ✅ | Remover item da lista |

#### POST `/lista-itens`
```json
{
  "listas_id": "uuid-da-lista",
  "catalogo_id": "uuid-do-item-catalogo"
}
```

---

### Compras

| Método | Rota | Autenticação | Descrição |
|--------|------|:---:|-----------|
| POST | `/compras` | ✅ | Registrar uma compra |
| GET | `/compras/:id` | ✅ | Buscar compra por ID |
| GET | `/compras/cpf/:cpf` | ✅ | Buscar compras por CPF do convidado |
| GET | `/compras/lista/:lista` | ❌ | Listar compras de uma lista |
| PUT | `/compras/:id` | ✅ | Atualizar compra |
| DELETE | `/compras/:id` | ✅ | Deletar compra |

#### POST `/compras`
```json
{
  "listas_id": "uuid-da-lista",
  "catalogo_id": "uuid-do-item-catalogo",
  "nome_convidado": "João Souza",
  "cpf": "12345678901",
  "telefone": "11977777777",
  "valor_pago": 450.00,
  "forma_pagamento": "PIX",
  "status_pagamento": "Pendente"
}
```

**Status de pagamento:** `Pendente`, `Aprovado`, `Rejeitado`

---

### Pré-montadas

Listas pré-configuradas de itens sugeridas pelo gestor.

| Método | Rota | Autenticação | Descrição |
|--------|------|:---:|-----------|
| POST | `/premontadas` | ✅ | Criar lista pré-montada |
| GET | `/premontadas` | ❌ | Listar todas as pré-montadas |
| GET | `/premontadas/:id` | ❌ | Buscar pré-montada por ID |
| PUT | `/premontadas/:id` | ✅ | Atualizar pré-montada |
| DELETE | `/premontadas/:id` | ✅ | Deletar pré-montada |

#### POST `/premontadas`
```json
{
  "nome": "Kit Cozinha Completa",
  "descricao": "Tudo o que você precisa para a sua cozinha",
  "badge": "Mais Popular",
  "popular": true,
  "img": "https://url-da-imagem.com/kit.jpg"
}
```

---

### Itens de Pré-montadas

| Método | Rota | Autenticação | Descrição |
|--------|------|:---:|-----------|
| POST | `/premontada-itens` | ✅ | Adicionar item a uma pré-montada |
| GET | `/premontadas/:premontada_id/itens` | ❌ | Listar itens de uma pré-montada |
| DELETE | `/premontada-itens/:premontada_id/:catalogo_id` | ✅ | Remover item de uma pré-montada |

#### POST `/premontada-itens`
```json
{
  "premontada_id": "uuid-da-premontada",
  "catalogo_id": "uuid-do-item-catalogo"
}
```

---

## Respostas de Erro

Todos os erros seguem o formato:

```json
{
  "success": false,
  "message": "Descrição do erro"
}
```

Erros de aplicação incluem adicionalmente:

```json
{
  "success": false,
  "code": "CODIGO_DO_ERRO",
  "message": "Descrição do erro",
  "details": {}
}
```

| Status | Descrição |
|--------|-----------|
| 400 | Dados inválidos na requisição |
| 401 | Não autenticado (token ausente ou inválido) |
| 404 | Recurso não encontrado |
| 429 | Limite de requisições atingido |
| 500 | Erro interno do servidor |

---

## Estrutura do Projeto

```
laprovence-api/
├── index.ts                  # Entry point
├── prisma/
│   └── schema.prisma         # Schema do banco de dados
├── errors/
│   ├── appError.ts           # Classe base de erros
│   ├── errorCodes.ts         # Códigos de erro
│   └── errors.ts             # Erros específicos (NotFoundError, etc.)
└── src/
    ├── plugins/
    │   └── auth.ts           # Plugin JWT (app.authenticate)
    ├── auth/                 # Login, forgot/reset password
    └── modules/
        ├── user/
        ├── catalogo/
        ├── catalogo_images/
        ├── listas/
        ├── lista_itens/
        ├── compras/
        ├── premontadas/
        └── premontada_itens/
```
