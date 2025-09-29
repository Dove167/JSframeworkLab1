import { useKindeAuth } from '@kinde-oss/kinde-auth-react'

export function AuthBar() {
  const { isAuthenticated, login, logout, user, getToken } = useKindeAuth()

  const debugAuth = async () => {
    console.log('=== AUTH DEBUG ===')
    console.log('isAuthenticated:', isAuthenticated)
    console.log('user:', user)

    const token = await getToken()
    console.log('token present:', !!token)
    if (token) {
      console.log('token preview:', token.substring(0, 50) + '...')

      // Test with backend
      try {
        const response = await fetch('http://localhost:3000/api/secure/profile', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        console.log('Backend auth test:', response.ok ? 'SUCCESS' : 'FAILED')
        console.log('Response status:', response.status)
        if (response.ok) {
          const data = await response.json()
          console.log('User data:', data.user)
        }
      } catch (error) {
        console.log('Backend connection error:', error)
      }
    }
  }

  return (
    <div className="flex items-center gap-3 text-sm">
      <button
        onClick={debugAuth}
        className="rounded bg-gray-500 px-2 py-1 text-white text-xs"
      >
        Debug
      </button>
      {isAuthenticated ? (
        <>
          <span className="text-gray-600">{user?.givenName ?? user?.email}</span>
          <button className="rounded bg-black px-3 py-1 text-white" onClick={() => logout()}>Logout</button>
        </>
      ) : (
        <button className="rounded bg-black px-3 py-1 text-white" onClick={() => login()}>Login</button>
      )}
    </div>
  )
}