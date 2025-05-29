import { render, screen } from '@testing-library/react'
import { describe, it, vi, expect, beforeEach } from 'vitest'
import { MapContainer } from '../../../src/components/map/MapContainer'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import driverReducer from '../../../src/store/driver.slice'

// Mock hooks
vi.mock('@/context/WebSocketContext', () => ({
  useWebSocket: vi.fn(),
}))

vi.mock('@/hooks/useRealtimeUpdates', () => ({
  useRealtimeUpdates: vi.fn(),
}))

// Mock mapbox-gl
vi.mock('mapbox-gl', () => {
  const mockPopup = vi.fn(() => ({
    setLngLat: vi.fn().mockReturnThis(),
    setHTML: vi.fn().mockReturnThis(),
    addTo: vi.fn().mockReturnThis(),
    remove: vi.fn(),
  }));

  const MockedMapbox = {
    Map: vi.fn(() => ({
      on: vi.fn(),
      off: vi.fn(),
      setCenter: vi.fn(),
      setZoom: vi.fn(),
      flyTo: vi.fn(),
      getCenter: vi.fn(() => ({ lng: 0, lat: 0 })),
      getZoom: vi.fn(() => 0),
    })),
    Marker: vi.fn(() => ({
      setLngLat: vi.fn().mockReturnThis(),
      setPopup: vi.fn().mockReturnThis(),
      addTo: vi.fn().mockReturnThis(),
      remove: vi.fn(),
    })),
    Popup: mockPopup,
    LngLatBounds: vi.fn(() => ({
      extend: vi.fn().mockReturnThis(),
    })),
  };

  return {
    __esModule: true,   // this makes it an ES module mock
    default: MockedMapbox,
    // (optional) re-export the named pieces in case some code does
    // `import { Marker } from 'mapbox-gl'`
    ...MockedMapbox,
  };
});

// Mock mapbox utilities
vi.mock('@/lib/mapbox', () => {
  // create a single fake map instance
  const mockMap = {
    on: vi.fn(),
    off: vi.fn(),
    setCenter: vi.fn(),
    setZoom: vi.fn(),
    flyTo: vi.fn(),
    fitBounds: vi.fn(),
  };

  return {
    initMap: vi.fn(() => mockMap),
    addMarker: vi.fn(() => ({
      setLngLat: vi.fn().mockReturnThis(),
      setPopup: vi.fn().mockReturnThis(),
      addTo: vi.fn().mockReturnThis(),
      remove: vi.fn(),
    })),
    drawRoute: vi.fn(() => ({ remove: vi.fn() })),
    addGeofence: vi.fn(() => ({ remove: vi.fn() })),
  };
});

// Create a mock store
const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      drivers: driverReducer
    },
    preloadedState: {
      drivers: {
        drivers: {
          'driver1': {
            id: 'driver1',
            name: 'John Doe',
            latitude: 0,
            longitude: 0,
            status: 'idle' as const,
            eta: Date.now(),
            lastUpdated: Date.now(),
            routeHistory: [[0, 0] as [number, number], [1, 1] as [number, number]]
          },
          'driver2': {
            id: 'driver2',
            name: 'Jane Smith',
            latitude: 1,
            longitude: 1,
            status: 'delivering' as const,
            eta: Date.now() + 1000,
            lastUpdated: Date.now(),
            routeHistory: [[1, 1] as [number, number], [2, 2] as [number, number]]
          }
        },
        selectedDriverId: null,
        filter: 'all' as const,
        isLoading: false,
        error: null,
        optimisticUpdates: {} as Record<string, { driverId: string; type: 'paused' | 'reassign' | 'complete' | 'resume' }>,
        ...initialState
      }
    }
  })
}

describe('MapContainer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders map and driver sheet', () => {
    const store = createMockStore()
    render(
      <Provider store={store}>
        <MapContainer />
      </Provider>
    )

    // Map should be rendered
    const mapContainer = screen.getByTestId('map-container')
    expect(mapContainer).toBeDefined()
  })

  it('handles driver selection', () => {
    const store = createMockStore()
    render(
      <Provider store={store}>
        <MapContainer />
      </Provider>
    )

    // Simulate driver selection
    const event = new CustomEvent('selectDriver', { detail: 'driver1' })
    window.dispatchEvent(event)

    // Verify store was updated
    const state = store.getState()
    // @ts-expect-error - This is a test
    expect((state as never).drivers.selectedDriverId).toBe('driver1')
  })

  
}) 