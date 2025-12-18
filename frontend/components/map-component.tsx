"use client"

import dynamic from "next/dynamic"
import { useMemo } from "react"

const MapInner = dynamic(() => import("./map-inner"), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-muted flex items-center justify-center">Loading Map...</div>
})

interface Facility {
  id: string
  name: string
  lat: number
  lng: number
  availability: string
}

interface MapComponentProps {
  facilities: Facility[]
  userLocation?: { lat: number; lng: number } | null
}

export function MapComponent(props: MapComponentProps) {
  // Use useMemo to prevent unnecessary re-renders of the dynamic component
  const Map = useMemo(() => MapInner, [])
  return <Map {...props} />
}
