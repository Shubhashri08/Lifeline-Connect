"use client"

import { useEffect, useState } from "react"
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"

// Fix for default marker icon issues in React Leaflet with Next.js
const iconUrl = "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png"
const iconRetinaUrl = "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png"
const shadowUrl = "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png"

const defaultIcon = L.icon({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

L.Marker.prototype.options.icon = defaultIcon

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

function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap()
  map.setView(center)
  return null
}

export default function MapInner({ facilities, userLocation }: MapComponentProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return <div className="h-full w-full bg-muted flex items-center justify-center">Loading Map...</div>

  // Default center (India) if no user location
  const center: [number, number] = userLocation
    ? [userLocation.lat, userLocation.lng]
    : [20.5937, 78.9629]

  // Zoom level depending on context
  const zoom = userLocation ? 12 : 5

  return (
    <div className="h-full w-full relative z-0">
      <MapContainer center={center} zoom={zoom} scrollWheelZoom={true} className="h-full w-full rounded-lg">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Recenter map when user location changes */}
        <ChangeView center={center} />

        {/* User Marker */}
        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]}>
            <Popup>You are here</Popup>
          </Marker>
        )}

        {/* Facility Markers & Lines */}
        {facilities.map((facility) => (
          <div key={facility.id}>
            <Marker position={[facility.lat, facility.lng]}>
              <Popup>
                <b>{facility.name}</b><br />
                Status: {facility.availability}
              </Popup>
            </Marker>

            {/* Draw Line from User to Facility if User Location exists */}
            {userLocation && (
              <Polyline
                positions={[
                  [userLocation.lat, userLocation.lng],
                  [facility.lat, facility.lng]
                ]}
                pathOptions={{ color: 'blue', dashArray: '10, 10', opacity: 0.6 }}
              />
            )}
          </div>
        ))}
      </MapContainer>
    </div>
  )
}
