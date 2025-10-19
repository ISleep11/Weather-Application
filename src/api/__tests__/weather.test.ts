import { describe, it, expect, vi, beforeEach } from 'vitest'
import { weatherAPI } from '../weather'
import { API_CONFIG } from '../config'
import type { Coordinates, WeatherData, ForecastData, GeocodingData } from '../types'

const coords: Coordinates = { lat: 50.45, lon: 30.52 }

describe('WeatherAPI', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('creates correct URL with parameters', () => {
    const endpoint = 'https://api.openweathermap.org/data/2.5/weather'
    // Accessing a private method for unit testing purposes only.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const url = (weatherAPI as any).createUrl(endpoint, { lat: 1, lon: 2, q: 'Kyiv' })
    expect(url).toContain(endpoint)
    expect(url).toContain('appid=')
    expect(url).toContain('lat=1')
    expect(url).toContain('lon=2')
    expect(url).toContain('q=Kyiv')
  })

  it('fetchData returns parsed JSON when response.ok', async () => {
    const mockData = { test: 'ok' }
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockData),
        }),
      ),
    )

    // Accessing a private method for unit testing purposes only.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await (weatherAPI as any).fetchData('mock-url')
    expect(result).toEqual(mockData)
  })

  it('fetchData throws error when response not ok', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve({
          ok: false,
          statusText: 'Forbidden',
        }),
      ),
    )

    // Accessing a private method for unit testing purposes only.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await expect((weatherAPI as any).fetchData('mock-url')).rejects.toThrow('Weather API Error: Forbidden')
  })

  it('getCurrentWeather calls correct URL and returns data', async () => {
    const mockWeather: WeatherData = {
      coord: coords,
      weather: [{ id: 1, main: 'Clouds', description: 'broken clouds', icon: '04d' }],
      main: {
        temp: 22,
        feels_like: 21,
        temp_min: 20,
        temp_max: 25,
        pressure: 1012,
        humidity: 60,
      },
      wind: { speed: 3.4, deg: 200 },
      sys: { sunrise: 1, sunset: 2, country: 'UA' },
      name: 'Kyiv',
      dt: 12345,
    }

    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockWeather),
        }),
      ),
    )

    const result = await weatherAPI.getCurrentWeather(coords)
    expect(fetch).toHaveBeenCalledTimes(1)
    expect(fetch).toHaveBeenCalledWith(
      `${API_CONFIG.BASE_URL}/weather?appid=${API_CONFIG.API_KEY}&lat=50.45&lon=30.52&units=metric`,
    )
    expect(result).toEqual(mockWeather)
  })

  it('getForecast calls correct URL and returns data', async () => {
    const mockForecast: ForecastData = {
      list: [],
      city: { name: 'Kyiv', country: 'UA', sunrise: 1, sunset: 2 },
    }

    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockForecast),
        }),
      ),
    )

    const result = await weatherAPI.getForecast(coords)
    expect(fetch).toHaveBeenCalledTimes(1)
    expect(fetch).toHaveBeenCalledWith(
      `${API_CONFIG.BASE_URL}/forecast?appid=${API_CONFIG.API_KEY}&lat=50.45&lon=30.52&units=metric`,
    )
    expect(result).toEqual(mockForecast)
  })

  it('reverseGeocode calls correct URL and returns data', async () => {
    const mockGeo: GeocodingData[] = [{ name: 'Kyiv', lat: 50.45, lon: 30.52, country: 'UA' }]

    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockGeo),
        }),
      ),
    )

    const result = await weatherAPI.reverseGeocode(coords)
    expect(fetch).toHaveBeenCalledTimes(1)
    expect(fetch).toHaveBeenCalledWith(
      `${API_CONFIG.GEO}/reverse?appid=${API_CONFIG.API_KEY}&lat=50.45&lon=30.52&limit=1`,
    )
    expect(result).toEqual(mockGeo)
  })

  it('searchLocations calls correct URL and returns data', async () => {
    const mockGeo: GeocodingData[] = [{ name: 'Kyiv', lat: 50.45, lon: 30.52, country: 'UA' }]

    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockGeo),
        }),
      ),
    )

    const result = await weatherAPI.searchLocations('Kyiv')
    expect(fetch).toHaveBeenCalledTimes(1)
    expect(fetch).toHaveBeenCalledWith(`${API_CONFIG.GEO}/direct?appid=${API_CONFIG.API_KEY}&q=Kyiv&limit=5`)
    expect(result).toEqual(mockGeo)
  })
})
