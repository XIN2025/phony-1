## Technology Stack (Summary)

-   **Framework:** Next.js 14+ (App Router)
-   **Language:** TypeScript
-   **ORM:** Prisma
-   **Authentication:** NextAuth.js
-   **UI:** ShadCN UI + Tailwind CSS
-   **State Management:** Zustand
-   **Testing:** Jest (Unit), Cypress (E2E)
-   **Package Manager:** PNPM

## Directory Structure & Conventions

-   **Components:** `/components` (Atomic Design, ShadCN UI components from `/components/ui/*`)
-   **API Routes:** `/app/api` (RESTful, Error Handling, Validation)
-   **Utilities:** `/utils`
-   **Types:** `/types`
-   **Constants:** `/constants`
-   **Hooks:** `/hooks` (Reusable logic)
-   **State (Zustand):** `/store` (Atomic, focused stores)
-   **Validation Schemas (zod):** `/validations`
-   **Authentication:** `/app/(auth)` (NextAuth.js patterns)
- **Path Alias:** Use `@/` prefix for imports (tsconfig.json configured).

## Component Structure (Consistent Pattern)

1.  **Props Interface:**  Define at the top of the component file.
2.  **Component Logic:**  Functions, state, hooks.
3.  **JSX Return:**  The rendered component.

## API & Database

-   **Prisma:**  All database interactions.
-   **RESTful APIs:**  `/app/api` routes.
-   **Validation:**  Use Zod schemas from `/validations`.  Create new schemas following existing patterns.
-   **Error Handling:**  Implement robust error handling and responses in APIs.

## Implementation Flow (Prioritized Order)

1.  **Database Schema:** (If required)
2.  **API Routes:** (If required)
3.  **Types/Interfaces:** (If required)
4.  **Store/Hooks:** (If required)
5.  **Components:**
6.  **Unit Tests (Jest):** (First ask the user if they want to write tests)
7.  **E2E Tests (Cypress):**  *If multi-page flows, ask the user for guidance.*

## Code Generation & Modification Rules (CRITICAL)

-   **Pattern Matching:**  *Prioritize* existing code patterns. Analyze similar files before generating new code. Reuse existing utilities.
-   **Minimal Changes:**  Modify *only* files directly related to the current task.
-   **Type Safety:**  Maintain strict TypeScript type definitions.
-   **Error Handling:** Implement at all levels (API, components, etc.). Follow existing patterns in `/app/error.tsx`.
-   **Testing:** Include necessary unit (Jest) and E2E (Cypress) tests. Follow existing patterns in `__tests__`.
-   **Component Hierarchy:** Adhere to the project's component structure (atomic design).
-   **Loading/Error States:** Implement appropriate loading and error states in components.
- **Authentication** Follow existing authentication patterns.
- **Styling**: Use Tailwind css for styling.
- **Linting**: Ignore formatting linting like quote, whitespace, indentation.

## Quality Assurance

-   **Type Checking:** Ensure TypeScript type correctness.
-   **Prisma Schema:** Verify schema integrity.
-   **API Routes:** Validate implementation and error handling.
-   **Responsiveness:** Check for responsive design.
-   **Accessibility:** Consider accessibility.