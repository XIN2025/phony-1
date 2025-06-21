## Project Overview

* **Description** : Full-stack application with FastAPI backend and Next.js frontend

## Backend (server/)
### Directory Structure
```text
server/
├── src/                    # Main source code
│   ├── config/            # Application configuration
│   ├── models/            # Database models
│   ├── modules/           # Feature modules
│   ├── exceptions/        # Error handlers
│   └── utils/             # Shared utilities
├── tests/                 # Test suites
└── migrations/            # Database migrations
```

### Coding Standards
#### Module Structure

Each feature module in `src/modules/` should follow this structure:
* `router.py` : API route definitions
* `service.py`  : Business logic implementation
* `schemas.py`  : Pydantic models for request/response
* `dependencies.py`  : FastAPI dependencies
* `constants.py`  : Module-specific constants
* `exceptions.py`  : Custom exceptions
* `utils.py`  : Module-specific utilities

#### Best Practices
1. **Dependency Injection**
   * Use FastAPI's dependency injection system
   * Define dependencies in module's `dependencies.py`
   * Prefer dependency injection over direct imports
2. **Error Handling**
   * Define custom exceptions in `exceptions.py` which are globally used, modules specific exceptions should be defined in the module's specific directory directly
   * Use global exception handlers in `src/exceptions/handlers.py`
   * Return consistent error responses
3. **Database**
   * Use tortoise models in `src/models/`
4. **Testing**
   * Write tests in `tests/` directory
   * Follow test file naming: `test_*.py`
   * Use pytest fixtures for common setup
5. Read Readme.md for more information

## Frontend (web/)
### Directory Structure
```text
web/
├── app/                   # Next.js app directory
│   ├── api/              # API routes
│   └── (auth)/           # Auth-related pages
├── components/           # React components
│   ├── ui/              # Reusable UI components
│   └── auth/            # Auth-related components
├── assets/              # Static assets
├── config/              # Frontend configuration
├── constants/           # Application constants
├── hooks/               # Custom React hooks
├── lib/                 # Utility libraries
├── services/           # API service layers
├── store/              # State management
├── types/              # TypeScript types
├── utils/              # Utility functions
└── validations/        # Schema validations
```

### Coding Standards
#### Component Structure
1. **UI Components**
   * Place reusable UI components in `components/ui/`
   * Follow atomic design principles
   * Use TypeScript for type safety
2. **Page Components**
   * Use Next.js App Router structure
   * Keep pages minimal, delegate to components
   * Keep code modular and clean
   * Handle loading and error states
3. **State Management**
   * Use React hooks for local state
   * Implement global state in `store/`
   * Follow immutable state patterns
4. **API Integration**
   * Define type-safe API clients in `services/`
   * Use `ApiClient` for API integration
   * Use environment variables for endpoints
   * Handle errors consistently

#### Best Practices
1. **TypeScript**
   * Define types in `types/` directory
   * Use strict type checking
   * Avoid `any` type usage
2. **Styling**
   * Use Tailwind CSS for styling
   * Follow component-based styling
   * Maintain consistent theme variables

## Development Workflow
### Environment Setup

1. Copy `.env.example` to `.env` in both `server/` and `web/`
2. Install dependencies:
   * Backend: Use `uv` for dependency management
   * Frontend: Use `pnpm` for package management

### Running the Application
1. Development mode:
   * Backend: `source .venv/bin/activate` and `fastapi dev`
   * Frontend: `pnpm dev`

### Code Quality
* Follow ESLint and Prettier configurations
* Use pre-commit hooks for code formatting
* Follow conventional commits

## API Guidelines
### Backend Endpoints
1. **Route Structure**
   * Group routes by feature in modules
   * Use versioning when needed
   * Follow RESTful conventions
2. **Error Handling**
   * Use appropriate HTTP status codes
   * Include detailed error messages
   * Handle validation errors consistently

## Security Considerations
1. **Authentication**
   * JWT-based authentication
2. **Data Protection**
   * Input validation
   * SQL injection prevention
   * XSS protection

## Performance Guidelines

1. **Backend**
   * Use async operations where appropriate
   * Implement caching strategies
   * Optimize database queries
2. **Frontend**
   * Implement code splitting
   * Optimize image loading
   * Use client-side caching
