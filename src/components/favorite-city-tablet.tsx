import { useNavigate } from 'react-router-dom'
import { useWeatherQuery } from '../hooks/use-weather.ts'
import { Button } from './ui/button.tsx'
import { Loader2, X } from 'lucide-react'
import { toast } from 'sonner'

interface FavoriteCityTabletProps {
  id: string
  name: string
  lat: number
  lon: number
  onRemove: (id: string) => void
}

const FavoriteCityTablet = ({ id, name, lat, lon, onRemove }: FavoriteCityTabletProps) => {
  const navigate = useNavigate()
  const { data: weather, isLoading } = useWeatherQuery({ lat, lon })

  return (
    <div
      className="relative min-w-[250px] cursor-pointer items-center gap-3 rounded-lg border bg-card p-4 pr-8 shadow-sm transition-all hover:shadow-md"
      onClick={() => navigate(`/city/${name}?lat=${lat}&lon=${lon}`)}
      role="button"
      tabIndex={0}
    >
      <Button
        className="absolute right-1 top-1 h-6 w-6 rounded-full p-0 hover:text-destructive-foreground group-hover:opacity-100"
        variant="ghost"
        size="icon"
        onClick={(e) => {
          e.stopPropagation()
          onRemove(id)
          toast.error(`Removed ${name} from Favorites`)
        }}
      >
        <X className="h-4 w-4" />
      </Button>

      {isLoading ? (
        <div className="flex h-8 items-center justify-center">
          <Loader2 className="h-4 w-4 animate-spin" />
        </div>
      ) : (
        weather && (
          <>
            <div className="flex items-center gap-2">
              <img
                className="h-8 w-8"
                src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}.png`}
                alt={weather.weather[0].description}
              />
              <div>
                <p className="font-medium">{name}</p>
                <p className="text-xs text-muted-foreground">{weather.sys.country}</p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-xl font-bold">{Math.round(weather.main.temp)}°</p>
                <p className="text-xs capitalize text-muted-foreground">{weather.weather[0].description}</p>
              </div>
            </div>
          </>
        )
      )}
    </div>
  )
}

export default FavoriteCityTablet
