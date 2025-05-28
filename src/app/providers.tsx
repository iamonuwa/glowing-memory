"use client"

import "@/lib/mockWebSocket"
import { useEffect, useRef, type ReactNode } from "react"
import { Provider } from "react-redux"
import { store } from "@/store"
import { initMockServer } from "@/lib/initializer";
import { MockWebSocketServer } from "@/lib/mockWebSocketServer";
import { WebSocketProvider } from "@/context/WebSocketContext"

/**
 * Props for the Providers component
 */
interface Props {
    /** Child components to be wrapped with Provider */
    children: ReactNode;
}

/**
 * Provider component that wraps the application with Redux store
 * @param props - Component props
 * @returns Provider wrapped component
 */
export function Providers({ children }: Props) {
    const server = useRef<MockWebSocketServer | null>(initMockServer())
    useEffect(() => {
        const currentServer = server.current
        return () => {
            if (currentServer) {
                currentServer.stop()
            }
        }
    }, [])

    return (
        <Provider store={store}>
            <WebSocketProvider>
                {children}
            </WebSocketProvider>
        </Provider>
    );
}
