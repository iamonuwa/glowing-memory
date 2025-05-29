import { render, screen } from '@testing-library/react'
import { describe, it, vi, expect, beforeEach } from 'vitest'
import { Providers } from '../../src/app/providers'
import { initMockServer } from '@/lib/initializer'

// Mock dependencies
const mockServer = {
  stop: vi.fn(),
  interval: 1000,
  driverRoutes: new Map(),
  initializeRoutes: vi.fn(),
  generateRoute: vi.fn(),
  start: vi.fn(),
  broadcastUpdate: vi.fn(),
  updateDriverLocation: vi.fn(),
  getDriverRoute: vi.fn(),
  getNextPoint: vi.fn(),
  isRouteComplete: vi.fn(),
}

vi.mock('@/lib/initializer', () => ({
  initMockServer: vi.fn(() => mockServer),
}))

vi.mock('@/lib/mockWebSocketServer', () => ({
  MockWebSocketServer: class {
    stop = vi.fn()
    interval = 1000
    driverRoutes = new Map()
    initializeRoutes = vi.fn()
    generateRoute = vi.fn()
    start = vi.fn()
    broadcastUpdate = vi.fn()
    updateDriverLocation = vi.fn()
    getDriverRoute = vi.fn()
    getNextPoint = vi.fn()
    isRouteComplete = vi.fn()
  },
}))

vi.mock('@/context/WebSocketContext', () => ({
  WebSocketProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

vi.mock('react-redux', () => ({
  Provider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

vi.mock('@/store', () => ({ store: {} }))

describe('Providers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders children', () => {
    render(
      <Providers>
        <div data-testid="child">Child</div>
      </Providers>
    )
    expect(screen.getByTestId('child')).toBeDefined()
  })

  it('initializes mock server on mount', () => {
    const { unmount } = render(
      <Providers>
        <div>Child</div>
      </Providers>
    )
    
    // Verify server was initialized
    expect(initMockServer).toHaveBeenCalled()
    
    // Cleanup
    unmount()
  })

  it('cleans up mock server on unmount', () => {
    const { unmount } = render(
      <Providers>
        <div>Child</div>
      </Providers>
    )

    unmount()
    expect(mockServer.stop).toHaveBeenCalled()
  })
}) 