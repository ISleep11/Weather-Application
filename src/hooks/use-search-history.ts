import useLocalStorage from './use-local-storage.ts'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRef } from 'react'

export interface SearchHistoryItem {
  id: string
  query: string
  lat: number
  lon: number
  name: string
  country: string
  searchedAt: number
  state?: string
}

const useSearchHistory = () => {
  const [history, setHistory] = useLocalStorage<SearchHistoryItem[]>('search-history', [])
  const lastClearedRef = useRef<SearchHistoryItem[]>([])

  const queryClient = useQueryClient()

  const historyQuery = useQuery({
    queryKey: ['search-history'],
    queryFn: () => history,
    initialData: history,
  })

  const addToHistory = useMutation({
    mutationFn: async (search: Omit<SearchHistoryItem, 'id' | 'searchedAt'>) => {
      const newSearch: SearchHistoryItem = {
        ...search,
        id: `${search.lat}-${search.lon}-${Date.now()}`,
        searchedAt: Date.now(),
      }

      const filteredHistory = history.filter((item) => !(item.lat === search.lat && item.lon === search.lon))

      const newHistory = [newSearch, ...filteredHistory].slice(0, 10)

      setHistory(newHistory)

      return newHistory
    },
    onSuccess: (newHistory) => {
      queryClient.setQueryData(['search-history'], newHistory)
    },
  })

  const clearHistory = useMutation({
    mutationFn: async () => {
      lastClearedRef.current = history
      setHistory([])
      return []
    },
    onSuccess: () => {
      queryClient.setQueryData(['search-history'], [])
    },
  })

  const undoClear = useMutation({
    mutationFn: async () => {
      if (lastClearedRef.current.length === 0) return history
      const restored = lastClearedRef.current
      setHistory(restored)
      lastClearedRef.current = []
      return restored
    },
    onSuccess: (restored) => {
      queryClient.setQueryData(['search-history'], restored)
    },
  })

  return {
    history: historyQuery.data ?? [],
    addToHistory,
    clearHistory,
    undoClear,
  }
}

export default useSearchHistory
