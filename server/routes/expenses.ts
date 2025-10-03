// server/routes/expenses.ts
import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { db, schema } from '../db/client'
import { eq } from 'drizzle-orm'
import { requireAuth } from '../auth/jwt'
import { getSignedGetUrl } from '../lib/s3'

const ok = <T>(c: any, data: T, status = 200) => c.json({ data }, status)
const err = (c: any, message: string, status = 400) => c.json({ error: { message } }, status)

const { expenses } = schema

// Zod schemas
const expenseSchema = z.object({
  id: z.number().int().positive(),
  title: z.string().min(3).max(100),
  amount: z.number().int().positive(),
  fileUrl: z.string().optional(),
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
    return c.json({ expenses: rows })
  })

  // GET /api/expenses/:id → single item
  // Enforce numeric id with a param regex (\\d+)
  .get('/:id{\\d+}', async (c) => {
    const id = Number(c.req.param('id'))
    const [row] = await db.select().from(expenses).where(eq(expenses.id, id)).limit(1)
    if (!row) return err(c, 'Not found', 404)
    return ok(c, { expense: row })
  })

  // GET /api/expenses/:id/file-url → get signed URL for file access
  .get('/:id{\\d+}/file-url', async (c) => {
    const authResult = await requireAuth(c)
    if (authResult) return authResult

    const id = Number(c.req.param('id'))
    const [row] = await db.select().from(expenses).where(eq(expenses.id, id)).limit(1)

    if (!row) return c.json({ error: 'Not found' }, 404)
    if (!row.fileUrl) return c.json({ url: null })

    // Extract key from fileUrl (format: https://bucket.s3.region.amazonaws.com/key)
    const url = new URL(row.fileUrl)
    const key = url.pathname.substring(1) // Remove leading slash

    if (!key) return c.json({ url: null })

    try {
      const signedUrl = await getSignedGetUrl({
        bucket: process.env.S3_BUCKET!,
        key: key,
        expiresIn: 3600, // 1 hour - longer expiration for debugging
        inline: true, // Show in browser for images/PDFs
      })

      console.log('Generated signed URL for key:', key)
      console.log('Signed URL length:', signedUrl.length)
      console.log('Has signature params:', signedUrl.includes('X-Amz-Signature'))

      return c.json({ url: signedUrl })
    } catch (error) {
      console.error('Error generating signed URL:', error)
      return c.json({ error: 'Failed to generate file URL' }, 500)
    }
  })

  // POST /api/expenses → create (validated)
  .post('/', zValidator('json', createExpenseSchema), async (c) => {
    const data = c.req.valid('json') // { title, amount }
    const [created] = await db.insert(expenses).values(data).returning()
    return c.json({ expense: created }, 201)
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