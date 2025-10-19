import useFavorite from '../hooks/use-favorite.ts'
import { ScrollArea } from './ui/scroll-area.tsx'
import FavoriteCityTablet from './favorite-city-tablet.tsx'
import { Button } from './ui/button.tsx'
import { Undo } from 'lucide-react'

const FavoriteCities = () => {
  const { favorites, removeFavorite, undoRemove, undoAvailable } = useFavorite()

  if (!favorites.length && !undoAvailable) {
    return null
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-bold tracking-tight">Favorites</h1>
        {undoAvailable && (
          <Button variant="ghost" size="icon" onClick={() => undoRemove.mutate()}>
            <Undo />
          </Button>
        )}
      </div>
      <ScrollArea className="w-full pb-4">
        <div className="flex gap-4">
          {favorites.map((city) => (
            <FavoriteCityTablet key={city.id} {...city} onRemove={() => removeFavorite.mutate(city.id)} />
          ))}
        </div>
      </ScrollArea>
    </>
  )
}

export default FavoriteCities
