import { vi, describe, it, expect, beforeEach } from 'vitest'
import 'vitest-localstorage-mock'
import useFavorite from '../use-favorite'
import { act, renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

vi.mock('@tanstack/react-query', async () => {
  const actual = await vi.importActual<typeof import('@tanstack/react-query')>('@tanstack/react-query')
  return {
    ...actual,
    useQuery: vi.fn(({ queryFn }) => ({
      data: queryFn(),
    })),
  }
})

describe('useFavorite (mocked react-query)', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    localStorage.clear()
    vi.setSystemTime(new Date('2024-01-01'))
    queryClient = new QueryClient()
  })

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )

  const sampleCity = {
    name: 'Kyiv',
    lat: 50.45,
    lon: 30.52,
    country: 'UA',
  }

  it('initializes with empty favorites', () => {
    const { result } = renderHook(() => useFavorite(), { wrapper })
    expect(result.current.favorites).toEqual([])
    expect(result.current.undoAvailable).toBe(false)
  })

  it('adds a city to favorites', async () => {
    const { result } = renderHook(() => useFavorite(), { wrapper })
    await act(async () => {
      await result.current.addFavorite.mutateAsync(sampleCity)
    })
    await waitFor(() => {
      expect(result.current.favorites).toHaveLength(1)
      expect(result.current.favorites?.[0].name).toBe('Kyiv')
    })
  })

  it('does not duplicate existing city', async () => {
    const { result } = renderHook(() => useFavorite(), { wrapper })
    await act(async () => {
      await result.current.addFavorite.mutateAsync(sampleCity)
      await result.current.addFavorite.mutateAsync(sampleCity)
    })
    await waitFor(() => expect(result.current.favorites).toHaveLength(1))
  })

  it('removes a city and enables undo', async () => {
    const { result } = renderHook(() => useFavorite(), { wrapper })
    await act(async () => {
      await result.current.addFavorite.mutateAsync(sampleCity)
    })
    await act(async () => {
      await result.current.removeFavorite.mutateAsync('50.45-30.52}')
    })
    await waitFor(() => {
      expect(result.current.favorites).toHaveLength(0)
      expect(result.current.undoAvailable).toBe(true)
    })
  })

  it('limits favorites to 10 cities', async () => {
    const { result } = renderHook(() => useFavorite(), { wrapper })
    const cities = Array.from({ length: 12 }).map((_, i) => ({
      name: `City${i}`,
      lat: i,
      lon: i,
      country: 'UA',
    }))
    await act(async () => {
      for (const city of cities) {
        await result.current.addFavorite.mutateAsync(city)
        await waitFor(() => true)
      }
    })
    await waitFor(() => {
      expect(result.current.favorites).toHaveLength(10)
      expect(result.current.favorites[0].name).toBe('City0')
      expect(result.current.favorites.at(-1)?.name).toBe('City9')
    })
  })

  it('checks if a city is favorite', async () => {
    const { result } = renderHook(() => useFavorite(), { wrapper })
    await act(async () => {
      await result.current.addFavorite.mutateAsync(sampleCity)
    })
    await waitFor(() => {
      expect(result.current.isFavorite(50.45, 30.52)).toBe(true)
      expect(result.current.isFavorite(0, 0)).toBe(false)
    })
  })
})
