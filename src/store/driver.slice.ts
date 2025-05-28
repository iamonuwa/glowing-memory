import { Driver, DriverUpdate } from '@/types/driver'
import { DeliveryAction } from '@/types/delivery';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { faker } from '@faker-js/faker'

const BASE_LOCATION = {
    latitude: 47.54870835400457,
    longitude: -52.74778004039589
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
        drivers[id] = {
            id,
            name: faker.person.fullName(),
            latitude: BASE_LOCATION.latitude + faker.number.float({ min: -0.05, max: 0.05 }),
            longitude: BASE_LOCATION.longitude + faker.number.float({ min: -0.05, max: 0.05 }),
            status: faker.helpers.arrayElement(['idle', 'delivering', 'paused'] as const),
            eta: Date.now() + faker.number.int({ min: 5, max: 50 }) * 60 * 1000, // 5-50 minutes from now
            lastUpdated: Date.now()
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
            const { driverId, latitude, longitude, status, eta } = action.payload
            const driver = state.drivers[driverId]
            
            if (driver) {
                driver.latitude = latitude
                driver.longitude = longitude
                driver.status = status
                driver.eta = eta
                driver.lastUpdated = Date.now()
                
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