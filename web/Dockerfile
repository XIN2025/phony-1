FROM node:22.16.0-alpine AS base

WORKDIR /app

RUN npm i -g pnpm

COPY package.json pnpm-lock.yaml ./

RUN pnpm install

COPY . .

RUN pnpm build:local

RUN cp -r public .next/standalone/ && cp -r .next/static .next/standalone/.next/

FROM node:22.16.0-alpine AS release

WORKDIR /app

RUN npm i -g pnpm

COPY --from=base /app/.next ./.next

CMD ["node", ".next/standalone/server.js"]