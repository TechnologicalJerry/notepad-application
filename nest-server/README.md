# Nest Server (Production-Ready)

NestJS API implementation aligned with the Express/Fastify services in this workspace.

## Features

- NestJS modular architecture (Users, Sessions/Auth, Todos)
- MongoDB with Mongoose schemas and indexes
- JWT authentication with Passport strategy
- Global request validation using class-validator
- Security middleware: helmet, compression, cookie-parser, CORS
- OpenAPI/Swagger docs at `/docs`
- Healthcheck endpoint at `/healthcheck`
- In-memory Mongo e2e test setup for reliable CI

## API Overview

Base URL prefix: `/api`

Public routes:

- `GET /healthcheck`
- `POST /api/users`
- `GET /api/users`
- `GET /api/users/:id`
- `PATCH /api/users/:id`
- `DELETE /api/users/:id`
- `POST /api/sessions/login`

Protected routes (Bearer token required):

- `POST /api/sessions/logout`
- `GET /api/sessions/me`
- `POST /api/todos`
- `GET /api/todos`
- `GET /api/todos/:id`
- `PATCH /api/todos/:id`
- `DELETE /api/todos/:id`

## Environment Variables

Copy `.env.example` to `.env` and fill values.

Required:

- `MONGODB_URI`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`

Optional:

- `PORT` (default: `3000`)
- `JWT_ACCESS_EXPIRES_IN` (default: `15m`)
- `JWT_REFRESH_EXPIRES_IN` (default: `7d`)
- `NODE_ENV` (`development` | `production` | `test`)

## Run

```bash
npm install
npm run start:dev
```

Production:

```bash
npm run build
npm run start:prod
```

## Test

```bash
npm run test
npm run test:e2e
```
