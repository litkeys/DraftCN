'use client'

import React from 'react'
import { Slider } from '@/components/ui/slider'
import { useAppStore } from '@/store'

export function ZoomControl() {
  const zoom = useAppStore((state) => state.zoom)
  const setZoom = useAppStore((state) => state.setZoom)

  const discreteSteps = [25, 50, 75, 100, 125, 150, 175, 200]

  const handleZoomChange = (value: number[]) => {
    const newZoom = value[0]
    const closestStep = discreteSteps.reduce((prev, curr) =>
      Math.abs(curr - newZoom) < Math.abs(prev - newZoom) ? curr : prev
    )
    setZoom(closestStep)
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium text-gray-700 min-w-[45px] text-right">
        {zoom}%
      </span>
      <Slider
        value={[zoom]}
        onValueChange={handleZoomChange}
        min={25}
        max={200}
        step={25}
        className="w-[200px]"
        aria-label="Zoom level"
      />
    </div>
  )
}