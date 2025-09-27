import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { KindeProvider } from '@kinde-oss/kinde-auth-react'
import { env } from './env'
import { AppRouter } from './router.tsx'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5000,
      retry: 1,
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <KindeProvider
        domain={env.VITE_KINDE_ISSUER_URL}
        clientId={env.VITE_KINDE_CLIENT_ID}
        audience={env.VITE_KINDE_AUDIENCE}
        redirectUri={env.VITE_KINDE_REDIRECT_URI}
        logoutUri={env.VITE_KINDE_LOGOUT_REDIRECT_URI}
      >
        <AppRouter />
      </KindeProvider>
    </QueryClientProvider>
  </StrictMode>,
)
