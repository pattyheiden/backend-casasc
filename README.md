# CasaSC Back-end

API REST em Node.js, Fastify, TypeScript, Prisma e PostgreSQL para o front-end CasaSC.

## Por que Fastify

Fastify combina bem com este projeto porque entrega uma API REST performatica, simples de manter e sem excesso de estrutura. O Prisma fica responsavel pelo contrato com PostgreSQL, migrations e consultas tipadas.

## Rodando localmente

1. Instale dependencias:

```bash
npm install
```

2. Configure o ambiente:

```bash
cp .env.example .env
```

3. Suba um PostgreSQL local e ajuste `DATABASE_URL`.

4. Crie as tabelas e carregue dados iniciais:

```bash
npm run prisma:migrate
npm run db:seed
```

5. Rode a API:

```bash
npm run dev
```

Por padrao a API sobe em `http://localhost:3333`. No front, defina:

```bash
VITE_API_URL=http://localhost:3333
```

Se quiser restringir CORS em producao, use uma lista separada por virgulas:

```bash
CORS_ORIGIN=https://casa-sc.com.br,https://www.casa-sc.com.br
```

## Endpoints

- `GET /health`
- `GET /properties`
- `GET /properties/:id`
- `POST /properties/drafts`
- `POST /properties/:id/views`
- `POST /properties/:id/whatsapp-clicks`
- `POST /properties/:id/shares`
- `GET /cities`
- `GET /cities/:citySlug/neighborhoods`
- `GET /brokers`
- `GET /advertisers`

## Proximos passos

- Autenticacao JWT para anunciantes, corretores, moderadores e admin.
- Upload de imagens para bucket externo.
- Painel de moderacao para publicar, pausar e arquivar imoveis.
- Relatorios agregados de leads e metricas.
# backend-casasc
