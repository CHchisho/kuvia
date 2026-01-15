import { useIsAllowed } from '@/store/useIsAllowed'

export async function authedFetch(url: string, options: RequestInit = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
    },
    credentials: 'include',
  })

  if (response.status === 401 || response.status === 403) {
    useIsAllowed.getState().setIsAllowed(undefined)
    throw new Error('Unauthorized')
  }

  return response
}
