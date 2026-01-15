import { QueryClient } from '@tanstack/react-query'

export const baseBackendUrl = `${process.env.NEXT_PUBLIC_BACKEND_PATH}/api`

export const queryClient = new QueryClient()
