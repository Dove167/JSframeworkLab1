// frontend/src/components/UploadExpenseForm.tsx
import { useState } from 'react'
import { useKindeAuth } from '@kinde-oss/kinde-auth-react'

interface UploadExpenseFormProps {
  title?: string
  amount?: number
  onUploadComplete?: (fileUrl: string) => void
}

export function UploadExpenseForm({ title: propTitle, amount: propAmount, onUploadComplete }: UploadExpenseFormProps = {}) {
  const { getToken } = useKindeAuth()
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [customTitle, setCustomTitle] = useState(propTitle || '')
  const [customAmount, setCustomAmount] = useState<number | ''>(propAmount || '')

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault()
    if (!file) return

    setIsUploading(true)

    try {
      // Get auth token
      const token = await getToken()
      console.log('Auth token present:', !!token)
      console.log('Auth token preview:', token?.substring(0, 50) + '...')

      if (!token) {
        throw new Error('Not authenticated')
      }

      // 1. Ask backend for signed URL
      console.log('Making request to:', 'http://localhost:3000/api/upload/sign')
      const res = await fetch('http://localhost:3000/api/upload/sign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ filename: file.name, type: file.type }),
      })

      console.log('Response status:', res.status)
      console.log('Response headers:', Object.fromEntries(res.headers.entries()))

      if (!res.ok) {
        const errorText = await res.text()
        console.error('Response error text:', errorText)
        throw new Error(`Failed to get upload URL: ${res.status} ${errorText}`)
      }

      const { url, key } = await res.json()
      console.log('Got signed URL for key:', key)

      // 2. Upload file directly to S3
      console.log('Uploading to S3:', url.substring(0, 100) + '...')
      console.log('File size:', file.size, 'bytes')
      const s3Response = await fetch(url, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type || 'application/octet-stream'
        }
      })
      console.log('S3 upload status:', s3Response.status)
      console.log('S3 response headers:', Object.fromEntries(s3Response.headers.entries()))

      if (!s3Response.ok) {
        const errorText = await s3Response.text()
        console.error('S3 error response:', errorText)
        throw new Error(`S3 upload failed: ${s3Response.status} - ${errorText}`)
      }

      // 3. Return the file URL to parent component
      const fileUrl = `https://expensetrackerjosh.sfo3.digitaloceanspaces.com/${key}`
      console.log('Final file URL:', fileUrl)
      onUploadComplete?.(fileUrl)

      // Reset form
      setFile(null)
      alert('File uploaded successfully!')

    } catch (error) {
      console.error('Upload failed:', error)
      alert('Upload failed: ' + (error as Error).message)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-3">
      <input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        disabled={isUploading}
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
      />
      {file && (
        <div className="text-sm text-gray-600">
          Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
        </div>
      )}
      <button
        onClick={handleUpload}
        disabled={!file || isUploading}
        className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {isUploading ? 'Uploading...' : 'Upload File'}
      </button>
    </div>
  )
}