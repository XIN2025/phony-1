# Heizen

Developer tools to ship end to end custom AI software in 10 mins

# Env Files

We use dotenv vault to manage env files for different environment

1. Initially need to login
   npx dotenv-vault@latest new <vault_id>
2. for development environment -> to run on your local machine
   - pnpm run build:dev
   - it will pull the development env
3. for stagging environment -> to run on dev/stagging cloud env
   - pnpm run build:stagging
   - it will pull the stagging env
4. for production environment -> to run on production cloud env
   - pnpm run build:production
   - it will pull the production env

# Project Setup

1. This is a mono repo for both frontend (`web`) and the backend (`server`).
2. Please only use `pnpm` for frontend and backend.

## Running the projects

Refer the readme of the project you want to run in their directory

1. Frontend: [README](./web/README.md)
2. Backend: [README](./server/README.md)

## General Guidelines for Frontend Project

### Components Folder

    - Naming Convention: Use PascalCase.
    - Purpose: Store reusable UI components.
    - Examples: Header.jsx, Footer.jsx, UserProfile.jsx.

### Pages Folder

    - Naming Convention: Use lowercase and hyphens.
    - Purpose: Store page components mapped to routes.
    - Examples: index.jsx, about.jsx, api/users.js.

### Public Folder

    - Naming Convention: Use lowercase and hyphens.
    - Purpose: Store static assets like images and fonts.
    - Examples: images/logo.png, fonts/Roboto.woff2.

### Styles Folder

    - Naming Convention: Use lowercase and hyphens for global styles, PascalCase for module-specific styles.
    - Purpose: Store global CSS files and CSS modules.
    - Examples: globals.css, Home.module.css.

### Utils Folder

    - Naming Convention: Use camelCase for files.
    - Purpose: Store utility functions.
    - Examples: fetchData.js, formatDate.js.

### Hooks Folder

    - Naming Convention: Use camelCase.
    - Purpose: Store custom hooks.
    - Examples: useAuth.js, useFetch.js.

### Context Folder

    - Naming Convention: Use PascalCase for context files.
    - Purpose: Store context providers and consumers.
    - Examples: AuthContext.js.

### Services Folder

    - Naming Convention: Use camelCase for files.
    - Purpose: Store service functions for API calls and business logic.
    - Examples: api.js.

# Tavily Search Keys

- dev -> karl marx account
- staging -> ga89qin
- prod -> abhilsingh
