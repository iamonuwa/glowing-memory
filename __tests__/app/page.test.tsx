import '@testing-library/jest-dom'
import { expect, beforeAll, describe, it } from 'vitest'
import { vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import Page from '../../src/app/page'
import { Provider } from 'react-redux'
import { store } from '../../src/store'
import { WebSocketProvider } from '../../src/context/WebSocketContext'

// Mock components
vi.mock('@/components/map/MapContainer', () => ({
  MapContainer: () => <div data-testid="map-container">Map Container</div>
}))

vi.mock('@/components/DriverList', () => ({
  DriverList: () => <div data-testid="driver-list">Driver List</div>
}))

// Mock WebSocket
const mockWebSocket = {
  send: vi.fn(),
  close: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
}

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn().mockImplementation((key) => {
    if (key === 'drivers') {
      return JSON.stringify({
        'driver1': {
          id: 'driver1',
          name: 'Test Driver',
          latitude: 0,
          longitude: 0,
          status: 'idle',
          eta: Date.now(),
          lastUpdated: Date.now(),
          routeHistory: []
        }
      })
    }
    return null
  }),
  setItem: vi.fn(),
  clear: vi.fn(),
  removeItem: vi.fn(),
  length: 0,
  key: vi.fn(),
}

beforeAll(() => {
  // Mock localStorage before any tests run
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true
  })

  // Mock WebSocket
  vi.stubGlobal('WebSocket', vi.fn(() => mockWebSocket))
})

describe("Page", () => {
    it("render with correct layout", () => {
        render(
            <Provider store={store}>
              <WebSocketProvider>
                <Page />
              </WebSocketProvider>
            </Provider>
          )

          // Check for the main grid layout
    const mainContainer = screen.getByTestId('page-container')
    expect(mainContainer).toBeDefined()
    
    // Check for the two main sections
    const sections = mainContainer.querySelectorAll('div[class*="col-span"]')
    expect(sections).toHaveLength(2)
    
    // Check for the correct column spans
    expect(sections[0].className).toContain('col-span-1')
    expect(sections[1].className).toContain('col-span-3')

    // Check for mocked components
    expect(screen.getByTestId('driver-list')).toBeDefined()
    expect(screen.getByTestId('map-container')).toBeDefined()
    })
})