import { z } from "zod";

/**
 * Schema for validating driver data
 * @property {string} id - Unique identifier for the driver
 * @property {string} name - Driver's full name
 * @property {number} latitude - Current latitude coordinate
 * @property {number} longitude - Current longitude coordinate
 * @property {('delivering'|'paused'|'idle')} status - Current status of the driver
 * @property {Date} eta - Estimated time of arrival
 * @property {Date} lastUpdated - Timestamp of the last update
 */
export const driverSchema = z.object({
    id: z.string(),
    name: z.string(),
    latitude: z.number(),
    longitude: z.number(),
    status: z.enum(["delivering", "paused", "idle"]),
    eta: z.date(),
    lastUpdated: z.date(),
})

/**
 * Schema for validating driver update data
 * @property {string} driverId - Unique identifier for the driver being updated
 * @property {number} latitude - Updated latitude coordinate
 * @property {number} longitude - Updated longitude coordinate
 * @property {('delivering'|'paused'|'idle')} status - Updated status of the driver
 * @property {Date} eta - Updated estimated time of arrival
 */
export const driverUpdateSchema = z.object({
    driverId: z.string(),
    latitude: z.number(),
    longitude: z.number(),
    status: z.enum(["delivering", "paused", "idle"]),
    eta: z.date(),
})

/** Type representing a driver with all their properties */
export type Driver = z.infer<typeof driverSchema>;

/** Type representing an update to a driver's properties */
export type DriverUpdate = z.infer<typeof driverUpdateSchema>;