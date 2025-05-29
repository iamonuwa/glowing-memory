import { render, screen } from '@testing-library/react'
import { describe, it, vi, expect, beforeEach } from 'vitest'
import Map from '../../../src/components/map'
import { initMap } from '@/lib/mapbox'

// Mock mapbox-gl
vi.mock('mapbox-gl', () => ({
  Map: vi.fn(() => ({
    on: vi.fn(),
    off: vi.fn(),
    setCenter: vi.fn(),
    setZoom: vi.fn(),
    getCenter: vi.fn(() => ({ lng: 0, lat: 0 })),
    getZoom: vi.fn(() => 0),
  })),
  Marker: vi.fn(() => ({
    setLngLat: vi.fn().mockReturnThis(),
    setPopup: vi.fn().mockReturnThis(),
    addTo: vi.fn().mockReturnThis(),
    remove: vi.fn(),
  })),
  Popup: vi.fn(() => ({
    setLngLat: vi.fn().mockReturnThis(),
    setHTML: vi.fn().mockReturnThis(),
    addTo: vi.fn().mockReturnThis(),
    remove: vi.fn(),
  })),
  LngLatBounds: vi.fn(() => ({
    extend: vi.fn().mockReturnThis(),
  })),
}))

// Mock mapbox utilities
vi.mock('@/lib/mapbox', () => ({
  initMap: vi.fn(() => ({
    on: vi.fn(),
    off: vi.fn(),
    setCenter: vi.fn(),
    setZoom: vi.fn(),
  })),
  addMarker: vi.fn(() => ({
    setLngLat: vi.fn().mockReturnThis(),
    setPopup: vi.fn().mockReturnThis(),
    addTo: vi.fn().mockReturnThis(),
    remove: vi.fn(),
  })),
  drawRoute: vi.fn(() => ({
    remove: vi.fn(),
  })),
  addGeofence: vi.fn(() => ({
    remove: vi.fn(),
  })),
}))

describe('Map', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders map container', () => {
    render(<Map />)
    const mapContainer = screen.getByTestId('map-container')
    expect(mapContainer).toBeDefined()
    expect(mapContainer.style.width).toBe('100%')
    expect(mapContainer.style.height).toBe('100%')
  })

  it('initializes map with default props', () => {
    render(<Map />)
    expect(initMap).toHaveBeenCalledWith(
      expect.any(HTMLDivElement),
      [47.54824330713512, -52.74778004039589],
      0
    )
  })

  it('initializes map with custom props', () => {
    const customCenter: [number, number] = [0, 0]
    const customZoom = 10
    render(<Map center={customCenter} zoom={customZoom} />)
    expect(initMap).toHaveBeenCalledWith(
      expect.any(HTMLDivElement),
      customCenter,
      customZoom
    )
  })

  it('calls onLoad callback when map is initialized', () => {
    const onLoad = vi.fn()
    render(<Map onLoad={onLoad} />)
    // Simulate style.load event
    const mapInstance = vi.mocked(initMap).mock.results[0].value
    const styleLoadCallback = vi.mocked(mapInstance.on).mock.calls.find(
      (call: [string, () => void]) => call[0] === 'style.load'
    )?.[1]
    styleLoadCallback?.()
    expect(onLoad).toHaveBeenCalled()
  })

  it('calls onReset callback when map is reset', () => {
    const onReset = vi.fn()
    render(<Map onReset={onReset} />)
    // Simulate style.load event
    const mapInstance = vi.mocked(initMap).mock.results[0].value
    const styleLoadCallback = vi.mocked(mapInstance.on).mock.calls.find(
      (call: [string, () => void]) => call[0] === 'style.load'
    )?.[1]
    styleLoadCallback?.()
    expect(onReset).toHaveBeenCalled()
  })
}) 