'use client'

import React from 'react'
import { useAppSelector } from '@/store/hooks'
import { RootState } from '@/store'
import { Button } from '@/components/ui/button'
import { useDispatch } from 'react-redux'
import { resetDrivers } from '@/store/driver.slice'
import { Clock, RefreshCw } from 'lucide-react'

export function NavigationHeader() {
    const drivers = useAppSelector((state: RootState) => state.drivers.drivers)
    const activeDrivers = Object.values(drivers).filter(driver => driver.status === 'delivering').length
    const totalDrivers = Object.keys(drivers).length
    const dispatch = useDispatch()

    const handleReset = () => {
        dispatch(resetDrivers())
    }

    return (
        <header className="bg-transparent border-b border-gray-200">
            <div className="max-w-8xl mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    {/* Logo and Title */}
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <Clock className="h-8 w-8 text-blue-500" />
                        </div>
                        <h1 className="ml-3 text-xl font-semibold text-gray-900 dark:text-white">
                            Glowing Delivery
                        </h1>
                    </div>

                    {/* Stats and Reset Button */}
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                            <div className="px-3 py-1 bg-green-100 dark:bg-green-900 rounded-full">
                                <span className="text-sm font-medium text-green-800 dark:text-green-200">
                                    Active: {activeDrivers}
                                </span>
                            </div>
                            <div className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">
                                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                    Total: {totalDrivers}
                                </span>
                            </div>
                        </div>
                        <Button 
                            variant="outline" 
                            size="sm"
                            onClick={handleReset}
                        >
                            <RefreshCw className="h-4 w-4" />
                            Reset
                        </Button>
                    </div>
                </div>
            </div>
        </header>
    )
} 