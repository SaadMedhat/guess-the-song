"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState, useEffect } from "react"
import { useStatsStore } from "@/lib/stores/stats-store"

const StatsHydration = (): null => {
  useEffect(() => {
    useStatsStore.persist.rehydrate()
  }, [])
  return null
}

export const Providers = ({
  children,
}: {
  readonly children: React.ReactNode
}): React.ReactElement => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: 2,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      <StatsHydration />
      {children}
    </QueryClientProvider>
  )
}
