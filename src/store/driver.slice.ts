import { Driver, DriverUpdate, driverUpdateSchema } from '@/types/driver'
import { DeliveryAction } from '@/types/delivery';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { faker } from '@faker-js/faker'

const BASE_LOCATION = {
    latitude: 47.54870835400457,
    longitude: -52.74778004039589
}

// Generate a new position based on current position and status
const generateNewPosition = (currentLat: number, currentLng: number, status: string, routeHistory: [number, number][]): { latitude: number; longitude: number } => {
    // Only move if status is delivering
    if (status !== 'delivering') {
        return { latitude: currentLat, longitude: currentLng }
    }

    // If we have enough history, use it to determine direction
    if (routeHistory.length >= 2) {
        const lastPoint = routeHistory[routeHistory.length - 1]
        const previousPoint = routeHistory[routeHistory.length - 2]
        
        // Calculate direction vector
        const dx = lastPoint[0] - previousPoint[0]
        const dy = lastPoint[1] - previousPoint[1]
        
        // Add some randomness to the direction
        const angleVariation = faker.number.float({ min: -0.2, max: 0.2 }) // ±0.2 radians
        const distance = faker.number.float({ min: 0.0001, max: 0.0003 }) // Smaller movement
        
        // Calculate new position with slight variation
        const newLng = lastPoint[0] + dx * distance + Math.sin(angleVariation) * distance
        const newLat = lastPoint[1] + dy * distance + Math.cos(angleVariation) * distance
        
        return { latitude: newLat, longitude: newLng }
    }

    // If not enough history, use random movement
    const angle = faker.number.float({ min: 0, max: 2 * Math.PI })
    const distance = faker.number.float({ min: 0.0001, max: 0.0003 }) // Smaller movement
    const newLat = currentLat + distance * Math.cos(angle)
    const newLng = currentLng + distance * Math.sin(angle)

    return { latitude: newLat, longitude: newLng }
}

// Load drivers from localStorage or generate new ones
const loadDrivers = (): Record<string, Driver> => {
    const storedDrivers = localStorage.getItem('drivers')
    if (storedDrivers) {
        try {
            return JSON.parse(storedDrivers)
        } catch (e) {
            console.error('Error parsing stored drivers:', e)
        }
    }
    return generateMockDrivers()
}

// Generate mock drivers
const generateMockDrivers = (count: number = 20): Record<string, Driver> => {
    const drivers: Record<string, Driver> = {}
    
    for (let i = 0; i < count; i++) {
        const id = faker.string.uuid()
        const baseLat = BASE_LOCATION.latitude + faker.number.float({ min: -0.05, max: 0.05 })
        const baseLng = BASE_LOCATION.longitude + faker.number.float({ min: -0.05, max: 0.05 })
        
        drivers[id] = {
            id,
            name: faker.person.fullName(),
            latitude: baseLat,
            longitude: baseLng,
            status: faker.helpers.arrayElement(['idle', 'delivering', 'paused'] as const),
            eta: Date.now() + faker.number.int({ min: 5, max: 50 }) * 60 * 1000, // 5-50 minutes from now
            lastUpdated: Date.now(),
            routeHistory: [[baseLng, baseLat]] // Initialize with current position
        }
    }
    
    // Store the generated drivers
    localStorage.setItem('drivers', JSON.stringify(drivers))
    return drivers
}

interface DriversState {
    drivers: Record<string, Driver>
    selectedDriverId: string | null
    filter: "all" | "Delivering" | "Paused" | "Idle"
    isLoading: boolean
    error: string | null
    optimisticUpdates: Record<string, DeliveryAction>
}

const initialState: DriversState = {
    drivers: loadDrivers(),
    selectedDriverId: null,
    filter: "all",
    isLoading: false,
    error: null,
    optimisticUpdates: {},
};

const driverSlice = createSlice({
    name: "drivers",
    initialState,
    reducers: {
        updateDriver: (state, action: PayloadAction<DriverUpdate>) => {
            const { driverId, latitude, longitude, status, eta } = driverUpdateSchema.parse(action.payload)
            const driver = state.drivers[driverId]
            
            if (driver) {
                driver.latitude = latitude
                driver.longitude = longitude
                driver.status = status
                driver.eta = eta
                driver.lastUpdated = Date.now()
                
                // Add to route history if position changed
                if (driver.routeHistory[driver.routeHistory.length - 1][0] !== longitude || 
                    driver.routeHistory[driver.routeHistory.length - 1][1] !== latitude) {
                    driver.routeHistory.push([longitude, latitude])
                }
                
                // Update localStorage
                localStorage.setItem('drivers', JSON.stringify(state.drivers))
            }
        },
        updateDriverPosition: (state, action: PayloadAction<string>) => {
            const driver = state.drivers[action.payload]
            if (driver && driver.status === 'delivering') {
                const newPosition = generateNewPosition(
                    driver.latitude, 
                    driver.longitude, 
                    driver.status,
                    driver.routeHistory
                )
                driver.latitude = newPosition.latitude
                driver.longitude = newPosition.longitude
                driver.lastUpdated = Date.now()
                
                // Only update route history for delivering drivers
                driver.routeHistory.push([newPosition.longitude, newPosition.latitude])
                
                // Update localStorage
                localStorage.setItem('drivers', JSON.stringify(state.drivers))
            }
        },
        selectedDriver: (state, action: PayloadAction<string | null>) => {
            state.selectedDriverId = action.payload;
        },
        setFilter: (state, action: PayloadAction<DriversState['filter']>) => {
            state.filter = action.payload;
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },
        addOptimisticUpdate: (state, action: PayloadAction<{ id: string; action: DeliveryAction }>) => {
            const { id, action: deliveryAction } = action.payload;
            state.optimisticUpdates[id] = deliveryAction;

            // Apply optimistic update
            const driver = state.drivers[deliveryAction.driverId];
            if (driver) {
                switch (deliveryAction.type) {
                    case "paused":
                        driver.status = "paused";
                        break;
                    case "resume":
                    case "reassign":
                        driver.status = "delivering";
                        driver.eta = Date.now() + faker.number.int({ min: 5, max: 50 }) * 60 * 1000; // 5-50 minutes from now
                        break;
                    case "complete":
                        driver.status = "idle";
                        break;
                }
                
                // Update localStorage
                localStorage.setItem('drivers', JSON.stringify(state.drivers))
            }
        },
        confirmOptimisticUpdate: (state, action: PayloadAction<string>) => {
            delete state.optimisticUpdates[action.payload];
        },
        rollbackOptimisticUpdate: (state, action: PayloadAction<string>) => {
            delete state.optimisticUpdates[action.payload];
            state.error = "Action failed. Please try again.";
        },
        clearError: (state) => {
            state.error = null;
        },
        resetDrivers: (state) => {
            state.drivers = generateMockDrivers()
        }
    }
});

export const {
    updateDriver,
    updateDriverPosition,
    selectedDriver,
    setFilter,
    setLoading,
    addOptimisticUpdate,
    confirmOptimisticUpdate,
    rollbackOptimisticUpdate,
    clearError,
    resetDrivers
} = driverSlice.actions;

export default driverSlice.reducer;