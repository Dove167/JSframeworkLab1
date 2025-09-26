# Learnings about Hono and Bun in this project Lab 1 2025-09-05 2:30PM:

*   **Bun as the Runtime and Module Bundler**: Bun is used as the JavaScript runtime for executing the server and likely also for its module bundling capabilities, given the `.ts` files are directly run.
*   **Hono as the Web Framework**: Hono is the chosen web framework for building the API, handling routing and request/response cycles.
*   **Hono Middleware Usage**: The project demonstrates the use of Hono's middleware system, with `logger()` applied globally for request logging.
*   **Bun's Native HTTP Server Integration**: Hono applications are designed to be compatible with the Web Fetch API, allowing them to be directly served by Bun's highly performant native HTTP server.
*   **TypeScript Integration**: TypeScript is used for development, leveraging Bun's native TypeScript support, as indicated by `.ts` files and `@types/bun` dependency.

# Learnings about Lab 2 2025-09-05 2:35PM:

- Struggled with PowerShell and curl.exe quoting for JSON in POST requests, requiring escaped backslashes for double quotes.
- Encountered "Malformed JSON" errors when using incorrect -d syntax, resolved by matching the working example with single quotes and escaping.
- Initially faced type errors after dependency installation, fixed by stopping and restarting `bun run dev`.
- Together, we explored API testing prototypes with curl, identifying how to properly set headers and send data for validation.
- Made code changes to `server/routes/expenses.ts`: added `ok` and `err` helpers for consistent error payloads, updated 404 error returns to use `err(c, 'Not found', 404)` instead of direct c.json.

# Learnings about Lab 3 2025-09-05 7:06PM:

- **PUT vs PATCH**: PUT replaces entire resources completely (replaces all fields), while PATCH applies partial updates (only modifies provided fields)
- **HTTP Semantics**: PUT is idempotent (multiple identical calls = same result), PATCH might not be if it uses relative operations like increment/decrement
- **Validation**: Both use Zod schemas, but PUT requires all fields while PATCH uses optional fields with refinement validation
- **PowerShell Issues**: Encountered quoting problems with curl.exe on Windows, requiring careful escaping of JSON strings in PowerShell
- **Error Handling**: Properly returning 400 for validation errors and 404 for non-existent resources, with consistent error message format
- **Middleware Integration**: Hono's zod-validator middleware works well for automatic JSON parsing and validation before route handlers
- **Fixed corrupted bun cache**: rm -rf node_modules bun.lock, bun install --no-cache --backend=copyfile

# Learnings about Lab 4 2025-09-12 2:35PM:

- **In-Memory to Database Transition**: Replaced local JavaScript array operations (find, push, splice, findIndex) with Drizzle ORM database queries using db.select(), db.insert(), db.update(), and db.delete() with proper WHERE clauses using eq() for ID filtering
- **Async/Await Integration**: All route handlers now use async/await for database operations, replacing synchronous array methods that were blocking the event loop
- **Schema Integration**: Added imports for db client and schema from '../db/client', destructuring { expenses } from schema for type-safe table references
- **Returning Clauses**: Database operations use .returning() to get created/updated/deleted rows, replacing manual object construction and array manipulation
- **Gotcha - Curl Testing**: PowerShell curl.exe had JSON escaping issues with parentheses in strings; Git Bash curl worked reliably with multi-line syntax and single quotes for JSON data
- **Error Handling Consistency**: Maintained ok/err helper functions for uniform response format while adapting 404 checks from array existence to database result length

# Learnings about Lab 5 2025-09-12 4:31PM:

- **Vite + React + TypeScript Setup**: Successfully scaffolded Vite React TS app with bun create vite, configured path alias "@" for src/ imports, and integrated TypeScript path mappings in tsconfig.json for module resolution
- **TailwindCSS Configuration**: Set up Tailwind via PostCSS with proper content paths including src/components for ShadCN, learned that Tailwind processing happens through postcss.config.js rather than explicit Vite plugins
- **Vite Config Plugin Issue**: Initial vite.config.ts with tailwindcss() plugin caused TypeScript errors; resolved by removing it since TailwindCSS is handled via PostCSS configuration, keeping only React plugin and path alias
- **ShadCN UI Integration**: Used npx shadcn@latest (bunx failed due to source-map dependency issues) to initialize with New York style and Stone base color, successfully added button, card, and input components to src/components/ui/
- **Windows Development Challenges**: Encountered EPERM permission errors with Vite's .vite/deps cache in OneDrive folder, resolved by manually clearing node_modules/.vite directory; Node.js version warning (20.17.0 vs required 20.19+) but server still ran successfully
- **Component Architecture**: Created reusable AppCard component using ShadCN Card with proper import structure; learned relative imports work reliably while "@" alias required TypeScript server restart to resolve in VSCode

# Learnings about Lab 6 2025-09-19 2:45PM

- **TanStack Query Integration**: Successfully connected React frontend to Hono backend API using QueryClientProvider, useQuery for fetching/caching expenses list, and useMutation for creating new expenses with automatic cache invalidation on success
- **CORS Configuration**: Encountered browser CORS errors when frontend (localhost:5173) tried to fetch from backend (localhost:3000); resolved by adding Hono's cors() middleware to server/app.ts with proper origin, methods (GET, POST, PUT, PATCH, DELETE, OPTIONS), and headers configuration
- **Loading and Error States**: Implemented proper loading states ("Loading…") and error handling in useQuery, with the component gracefully showing error messages when fetch requests fail
- **Automatic UI Updates**: useMutation's onSuccess callback invalidates the ['expenses'] query key, causing useQuery to automatically refetch and update the UI when new expenses are created via the form
- **Data Persistence**: Expenses data persists across browser sessions (including incognito mode) because it's stored in the PostgreSQL database via Drizzle ORM, not just in browser memory or localStorage
- **Development Workflow**: Restarting backend server required after CORS middleware changes; frontend hot reload handled TanStack Query updates automatically, but full page refresh needed to clear failed fetch states

# Learnings about Lab 7 2025-09-26 10:16AM

- **TanStack Query Setup**: Installed @tanstack/react-query v5.90.2 and configured QueryClientProvider in main.tsx with default options (5s stale time, 1 retry) to enable caching and state management across the React app
- **useQuery Implementation**: Created ExpensesList component using useQuery hook to fetch expenses from /api/expenses with proper loading ("Loading…") and error state handling, displaying data in a clean list format
- **useMutation for Data Creation**: Implemented AddExpenseForm component with useMutation for POST requests, including form state management (title/amount), validation, and automatic cache invalidation on successful submission
- **Cache Invalidation Strategy**: Used queryClient.invalidateQueries({ queryKey: ['expenses'] }) in mutation's onSuccess callback to automatically refresh the expenses list when new items are added, ensuring UI consistency
- **API Response Format Alignment**: Modified backend GET/POST endpoints to return direct { expenses: [...] } and { expense: {...} } format instead of nested { data: {...} } to match TanStack Query expectations and simplify component logic
- **End-to-End Testing**: Verified complete data flow from backend API through TanStack Query caching to frontend UI, confirming that expense creation triggers automatic list updates and proper error handling throughout the stack

# Learnings about Lab 8 2025-09-26 10:47AM

1. **File-Based Routing**: TanStack Router automatically creates routes from file structure - just create files in routes/ directory and they're registered
2. **Layout with Outlet**: App.tsx became a shared layout using Outlet component instead of containing all UI logic directly
3. **Nested Routes**: Created nested routes like /expenses/:id using file naming convention (expenses.detail.tsx for expense detail pages)
4. **Route Parameters**: Used useParams() hook to access dynamic route parameters like expenseId from URLs
5. **Link Navigation**: Replaced anchor tags with Link components for client-side routing with proper active states
6. **Error Boundaries**: Added defaultNotFoundComponent and defaultErrorComponent for better UX on missing pages and errors

