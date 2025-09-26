import { useQuery } from '@tanstack/react-query'
import { useParams, Link } from '@tanstack/react-router'

export function ExpenseDetail() {
  const { expenseId } = useParams({ from: '/expenses/$expenseId' })

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['expense', expenseId],
    queryFn: async () => {
      const res = await fetch(`http://localhost:3000/api/expenses/${expenseId}`)
      if (!res.ok) throw new Error('Failed to fetch expense')
      return res.json() as Promise<{ id: number; title: string; amount: number }>
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
        </div>
      </div>
    </div>
  )
}