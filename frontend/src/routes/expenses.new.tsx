import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Link, useRouter } from '@tanstack/react-router'

export function NewExpense() {
  const qc = useQueryClient()
  const router = useRouter()
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
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses'] })
      router.navigate({ to: '/expenses' })
    }
  })

  return (
    <div>
      <div className="mb-4">
        <Link to="/expenses" className="text-blue-600 hover:text-blue-800">
          ← Back to Expenses
        </Link>
      </div>

      <div className="bg-white border rounded-lg p-6 max-w-md">
        <h2 className="text-xl font-semibold mb-4">Add New Expense</h2>

        <form onSubmit={e => {
          e.preventDefault()
          if (title && typeof amount === 'number') {
            mutation.mutate({ title, amount })
          }
        }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Enter expense title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount
            </label>
            <input
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={e => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="0.00"
              required
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={mutation.isPending || !title || amount === ''}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {mutation.isPending ? 'Adding…' : 'Add Expense'}
            </button>

            <Link
              to="/expenses"
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}