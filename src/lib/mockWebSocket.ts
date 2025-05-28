"use client"

/**
 * Custom event type for mock WebSocket messages
 */
interface MockWebSocketMessageEvent extends Event {
    detail: string;
}

/**
 * Mock implementation of WebSocket for demo purposes
 * @extends EventTarget
 */
export class MockWebSocket extends EventTarget {
    /** WebSocket connection states */
    static readonly CONNECTING = 0;
    static readonly OPEN = 1;
    static readonly CLOSING = 2;
    static readonly CLOSED = 3;

    /** Current connection state of the WebSocket */
    public readyState: number = MockWebSocket.CONNECTING;
    /** URL of the WebSocket connection */
    public url: string;

    /**
     * Creates a new MockWebSocket instance
     * @param {string} url - The URL to connect to
     */
    constructor(url: string) {
        super();
        this.url = url;

        // Simulate connection
        setTimeout(() => {
            this.readyState = MockWebSocket.OPEN;
            this.dispatchEvent(new Event("open"));
        }, 100);

        // Listen for mock messages
        window.addEventListener("mock-websocket-message", ((event: MockWebSocketMessageEvent) => {
            const messageEvent = new MessageEvent("message", { data: event.detail });
            this.dispatchEvent(messageEvent);
        }) as EventListener);
    }

    /**
     * Sends data through the WebSocket connection
     * @param {string} data - The data to send
     */
    send(data: string): void {
        // Mock send implementation
        console.log("Mock WebSocket send:", data);
    }

    /**
     * Closes the WebSocket connection
     */
    close(): void {
        this.readyState = MockWebSocket.CLOSED;
        this.dispatchEvent(new Event("close"));
    }

    /**
     * Adds an event listener to the WebSocket
     * @param {string} type - The type of event to listen for
     * @param {EventListener} listener - The event listener function
     */
    addEventListener(type: string, listener: EventListener): void {
        super.addEventListener(type, listener);
    }

    /**
     * Removes an event listener from the WebSocket
     * @param {string} type - The type of event to remove the listener from
     * @param {EventListener} listener - The event listener function to remove
     */
    removeEventListener(type: string, listener: EventListener): void {
        super.removeEventListener(type, listener);
    }
}

// Override WebSocket for demo purposes
if (typeof window !== "undefined") {
    // @ts-expect-error - MockWebSocket is a valid WebSocket implementation
    ; (window as never).WebSocket = MockWebSocket
}
