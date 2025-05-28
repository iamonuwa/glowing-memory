"use client"

import { useEffect, useRef, useCallback } from "react"
import { useAppDispatch } from "@/store/hooks"
import type { DriverUpdate } from "@/types/driver"
import { updateDriver } from "@/store/driver.slice"

const RECONNECT_DELAY = 3000;

/**
 * Custom hook for managing WebSocket connections
 * @param url - WebSocket server URL
 * @returns WebSocket instance
 */
export function useWebSocket(url: string) {
  const dispatch = useAppDispatch()
  const ws = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isConnecting = useRef(false)

  const handleMessage = useCallback((event: MessageEvent) => {
    try {
      const data: DriverUpdate = JSON.parse(event.data)
      dispatch(updateDriver(data))
    } catch (error) {
      console.error("Failed to parse WebSocket message:", error)
    }
  }, [dispatch])

  const connect = useCallback(() => {
    if (isConnecting.current || ws.current?.readyState === WebSocket.OPEN) {
      return
    }

    isConnecting.current = true

    try {
      ws.current = new WebSocket(url)

      ws.current.onopen = () => {
        console.log("WebSocket connected")
        isConnecting.current = false
      }

      ws.current.onmessage = handleMessage

      ws.current.onclose = () => {
        console.log("WebSocket disconnected, attempting to reconnect...")
        isConnecting.current = false
        reconnectTimeoutRef.current = setTimeout(connect, RECONNECT_DELAY)
      }

      ws.current.onerror = (error) => {
        console.error("WebSocket error:", error)
        isConnecting.current = false
      }
    } catch (error) {
      console.error("Failed to connect to WebSocket:", error)
      isConnecting.current = false
      reconnectTimeoutRef.current = setTimeout(connect, RECONNECT_DELAY)
    }
  }, [url, handleMessage])

  useEffect(() => {
    connect()

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      if (ws.current) {
        ws.current.close()
      }
    }
  }, [connect])

  return ws.current
}
