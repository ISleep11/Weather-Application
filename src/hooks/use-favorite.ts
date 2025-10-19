import useLocalStorage from './use-local-storage.ts'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRef, useState } from 'react'

export interface FavoriteCity {
  id: string
  name: string
  lat: number
  lon: number
  country: string
  addedAt: number
  state?: string
}

const useFavorite = () => {
  const [favorites, setFavorites] = useLocalStorage<FavoriteCity[]>('favorites', [])
  const [undoAvailable, setUndoAvailable] = useState(false)
  const lastRemovedRef = useRef<FavoriteCity[]>([])
  const queryClient = useQueryClient()

  const favoritesQuery = useQuery({
    queryKey: ['favorites'],
    queryFn: () => favorites,
    initialData: favorites,
    staleTime: Infinity,
  })

  const addFavorite = useMutation({
    mutationFn: async (city: Omit<FavoriteCity, 'id' | 'addedAt'>) => {
      const newFavorite: FavoriteCity = {
        ...city,
        id: `${city.lat}-${city.lon}}`,
        addedAt: Date.now(),
      }

      const exists = favorites.some((fav) => fav.id === newFavorite.id)

      if (exists) return favorites

      const newFavorites = [...favorites, newFavorite].slice(0, 10)

      setFavorites(newFavorites)

      return newFavorites
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['favorites'],
      })
    },
  })

  const removeFavorite = useMutation({
    mutationFn: async (cityId: string) => {
      const removedCity = favorites.find((city) => city.id === cityId)
      const newFavorites = favorites.filter((city) => city.id !== cityId)

      if (removedCity) {
        lastRemovedRef.current.push(removedCity)
        setUndoAvailable(true)
      }

      setFavorites(newFavorites)
      return newFavorites
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['favorites'],
      })
    },
  })

  const undoRemove = useMutation({
    mutationFn: async () => {
      if (lastRemovedRef.current.length === 0) return favorites

      const cityToRestore = lastRemovedRef.current.pop()!
      const newFavorites = [...favorites, cityToRestore]
      setFavorites(newFavorites)

      if (lastRemovedRef.current.length === 0) {
        setUndoAvailable(false)
      }

      return newFavorites
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] })
    },
  })

  return {
    favorites: favoritesQuery.data,
    addFavorite,
    removeFavorite,
    undoRemove,
    undoAvailable,
    isFavorite: (lat: number, lon: number) => favorites.some((city) => city.lat === lat && city.lon === lon),
  }
}

export default useFavorite
