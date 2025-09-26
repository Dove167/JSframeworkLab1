import { RouterProvider, createRouter, createRootRoute, createRoute } from '@tanstack/react-router'
import App from './App'
import { ExpensesList } from './routes/expenses.list'
import { ExpenseDetail } from './routes/expenses.detail'
import { NewExpense } from './routes/expenses.new'

const rootRoute = createRootRoute({
  component: () => <App />,
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => (
    <div className="text-center py-12">
      <h2 className="text-2xl font-semibold mb-4">Welcome to Expenses App</h2>
      <p className="text-gray-600 mb-6">Manage your expenses with ease</p>
      <a href="/expenses" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
        View Expenses
      </a>
    </div>
  ),
})

const expensesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/expenses',
  component: () => <ExpensesList />,
})

const expensesDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/expenses/$expenseId',
  component: () => <ExpenseDetail />,
})

const expensesNewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/expenses/new',
  component: () => <NewExpense />,
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  expensesRoute,
  expensesDetailRoute,
  expensesNewRoute
])

export const router = createRouter({
  routeTree,
  defaultNotFoundComponent: () => (
    <div className="text-center py-12">
      <h2 className="text-2xl font-semibold mb-4">404 - Page Not Found</h2>
      <p className="text-gray-600 mb-6">The page you're looking for doesn't exist.</p>
      <a href="/expenses" className="text-blue-600 hover:text-blue-800">
        Go back to Expenses
      </a>
    </div>
  ),
  defaultErrorComponent: ({ error }) => (
    <div className="text-center py-12">
      <h2 className="text-2xl font-semibold mb-4">Something went wrong</h2>
      <p className="text-red-600 mb-6">{(error as Error).message}</p>
      <a href="/expenses" className="text-blue-600 hover:text-blue-800">
        Go back to Expenses
      </a>
    </div>
  ),
})

export function AppRouter() {
  return <RouterProvider router={router} />
}