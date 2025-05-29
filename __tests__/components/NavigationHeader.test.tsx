import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, vi, expect, beforeEach } from 'vitest'
import { NavigationHeader } from '../../src/components/NavigationHeader'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import driverReducer from '../../src/store/driver.slice'

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
            status: 'delivering' as const,
            eta: Date.now(),
            lastUpdated: Date.now(),
            routeHistory: []
          },
          'driver2': {
            id: 'driver2',
            name: 'Jane Smith',
            latitude: 1,
            longitude: 1,
            status: 'idle' as const,
            eta: Date.now(),
            lastUpdated: Date.now(),
            routeHistory: []
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

describe('NavigationHeader', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders header with correct title', () => {
    const store = createMockStore()
    render(
      <Provider store={store}>
        <NavigationHeader />
      </Provider>
    )

    expect(screen.getByText('Driver Tracking')).toBeDefined()
  })

  it('displays correct active and total driver counts', () => {
    const store = createMockStore()
    render(
      <Provider store={store}>
        <NavigationHeader />
      </Provider>
    )

    expect(screen.getByText('Active: 1')).toBeDefined()
    expect(screen.getByText('Total: 2')).toBeDefined()
  })

  it('dispatches reset action when reset button is clicked', () => {
    const store = createMockStore()
    render(
      <Provider store={store}>
        <NavigationHeader />
      </Provider>
    )

    const resetButton = screen.getByText('Reset')
    fireEvent.click(resetButton)

    // Verify the store state was reset
    const state = store.getState()
    expect(Object.keys(state.drivers.drivers)).toHaveLength(20)
  })
}) 