import { renderHook, act, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import useGeolocation from '../use-geolocation'

interface MockGeolocation {
  getCurrentPosition: ReturnType<typeof vi.fn>
}

interface GeolocationPositionErrorMock {
  code: number
  PERMISSION_DENIED: number
  POSITION_UNAVAILABLE: number
  TIMEOUT: number
}

const mockGeolocation: MockGeolocation = {
  getCurrentPosition: vi.fn(),
}

const setMockNavigatorGeolocation = (mock: MockGeolocation | undefined) => {
  Object.defineProperty(global.navigator, 'geolocation', {
    value: mock,
    configurable: true,
  })
}

describe('useGeolocation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setMockNavigatorGeolocation(mockGeolocation)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns coordinates when geolocation is successful', async () => {
    mockGeolocation.getCurrentPosition.mockImplementationOnce((success: PositionCallback) => {
      success({
        coords: { latitude: 50.45, longitude: 30.52 },
      } as GeolocationPosition)
    })

    const { result } = renderHook(() => useGeolocation())

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.coordinates).toEqual({ lat: 50.45, lon: 30.52 })
    expect(result.current.error).toBeNull()
  })

  it('returns error when geolocation is not supported', async () => {
    setMockNavigatorGeolocation(undefined)

    const { result } = renderHook(() => useGeolocation())

    await waitFor(() => expect(result.current.error).toBe('Geolocation is not supported by your browser'))
  })

  it('handles PERMISSION_DENIED error', async () => {
    const errorMock: GeolocationPositionErrorMock = {
      code: 1,
      PERMISSION_DENIED: 1,
      POSITION_UNAVAILABLE: 2,
      TIMEOUT: 3,
    }

    mockGeolocation.getCurrentPosition.mockImplementationOnce((_s, error) => {
      error(errorMock as unknown as GeolocationPositionError)
    })

    const { result } = renderHook(() => useGeolocation())

    await waitFor(() => expect(result.current.error).toBe('Location permission denied. Please enable location access'))
  })

  it('handles POSITION_UNAVAILABLE error', async () => {
    const errorMock: GeolocationPositionErrorMock = {
      code: 2,
      PERMISSION_DENIED: 1,
      POSITION_UNAVAILABLE: 2,
      TIMEOUT: 3,
    }

    mockGeolocation.getCurrentPosition.mockImplementationOnce((_s, error) => {
      error(errorMock as unknown as GeolocationPositionError)
    })

    const { result } = renderHook(() => useGeolocation())

    await waitFor(() => expect(result.current.error).toBe('Location information is unavailable'))
  })

  it('handles TIMEOUT error', async () => {
    const errorMock: GeolocationPositionErrorMock = {
      code: 3,
      PERMISSION_DENIED: 1,
      POSITION_UNAVAILABLE: 2,
      TIMEOUT: 3,
    }

    mockGeolocation.getCurrentPosition.mockImplementationOnce((_s, error) => {
      error(errorMock as unknown as GeolocationPositionError)
    })

    const { result } = renderHook(() => useGeolocation())

    await waitFor(() => expect(result.current.error).toBe('Location request timed out'))
  })

  it('handles unknown error code', async () => {
    mockGeolocation.getCurrentPosition.mockImplementationOnce((_s, error) => {
      error({ code: 999 } as GeolocationPositionError)
    })

    const { result } = renderHook(() => useGeolocation())

    await waitFor(() => expect(result.current.error).toBe('An unexpected error occurred.'))
  })

  it('allows manual re-fetching via getLocation()', async () => {
    mockGeolocation.getCurrentPosition.mockImplementationOnce((success: PositionCallback) => {
      success({
        coords: { latitude: 40, longitude: -74 },
      } as GeolocationPosition)
    })

    const { result } = renderHook(() => useGeolocation())

    await waitFor(() => expect(result.current.coordinates).toEqual({ lat: 40, lon: -74 }))

    mockGeolocation.getCurrentPosition.mockImplementationOnce((success: PositionCallback) => {
      success({
        coords: { latitude: 10, longitude: 20 },
      } as GeolocationPosition)
    })

    act(() => {
      result.current.getLocation()
    })

    await waitFor(() => expect(result.current.coordinates).toEqual({ lat: 10, lon: 20 }))
  })
})
