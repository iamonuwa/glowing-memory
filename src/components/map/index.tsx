'use client'

import { useWebSocket } from '@/hooks/useWebsocket'
import { addMarker, drawRoute, initMap, Route } from '@/lib/mapbox'
import { setDrivers } from '@/store/driver.slice'
import React, { useEffect, useRef } from 'react'
import { useDispatch } from 'react-redux'

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
}

const Map: React.FC<MapProps> = ({ 
  center = [-74.5, 40], 
  zoom = 9, 
  markers = [], 
  routes = [],
  style 
}) => {
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const markerRefs = useRef<{ [id: string]: mapboxgl.Marker }>({})
  const routeRefs = useRef<{ [id: string]: { remove: () => void } }>({})
  const isUserInteraction = useRef(false)
  const dispatch = useDispatch()

  // Connect to WebSocket (using mock implementation)
  useWebSocket("ws://localhost:8080")

  useEffect(() => {
    dispatch(setDrivers([]))
  }, [dispatch])

  useEffect(() => {
    if (!mapContainer.current) return
    if (mapRef.current) return // Prevent re-initialization

    mapRef.current = initMap(mapContainer.current, center, zoom)

    // Add event listeners to track user interactions
    mapRef.current.on('moveend', () => {
      isUserInteraction.current = true
    })

    return () => {
      mapRef.current?.remove()
      mapRef.current = null
    }
  }, [center, zoom])

  // Update markers
  useEffect(() => {
    if (!mapRef.current) return
    // Remove old markers
    Object.values(markerRefs.current).forEach((marker) => marker.remove())
    markerRefs.current = {}
    // Add new markers
    markers.forEach(({ id, lng, lat, popup }) => {
      const marker = addMarker(mapRef.current!, [lng, lat], popup)
      markerRefs.current[id] = marker
    })
  }, [markers])

  // Update routes
  useEffect(() => {
    if (!mapRef.current) return
    // Remove old routes
    Object.values(routeRefs.current).forEach((route) => route.remove())
    routeRefs.current = {}
    // Add new routes
    routes.forEach((route) => {
      const routeRef = drawRoute(mapRef.current!, route)
      routeRefs.current[route.id] = routeRef
    })
  }, [routes])

  // Optionally update center/zoom only when props change from parent
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
}

export default Map 