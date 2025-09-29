import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

export function AddExpenseForm() {
  const qc = useQueryClient()
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState<number | ''>('')

  const mutation = useMutation({
    mutationFn: async (payload: { title: string; amount: number }) => {
      const res = await fetch('http://localhost:3000/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('Failed to add')
      return res.json()
    },
    onMutate: async (newItem) => {
      // Cancel any outgoing refetches
      await qc.cancelQueries({ queryKey: ['expenses'] })

      // Snapshot the previous value
      const prev = qc.getQueryData<{ expenses: any[] }>(['expenses'])

      // Optimistically update to the new value
      if (prev) {
        qc.setQueryData(['expenses'], {
          expenses: [...prev.expenses, { id: Date.now(), ...newItem }],
        })
      }

      // Return a context object with the snapshotted value
      return { prev }
    },
    onError: (_err, _newItem, ctx) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (ctx?.prev) qc.setQueryData(['expenses'], ctx.prev)
    },
    onSettled: () => {
      // Always refetch after error or success
      qc.invalidateQueries({ queryKey: ['expenses'] })
    },
    onSuccess: () => {
      // Reset form on successful submission
      setTitle('')
      setAmount('')
    },
  })

  return (
    <form onSubmit={e => {
      e.preventDefault()
      if (title && typeof amount === 'number') {
        mutation.mutate({ title, amount })
      }
    }} className="mt-4 p-4 bg-gray-50 rounded-lg border">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <input
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Enter expense title"
            disabled={mutation.isPending}
          />
        </div>
        <div className="flex-1 sm:w-32">
          <input
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            type="number"
            step="0.01"
            min="0"
            value={amount}
            onChange={e => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="0.00"
            disabled={mutation.isPending}
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          disabled={mutation.isPending || !title || amount === ''}
        >
          {mutation.isPending ? (
            <>
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Adding...</span>
            </>
          ) : (
            <span>Add Expense</span>
          )}
        </button>
      </div>
      {mutation.isError && (
        <p className="mt-2 text-sm text-red-600">
          ❌ Error: {(mutation.error as Error).message}
        </p>
      )}
    </form>
  )
}