import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, vi, expect, beforeEach } from 'vitest'
import { DriverList } from '../../src/components/DriverList'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import driverReducer from '../../src/store/driver.slice'

// Mock window.dispatchEvent
const mockDispatchEvent = vi.fn()
window.dispatchEvent = mockDispatchEvent

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
          },
          'driver2': {
            id: 'driver2',
            name: 'Jane Smith',
            latitude: 1,
            longitude: 1,
            status: 'delivering' as const,
            eta: Date.now() + 1000,
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

describe('DriverList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders list of drivers', () => {
    const store = createMockStore()
    render(
      <Provider store={store}>
        <DriverList />
      </Provider>
    )

    expect(screen.getByText('John Doe')).toBeDefined()
    expect(screen.getByText('Jane Smith')).toBeDefined()
  })

  it('filters drivers based on search query', () => {
    const store = createMockStore()
    render(
      <Provider store={store}>
        <DriverList />
      </Provider>
    )

    const searchInput = screen.getByPlaceholderText('Search drivers...')
    fireEvent.change(searchInput, { target: { value: 'John' } })

    expect(screen.getByText('John Doe')).toBeDefined()
    expect(screen.queryByText('Jane Smith')).toBeNull()
  })

  it('sorts drivers by name', () => {
    const store = createMockStore()
    render(
      <Provider store={store}>
        <DriverList />
      </Provider>
    )

    const nameSortButton = screen.getByText('Name')
    fireEvent.click(nameSortButton)

    const driverElements = screen.getAllByText(/John Doe|Jane Smith/)
    expect(driverElements[0]).toHaveTextContent('John Doe') // Should be first in ascending order
  })

  it('dispatches openDriverPopup event when driver is selected', () => {
    const store = createMockStore()
    render(
      <Provider store={store}>
        <DriverList />
      </Provider>
    )

    const driverElement = screen.getByText('John Doe')
    fireEvent.click(driverElement)

    expect(mockDispatchEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'openDriverPopup',
        detail: 'driver1'
      })
    )
  })
}) 