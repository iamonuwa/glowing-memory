import { addMarker, drawRoute, initMap, Route } from '@/lib/mapbox'
import React, { useEffect, useRef, useMemo, memo, useCallback } from 'react'

export interface MapMarker {
  id: string
  lng: number
  lat: number
  popup?: string
}

interface MapProps {
  center?: [number, number]
  zoom?: number
  markers?: MapMarker[]
  routes?: Route[]
  style?: React.CSSProperties
  onLoad?: (map: mapboxgl.Map) => void
  onReset?: () => void
}

const Map: React.FC<MapProps> = memo(({
  center = [47.54824330713512, -52.74778004039589] as [number, number],
  zoom = 0,
  markers = [],
  routes = [],
  style,
  onLoad,
  onReset
}) => {
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const markerRefs = useRef<{ [id: string]: mapboxgl.Marker }>({})
  const routeRefs = useRef<{ [id: string]: { remove: () => void } }>({})
  const isUserInteraction = useRef(false)
  const isStyleLoaded = useRef(false)

  // Memoize markers and routes
  const memoizedMarkers = useMemo(() => markers, [markers])
  const memoizedRoutes = useMemo(() => routes, [routes])

  // Initialize map only once
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return

    console.log('Initializing map')
    mapRef.current = initMap(mapContainer.current, center, zoom)

    // Wait for style to load
    mapRef.current.on('style.load', () => {
      console.log('Map style loaded')
      isStyleLoaded.current = true
      onReset?.()
      onLoad?.(mapRef.current!)
    })

    mapRef.current.on('moveend', () => {
      isUserInteraction.current = true
    })

    return () => {
      if (mapRef.current) {
        mapRef.current.off('moveend', () => {
          isUserInteraction.current = true
        })
        mapRef.current.off('style.load', () => {
          console.log('Map style loaded')
          isStyleLoaded.current = true
          if (onLoad) {
            onLoad(mapRef.current!)
          }
        })
        isStyleLoaded.current = false
      }
    }
  }, [center, onLoad, zoom])


  // Function to update markers
  const updateMarkers = useCallback(() => {
    if (!mapRef.current || !isStyleLoaded.current) return

    console.log('Updating markers:', memoizedMarkers)

    // Remove all existing markers first
    Object.values(markerRefs.current).forEach(marker => {
      marker.remove()
    })
    markerRefs.current = {}

    // Remove any existing popups
    const popupElements = document.querySelectorAll('.mapboxgl-popup')
    popupElements.forEach(el => el.remove())

    // Add new markers
    memoizedMarkers.forEach(({ id, lng, lat, popup }) => {
      console.log('Creating marker:', { id, lng, lat })
      const marker = addMarker(mapRef.current!, [lng, lat], popup)
      markerRefs.current[id] = marker
    })
  }, [memoizedMarkers])

  // Update markers efficiently
  useEffect(() => {
    if (!mapRef.current) {
      console.log('Map not initialized yet')
      return
    }

    // If style isn't loaded yet, wait for it
    if (!isStyleLoaded.current) {
      console.log('Waiting for style to load...')
      const handleStyleLoad = () => {
        console.log('Style loaded, now updating markers')
        isStyleLoaded.current = true
        updateMarkers()
        mapRef.current?.off('style.load', handleStyleLoad)
      }
      mapRef.current.on('style.load', handleStyleLoad)
      return
    }

    updateMarkers()
  }, [memoizedMarkers, updateMarkers])


  // Update routes efficiently
  useEffect(() => {
    if (!mapRef.current || !isStyleLoaded.current) return

    memoizedRoutes.forEach(route => {
      if (routeRefs.current[route.id]) {
        routeRefs.current[route.id].remove()
        routeRefs.current[route.id] = drawRoute(mapRef.current!, route)
      } else {
        routeRefs.current[route.id] = drawRoute(mapRef.current!, route)
      }
    })

    Object.keys(routeRefs.current).forEach(id => {
      if (!memoizedRoutes.find(route => route.id === id)) {
        routeRefs.current[id].remove()
        delete routeRefs.current[id]
      }
    })
  }, [memoizedRoutes])

  // Update center/zoom only when props change and not during user interaction
  useEffect(() => {
    if (!mapRef.current || isUserInteraction.current) return
    mapRef.current.setCenter(center)
    mapRef.current.setZoom(zoom)
    isUserInteraction.current = false
  }, [center, zoom])

  return (
    <div
      ref={mapContainer}
      style={{ width: '100%', height: '100%', minHeight: 900, ...style }}
    />
  )
})

Map.displayName = 'Map'

export default Map 