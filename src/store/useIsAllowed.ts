
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type IsAllowed = {
  isAllowed: boolean
  username: string | undefined
  isHydrated: boolean
  setIsAllowed: (address: string | undefined) => void
  setHydrated: () => void
}

export const useIsAllowed = create<IsAllowed>()(
  persist(
    (set) => ({
      isAllowed: false,
      username: undefined,
      isHydrated: false,
      setIsAllowed: (username) => set(() => ({ username, isAllowed: !!username })),
      setHydrated: () => set(() => ({ isHydrated: true })),
    }),
    {
      name: 'isAllowed-storage', // unique name for localStorage
      onRehydrateStorage: () => (state) => {
        state?.setHydrated()
      },
    }
  )
)
