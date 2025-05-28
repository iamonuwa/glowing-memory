import { configureStore } from "@reduxjs/toolkit";
import driversReducer from "./driver.slice";

export const store = configureStore({
    reducer: {
        drivers: driversReducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
        serializableCheck: {
            ignoredActions: ["drivers/updateDriver"],
            ignoredPaths: ["drivers.drivers.lastUpdated"],
        }
    }),
})

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;