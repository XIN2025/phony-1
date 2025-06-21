## Development Guidelines (Adaptable)
-   **Package Manager:** Detect from lock file (e.g., `package-lock.json`, `pnpm-lock.yaml`, `yarn.lock`).
-   **Quotes:** Ignore quote style errors (single/double are acceptable).
-   **Import Aliases:** If path aliases (e.g., `@/`) are used, parse configuration files (e.g., `tsconfig.json`, `jsconfig.json`, `webpack.config.js`, `\.babelrc`) to resolve them.
- **UI Components:** Prioritize using a component library (shadcn or similiar) if the user confirms using.
-   **API Architecture:** Adapt to the *existing* API architecture (REST, GraphQL, tRPC, etc.).  Do *not* introduce a new architecture unless explicitly requested.
-   **Separate Backend Directory:** If the backend is in a separate directory (e.g., `server`, `api`), adjust file modifications accordingly.
-   **Formatting/Linting:** *Always* ignore errors related to styling, linting, and formatting. Mark these as successful.
- **User Confirmation:** If crucial details are missing or ambiguous (e.g., specific library usage, testing framework), *ask the user for clarification* before proceeding.

## Code Modification Rules (CRITICAL)

-   **Targeted Edits:** Modify *only* files directly relevant to the current task.
-   **Skip Correct Files:** Do *not* modify files that already have a correct implementation and no errors.
-   **Preserve Comments:** Do *not* remove existing comments unless specifically instructed.

## Implementation Consistency (Pattern Matching)

-   **Pattern Analysis:** Analyze 2-3 existing files of a similar type (e.g., components, API routes) to understand the project's coding style and patterns.
-   **Consistency:** Maintain existing component structure, styling, data fetching methods, and overall conventions.  *Mimic* the existing code as closely as possible.

## Implementation Approach (General)

1.  **Project Structure:** Begin by understanding the project's directory structure and file organization. Use `tree` command or similar.
2.  **Identify Core Technologies:** Determine the primary framework, libraries, and tools used (e.g., React, Vue, Angular, Svelte; state management; testing libraries). Ask the user if needed.
3.  **Backend (if needed):**
    -   API Endpoints (or equivalent, e.g., GraphQL resolvers, tRPC procedures).
    -   Database Models/Schemas (if applicable).
4.  **API Integration:**  Create or modify services/functions to interact with the backend.
5.  **Frontend (if needed):**
    -   UI Components.
    -   Integrate with backend data (using appropriate methods for the framework).
6.  **Error Handling:** Implement at *all* layers (UI, API, data fetching).
7.  **Testing:** Create or modify tests (unit, integration, E2E) based on the project's existing testing strategy. Ask the user if the strategy is unclear.

## Implementation Flow (User Story Driven)

1. **Story Selection:**
2. **Implementation:**
3. **Validation:**

## Framework-Agnostic Considerations

- **Authentication:** If authentication is required, *first* analyze existing authentication mechanisms before implementing new ones. Ask the user about the auth flow if needed.
- **State Management:** Determine the existing state management solution (e.g., Redux, Vuex, Zustand, Context API, MobX) and follow its patterns.
- **Data Fetching:** Use the project's preferred method for data fetching (e.g., `fetch`, `axios`, GraphQL client, framework-specific hooks).
- **Styling:** Adapt to the existing styling approach (e.g., CSS Modules, Styled Components, Tailwind CSS, plain CSS).
- **File Naming Conventions:**  Observe and follow any existing file naming conventions (e.g., `PascalCase` for components, `service.ts` for services).
- **Testing Conventions:** Analyze existing tests to understand the testing framework, mocking strategy, and file structure.