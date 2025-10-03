import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from '@tanstack/react-router'
import { useKindeAuth } from '@kinde-oss/kinde-auth-react'

export function ExpenseDetail() {
  const { expenseId } = useParams({ from: '/expenses/$expenseId' })
  const { getToken } = useKindeAuth()

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['expense', expenseId],
    queryFn: async () => {
      console.log('Fetching expense:', expenseId)
      const res = await fetch(`http://localhost:3000/api/expenses/${expenseId}`)
      console.log('Response status:', res.status)
      if (!res.ok) throw new Error('Failed to fetch expense')
      const result = await res.json()
      console.log('Response data:', result)

      // Handle both { data: { expense: ... } } and direct object formats
      if (result.data && result.data.expense) {
        return result.data.expense
      }
      return result
    }
  })

  if (isLoading) return <p className="text-sm text-gray-500">Loading expense…</p>
  if (isError) return <p className="text-sm text-red-600">{(error as Error).message}</p>

  return (
    <div>
      <div className="mb-4">
        <Link to="/expenses" className="text-blue-600 hover:text-blue-800">
          ← Back to Expenses
        </Link>
      </div>

      <div className="bg-white border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Expense Details</h2>

        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-gray-600">Title:</label>
            <p className="text-lg">{data!.title}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600">Amount:</label>
            <p className="text-lg font-semibold text-green-600">${data!.amount}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600">ID:</label>
            <p className="text-sm text-gray-500">#{data!.id}</p>
          </div>

          {data!.fileUrl && (
            <div>
              <label className="text-sm font-medium text-gray-600">Receipt:</label>
              <div className="mt-2">
                <button
                  onClick={async () => {
                    try {
                      console.log('Fetching signed URL for expense:', data!.id)
                      const token = await getToken()
                      const response = await fetch(`http://localhost:3000/api/expenses/${data!.id}/file-url`, {
                        headers: {
                          'Authorization': `Bearer ${token}`
                        }
                      })
                      console.log('Response status:', response.status)
                      if (response.ok) {
                        const responseData = await response.json()
                        const { url } = responseData
                        console.log('Full response:', responseData)
                        console.log('Received URL:', url)
                        console.log('URL length:', url?.length)
                        console.log('URL query params:', url?.split('?')[1]?.substring(0, 100))
                        console.log('Got signed URL, opening file...')
                        if (url) {
                          console.log('✅ Signed URL generated successfully!')
                          console.log('Opening file in new tab...')

                          // Use anchor click method to bypass CORS issues
                          const link = document.createElement('a')
                          link.href = url
                          link.target = '_blank'
                          link.rel = 'noopener noreferrer'

                          // Add some styling to make it invisible
                          link.style.position = 'absolute'
                          link.style.left = '-9999px'
                          link.style.top = '-9999px'

                          document.body.appendChild(link)
                          link.click()
                          document.body.removeChild(link)

                          console.log('✅ File should be opening in new tab now')
                        } else {
                          alert('No file attached to this expense')
                        }
                      } else {
                        const errorData = await response.json()
                        console.error('Error response:', errorData)
                        alert('Error accessing file: ' + (errorData.error?.message || 'Unknown error'))
                      }
                    } catch (error) {
                      console.error('Error getting file URL:', error)
                      alert('Network error: ' + (error as Error).message)
                    }
                  }}
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  View File
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}