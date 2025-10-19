import { renderHook, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach, type Mock } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  useWeatherQuery,
  useForecastQuery,
  useReverseGeocodeQuery,
  useLocationSearch,
  WEATHER_KEYS,
} from '../use-weather'
import { weatherAPI } from '@/api/weather.ts'
import type { Coordinates } from '@/api/types.ts'

vi.mock('../../api/weather', () => ({
  weatherAPI: {
    getCurrentWeather: vi.fn(),
    getForecast: vi.fn(),
    reverseGeocode: vi.fn(),
    searchLocations: vi.fn(),
  },
}))

describe('useWeather hooks', () => {
  let queryClient: QueryClient
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )

  const coords: Coordinates = { lat: 50.45, lon: 30.52 }

  beforeEach(() => {
    queryClient = new QueryClient()
    vi.clearAllMocks()
  })

  // ---- WEATHER ----
  it('fetches weather when coordinates provided', async () => {
    ;(weatherAPI.getCurrentWeather as Mock).mockResolvedValue({ temp: 22 })

    const { result } = renderHook(() => useWeatherQuery(coords), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(weatherAPI.getCurrentWeather).toHaveBeenCalledWith(coords)
    expect(result.current.data).toEqual({ temp: 22 })
    expect(result.current.data).not.toBeNull()
  })

  it('does not fetch weather when coordinates are null', async () => {
    const { result } = renderHook(() => useWeatherQuery(null), { wrapper })
    expect(result.current.isFetched).toBe(false)
    expect(weatherAPI.getCurrentWeather).not.toHaveBeenCalled()
  })

  // ---- FORECAST ----
  it('fetches forecast when coordinates provided', async () => {
    ;(weatherAPI.getForecast as Mock).mockResolvedValue({ list: [1, 2, 3] })

    const { result } = renderHook(() => useForecastQuery(coords), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(weatherAPI.getForecast).toHaveBeenCalledWith(coords)
    expect(result.current.data).toEqual({ list: [1, 2, 3] })
  })

  it('does not fetch forecast when coordinates are null', () => {
    renderHook(() => useForecastQuery(null), { wrapper })
    expect(weatherAPI.getForecast).not.toHaveBeenCalled()
  })

  // ---- REVERSE GEOCODE ----
  it('fetches reverse geocode when coordinates provided', async () => {
    ;(weatherAPI.reverseGeocode as Mock).mockResolvedValue([{ name: 'Kyiv' }])

    const { result } = renderHook(() => useReverseGeocodeQuery(coords), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(weatherAPI.reverseGeocode).toHaveBeenCalledWith(coords)
    expect(result.current.data).toEqual([{ name: 'Kyiv' }])
  })

  it('does not fetch reverse geocode when coordinates are null', () => {
    renderHook(() => useReverseGeocodeQuery(null), { wrapper })
    expect(weatherAPI.reverseGeocode).not.toHaveBeenCalled()
  })

  // ---- LOCATION SEARCH ----
  it('fetches location search when query length >= 3', async () => {
    ;(weatherAPI.searchLocations as Mock).mockResolvedValue([{ name: 'Kyiv' }])

    const { result } = renderHook(() => useLocationSearch('Kyi'), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(weatherAPI.searchLocations).toHaveBeenCalledWith('Kyi')
    expect(result.current.data).toEqual([{ name: 'Kyiv' }])
  })

  it('does not fetch location search when query is too short', () => {
    renderHook(() => useLocationSearch('Ky'), { wrapper })
    expect(weatherAPI.searchLocations).not.toHaveBeenCalled()
  })

  // ---- WEATHER_KEYS ----
  it('generates proper query keys', () => {
    expect(WEATHER_KEYS.weather(coords)).toEqual(['weather', coords])
    expect(WEATHER_KEYS.forecast(coords)).toEqual(['forecast', coords])
    expect(WEATHER_KEYS.location(coords)).toEqual(['location', coords])
    expect(WEATHER_KEYS.search('Kyi')).toEqual(['location-search', 'Kyi'])
  })
})
