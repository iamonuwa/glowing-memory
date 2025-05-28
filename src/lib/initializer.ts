"use client"

import { MockWebSocketServer } from "./mockWebSocketServer"

let mockServer: MockWebSocketServer | null = null

export function initMockServer() {
    if (typeof window !== "undefined" && !mockServer) {
        mockServer = new MockWebSocketServer()
        mockServer.start()
        console.log("Mock WebSocket server started")
    }
    return mockServer
}

export function stopMockServer() {
    if (mockServer) {
        mockServer.stop()
        mockServer = null
    }
}
