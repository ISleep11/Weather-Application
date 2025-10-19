import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import useSearchHistory, { type SearchHistoryItem } from '../use-search-history'
import 'vitest-localstorage-mock'

describe('useSearchHistory (with real localStorage)', () => {
  let queryClient: QueryClient

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )

  beforeEach(() => {
    localStorage.clear()
    queryClient = new QueryClient()
  })

  it('initializes with empty history', () => {
    const { result } = renderHook(() => useSearchHistory(), { wrapper })
    expect(result.current.history).toEqual([])
  })

  it('adds new search item to history and saves to localStorage', async () => {
    const { result } = renderHook(() => useSearchHistory(), { wrapper })

    const item = {
      query: 'Kyiv',
      lat: 50.45,
      lon: 30.52,
      name: 'Kyiv',
      country: 'UA',
    }

    await act(async () => {
      await result.current.addToHistory.mutateAsync(item)
    })

    const parsed = JSON.parse(localStorage.getItem('search-history') ?? '[]') as SearchHistoryItem[]
    expect(parsed.length).toBe(1)
    expect(parsed[0].query).toBe('Kyiv')
    expect(result.current.history[0].name).toBe('Kyiv')
  })

  it('removes duplicate if same city is added again', async () => {
    const initial: SearchHistoryItem[] = [
      {
        id: '50.45-30.52-1',
        query: 'Kyiv',
        lat: 50.45,
        lon: 30.52,
        name: 'Kyiv',
        country: 'UA',
        searchedAt: Date.now(),
      },
    ]
    localStorage.setItem('search-history', JSON.stringify(initial))

    const { result } = renderHook(() => useSearchHistory(), { wrapper })

    await act(async () => {
      await result.current.addToHistory.mutateAsync({
        query: 'Kyiv',
        lat: 50.45,
        lon: 30.52,
        name: 'Kyiv',
        country: 'UA',
      })
    })

    const updated = JSON.parse(localStorage.getItem('search-history') ?? '[]')
    expect(updated.length).toBe(1)
  })

  it('keeps only 10 last items', async () => {
    const items = Array.from({ length: 12 }, (_, i) => ({
      id: `${i}`,
      query: `City${i}`,
      lat: i,
      lon: i,
      name: `City ${i}`,
      country: 'UA',
      searchedAt: i,
    }))
    localStorage.setItem('search-history', JSON.stringify(items))

    const { result } = renderHook(() => useSearchHistory(), { wrapper })

    await act(async () => {
      await result.current.addToHistory.mutateAsync({
        query: 'NewCity',
        lat: 100,
        lon: 100,
        name: 'NewCity',
        country: 'UA',
      })
    })

    const updated = JSON.parse(localStorage.getItem('search-history') ?? '[]')
    expect(updated.length).toBe(10)
    expect(updated[0].name).toBe('NewCity')
  })

  it('clears history and can undo', async () => {
    const item = {
      id: '1',
      query: 'Lviv',
      lat: 49.84,
      lon: 24.03,
      name: 'Lviv',
      country: 'UA',
      searchedAt: Date.now(),
    }
    localStorage.setItem('search-history', JSON.stringify([item]))

    const { result } = renderHook(() => useSearchHistory(), { wrapper })

    // Очистка
    await act(async () => {
      await result.current.clearHistory.mutateAsync()
    })
    expect(JSON.parse(localStorage.getItem('search-history') ?? '[]')).toEqual([])

    // Undo
    await act(async () => {
      await result.current.undoClear.mutateAsync()
    })

    const restored = JSON.parse(localStorage.getItem('search-history') ?? '[]')
    expect(restored[0].query).toBe('Lviv')
  })

  it('does nothing on undoClear if lastClearedRef is empty', async () => {
    const { result } = renderHook(() => useSearchHistory(), { wrapper })

    await act(async () => {
      const restored = await result.current.undoClear.mutateAsync()
      expect(restored).toEqual([])
    })
  })
})
