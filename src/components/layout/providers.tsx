"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useRef, useEffect } from "react"
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
  const queryClientRef = useRef<QueryClient | null>(null)

  if (queryClientRef.current === null) {
    queryClientRef.current = new QueryClient({
      defaultOptions: {
        queries: {
          refetchOnWindowFocus: false,
          retry: 2,
        },
      },
    })
  }

  return (
    <QueryClientProvider client={queryClientRef.current}>
      <StatsHydration />
      {children}
    </QueryClientProvider>
  )
}
