'use client'

import React, { createContext, useContext, useCallback, useRef, useEffect } from 'react'
import { useAppDispatch } from '@/store/hooks'
import { updateDriver } from '@/store/driver.slice'
import { MockWebSocketServer } from '@/lib/mockWebSocketServer'
import type { DriverUpdate } from '@/types/driver'

const mockServer = new MockWebSocketServer()

interface WebSocketMessage {
  type: 'update'
  driverId: string
  latitude: number
  longitude: number
  status: DriverUpdate['status']
  eta: Date
}

interface Driver {
  id: string
  name: string
  latitude: number
  longitude: number
  status: DriverUpdate['status']
  eta: number
  lastUpdated: number
  routeHistory: [number, number][]
}

interface WebSocketContextType {
  initializeRoutes: (drivers: Record<string, Driver>) => void
}

const WebSocketContext = createContext<WebSocketContextType | null>(null)

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch()
  const isInitialized = useRef(false)
  const serverRef = useRef<MockWebSocketServer>(mockServer)

  const handleMessage = useCallback((event: CustomEvent<string>) => {
    try {
      const data: WebSocketMessage = JSON.parse(event.detail)
      
      if (data.type === 'update' && data.driverId && data.latitude && data.longitude) {
        dispatch(updateDriver({
          driverId: data.driverId,
          latitude: data.latitude,
          longitude: data.longitude,
          status: data.status,
          eta: new Date(data.eta).getTime()
        }))
      }
    } catch (error) {
      console.error("Failed to parse WebSocket message:", error)
    }
  }, [dispatch])

  const initializeRoutes = useCallback((drivers: Record<string, Driver>) => {
    if (!isInitialized.current) return
    serverRef.current.initializeRoutes(drivers)
  }, [])

  useEffect(() => {
    if (isInitialized.current) return
    isInitialized.current = true

    const server = serverRef.current
    server.start()

    window.addEventListener('mock-websocket-message', handleMessage as EventListener)

    return () => {
      window.removeEventListener('mock-websocket-message', handleMessage as EventListener)
      server.stop()
      isInitialized.current = false
    }
  }, [handleMessage])

  return (
    <WebSocketContext.Provider value={{ initializeRoutes }}>
      {children}
    </WebSocketContext.Provider>
  )
}

export function useWebSocket() {
  const context = useContext(WebSocketContext)
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider')
  }
  return context
} 