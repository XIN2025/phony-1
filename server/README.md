
# Project Setup
# To start the project for development

1. run `pnpm i` to install all packages
2. run `docker-compose up` for running database in another terminal.
3. run prisma generate, to generate prisma client.
4. run `pnpm start:dev` to run the server
5. add .env file in server folder
6. check if server is running at http://localhost:3001/

# When changing any code

1. after code has been changed run `pnpm run lint` for linting and formatting the code.

# Database ORM Prisma
## Setup
  - pnpm install prisma --save-dev
  - npx prisma
  - npx prisma init : to setup new project
  - to generate prisma client: prisma generate
  - To create migration from your prisma schema, apply them to the database, generate client: prisma migrate dev
  - pull schema from an existing database, updating Prisma schema: prisma db pull
  - Push the prisma schema state to the datase: prisma db push
  - Validate your prisma: prisma validate
  - prisma format
