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

