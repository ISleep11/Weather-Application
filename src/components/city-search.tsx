import { Button } from './ui/button.tsx'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from './ui/command.tsx'
import { useEffect, useState } from 'react'
import { Clock, Loader2, Search, Star, Undo, XCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import useSearchHistory from '../hooks/use-search-history.ts'
import { format } from 'date-fns'
import { useLocationSearch } from '../hooks/use-weather.ts'
import useFavorite from '../hooks/use-favorite.ts'

const CitySearch = () => {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [showUndo, setShowUndo] = useState(false)
  const navigate = useNavigate()

  const { data: locations, isLoading } = useLocationSearch(query)
  const { history, clearHistory, addToHistory, undoClear } = useSearchHistory()
  const { favorites } = useFavorite()

  const handleSelect = (cityData: string) => {
    const [lat, lon, name, country] = cityData.split('|')

    addToHistory.mutate({
      query,
      name,
      lat: parseFloat(lat),
      lon: parseFloat(lon),
      country,
    })

    setOpen(false)
    setQuery('')
    navigate(`/city/${name}?lat=${lat}&lon=${lon}`)
  }

  useEffect(() => {
    if (!open) {
      setShowUndo(false)
    }
  }, [open])

  return (
    <>
      <Button
        className="relative w-full justify-start text-sm text-muted-foreground sm:pr-12 md:w-40 lg:w-64"
        variant="outline"
        onClick={() => setOpen(true)}
      >
        <Search className="mr-2 h-4 w-4" />
        Search cities...
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search cities..." value={query} onValueChange={setQuery} />
        <CommandList>
          {query.length > 2 && !isLoading && <CommandEmpty>No cities found.</CommandEmpty>}

          {favorites.length > 0 && (
            <CommandGroup heading="Favorites">
              {favorites.map((location) => {
                return (
                  <CommandItem
                    key={location.id}
                    value={`${location.lat}|${location.lon}|${location.name}|${location.country}`}
                    onSelect={handleSelect}
                  >
                    <Star className="mr-2 h-4 w-4 text-yellow-500" />
                    <span>{location.name}</span>
                    {location.state && <span className="text-sm text-muted-foreground">, {location.state}</span>}
                    <span className="text-sm text-muted-foreground">, {location.country}</span>
                  </CommandItem>
                )
              })}
            </CommandGroup>
          )}

          {history.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup>
                <div className="flex items-center justify-between px-2 my-2">
                  <p className="text-xs text-muted-foreground">Recent Searches</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowUndo(true)
                      clearHistory.mutate()
                    }}
                  >
                    <XCircle className="h-4 w-4" />
                    Clear
                  </Button>
                </div>

                {history.map((location) => {
                  return (
                    <CommandItem
                      key={`${location.lat}-${location.lon}`}
                      value={`${location.lat}|${location.lon}|${location.name}|${location.country}`}
                      onSelect={handleSelect}
                    >
                      <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>{location.name}</span>
                      {location.state && <span className="text-sm text-muted-foreground">, {location.state}</span>}
                      <span className="text-sm text-muted-foreground">, {location.country}</span>
                      <span className="text-sm text-muted-foreground">
                        {format(location.searchedAt, 'MMM d, h:mm a')}
                      </span>
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            </>
          )}

          {clearHistory.isSuccess && showUndo && (
            <>
              <CommandSeparator />
              <CommandGroup>
                <div className="flex items-center justify-between px-2 my-2">
                  <p className="text-xs text-muted-foreground">Recent Searches</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowUndo(false)
                      undoClear.mutate()
                    }}
                  >
                    <Undo className="h-4 w-4" />
                  </Button>
                </div>
              </CommandGroup>
            </>
          )}

          <CommandSeparator />

          {locations && locations.length > 0 && (
            <CommandGroup heading="Suggestions">
              {isLoading && (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              )}
              {locations.map((location) => {
                return (
                  <CommandItem
                    key={`${location.lat}-${location.lon}`}
                    value={`${location.lat}|${location.lon}|${location.name}|${location.country}`}
                    onSelect={handleSelect}
                  >
                    <Search className="mr-2 h-4 w-4" />
                    <span>{location.name}</span>
                    {location.state && <span className="text-sm text-muted-foreground">, {location.state}</span>}
                    <span className="text-sm text-muted-foreground">, {location.country}</span>
                  </CommandItem>
                )
              })}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  )
}

export default CitySearch
