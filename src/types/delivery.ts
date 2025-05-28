import { z } from "zod";

/**
 * Schema for validating delivery action data
 * @property {('reassign'|'complete'|'paused'|'resume')} type - Type of action to perform
 * @property {string} driverId - ID of the driver performing the action
 * @property {string} [targetDriverId] - Optional ID of the target driver (used for reassignment)
 */
export const deliveryActionSchema = z.object({
    type: z.enum(["reassign", "complete", "paused", "resume"]),
    driverId: z.string(),
    targetDriverId: z.string().optional(),
})

/** Type representing a delivery action with its properties */
export type DeliveryAction = z.infer<typeof deliveryActionSchema>;