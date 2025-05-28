"use client"

import { faker } from "@faker-js/faker"
import type { Driver, DriverUpdate } from "@/types/driver"

/**
 * Interface representing a mock driver's route point
 */
interface RoutePoint {
    lat: number;
    lng: number;
}

/**
 * Interface representing a mock driver's route data
 */
interface DriverRoute {
    route: RoutePoint[];
    routeIndex: number;
}

/**
 * Mock WebSocket server implementation for demo purposes
 * Simulates real-time driver location updates in the browser
 */
export class MockWebSocketServer {
    /** Interval timer for sending updates */
    private interval: NodeJS.Timeout | null = null;
    /** Collection of driver routes */
    private driverRoutes: Record<string, DriverRoute> = {};

    /**
     * Initializes routes for existing drivers
     * @param drivers - Current drivers from the store
     */
    initializeRoutes(drivers: Record<string, Driver>): void {
        // Clear existing routes
        this.driverRoutes = {};

        // Create routes for each driver
        Object.values(drivers).forEach(driver => {
            this.driverRoutes[driver.id] = {
                route: this.generateRoute({ lat: driver.latitude, lng: driver.longitude }),
                routeIndex: 0
            };
        });
    }

    /**
     * Generates a random route around a base location
     * @param baseLocation - The center point for the route
     * @returns Array of route points
     */
    private generateRoute(baseLocation: RoutePoint): RoutePoint[] {
        const numPoints = 3;
        const route: RoutePoint[] = [];

        for (let i = 0; i < numPoints; i++) {
            route.push({
                lat: baseLocation.lat + faker.number.float({ min: -0.005, max: 0.005 }),
                lng: baseLocation.lng + faker.number.float({ min: -0.005, max: 0.005 }),
            });
        }

        return route;
    }

    /**
     * Starts the mock WebSocket server and begins sending updates
     */
    start(): void {
        this.startMockUpdates();
    }

    /**
     * Starts sending periodic mock updates to all connected clients
     */
    private startMockUpdates(): void {
        this.interval = setInterval(() => {
            Object.entries(this.driverRoutes).forEach(([driverId, routeData]) => {
                const update = this.generateDriverUpdate(driverId, routeData);
                this.broadcast(JSON.stringify({
                    type: 'update',
                    ...update
                }));
            });
        }, 2000); // Update every 2 seconds
    }

    /**
     * Generates a driver update based on the current route position
     * @param driverId - ID of the driver to update
     * @param routeData - Current route data for the driver
     * @returns DriverUpdate object with current position and status
     */
    private generateDriverUpdate(driverId: string, routeData: DriverRoute): DriverUpdate {
        const currentPoint = routeData.route[routeData.routeIndex];
        const nextPoint = routeData.route[(routeData.routeIndex + 1) % routeData.route.length];

        // Interpolate between current and next point
        const progress = (Date.now() / 10000) % 1; // Complete route every 10 seconds
        const lat = currentPoint.lat + (nextPoint.lat - currentPoint.lat) * progress;
        const lng = currentPoint.lng + (nextPoint.lng - currentPoint.lng) * progress;

        // Add some random variation
        const randomLat = lat + faker.number.float({ min: -0.0005, max: 0.0005 });
        const randomLng = lng + faker.number.float({ min: -0.0005, max: 0.0005 });

        // Update route index occasionally
        if (faker.number.float({ min: 0, max: 1 }) < 0.1) {
            routeData.routeIndex = (routeData.routeIndex + 1) % routeData.route.length;
        }

        return {
            driverId,
            latitude: randomLat,
            longitude: randomLng,
            status: this.getRandomStatus(),
            eta: this.getRandomETA()
        };
    }

    /**
     * Gets a random driver status
     * @returns Random status from available options
     */
    private getRandomStatus(): "delivering" | "paused" | "idle" {
        return faker.helpers.arrayElement(["delivering", "paused", "idle"]);
    }

    /**
     * Generates a random ETA between 5 and 50 minutes from now
     * @returns Timestamp in milliseconds
     */
    private getRandomETA(): number {
        const minutes = faker.number.int({ min: 5, max: 50 });
        return Date.now() + minutes * 60 * 1000;
    }

    /**
     * Broadcasts a message to all connected clients
     * @param message - The message to broadcast
     */
    private broadcast(message: string): void {
        window.dispatchEvent(new CustomEvent("mock-websocket-message", { detail: message }));
    }

    /**
     * Stops the mock WebSocket server and cleans up resources
     */
    stop(): void {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }
}
