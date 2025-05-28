'use client'

import React, { useState, useMemo } from 'react'
import { useAppSelector } from '@/store/hooks'
import { RootState } from '@/store'
import { Clock, MapPin, Truck, Search, ArrowUpDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

type SortField = 'name' | 'status' | 'eta'
type SortOrder = 'asc' | 'desc'

const getStatusClasses = (status: string) => {
    switch (status) {
        case 'delivering':
            return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800'
        case 'idle':
            return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800'
        case 'paused':
            return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800'
        default:
            return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700'
    }
}

export function DriverList() {
    const drivers = useAppSelector((state: RootState) => state.drivers.drivers)
    const selectedDriverId = useAppSelector((state: RootState) => state.drivers.selectedDriverId)

    const [searchQuery, setSearchQuery] = useState('')
    const [sortField, setSortField] = useState<SortField>('name')
    const [sortOrder, setSortOrder] = useState<SortOrder>('asc')

    const handleSelectDriver = (driverId: string) => {
        window.dispatchEvent(new CustomEvent('openDriverPopup', { detail: driverId }))
    }

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
        } else {
            setSortField(field)
            setSortOrder('asc')
        }
    }

    const filteredAndSortedDrivers = useMemo(() => {
        return Object.values(drivers)
            .filter(driver => 
                driver.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                driver.status.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .sort((a, b) => {
                let comparison = 0
                switch (sortField) {
                    case 'name':
                        comparison = a.name.localeCompare(b.name)
                        break
                    case 'status':
                        comparison = a.status.localeCompare(b.status)
                        break
                    case 'eta':
                        comparison = a.eta - b.eta
                        break
                }
                return sortOrder === 'asc' ? comparison : -comparison
            })
    }, [drivers, searchQuery, sortField, sortOrder])

    return (
        <div className="h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Drivers</h2>
                <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search drivers..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-8 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div className="mt-4 flex gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        className={`flex items-center gap-1 ${sortField === 'name' ? 'text-blue-500' : ''}`}
                        onClick={() => handleSort('name')}
                    >
                        Name
                        <ArrowUpDown className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className={`flex items-center gap-1 ${sortField === 'status' ? 'text-blue-500' : ''}`}
                        onClick={() => handleSort('status')}
                    >
                        Status
                        <ArrowUpDown className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className={`flex items-center gap-1 ${sortField === 'eta' ? 'text-blue-500' : ''}`}
                        onClick={() => handleSort('eta')}
                    >
                        ETA
                        <ArrowUpDown className="h-4 w-4" />
                    </Button>
                </div>
            </div>
            <div className="h-[calc(100vh-12rem)] overflow-y-auto">
                {filteredAndSortedDrivers.map((driver) => (
                    <div
                        key={driver.id}
                        className={`p-4 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
                            selectedDriverId === driver.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                        }`}
                        onClick={() => handleSelectDriver(driver.id)}
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-base font-medium text-gray-900 dark:text-white">
                                        {driver.name}
                                    </h3>
                                    <Badge className={cn("inline-flex items-center gap-1", getStatusClasses(driver.status))}>
                                        <Truck className="h-3 w-3" />
                                        {driver.status}
                                    </Badge>
                                </div>
                                <div className="mt-2 space-y-1">
                                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                        <Clock className="h-4 w-4" />
                                        <span>ETA: {new Date(driver.eta).toLocaleTimeString()}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                        <MapPin className="h-4 w-4" />
                                        <span>
                                            {driver.latitude.toFixed(4)}, {driver.longitude.toFixed(4)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
} 