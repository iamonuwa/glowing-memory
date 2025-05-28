import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

export interface Route {
  id: string
  coordinates: [number, number][]
  color?: string
}

let mapInstance: L.Map | null = null

export function initMap(
  container: HTMLElement,
  center: [number, number] = [47.54870835400457, -52.74778004039589],
  zoom: number = 9
): L.Map {
  if (mapInstance) {
    return mapInstance
  }

  mapInstance = L.map(container).setView(center, zoom)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(mapInstance)

  return mapInstance
}

export function addMarker(
  map: L.Map,
  coordinates: [number, number],
  popup?: string
): L.Marker {
  const marker = L.marker(coordinates).addTo(map)
  
  if (popup) {
    marker.bindPopup(popup)
  }

  return marker
}

export function drawRoute(
  map: L.Map,
  route: Route
): { remove: () => void } {
  const polyline = L.polyline(route.coordinates, {
    color: route.color || '#3388ff',
    weight: 3,
    opacity: 0.7
  }).addTo(map)

  return {
    remove: () => {
      polyline.remove()
    }
  }
} 