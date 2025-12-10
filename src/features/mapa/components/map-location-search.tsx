'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Search, MapPin, Loader2, X, Navigation } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { MAPBOX_CONFIG } from '@/lib/config';
import { useDebounce } from '@/hooks/use-debounce';

export interface SearchResult {
  id: string;
  place_name: string;
  text: string;
  center: [number, number]; // [lng, lat]
  place_type: string[];
  context?: Array<{
    id: string;
    text: string;
  }>;
  bbox?: [number, number, number, number];
}

interface MapLocationSearchProps {
  onSelect: (result: SearchResult) => void;
  placeholder?: string;
  className?: string;
  defaultValue?: string;
  showCurrentLocation?: boolean;
  onCurrentLocation?: () => void;
  boundsBias?: {
    bbox: [number, number, number, number];
    country?: string;
  };
}

export function MapLocationSearch({
  onSelect,
  placeholder = 'Buscar localização...',
  className,
  defaultValue = '',
  showCurrentLocation = true,
  onCurrentLocation,
  boundsBias,
}: MapLocationSearchProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(defaultValue);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const debouncedQuery = useDebounce(query, 300);

  // Fetch results from Mapbox Geocoding API
  const searchLocations = useCallback(async (searchQuery: string) => {
    if (!searchQuery || searchQuery.length < 2) {
      setResults([]);
      return;
    }

    if (!MAPBOX_CONFIG.hasValidToken) {
      setError('Mapbox não configurado');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        access_token: MAPBOX_CONFIG.accessToken,
        autocomplete: 'true',
        language: 'pt-BR',
        limit: '5',
        types: 'place,locality,neighborhood,address,poi',
      });

      // Add bounds bias for Brazil if provided
      if (boundsBias?.bbox) {
        params.set('bbox', boundsBias.bbox.join(','));
      }
      if (boundsBias?.country) {
        params.set('country', boundsBias.country);
      } else {
        // Default to Brazil
        params.set('country', 'BR');
      }

      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          searchQuery
        )}.json?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error('Erro ao buscar localização');
      }

      const data = await response.json();
      setResults(data.features || []);
    } catch (err) {
      setError('Erro ao buscar localização');
      console.error('Geocoding error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [boundsBias]);

  // Search when debounced query changes
  useEffect(() => {
    searchLocations(debouncedQuery);
  }, [debouncedQuery, searchLocations]);

  const handleSelect = (result: SearchResult) => {
    setQuery(result.place_name);
    setOpen(false);
    onSelect(result);
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    inputRef.current?.focus();
  };

  const getPlaceTypeIcon = (types: string[]) => {
    if (types.includes('address')) return '🏠';
    if (types.includes('poi')) return '📍';
    if (types.includes('neighborhood')) return '🏘️';
    if (types.includes('locality')) return '🏙️';
    if (types.includes('place')) return '🌆';
    return '📌';
  };

  const getPlaceContext = (result: SearchResult) => {
    if (!result.context) return '';
    return result.context
      .filter((c) => c.id.startsWith('region') || c.id.startsWith('place'))
      .map((c) => c.text)
      .join(', ');
  };

  return (
    <div className={cn('relative', className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              ref={inputRef}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                if (!open) setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              placeholder={placeholder}
              className="pl-9 pr-20"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {isLoading && (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              )}
              {query && !isLoading && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={handleClear}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
              {showCurrentLocation && onCurrentLocation && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => {
                    onCurrentLocation();
                    setOpen(false);
                  }}
                  title="Usar minha localização"
                >
                  <Navigation className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        </PopoverTrigger>
        <PopoverContent
          className="w-[var(--radix-popover-trigger-width)] p-0"
          align="start"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <Command shouldFilter={false}>
            <CommandList>
              {error && (
                <div className="p-4 text-center text-sm text-destructive">
                  {error}
                </div>
              )}

              {!error && results.length === 0 && query.length >= 2 && !isLoading && (
                <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
              )}

              {!error && results.length === 0 && query.length < 2 && !isLoading && (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  Digite pelo menos 2 caracteres para buscar
                </div>
              )}

              {results.length > 0 && (
                <CommandGroup heading="Resultados">
                  {results.map((result) => (
                    <CommandItem
                      key={result.id}
                      value={result.id}
                      onSelect={() => handleSelect(result)}
                      className="flex items-start gap-2 py-3"
                    >
                      <span className="text-lg shrink-0">
                        {getPlaceTypeIcon(result.place_type)}
                      </span>
                      <div className="flex flex-col min-w-0">
                        <span className="font-medium truncate">{result.text}</span>
                        {getPlaceContext(result) && (
                          <span className="text-xs text-muted-foreground truncate">
                            {getPlaceContext(result)}
                          </span>
                        )}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {showCurrentLocation && onCurrentLocation && (
                <CommandGroup heading="Atalhos">
                  <CommandItem
                    onSelect={() => {
                      onCurrentLocation();
                      setOpen(false);
                    }}
                    className="flex items-center gap-2"
                  >
                    <Navigation className="h-4 w-4 text-primary" />
                    <span>Usar minha localização atual</span>
                  </CommandItem>
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

// Hook for geocoding
export function useGeocoding() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const geocode = useCallback(async (query: string): Promise<SearchResult[]> => {
    if (!query || !MAPBOX_CONFIG.hasValidToken) {
      return [];
    }

    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        access_token: MAPBOX_CONFIG.accessToken,
        language: 'pt-BR',
        limit: '5',
        country: 'BR',
      });

      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          query
        )}.json?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error('Erro ao buscar localização');
      }

      const data = await response.json();
      return data.features || [];
    } catch (err) {
      setError('Erro ao buscar localização');
      console.error('Geocoding error:', err);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reverseGeocode = useCallback(
    async (lng: number, lat: number): Promise<SearchResult | null> => {
      if (!MAPBOX_CONFIG.hasValidToken) {
        return null;
      }

      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          access_token: MAPBOX_CONFIG.accessToken,
          language: 'pt-BR',
          types: 'address,place,locality',
        });

        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?${params.toString()}`
        );

        if (!response.ok) {
          throw new Error('Erro ao buscar endereço');
        }

        const data = await response.json();
        return data.features?.[0] || null;
      } catch (err) {
        setError('Erro ao buscar endereço');
        console.error('Reverse geocoding error:', err);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return {
    geocode,
    reverseGeocode,
    isLoading,
    error,
  };
}
