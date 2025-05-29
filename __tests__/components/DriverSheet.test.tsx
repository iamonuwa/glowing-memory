import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, vi, expect, beforeEach } from 'vitest'
import { DriverSheet } from '../../src/components/DriverSheet'
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
            status: 'idle' as const,
            eta: Date.now(),
            lastUpdated: Date.now(),
            routeHistory: []
          }
        },
        selectedDriverId: 'driver1',
        filter: 'all' as const,
        isLoading: false,
        error: null,
        optimisticUpdates: {} as Record<string, { driverId: string; type: 'paused' | 'reassign' | 'complete' | 'resume' }>,
        ...initialState
      }
    }
  })
}

describe('DriverSheet', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders driver details when a driver is selected', () => {
    const store = createMockStore()
    render(
      <Provider store={store}>
        <DriverSheet />
      </Provider>
    )

    expect(screen.getByText('John Doe')).toBeDefined()
    expect(screen.getByText('Idle')).toBeDefined()
  })

  it('closes sheet when cancel button is clicked', () => {
    const store = createMockStore()
    render(
      <Provider store={store}>
        <DriverSheet />
      </Provider>
    )

    const cancelButton = screen.getByText('Cancel')
    fireEvent.click(cancelButton)

    // The sheet should be closed (not visible)
    expect(screen.queryByText('John Doe')).toBeNull()
  })

  it('disables reassign button when driver is delivering', () => {
    const store = createMockStore({
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
        }
      }
    })
    render(
      <Provider store={store}>
        <DriverSheet />
      </Provider>
    )

    const reassignButton = screen.getByText('Reassign Delivery')
    expect(reassignButton).toBeDisabled()
  })

  it('enables reassign button when driver is not delivering', () => {
    const store = createMockStore()
    render(
      <Provider store={store}>
        <DriverSheet />
      </Provider>
    )

    const reassignButton = screen.getByText('Reassign Delivery')
    expect(reassignButton).not.toBeDisabled()
  })
}) 