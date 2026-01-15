import { useMutation, useQuery } from '@tanstack/react-query'
import { baseBackendUrl } from './utils/consts'
import { useIsAllowed } from '@/store/useIsAllowed'
import { authedFetch } from './utils/authedFetch'

type Response<T> = {
  data: T
  error: string
  success: boolean
}

type UserProfile = {
  createdAt: string
  followersCount: number
  id: number
  name: string
  profileImgUrl: string
  tgLink: string
  twitterId: string
  updatedAt: string
  username: string
  uuid: string
  weight: number
}

export type GraphNode = {
  profileImgUrl: string
  username: string
  weight: number
}

export const useGetData = () => {
  const { isAllowed } = useIsAllowed()

  const { isLoading, data, error } = useQuery({
    queryKey: ['data'],
    enabled: isAllowed,
    queryFn: async () => {
      const response = await authedFetch(`${baseBackendUrl}/users/data`)
      const result: Response<UserProfile> = await response.json()
      return result
    },
  })

  return {
    isLoading,
    data,
    error,
  }
}
