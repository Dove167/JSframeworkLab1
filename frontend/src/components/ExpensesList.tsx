import { useQuery } from '@tanstack/react-query'

export function ExpensesList() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['expenses'],
    queryFn: async () => {
      const res = await fetch('http://localhost:3000/api/expenses')
      if (!res.ok) throw new Error('Failed to fetch')
      return res.json() as Promise<{ expenses: { id: number; title: string; amount: number; fileUrl?: string }[] }>
    }
  })

  if (isLoading) return <p className="text-sm text-gray-500">Loading…</p>
  if (isError) return <p className="text-sm text-red-600">{(error as Error).message}</p>

  return (
    <ul className="mt-4 space-y-2">
      {data!.expenses.map(e => (
        <li key={e.id} className="flex justify-between rounded border p-2 bg-white">
          <span>{e.title}</span>
          <span>${e.amount}</span>
          {e.fileUrl && (
            <a href={e.fileUrl} target="_blank" rel="noopener noreferrer" className="ml-3 text-blue-600 underline">
              View File
            </a>
          )}
        </li>
      ))}
    </ul>
  )
}