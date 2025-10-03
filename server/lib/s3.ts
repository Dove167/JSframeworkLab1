// server/lib/s3.ts
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

export const s3 = new S3Client({
  region: process.env.S3_REGION!,
  endpoint: process.env.S3_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY!,
    secretAccessKey: process.env.S3_SECRET_KEY!,
  },
  // Force path-style URLs for Digital Ocean Spaces compatibility
  forcePathStyle: true,
  // Disable SSL verification for debugging (remove in production)
  requestHandler: {
    // @ts-ignore
    httpOptions: {
      timeout: 30000,
    },
  },
})

export async function getSignedGetUrl(params: {
  bucket: string
  key: string
  expiresIn?: number
  responseContentType?: string
  inline?: boolean
}) {
  const { bucket, key, expiresIn = 60, responseContentType, inline } = params

  console.log('🔧 Generating signed URL with params:', {
    bucket,
    key,
    expiresIn,
    inline,
    endpoint: process.env.S3_ENDPOINT
  })

  const cmd = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
    ResponseContentType: responseContentType,
    ResponseContentDisposition: inline ? 'inline' : 'attachment',
  })

  const signedUrl = await getSignedUrl(s3, cmd, { expiresIn })
  console.log('✅ Generated signed URL:', signedUrl.substring(0, 100) + '...')
  console.log('🔍 URL has signature:', signedUrl.includes('X-Amz-Signature'))

  return signedUrl
}