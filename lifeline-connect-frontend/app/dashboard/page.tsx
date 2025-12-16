"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { isAuthenticated, getUserName, logout } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Activity, Search, MapPin, User, LogOut, Hospital } from "lucide-react"
import { MapComponent } from "@/components/map-component"
import { FacilityCard } from "@/components/facility-card"
import { WhatsAppButton } from "@/components/whatsapp-button"

// Mock facility data
const mockFacilities = [
  {
    id: 1,
    name: "District Hospital Nashik",
    type: "District Hospital",
    distance: "12.5 km",
    travelTime: "25 min",
    bedsAvailable: 15,
    totalBeds: 50,
    specialists: ["Cardiologist", "Orthopedic"],
    labWaitTime: "30 min",
    lat: 20.0,
    lng: 73.78,
    availability: "available",
  },
  {
    id: 2,
    name: "PHC Satana",
    type: "Primary Health Center",
    distance: "8.2 km",
    travelTime: "18 min",
    bedsAvailable: 3,
    totalBeds: 10,
    specialists: ["General Physician"],
    labWaitTime: "15 min",
    lat: 20.05,
    lng: 73.8,
    availability: "limited",
  },
  {
    id: 3,
    name: "Community Health Center Malegaon",
    type: "Community Health Center",
    distance: "22.8 km",
    travelTime: "45 min",
    bedsAvailable: 0,
    totalBeds: 30,
    specialists: ["Pediatrician", "Gynecologist"],
    labWaitTime: "60 min",
    lat: 20.1,
    lng: 73.85,
    availability: "full",
  },
]

const symptoms = [
  "Fever",
  "Cough",
  "Chest Pain",
  "Abdominal Pain",
  "Headache",
  "Injury/Fracture",
  "Pregnancy Care",
  "General Checkup",
]

export default function DashboardPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [userName, setUserName] = useState<string | null>(null)
  const [selectedSymptom, setSelectedSymptom] = useState("")
  const [location, setLocation] = useState("")
  const [facilities, setFacilities] = useState(mockFacilities)
  const [searchPerformed, setSearchPerformed] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (!isAuthenticated()) {
      router.push("/login")
      return
    }
    setUserName(getUserName())

    // Auto-detect location
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation(`${position.coords.latitude.toFixed(2)}, ${position.coords.longitude.toFixed(2)}`)
        },
        () => {
          setLocation("Location unavailable")
        },
      )
    }
  }, [router])

  const handleSearch = () => {
    setSearchPerformed(true)
    // In production, this would call the backend API to search facilities
    console.log("[v0] Searching for facilities with symptom:", selectedSymptom)
  }

  const handleLogout = () => {
    logout()
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold">Lifeline Connect</span>
          </div>
          <div className="flex items-center gap-4">
            <WhatsAppButton
              variant="inline"
              preFilledMessage={`Hi! I'm looking for a ${selectedSymptom || "doctor"} near ${location || "me"}.`}
              className="hidden sm:flex"
            />
            <Button variant="ghost" size="sm" asChild>
              <a href="/profile">
                <User className="h-4 w-4 mr-2" />
                {userName || "Profile"}
              </a>
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome, {userName || "User"}!</h1>
          <p className="text-muted-foreground">Find healthcare facilities near you with real-time availability</p>
        </div>

        {/* Search Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Find Healthcare Facilities</CardTitle>
            <CardDescription>Select your symptoms and location to find the best care option</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="symptom">Select Symptom</Label>
                <Select value={selectedSymptom} onValueChange={setSelectedSymptom}>
                  <SelectTrigger id="symptom">
                    <SelectValue placeholder="Choose your symptom" />
                  </SelectTrigger>
                  <SelectContent>
                    {symptoms.map((symptom) => (
                      <SelectItem key={symptom} value={symptom}>
                        {symptom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Your Location</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Enter your location"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <Button onClick={handleSearch} className="w-full md:w-auto" disabled={!selectedSymptom || !location}>
              <Search className="h-4 w-4 mr-2" />
              Search Facilities
            </Button>
          </CardContent>
        </Card>

        {searchPerformed && (
          <>
            {/* Map Section */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Facilities Near You</CardTitle>
                <CardDescription>Interactive map showing healthcare facilities and their availability</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] rounded-lg overflow-hidden bg-muted">
                  <MapComponent facilities={facilities} />
                </div>
                <div className="flex gap-4 mt-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-secondary" />
                    <span>Available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-chart-4" />
                    <span>Limited</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-destructive" />
                    <span>Full</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recommended Care Pathway */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Recommended Facilities</h2>
              <div className="grid gap-4">
                {facilities.map((facility) => (
                  <FacilityCard
                    key={facility.id}
                    facility={facility}
                    onBook={() => router.push(`/booking/${facility.id}`)}
                  />
                ))}
              </div>
            </div>
          </>
        )}

        {!searchPerformed && (
          <Card>
            <CardContent className="py-12 text-center">
              <Hospital className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Start Your Search</h3>
              <p className="text-muted-foreground">
                Select your symptoms and location to find the nearest healthcare facilities with real-time availability
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <WhatsAppButton
        preFilledMessage={
          selectedSymptom && location
            ? `Hi! I'm looking for a ${selectedSymptom} doctor near ${location}. Can you help me find the nearest facility?`
            : "Hi! I need help finding a doctor for my symptoms."
        }
      />
    </div>
  )
}
