import mapboxgl from 'mapbox-gl'
import * as turf from '@turf/turf'
import 'mapbox-gl/dist/mapbox-gl.css'

// Initialize Mapbox with your access token
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''

export interface Route {
    id: string
    coordinates: [number, number][]
    color?: string
}

let mapInstance: mapboxgl.Map | null = null

export function initMap(
    container: HTMLElement,
    center: [number, number] = [47.54824330713512, -52.74778004039589],
    zoom: number = 0
): mapboxgl.Map {
    if (mapInstance) {
        return mapInstance
    }

    mapInstance = new mapboxgl.Map({
        container,
        style: 'mapbox://styles/mapbox/streets-v12',
        zoom,
        center,
    })


    mapInstance.setZoom(zoom)
    mapInstance.setCenter(center)
    mapInstance.setBearing(0)
    mapInstance.setPitch(0)

    // Wait for the map to load before adding controls
    // Add navigation controls
    mapInstance?.addControl(new mapboxgl.NavigationControl(), 'top-right')

    return mapInstance
}

export function addMarker(
    map: mapboxgl.Map,
    coordinates: [number, number],
    popup?: string
): mapboxgl.Marker {
    console.log('Adding marker at:', coordinates)

    // Create a custom marker element
    const el = document.createElement('div')
    el.style.width = '20px'
    el.style.height = '20px'
    el.style.backgroundColor = '#ff0000'
    el.style.borderRadius = '50%'
    el.style.border = '2px solid white'
    el.style.boxShadow = '0 0 5px rgba(0,0,0,0.5)'

    const marker = new mapboxgl.Marker(el)
        .setLngLat(coordinates)
        .addTo(map)

    if (popup) {
        const popupInstance = new mapboxgl.Popup({ offset: 25 })
            .setHTML(popup)

        marker.setPopup(popupInstance)
    }

    console.log('Marker added successfully')
    return marker
}

export function drawRoute(
    map: mapboxgl.Map,
    route: Route
): { remove: () => void } {
    const sourceId = `route-${route.id}`
    const layerId = `route-layer-${route.id}`

    // Remove existing route if it exists
    if (map.getSource(sourceId)) {
        map.removeLayer(layerId)
        map.removeSource(sourceId)
    }

    // Add the route source
    map.addSource(sourceId, {
        type: 'geojson',
        data: {
            type: 'Feature',
            properties: {},
            geometry: {
                type: 'LineString',
                coordinates: route.coordinates
            }
        }
    })

    // Add the route layer
    map.addLayer({
        id: layerId,
        type: 'line',
        source: sourceId,
        layout: {
            'line-join': 'round',
            'line-cap': 'round'
        },
        paint: {
            'line-color': route.color || '#3388ff',
            'line-width': 3,
            'line-opacity': 0.7
        }
    })

    return {
        remove: () => {
            if (map.getLayer(layerId)) {
                map.removeLayer(layerId)
                map.removeSource(sourceId)
            }
        }
    }
}

// Add geofence circle
export function addGeofence(
    map: mapboxgl.Map,
    center: [number, number],
    radiusKm: number = 30
): { remove: () => void } {
    const sourceId = 'geofence'
    const layerId = 'geofence-layer'
    const outlineLayerId = 'geofence-outline-layer'

    // Create a circle using turf.js
    const circle = turf.circle(center, radiusKm, {
        steps: 64,
        units: 'kilometers'
    })

    // Add source if it doesn't exist
    if (!map.getSource(sourceId)) {
        map.addSource(sourceId, {
            type: 'geojson',
            data: circle
        })
    }

    // Add fill layer
    if (!map.getLayer(layerId)) {
        map.addLayer({
            id: layerId,
            type: 'fill',
            source: sourceId,
            layout: {},
            paint: {
                'fill-color': '#ff0000',
                'fill-opacity': 0.1
            }
        })
    }

    // Add outline layer
    if (!map.getLayer(outlineLayerId)) {
        map.addLayer({
            id: outlineLayerId,
            type: 'line',
            source: sourceId,
            layout: {},
            paint: {
                'line-color': '#ff0000',
                'line-width': 2,
                'line-opacity': 0.5
            }
        })
    }

    return {
        remove: () => {
            if (map.getLayer(outlineLayerId)) map.removeLayer(outlineLayerId)
            if (map.getLayer(layerId)) map.removeLayer(layerId)
            if (map.getSource(sourceId)) map.removeSource(sourceId)
        }
    }
}

// Check if a point is within the geofence
export function isWithinGeofence(
    point: [number, number],
    center: [number, number],
    radiusKm: number = 30
): boolean {
    const R = 6371 // Earth's radius in km
    const dLat = (point[1] - center[1]) * Math.PI / 180
    const dLon = (point[0] - center[0]) * Math.PI / 180
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(center[1] * Math.PI / 180) * Math.cos(point[1] * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const distance = R * c
    return distance <= radiusKm
}

export const updateMarkerPosition = (
    marker: mapboxgl.Marker,
    coordinates: [number, number]
) => {
    marker.setLngLat(coordinates)
}

export const updateRoute = (
    map: mapboxgl.Map,
    route: Route
) => {
    const sourceId = `route-${route.id}`
    const source = map.getSource(sourceId) as mapboxgl.GeoJSONSource

    if (source) {
        source.setData({
            type: 'Feature',
            properties: {},
            geometry: {
                type: 'LineString',
                coordinates: route.coordinates
            }
        })
    }
} 