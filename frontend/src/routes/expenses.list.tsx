import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'

export function ExpensesList() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['expenses'],
    queryFn: async () => {
      const res = await fetch('http://localhost:3000/api/expenses')
      if (!res.ok) throw new Error('Failed to fetch')
      return res.json() as Promise<{ expenses: { id: number; title: string; amount: number }[] }>
    }
  })

  if (isLoading) return <p className="text-sm text-gray-500">Loading…</p>
  if (isError) return <p className="text-sm text-red-600">{(error as Error).message}</p>

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">All Expenses</h2>
      <ul className="space-y-2">
        {data!.expenses.map(e => (
          <li key={e.id} className="flex justify-between items-center rounded border p-3 bg-white">
            <div>
              <Link
                to="/expenses/$expenseId"
                params={{ expenseId: e.id.toString() }}
                className="font-medium text-blue-600 hover:text-blue-800"
              >
                {e.title}
              </Link>
            </div>
            <span className="font-semibold">${e.amount}</span>
          </li>
        ))}
      </ul>
      {data!.expenses.length === 0 && (
        <p className="text-gray-500 text-center py-8">No expenses yet. <Link to="/expenses/new" className="text-blue-600 hover:text-blue-800">Add one!</Link></p>
      )}
    </div>
  )
}