import mapboxgl from 'mapbox-gl'
import { Car } from 'lucide-react'
import * as React from 'react'
import { createRoot } from 'react-dom/client'

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''

export const initMap = (
    container: HTMLElement,
    center: [number, number] = [-74.5, 40],
    zoom: number = 9
) => {
    const map = new mapboxgl.Map({
        container,
        style: 'mapbox://styles/mapbox/streets-v12',
        center,
        zoom,
    })

    // Add navigation controls
    map.addControl(new mapboxgl.NavigationControl(), 'top-right')

    return map
}

export const addMarker = (
    map: mapboxgl.Map,
    coordinates: [number, number],
    popup?: string
) => {
    // Create a DOM element for the marker
    const el = document.createElement('div')
    el.style.width = '32px'
    el.style.height = '32px'
    el.style.display = 'flex'
    el.style.alignItems = 'center'
    el.style.justifyContent = 'center'
    // Render the Lucide Car icon into the element
    createRoot(el).render(React.createElement(Car, { color: '#007aff', size: 32 }))

    const marker = new mapboxgl.Marker(el)
        .setLngLat(coordinates)
        .addTo(map)

    if (popup) {
        marker.setPopup(new mapboxgl.Popup().setHTML(popup))
    }

    return marker
}

export const updateMarkerPosition = (
    marker: mapboxgl.Marker,
    coordinates: [number, number]
) => {
    marker.setLngLat(coordinates)
}

export interface Route {
    id: string
    coordinates: [number, number][]
    color?: string
}

export const drawRoute = (
    map: mapboxgl.Map,
    route: Route
) => {
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
            'line-color': route.color || '#007aff',
            'line-width': 4,
            'line-opacity': 0.8
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