import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { useAppSelector } from "@/store/hooks"
import { RootState } from "@/store"
import { Button } from "@/components/ui/button"
import { useDispatch } from "react-redux"
import { selectedDriver, addOptimisticUpdate } from "@/store/driver.slice"
import { DeliveryAction } from "@/types/delivery"

export function DriverSheet() {
    const dispatch = useDispatch()
    const selectedDriverId = useAppSelector((state: RootState) => state.drivers.selectedDriverId)
    const drivers = useAppSelector((state: RootState) => state.drivers.drivers)
    const selectedDriverData = selectedDriverId ? drivers[selectedDriverId] : null
    const driver = selectedDriverId ? drivers[selectedDriverId] : null

    const handleClose = () => {
        dispatch(selectedDriver(null))
    }

    const handleReassign = () => {
        if (!selectedDriverId || (driver && driver.status === 'delivering')) return

        const action: DeliveryAction = {
            type: 'reassign',
            driverId: selectedDriverId,
        }

        dispatch(addOptimisticUpdate({ id: selectedDriverId, action }))
        handleClose()
    }

    if (!selectedDriverData) return null

    return (
        <Sheet open={!!selectedDriverId} onOpenChange={handleClose}>
            <SheetContent className="w-[400px] sm:w-[540px] px-4 flex flex-col">
                <SheetHeader className="px-0">
                    <SheetTitle className="text-2xl font-bold">{selectedDriverData.name}</SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-6 flex-1">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</span>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${selectedDriverData.status === 'delivering'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : selectedDriverData.status === 'paused'
                                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                                }`}>
                                {selectedDriverData.status.charAt(0).toUpperCase() + selectedDriverData.status.slice(1)}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">ETA</span>
                            <span className="text-sm text-gray-900 dark:text-gray-100">
                                {new Date(selectedDriverData.eta).toLocaleTimeString()}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Updated</span>
                            <span className="text-sm text-gray-900 dark:text-gray-100">
                                {new Date(selectedDriverData.lastUpdated).toLocaleTimeString()}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Current Location</span>
                            <span className="text-sm text-gray-900 dark:text-gray-100">
                                {selectedDriverData.latitude.toFixed(6)}, {selectedDriverData.longitude.toFixed(6)}
                            </span>
                        </div>
                    </div>
                </div>
                <SheetFooter className="flex flex-row gap-4 w-full">
                    <Button
                        variant="outline"
                        className="flex-1"
                        onClick={handleClose}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="default"
                        className="flex-1"
                        onClick={handleReassign}
                        disabled={driver?.status === 'delivering'}
                    >
                        Reassign Delivery
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
} 