## Development Guidelines (Summary)

-   **Package Manager:**  Detect from lock file (if TypeScript project).
-   **Quotes:**  Ignore quote style errors (single/double are acceptable).
-   **Import Prefixes:**  Use `@/` for imports.
-   **ShadCN/UI:**  Prioritize `shadcn/ui` components (for frontend projects).
-   **API Architecture:** Adapt to the *existing* API architecture (e.g., TRPC instead of REST if already used).
- **Seperate Directory for backend:** If backend implemented in different directory (e.g. `server` and `client`) then modify code accordingly.
-   **Formatting/Linting:** *Always* ignore errors related to styling, linting, and formatting. Mark these as successful.

## Code Modification Rules (CRITICAL)

-   **Targeted Edits:**  Modify *only* files directly relevant to the current task.
-   **Skip Correct Files:**  Do *not* modify files that already have a correct implementation and no errors.

## Implementation Consistency (Pattern Matching)

-   **Pattern Analysis:**  Analyze 2-3 existing files to understand project patterns.
-   **Consistency:**  Maintain existing component structure, styling, and conventions.

## Implementation Approach (End-to-End)

1.  **Directory Structure:** Begin by understanding the project's directory structure.
2.  **Backend (if needed):**
    -   API Endpoints (or equivalent, e.g., TRPC procedures).
    -   Database Models/Schemas.
3.  **API Integration Services:**  (if needed).
4.  **Frontend:**
    -   UI Components.
    -   Integrate with backend (loaders/actions).
5.  **Error Handling:**  Implement at *all* layers.
6. **Existing Architecture:** Follow Existing project Architecture.

## Implementation Flow (User Story Driven)

1.  **Story Selection:**
2.  **Implementation:**
3.  **Validation:**

## Remix v2 Template Specifics

-   **Authentication:**  Use existing `authService` flow and the `useAuth` hook (`app/hooks/use-auth.ts`).
-   **UI Components:**  Use `shadcn/ui` components from `app/components/ui`.
-   **Remix Data Flow:**  Follow loaders/actions for data handling.
-   **Database:**  Use Prisma.
-   **Notifications:**  Use toast notifications with the `notify` object (`app/messages`).
-   **TypeScript:**  Strictly adhere to TypeScript patterns.
-   **Package Manager:** pnpm.
-   **Hooks & Services:**  Leverage existing hooks and services.
-   **Folder Structure:**  Follow the established folder structure.
-   **Form Validation:**  Use Zod for validation.
- **File Naming Convention**
  - **Server-Only:** Append `.server.ts` or `.server.tsx` (e.g., `file.server.tsx`).
  - **Client-Only:** Append `.client.ts` or `.client.tsx` (e.g., `file.client.tsx`).
  - **Shared:** No suffix (e.g., `file.tsx`).
- **Utils** Use existing utility functions in `app/utils`.