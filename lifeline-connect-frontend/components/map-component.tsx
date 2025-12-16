"use client"

import { useEffect, useRef, useState } from "react"

interface Facility {
  id: number
  name: string
  lat: number
  lng: number
  availability: "available" | "limited" | "full"
}

interface MapComponentProps {
  facilities: Facility[]
}

export function MapComponent({ facilities }: MapComponentProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const [mapLoaded, setMapLoaded] = useState(false)

  useEffect(() => {
    // In production, this would initialize Mapbox GL JS
    // For demo purposes, we'll show a static map with markers
    setMapLoaded(true)
  }, [])

  const getMarkerColor = (availability: string) => {
    switch (availability) {
      case "available":
        return "bg-secondary"
      case "limited":
        return "bg-chart-4"
      case "full":
        return "bg-destructive"
      default:
        return "bg-muted-foreground"
    }
  }

  return (
    <div ref={mapContainerRef} className="w-full h-full relative bg-muted">
      {/* Placeholder map - In production, use Mapbox GL JS */}
      <div className="absolute inset-0 flex items-center justify-center">
        <img src="/map-of-rural-india-with-healthcare-facilities.jpg" alt="Healthcare Facilities Map" className="w-full h-full object-cover" />
      </div>

      {/* Markers overlay */}
      <div className="absolute inset-0">
        {facilities.map((facility, index) => (
          <div
            key={facility.id}
            className="absolute"
            style={{
              left: `${20 + index * 25}%`,
              top: `${30 + index * 15}%`,
            }}
          >
            <div
              className={`h-6 w-6 rounded-full ${getMarkerColor(facility.availability)} border-2 border-background shadow-lg flex items-center justify-center cursor-pointer hover:scale-110 transition-transform`}
              title={facility.name}
            >
              <div className="h-2 w-2 rounded-full bg-background" />
            </div>
          </div>
        ))}
      </div>

      {/* Map attribution */}
      <div className="absolute bottom-2 right-2 bg-background/80 px-2 py-1 rounded text-xs text-muted-foreground">
        Map data for demo purposes
      </div>
    </div>
  )
}
