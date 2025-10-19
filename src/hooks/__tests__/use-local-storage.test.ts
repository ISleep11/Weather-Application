import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import useLocalStorage from '../use-local-storage'

describe('useLocalStorage', () => {
  const key = 'test-key'

  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('initializes with value from localStorage if present', () => {
    localStorage.setItem(key, JSON.stringify('stored value'))

    const { result } = renderHook(() => useLocalStorage(key, 'initial'))

    expect(result.current[0]).toBe('stored value')
  })

  it('initializes with initialValue if localStorage is empty', () => {
    const { result } = renderHook(() => useLocalStorage(key, 'default'))

    expect(result.current[0]).toBe('default')
  })

  it('saves updated value to localStorage when state changes', () => {
    const { result } = renderHook(() => useLocalStorage(key, 'initial'))

    act(() => {
      result.current[1]('new value')
    })

    const stored = localStorage.getItem(key)
    expect(stored).toBe(JSON.stringify('new value'))
  })

  it('handles JSON.parse errors gracefully', () => {
    localStorage.setItem(key, '{ bad json }')

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const { result } = renderHook(() => useLocalStorage(key, 'fallback'))

    expect(result.current[0]).toBe('fallback')
    expect(consoleSpy).toHaveBeenCalled()

    consoleSpy.mockRestore()
  })

  it('handles JSON.stringify errors gracefully', () => {
    const circular: Record<string, unknown> = {}
    circular.self = circular

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const { result } = renderHook(() => useLocalStorage(key, circular))

    act(() => {
      result.current[1](circular)
    })

    expect(consoleSpy).toHaveBeenCalled()
    consoleSpy.mockRestore()
  })
})
