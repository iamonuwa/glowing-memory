"use client"

import { faker } from "@faker-js/faker"
import { v4 as uuidv4 } from "uuid"
import type { DriverUpdate } from "@/types/driver"

/**
 * Interface representing a mock driver's route point
 */
interface RoutePoint {
    lat: number;
    lng: number;
}

/**
 * Interface representing a mock driver's data
 */
interface MockDriver {
    id: string;
    name: string;
    baseLatitude: number;
    baseLongitude: number;
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
    /** Collection of mock drivers with their routes */
    private mockDrivers: MockDriver[] = [];

    constructor() {
        this.initializeMockDrivers();
    }

    /**
     * Initializes mock drivers with random data using Faker
     */
    private initializeMockDrivers(): void {
        const numDrivers = 4;
        const baseLocation = { lat: 51.6214, lng: -3.9436 }; // Swansea Bus Station

        for (let i = 0; i < numDrivers; i++) {
            const driver: MockDriver = {
                id: uuidv4(),
                name: faker.person.fullName(),
                baseLatitude: baseLocation.lat + faker.number.float({ min: -0.01, max: 0.01 }),
                baseLongitude: baseLocation.lng + faker.number.float({ min: -0.01, max: 0.01 }),
                route: this.generateRoute(baseLocation),
                routeIndex: 0,
            };
            this.mockDrivers.push(driver);
        }
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
            this.mockDrivers.forEach((driver) => {
                const update = this.generateDriverUpdate(driver);
                this.broadcast(JSON.stringify(update));
            });
        }, 2000); // Update every 2 seconds
    }

    /**
     * Generates a driver update based on the current route position
     * @param driver - The mock driver to generate an update for
     * @returns DriverUpdate object with current position and status
     */
    private generateDriverUpdate(driver: MockDriver): DriverUpdate {
        const currentPoint = driver.route[driver.routeIndex];
        const nextPoint = driver.route[(driver.routeIndex + 1) % driver.route.length];

        // Interpolate between current and next point
        const progress = (Date.now() / 10000) % 1; // Complete route every 10 seconds
        const lat = currentPoint.lat + (nextPoint.lat - currentPoint.lat) * progress;
        const lng = currentPoint.lng + (nextPoint.lng - currentPoint.lng) * progress;

        // Add some random variation
        const randomLat = lat + faker.number.float({ min: -0.0005, max: 0.0005 });
        const randomLng = lng + faker.number.float({ min: -0.0005, max: 0.0005 });

        // Update route index occasionally
        if (faker.number.float({ min: 0, max: 1 }) < 0.1) {
            driver.routeIndex = (driver.routeIndex + 1) % driver.route.length;
        }

        return {
            driverId: driver.id,
            latitude: randomLat,
            longitude: randomLng,
            status: this.getRandomStatus(),
            eta: this.getRandomETA(),
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
     * @returns Date object representing the ETA
     */
    private getRandomETA(): Date {
        const minutes = faker.number.int({ min: 5, max: 50 });
        return new Date(Date.now() + minutes * 60 * 1000);
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
