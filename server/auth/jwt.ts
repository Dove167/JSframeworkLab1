// /server/auth/jwt.ts
import type { Context } from 'hono'
import { createRemoteJWKSet, jwtVerify } from 'jose'

const ISSUER = process.env.KINDE_ISSUER_URL
const AUDIENCE = process.env.KINDE_AUDIENCE

if (!ISSUER || !AUDIENCE) {
  console.warn('⚠️  Kinde authentication not configured. Please set KINDE_ISSUER_URL and KINDE_AUDIENCE in .env file')
  console.warn('🔧 Server will start but authentication features will not work until configured')
}

// For development, we'll use placeholder values to prevent crashes
const devIssuer = ISSUER || 'https://placeholder.kinde.com'
const devAudience = AUDIENCE || 'api://default'

const jwks = createRemoteJWKSet(new URL(`${devIssuer}/.well-known/jwks.json`))

export async function requireAuth(c: Context) {
  try {
    const auth = c.req.header('authorization') || ''
    const [, token] = auth.split(' ')
    if (!token) return c.json({ error: 'Missing Bearer token' }, 401)

    // Use configured values or fallbacks for development
    const currentIssuer = ISSUER || devIssuer
    const currentAudience = AUDIENCE || devAudience

    const { payload } = await jwtVerify(token, jwks, {
      issuer: currentIssuer,
      audience: currentAudience,
    })

    // attach user to context (sub, email, etc.)
    // @ts-ignore - add a type if you like
    c.set('user', payload)
    return null // means OK, continue
  } catch (err) {
    return c.json({ error: 'Invalid or expired token' }, 401)
  }
}