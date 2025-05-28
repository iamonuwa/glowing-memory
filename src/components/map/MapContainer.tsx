'use client'

import { useAppSelector } from '@/store/hooks'
import Map, { MapMarker } from '@/components/map'
import { useMemo, useEffect, useRef, useCallback } from 'react'
import { Route, addGeofence } from '@/lib/mapbox'
import mapboxgl from 'mapbox-gl'
import { RootState } from '@/store'
import { DriverSheet } from '../DriverSheet'
import { useDispatch } from 'react-redux'
import { selectedDriver } from '@/store/driver.slice'
import { useWebSocket } from '@/context/WebSocketContext'
import { useRealtimeUpdates } from '@/hooks/useRealtimeUpdates'

const COLUMBUS_DRIVE: [number, number] = [47.54824330713512, -52.74778004039589]
const GEOFENCE_RADIUS_KM = 1_000

interface Driver {
    id: string
    name: string
    status: string
    eta: number
    latitude: number
    longitude: number
    routeHistory: [number, number][]
}

export function MapContainer() {
    // initializer hooks
    // Connect to WebSocket
    useWebSocket()
    // realtime updates
    useRealtimeUpdates()

    // redux state
    const drivers = useAppSelector((state: RootState) => state.drivers.drivers) as Record<string, Driver>
    const selectedDriverId = useAppSelector((state: RootState) => state.drivers.selectedDriverId)
    const geofenceRef = useRef<{ remove: () => void } | null>(null)
    const mapRef = useRef<mapboxgl.Map | null>(null)
    const dispatch = useDispatch()

    // Add popup ref
    const popupRef = useRef<mapboxgl.Popup | null>(null)

    // Convert drivers to map markers
    const markers = useMemo(() => {
        console.log('Creating markers for drivers:', drivers)
        const markerArray = Object.values(drivers).map(driver => {
            const marker = {
                id: driver.id,
                lat: driver.latitude,
                lng: driver.longitude,
                popup: `
                    <div class="flex flex-col gap-2 bg-white dark:bg-gray-800 rounded-lg p-2">
                        <h3 class="text-base font-semibold text-gray-900 dark:text-white">${driver.name}</h3>
                        <div class="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                            <span class="flex items-center gap-2">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span class="text-foreground text-sm capitalize font-semibold">Status: ${driver.status}</span>
                            </span>
                            <span class="flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-hourglass-icon lucide-hourglass"><path d="M5 22h14"/><path d="M5 2h14"/><path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"/><path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"/></svg>
                                <span class="text-foreground text-sm font-semibold">ETA: ${new Date(driver.eta).toLocaleTimeString()}</span>
                            </span>
                        </div>
                        <button 
                            class="w-full inline-flex items-center justify-center gap-2 p-2 text-xs bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none transition-colors"
                            onclick="window.dispatchEvent(new CustomEvent('selectDriver', { detail: '${driver.id}' }))"
                        >
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            View Details
                        </button>
                    </div>
                `
            }
            console.log('Created marker:', marker)
            return marker
        }) as MapMarker[]
        console.log('Final markers array:', markerArray)
        return markerArray
    }, [drivers])

    // Create routes for selected driver
    const routes = useMemo(() => {
        if (!selectedDriverId) return []

        const selectedDriver = drivers[selectedDriverId]
        if (!selectedDriver) return []

        // Create route from history
        return [{
            id: selectedDriverId,
            coordinates: selectedDriver.routeHistory,
            color: '#ff4444'
        }] as Route[]
    }, [selectedDriverId, drivers])

    const onMapLoad = (map: mapboxgl.Map) => {
        console.log('Map loaded')
        mapRef.current = map
        fitMapToDrivers()
    }

    // Add geofence when map is ready
    useEffect(() => {
        if (!mapRef.current) return

        // Remove existing geofence if any
        if (geofenceRef.current) {
            geofenceRef.current.remove()
        }

        // Add new geofence
        geofenceRef.current = addGeofence(mapRef.current, COLUMBUS_DRIVE, GEOFENCE_RADIUS_KM)
    }, [])


    // Fit map to all drivers when map is ready and drivers are available
    const fitMapToDrivers = useCallback(() => {
        console.log('Fitting map to drivers:', drivers, mapRef.current)
        if (!mapRef.current || Object.values(drivers).length === 0) return;

        const bounds = new mapboxgl.LngLatBounds();
        Object.values(drivers).forEach(driver => {
            bounds.extend([driver.longitude, driver.latitude]);
        });

        if (Object.values(drivers).length > 1) {
            mapRef.current.fitBounds(bounds, { padding: 100, maxZoom: 14 });
        } else {
            const only = Object.values(drivers)[0];
            mapRef.current.setCenter([only.longitude, only.latitude]);
            mapRef.current.setZoom(13);
        }
    }, [drivers])

    useEffect(() => {
        fitMapToDrivers()
    }, [drivers, fitMapToDrivers]);

    // Cleanup geofence on unmount
    useEffect(() => {
        return () => {
            if (geofenceRef.current) {
                geofenceRef.current.remove()
            }
        }
    }, [])

    // Add event listener for driver selection
    useEffect(() => {
        const handleDriverSelect = (event: CustomEvent<string>) => {
            dispatch(selectedDriver(event.detail))
        }

        window.addEventListener('selectDriver', handleDriverSelect as EventListener)
        return () => {
            window.removeEventListener('selectDriver', handleDriverSelect as EventListener)
        }
    }, [dispatch])

    // Handle popup opening
    useEffect(() => {
        const handleOpenPopup = (event: CustomEvent<string>) => {
            const driverId = event.detail
            const driver = drivers[driverId]
            if (!driver || !mapRef.current) return

            // Close existing popup if any
            if (popupRef.current) {
                popupRef.current.remove()
            }

            // Create new popup
            popupRef.current = new mapboxgl.Popup({
                closeButton: true,
                closeOnClick: false,
                offset: 25
            })
                .setLngLat([driver.longitude, driver.latitude])
                .setHTML(`
                    <div class="flex flex-col gap-2 bg-white dark:bg-gray-800 rounded-lg p-2">
                        <h3 class="text-base font-semibold text-gray-900 dark:text-white">${driver.name}</h3>
                        <div class="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                            <span class="flex items-center gap-2">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span class="text-foreground text-sm capitalize font-semibold">Status: ${driver.status}</span>
                            </span>
                            <span class="flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-hourglass-icon lucide-hourglass"><path d="M5 22h14"/><path d="M5 2h14"/><path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"/><path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"/></svg>
                                <span class="text-foreground text-sm font-semibold">ETA: ${new Date(driver.eta).toLocaleTimeString()}</span>
                            </span>
                        </div>
                        <button 
                            class="w-full inline-flex items-center justify-center gap-2 p-2 text-xs bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none transition-colors"
                            onclick="window.dispatchEvent(new CustomEvent('selectDriver', { detail: '${driver.id}' }))"
                        >
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            View Details
                        </button>
                    </div>
                `)
                .addTo(mapRef.current)

            // Center map on driver
            mapRef.current.flyTo({
                center: [driver.longitude, driver.latitude],
                zoom: 13,
                duration: 1000
            })
        }

        window.addEventListener('openDriverPopup', handleOpenPopup as EventListener)
        return () => {
            window.removeEventListener('openDriverPopup', handleOpenPopup as EventListener)
        }
    }, [drivers])

    // Cleanup popup on unmount
    useEffect(() => {
        return () => {
            if (popupRef.current) {
                popupRef.current.remove()
            }
        }
    }, [])

    console.log('Rendering MapContainer with markers:', markers)

    return (
        <>
            <Map
                markers={markers}
                routes={routes}
                center={COLUMBUS_DRIVE}
                zoom={9}
                onLoad={onMapLoad}
            />
            <DriverSheet />
        </>
    )
} 