import { Link } from '@tanstack/react-router'
import { ExpensesList } from '../components/ExpensesList'

export function ExpensesListRoute() {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">All Expenses</h2>
        <Link
          to="/expenses/new"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Add New Expense
        </Link>
      </div>

      <ExpensesList />
    </div>
  )
}