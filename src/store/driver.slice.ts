import { Driver, DriverUpdate } from '@/types/driver'
import { DeliveryAction } from '@/types/delivery';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface DriversState {
    drivers: Record<string, Driver>
    selectedDriverId: string | null
    filter: "all" | "Delivering" | "Paused" | "Idle"
    isLoading: boolean
    error: string | null
    optimisticUpdates: Record<string, DeliveryAction>
}

const initialState: DriversState = {
    drivers: {},
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
        setDrivers: (state, action: PayloadAction<Driver[]>) => {
            const driversMap: Record<string, Driver> = {};
            action.payload.forEach((driver) => {
                driversMap[driver.id] = driver;
            });
            state.drivers = driversMap;
        },
        updateDriver: (state, action: PayloadAction<DriverUpdate>) => {
            const { driverId, ...updates } = action.payload;
            const driver = state.drivers[driverId];
            if (driver) {
                state.drivers[driverId] = {
                    ...driver,
                    ...updates,
                    lastUpdated: new Date(),
                };
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
                        driver.status = "delivering";
                        break;
                    case "complete":
                        driver.status = "idle";
                        break;
                }
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
    }
});

export const {
    setDrivers,
    updateDriver,
    selectedDriver,
    setFilter,
    setLoading,
    addOptimisticUpdate,
    confirmOptimisticUpdate,
    rollbackOptimisticUpdate,
    clearError
} = driverSlice.actions;

export default driverSlice.reducer;