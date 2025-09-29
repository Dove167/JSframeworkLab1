import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export function ExpensesList() {
  const qc = useQueryClient()

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['expenses'],
    queryFn: async () => {
      const res = await fetch('http://localhost:3000/api/expenses')
      if (!res.ok) throw new Error('Failed to fetch')
      return res.json() as Promise<{ expenses: { id: number; title: string; amount: number; fileUrl?: string }[] }>
    }
  })

  const delMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`http://localhost:3000/api/expenses/${id}`, {
        method: 'DELETE'
      })
      if (!res.ok) throw new Error('Delete failed')
      return id
    },
    onMutate: async (id) => {
      // Cancel any outgoing refetches
      await qc.cancelQueries({ queryKey: ['expenses'] })

      // Snapshot the previous value
      const prev = qc.getQueryData<{ expenses: any[] }>(['expenses'])

      // Optimistically update to the new value
      if (prev) {
        qc.setQueryData(['expenses'], {
          expenses: prev.expenses.filter((e) => e.id !== id),
        })
      }

      return { prev }
    },
    onError: (_err, _id, ctx) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (ctx?.prev) qc.setQueryData(['expenses'], ctx.prev)
    },
    onSettled: () => {
      // Always refetch after error or success
      qc.invalidateQueries({ queryKey: ['expenses'] })
    },
  })

  if (isLoading) {
    return (
      <div className="mt-4 flex items-center justify-center py-8">
        <div className="flex items-center space-x-2 text-gray-500">
          <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Loading expenses...</span>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
        <p className="text-red-600">❌ Error loading expenses: {(error as Error).message}</p>
        <button
          onClick={() => qc.invalidateQueries({ queryKey: ['expenses'] })}
          className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
        >
          Try again
        </button>
      </div>
    )
  }

  if (!data || data.expenses.length === 0) {
    return (
      <div className="mt-4 text-center py-8">
        <div className="text-gray-400 mb-2">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <p className="text-gray-500">No expenses yet</p>
        <p className="text-sm text-gray-400 mt-1">Add your first expense to get started!</p>
      </div>
    )
  }

  return (
    <ul className="mt-4 space-y-2">
      {data.expenses.map(e => (
        <li key={e.id} className="flex justify-between items-center rounded border p-3 bg-white shadow-sm">
          <div className="flex-1">
            <span className="font-medium">{e.title}</span>
            <span className="text-gray-600 ml-2">– ${e.amount}</span>
          </div>
          <div className="flex items-center space-x-2">
            {e.fileUrl && (
              <a
                href={e.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 text-sm underline"
              >
                View File
              </a>
            )}
            <button
              className="text-red-500 hover:text-red-700 text-sm px-3 py-1 rounded border border-red-300 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => delMutation.mutate(e.id)}
              disabled={delMutation.isPending}
            >
              {delMutation.isPending ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </li>
      ))}
    </ul>
  )
}