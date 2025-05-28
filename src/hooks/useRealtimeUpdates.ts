import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { updateDriverPosition, addOptimisticUpdate } from '@/store/driver.slice'
import { useAppSelector } from '@/store/hooks'
import { RootState } from '@/store'

export function useRealtimeUpdates() {
    const dispatch = useDispatch()
    const drivers = useAppSelector((state: RootState) => state.drivers.drivers)

    useEffect(() => {
        // Update positions every 2 seconds
        const interval = setInterval(() => {
            const now = Date.now()
            
            // Only update delivering drivers
            Object.keys(drivers).forEach(driverId => {
                const driver = drivers[driverId]
                
                if (driver.status === 'delivering') {
                    // Check if delivery is completed (ETA has passed)
                    if (driver.eta <= now) {
                        dispatch(addOptimisticUpdate({
                            id: driverId,
                            action: {
                                type: 'complete',
                                driverId
                            }
                        }))
                    } else {
                        // Update position if still delivering
                        dispatch(updateDriverPosition(driverId))
                    }
                }
            })
        }, 2000)

        return () => clearInterval(interval)
    }, [dispatch, drivers])
} 