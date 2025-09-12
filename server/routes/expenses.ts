// server/routes/expenses.ts
import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { db, schema } from '../db/client'
import { eq } from 'drizzle-orm'

const ok = <T>(c: any, data: T, status = 200) => c.json({ data }, status)
const err = (c: any, message: string, status = 400) => c.json({ error: { message } }, status)

const { expenses } = schema

// Zod schemas
const expenseSchema = z.object({
  id: z.number().int().positive(),
  title: z.string().min(3).max(100),
  amount: z.number().int().positive(),
})

const createExpenseSchema = expenseSchema.omit({ id: true })

// Allow updating title and/or amount, but not id
const updateExpenseSchema = z.object({
  title: z.string().min(3).max(100).optional(),
  amount: z.number().int().positive().optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update',
})

// Router
export const expensesRoute = new Hono()
// GET /api/expenses → list
  .get('/', async (c) => {
    const rows = await db.select().from(expenses)
    return ok(c, { expenses: rows })
  })

  // GET /api/expenses/:id → single item
  // Enforce numeric id with a param regex (\\d+)
  .get('/:id{\\d+}', async (c) => {
    const id = Number(c.req.param('id'))
    const [row] = await db.select().from(expenses).where(eq(expenses.id, id)).limit(1)
    if (!row) return err(c, 'Not found', 404)
    return ok(c, { expense: row })
  })

  // POST /api/expenses → create (validated)
  .post('/', zValidator('json', createExpenseSchema), async (c) => {
    const data = c.req.valid('json') // { title, amount }
    const [created] = await db.insert(expenses).values(data).returning()
    return ok(c, { expense: created }, 201)
  })

  // DELETE /api/expenses/:id → remove
  .delete('/:id{\\d+}', async (c) => {
    const id = Number(c.req.param('id'))
    const [deletedRow] = await db.delete(expenses).where(eq(expenses.id, id)).returning()
    if (!deletedRow) return err(c, 'Not found', 404)
    return ok(c, { deleted: deletedRow })
  })

  // PUT /api/expenses/:id → full replace
  .put('/:id{\\d+}', zValidator('json', createExpenseSchema), async (c) => {
    const id = Number(c.req.param('id'))
    const data = c.req.valid('json')
    const [updated] = await db.update(expenses).set(data).where(eq(expenses.id, id)).returning()
    if (!updated) return err(c, 'Not found', 404)
    return ok(c, { expense: updated })
  })

  // PATCH /api/expenses/:id → partial update
  .patch('/:id{\\d+}', zValidator('json', updateExpenseSchema), async (c) => {
    const id = Number(c.req.param('id'))
    const patch = c.req.valid('json')
    const [updated] = await db.update(expenses).set(patch).where(eq(expenses.id, id)).returning()
    if (!updated) return err(c, 'Not found', 404)
    return ok(c, { expense: updated })
  })